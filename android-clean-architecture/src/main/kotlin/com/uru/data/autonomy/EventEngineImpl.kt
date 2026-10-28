package com.autonomy.engine.data

import com.autonomy.engine.domain.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.LinkedBlockingQueue
import java.util.regex.Pattern

/**
 * High-performance, coroutine-powered EventEngine implementation for Android.
 */
class EventEngineImpl(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : EventEngine {

    private val subscriptions = ConcurrentHashMap<String, Subscription>()
    private val middlewares = CopyOnWriteArrayList<Middleware>()
    private val eventHistory = CopyOnWriteArrayList<EngineEvent<*>>()
    private val deadLetterQueue = ConcurrentHashMap<String, DeadLetterEntry>()
    private val maxHistorySize = 500

    private val _metrics = MutableStateFlow(EngineMetrics())
    override val metricsFlow: StateFlow<EngineMetrics> = _metrics.asStateFlow()

    private var totalLatencySumMs: Double = 0.0
    private var totalDispatchedEvents: Long = 0

    override suspend fun <T> publish(
        topic: String,
        payload: T,
        metadata: EventMetadata
    ): EngineEvent<T> {
        val startNs = System.nanoTime()

        var currentEvent: EngineEvent<*> = EngineEvent(
            topic = topic,
            payload = payload,
            metadata = metadata,
            status = EventStatus.PENDING
        )

        // Run beforePublish middlewares
        for (mw in middlewares) {
            try {
                val modified = mw.beforePublish(currentEvent)
                if (modified == null) {
                    val skipped = (currentEvent as EngineEvent<T>).copy(status = EventStatus.SKIPPED)
                    recordEvent(skipped)
                    return skipped
                }
                currentEvent = modified
            } catch (e: Exception) {
                mw.onError(currentEvent, e, null)
            }
        }

        // Find matching subscriptions sorted by priority (higher priority first)
        val matchingSubs = subscriptions.values
            .filter { it.active && matchTopic(it.topicPattern, currentEvent.topic) }
            .sortedByDescending { it.priority }

        if (matchingSubs.isEmpty()) {
            val processedEvent = (currentEvent as EngineEvent<T>).copy(
                status = EventStatus.PROCESSED,
                executionTimeMs = (System.nanoTime() - startNs) / 1_000_000
            )
            recordEvent(processedEvent)
            updateMetrics(published = 1, processed = 1, latencyMs = processedEvent.executionTimeMs?.toDouble() ?: 0.0)
            return processedEvent
        }

        var anyFailed = false
        var lastError: Throwable? = null

        for (sub in matchingSubs) {
            val subStart = System.currentTimeMillis()
            try {
                // Check filter if provided
                if (sub.filter != null && !sub.filter.invoke(currentEvent)) {
                    continue
                }

                // Middleware beforeDispatch
                var shouldDispatch = true
                for (mw in middlewares) {
                    if (!mw.beforeDispatch(currentEvent, sub)) {
                        shouldDispatch = false
                        break
                    }
                }
                if (!shouldDispatch) continue

                // Execute handler asynchronously
                sub.handler(currentEvent, null)
                sub.invocationCount++
                sub.lastInvokedAt = System.currentTimeMillis()

                val duration = System.currentTimeMillis() - subStart
                for (mw in middlewares) {
                    mw.afterDispatch(currentEvent, sub, duration)
                }
            } catch (e: Throwable) {
                anyFailed = true
                lastError = e
                sub.errorCount++
                for (mw in middlewares) {
                    mw.onError(currentEvent, e, sub)
                }
            }
        }

        val elapsedMs = (System.nanoTime() - startNs) / 1_000_000

        val finalEvent = if (anyFailed) {
            val failedEvent = (currentEvent as EngineEvent<T>).copy(
                status = EventStatus.FAILED,
                error = lastError?.message ?: "Unknown handler error",
                executionTimeMs = elapsedMs
            )
            moveToDeadLetter(failedEvent, lastError)
            updateMetrics(published = 1, failed = 1, latencyMs = elapsedMs.toDouble())
            failedEvent
        } else {
            val successfulEvent = (currentEvent as EngineEvent<T>).copy(
                status = EventStatus.PROCESSED,
                executionTimeMs = elapsedMs
            )
            updateMetrics(published = 1, processed = 1, latencyMs = elapsedMs.toDouble())
            successfulEvent
        }

        recordEvent(finalEvent)
        return finalEvent
    }

    override suspend fun publishBatch(
        events: List<Triple<String, Any?, EventMetadata>>
    ): List<EngineEvent<*>> {
        // Sort by priority order
        val priorityComparator = compareBy<Triple<String, Any?, EventMetadata>> { triple ->
            when (triple.third.priority) {
                EventPriority.CRITICAL -> 0
                EventPriority.HIGH -> 1
                EventPriority.NORMAL -> 2
                EventPriority.LOW -> 3
            }
        }

        val sorted = events.sortedWith(priorityComparator)
        val results = mutableListOf<EngineEvent<*>>()
        for (item in sorted) {
            results.add(publish(item.first, item.second, item.third))
        }
        return results
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T> subscribe(
        topicPattern: String,
        options: SubscriptionOptions,
        handler: EventHandler<T>
    ): Subscription {
        val sub = Subscription(
            topicPattern = topicPattern,
            priority = options.priority,
            name = options.name,
            filter = options.filter,
            handler = { event, ctx ->
                handler(event as EngineEvent<T>, ctx)
            }
        )
        subscriptions[sub.id] = sub
        _metrics.value = _metrics.value.copy(activeSubscriptions = subscriptions.size)
        return sub
    }

    override fun unsubscribe(subscriptionId: String): Boolean {
        val removed = subscriptions.remove(subscriptionId) != null
        if (removed) {
            _metrics.value = _metrics.value.copy(activeSubscriptions = subscriptions.size)
        }
        return removed
    }

    override fun use(middleware: Middleware) {
        middlewares.add(middleware)
    }

    override fun removeMiddleware(name: String): Boolean {
        return middlewares.removeIf { it.name == name }
    }

    override fun getHistory(limit: Int, filterTopic: String?): List<EngineEvent<*>> {
        val list = if (filterTopic.isNullOrBlank()) {
            eventHistory.toList()
        } else {
            eventHistory.filter { matchTopic(filterTopic, it.topic) }
        }
        return list.takeLast(limit)
    }

    override suspend fun replay(fromTimestampOrId: Any, toTimestamp: Long?): Int {
        val eventsToReplay = eventHistory.filter { event ->
            when (fromTimestampOrId) {
                is Long -> event.metadata.timestamp >= fromTimestampOrId && (toTimestamp == null || event.metadata.timestamp <= toTimestamp)
                is String -> event.id == fromTimestampOrId || event.metadata.correlationId == fromTimestampOrId
                else -> false
            }
        }

        for (evt in eventsToReplay) {
            publish(
                topic = evt.topic,
                payload = evt.payload,
                metadata = evt.metadata.copy(
                    timestamp = System.currentTimeMillis(),
                    tags = evt.metadata.tags + "replayed"
                )
            )
        }
        return eventsToReplay.size
    }

    override fun getDeadLetterQueue(): List<DeadLetterEntry> {
        return deadLetterQueue.values.toList()
    }

    override suspend fun retryDeadLetter(dlqEntryId: String): Boolean {
        val entry = deadLetterQueue[dlqEntryId] ?: return false
        deadLetterQueue.remove(dlqEntryId)
        _metrics.value = _metrics.value.copy(eventsInDLQ = deadLetterQueue.size)

        val retried = publish(
            topic = entry.event.topic,
            payload = entry.event.payload,
            metadata = entry.event.metadata.copy(
                retryCount = entry.event.metadata.retryCount + 1,
                tags = entry.event.metadata.tags + "dlq_retry"
            )
        )
        return retried.status == EventStatus.PROCESSED
    }

    override suspend fun retryAllDeadLetters(): Int {
        val entries = deadLetterQueue.values.toList()
        var recovered = 0
        for (entry in entries) {
            if (retryDeadLetter(entry.id)) {
                recovered++
            }
        }
        return recovered
    }

    override fun clearDeadLetterQueue() {
        deadLetterQueue.clear()
        _metrics.value = _metrics.value.copy(eventsInDLQ = 0)
    }

    override fun clearHistory() {
        eventHistory.clear()
    }

    override fun getMetrics(): EngineMetrics = _metrics.value

    override fun resetMetrics() {
        totalLatencySumMs = 0.0
        totalDispatchedEvents = 0
        _metrics.value = EngineMetrics(activeSubscriptions = subscriptions.size)
    }

    private fun recordEvent(event: EngineEvent<*>) {
        eventHistory.add(event)
        if (eventHistory.size > maxHistorySize) {
            eventHistory.removeAt(0)
        }
    }

    private fun moveToDeadLetter(event: EngineEvent<*>, error: Throwable?) {
        val entry = DeadLetterEntry(
            event = event,
            reason = error?.message ?: "Execution failed",
            stackTrace = error?.stackTraceToString()
        )
        deadLetterQueue[entry.id] = entry
        _metrics.value = _metrics.value.copy(eventsInDLQ = deadLetterQueue.size)
    }

    private fun updateMetrics(published: Long = 0, processed: Long = 0, failed: Long = 0, latencyMs: Double = 0.0) {
        val current = _metrics.value
        totalDispatchedEvents += (processed + failed)
        totalLatencySumMs += latencyMs
        val avgLatency = if (totalDispatchedEvents > 0) totalLatencySumMs / totalDispatchedEvents else 0.0

        _metrics.value = current.copy(
            eventsPublished = current.eventsPublished + published,
            eventsProcessed = current.eventsProcessed + processed,
            eventsFailed = current.eventsFailed + failed,
            avgDispatchLatencyMs = (avgLatency * 100.0).toLong() / 100.0
        )
    }

    companion object {
        /**
         * Match topic string with wildcard support (*, **, #).
         * e.g., "sensor.*" matches "sensor.temp", "sensor.**" matches "sensor.room.1.temp".
         */
        fun matchTopic(pattern: String, topic: String): Boolean {
            if (pattern == topic || pattern == "#" || pattern == "**") return true

            val regexPattern = pattern
                .replace(".", "\\.")
                .replace("**", ".*")
                .replace("#", ".*")
                .replace("*", "[^.]+")

            return Pattern.compile("^$regexPattern$").matcher(topic).matches()
        }
    }
}

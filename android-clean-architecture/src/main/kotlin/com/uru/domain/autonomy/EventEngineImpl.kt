package com.uru.domain.autonomy

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.*
import kotlin.math.min

class EventEngineImpl(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : IEventEngine {

    private val subscriptions = mutableMapOf<String, Subscription>()
    private val subscriptionsByTopic = mutableMapOf<String, MutableSet<String>>()
    private val deadLetterQueue = mutableListOf<DeadLetterEntry>()
    private val eventQueue = PriorityQueue<QueuedEvent<*>>(compareBy { it.event.metadata.priority.ordinal })
    private val metrics = EngineMetrics()
    private val middleware = mutableListOf<Middleware>()

    private val eventBus = MutableSharedFlow<EngineEvent<*>>(
        replay = 0,
        extraBufferCapacity = 100,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )

    private val subscriptionMutex = Mutex()
    private val queueMutex = Mutex()
    private val dlqMutex = Mutex()
    private val metricsMutex = Mutex()

    private var processingJob: Job? = null
    private var isRunning = false

    private val metricsUpdateFlow = MutableStateFlow(metrics.copy())

    data class QueuedEvent<T>(
        val event: EngineEvent<T>,
        val timestamp: Long = System.currentTimeMillis()
    )

    init {
        addTelemetryMiddleware()
    }

    override suspend fun <T> publish(
        topic: String,
        payload: T,
        metadata: EventMetadata?
    ): EngineEvent<T> {
        val eventMetadata = metadata ?: EventMetadata(source = topic)
        var event = EngineEvent(
            topic = topic,
            payload = payload,
            metadata = eventMetadata
        )

        for (mw in middleware) {
            event = mw.beforePublish(event) as EngineEvent<T>
        }

        queueMutex.withLock {
            eventQueue.offer(QueuedEvent(event))
        }

        metricsMutex.withLock {
            metrics.eventsPublished += 1
        }

        ensureProcessing()
        return event
    }

    override suspend fun subscribe(
        topic: String,
        handler: suspend (EngineEvent<*>) -> Unit
    ): String {
        val subscription = Subscription(topic = topic, handler = handler)

        subscriptionMutex.withLock {
            subscriptions[subscription.id] = subscription
            subscriptionsByTopic.getOrPut(topic) { mutableSetOf() }.add(subscription.id)
        }

        metricsMutex.withLock {
            metrics.activeSubscriptions = subscriptions.size
        }

        ensureProcessing()
        return subscription.id
    }

    override suspend fun unsubscribe(subscriptionId: String) {
        subscriptionMutex.withLock {
            val subscription = subscriptions.remove(subscriptionId)
            subscription?.let {
                subscriptionsByTopic[it.topic]?.remove(subscriptionId)
            }
        }

        metricsMutex.withLock {
            metrics.activeSubscriptions = subscriptions.size
        }
    }

    override fun observeEvents(): Flow<EngineEvent<*>> {
        return eventBus.asSharedFlow()
    }

    override fun getMetrics(): EngineMetrics {
        return metrics.copy()
    }

    override suspend fun getDeadLetterQueue(): List<DeadLetterEntry> {
        dlqMutex.withLock {
            return deadLetterQueue.toList()
        }
    }

    override suspend fun retryDeadLetter(eventId: String): Boolean {
        dlqMutex.withLock {
            val entry = deadLetterQueue.find { it.eventId == eventId } ?: return false
            deadLetterQueue.remove(entry)

            queueMutex.withLock {
                eventQueue.offer(QueuedEvent(entry.event))
            }

            return true
        }
    }

    override suspend fun retryAllDeadLetters() {
        dlqMutex.withLock {
            val entries = deadLetterQueue.toList()
            deadLetterQueue.clear()

            queueMutex.withLock {
                entries.forEach { entry ->
                    eventQueue.offer(QueuedEvent(entry.event))
                }
            }

            metricsMutex.withLock {
                metrics.eventsInDLQ = 0
            }
        }
    }

    fun addMiddleware(mw: Middleware) {
        middleware.add(mw)
    }

    fun removeMiddleware(name: String) {
        middleware.removeAll { it.name == name }
    }

    private fun addTelemetryMiddleware() {
        addMiddleware(object : Middleware {
            override val name = "telemetry"

            override fun beforePublish(event: EngineEvent<*>): EngineEvent<*> {
                if (event.metadata.traceId == "trc_${System.currentTimeMillis()}") {
                    return event.copy(
                        metadata = event.metadata.copy(
                            traceId = "trc_${UUID.randomUUID()}"
                        )
                    )
                }
                return event
            }
        })
    }

    private fun ensureProcessing() {
        if (!isRunning) {
            isRunning = true
            processingJob = scope.launch {
                processEvents()
            }
        }
    }

    private suspend fun processEvents() {
        while (isRunning && isActive) {
            val queuedEvent = queueMutex.withLock {
                eventQueue.poll()
            }

            if (queuedEvent == null) {
                delay(1)
                continue
            }

            try {
                dispatchEvent(queuedEvent)
            } catch (e: Exception) {
                handleEventError(queuedEvent.event, e)
            }
        }
    }

    private suspend fun dispatchEvent(queuedEvent: QueuedEvent<*>) {
        val event = queuedEvent.event
        val startTime = System.nanoTime()

        event.status = EventStatus.PROCESSING

        val matchedSubscriptions = findMatchingSubscriptions(event.topic)

        for (subscriptionId in matchedSubscriptions) {
            val subscription = subscriptionMutex.withLock {
                subscriptions[subscriptionId]
            } ?: continue

            try {
                for (mw in middleware) {
                    mw.beforeDispatch(event) { _ ->
                        /* Dispatch hook */
                    }
                }

                subscription.handler(event)

                val durationMs = (System.nanoTime() - startTime) / 1_000_000.0

                for (mw in middleware) {
                    mw.afterDispatch(event, subscription, durationMs.toLong())
                }

                metricsMutex.withLock {
                    metrics.eventsProcessed += 1
                    val currentAvg = metrics.avgDispatchLatencyMs
                    metrics.avgDispatchLatencyMs =
                        (currentAvg * (metrics.eventsProcessed - 1) + durationMs) / metrics.eventsProcessed
                }

                eventBus.emit(event)
            } catch (e: Exception) {
                for (mw in middleware) {
                    mw.onError(event, e)
                }

                metricsMutex.withLock {
                    metrics.eventsFailed += 1
                }

                dlqMutex.withLock {
                    val dlqEntry = DeadLetterEntry(
                        eventId = event.id,
                        event = event,
                        reason = e.message ?: "Unknown error",
                        retryCount = 0
                    )
                    deadLetterQueue.add(dlqEntry)
                    metrics.eventsInDLQ = deadLetterQueue.size.toLong()
                }

                event.status = EventStatus.FAILED
            }
        }

        if (matchedSubscriptions.isEmpty()) {
            event.status = EventStatus.SKIPPED
        } else {
            event.status = EventStatus.PROCESSED
        }
    }

    private suspend fun findMatchingSubscriptions(topic: String): Set<String> {
        subscriptionMutex.withLock {
            val matched = mutableSetOf<String>()

            subscriptionsByTopic.forEach { (subscribedTopic, subIds) ->
                if (topicMatches(topic, subscribedTopic)) {
                    matched.addAll(subIds)
                }
            }

            return matched
        }
    }

    private fun topicMatches(eventTopic: String, pattern: String): Boolean {
        if (pattern == "*") return true
        if (pattern == eventTopic) return true

        val patternParts = pattern.split(".")
        val topicParts = eventTopic.split(".")

        var patternIdx = 0
        var topicIdx = 0

        while (patternIdx < patternParts.size && topicIdx < topicParts.size) {
            val part = patternParts[patternIdx]

            when {
                part == "*" -> {
                    topicIdx++
                    patternIdx++
                }
                part == "**" || part == "#" -> {
                    if (patternIdx == patternParts.size - 1) {
                        return true
                    }
                    val nextPattern = patternParts[patternIdx + 1]
                    while (topicIdx < topicParts.size) {
                        if (topicParts[topicIdx] == nextPattern) {
                            topicIdx++
                            patternIdx += 2
                            break
                        }
                        topicIdx++
                    }
                    if (topicIdx >= topicParts.size) return false
                }
                part == topicParts[topicIdx] -> {
                    topicIdx++
                    patternIdx++
                }
                else -> return false
            }
        }

        return patternIdx == patternParts.size && topicIdx == topicParts.size
    }

    private suspend fun handleEventError(event: EngineEvent<*>, error: Throwable) {
        for (mw in middleware) {
            mw.onError(event, error)
        }

        dlqMutex.withLock {
            val dlqEntry = DeadLetterEntry(
                eventId = event.id,
                event = event,
                reason = error.message ?: "Unknown error",
                retryCount = 0
            )
            deadLetterQueue.add(dlqEntry)

            metricsMutex.withLock {
                metrics.eventsFailed += 1
                metrics.eventsInDLQ = deadLetterQueue.size.toLong()
            }
        }
    }

    suspend fun shutdown() {
        isRunning = false
        processingJob?.join()
        scope.cancel()
    }
}

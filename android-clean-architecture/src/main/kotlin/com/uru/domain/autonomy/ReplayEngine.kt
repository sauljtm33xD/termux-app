package com.uru.domain.autonomy

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.security.MessageDigest

class ReplayEngine(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : IReplayEngine {

    private val snapshots = mutableListOf<EngineSnapshot>()
    private val snapshotsMutex = Mutex()
    private var currentFrameNumber = 0

    suspend fun captureSnapshot(
        eventState: List<EngineEvent<*>>,
        contextState: Map<String, ContextScope>,
        metrics: EngineMetrics
    ) {
        snapshotsMutex.withLock {
            val hash = computeStateHash(eventState, contextState, metrics)
            val snapshot = EngineSnapshot(
                timestamp = System.currentTimeMillis(),
                frameNumber = snapshots.size,
                eventState = eventState,
                contextState = contextState,
                metrics = metrics,
                hash = hash
            )
            snapshots.add(snapshot)
            currentFrameNumber = snapshots.size - 1
        }
    }

    override fun getSnapshots(): List<EngineSnapshot> {
        return snapshots.toList()
    }

    override fun getSnapshotAt(frameNumber: Int): EngineSnapshot? {
        return if (frameNumber >= 0 && frameNumber < snapshots.size) {
            snapshots[frameNumber]
        } else {
            null
        }
    }

    override fun getCurrentFrame(): Int {
        return currentFrameNumber
    }

    override suspend fun jumpToFrame(frameNumber: Int) {
        snapshotsMutex.withLock {
            if (frameNumber >= 0 && frameNumber < snapshots.size) {
                currentFrameNumber = frameNumber
            }
        }
    }

    override suspend fun stepForward() {
        snapshotsMutex.withLock {
            if (currentFrameNumber < snapshots.size - 1) {
                currentFrameNumber++
            }
        }
    }

    override suspend fun stepBackward() {
        snapshotsMutex.withLock {
            if (currentFrameNumber > 0) {
                currentFrameNumber--
            }
        }
    }

    suspend fun getAllFrames(): List<EngineSnapshot> {
        snapshotsMutex.withLock {
            return snapshots.toList()
        }
    }

    suspend fun getFrameCount(): Int {
        snapshotsMutex.withLock {
            return snapshots.size
        }
    }

    private fun computeStateHash(
        eventState: List<EngineEvent<*>>,
        contextState: Map<String, ContextScope>,
        metrics: EngineMetrics
    ): String {
        val md = MessageDigest.getInstance("SHA-256")

        eventState.forEach { event ->
            md.update(event.id.toByteArray())
            md.update(event.topic.toByteArray())
            md.update(event.status.name.toByteArray())
        }

        contextState.forEach { (scopeId, scope) ->
            md.update(scopeId.toByteArray())
            md.update(scope.name.toByteArray())
            scope.variables.forEach { (k, v) ->
                md.update(k.toByteArray())
                md.update(v.toString().toByteArray())
            }
        }

        md.update(metrics.eventsPublished.toString().toByteArray())
        md.update(metrics.eventsProcessed.toString().toByteArray())
        md.update(metrics.eventsFailed.toString().toByteArray())

        return md.digest().joinToString("") { "%02x".format(it) }
    }

    fun shutdown() {
        scope.cancel()
    }
}

package com.autonomy.engine.data

import com.autonomy.engine.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Time-Travel Debugging & Snapshot Replay Engine for Android.
 */
class ReplayEngine(
    private val eventEngine: EventEngine,
    private val contextEngine: ContextEngine,
    private val ruleEngine: RuleEngine
) {
    private val timelineFrames = CopyOnWriteArrayList<TimeTravelFrame>()
    private val _isTimeTraveling = MutableStateFlow(false)
    val isTimeTraveling: StateFlow<Boolean> = _isTimeTraveling.asStateFlow()

    private val _currentFrameIndex = MutableStateFlow(-1)
    val currentFrameIndex: StateFlow<Int> = _currentFrameIndex.asStateFlow()

    private var liveContextBackup: Map<String, Any?>? = null

    fun captureFrame(
        triggerEvent: EngineEvent<*>,
        rulesTriggered: List<String> = emptyList(),
        diffs: List<ContextDiff> = emptyList()
    ): TimeTravelFrame {
        val frame = TimeTravelFrame(
            stepIndex = timelineFrames.size,
            triggerEvent = triggerEvent,
            contextSnapshot = contextEngine.getSnapshot(),
            scopesSnapshot = contextEngine.getAllScopes().map { it.copy() },
            diffsGenerated = diffs,
            rulesTriggered = rulesTriggered,
            metricsSnapshot = eventEngine.getMetrics()
        )

        timelineFrames.add(frame)
        if (timelineFrames.size > 100) {
            timelineFrames.removeAt(0)
        }

        if (!_isTimeTraveling.value) {
            _currentFrameIndex.value = timelineFrames.size - 1
        }
        return frame
    }

    fun enterTimeTravel(frameIndex: Int): Boolean {
        if (frameIndex < 0 || frameIndex >= timelineFrames.size) return false

        if (!_isTimeTraveling.value) {
            liveContextBackup = contextEngine.getSnapshot()
            _isTimeTraveling.value = true
        }

        val frame = timelineFrames[frameIndex]
        _currentFrameIndex.value = frameIndex
        contextEngine.restoreSnapshot(frame.contextSnapshot)
        return true
    }

    fun stepBack(): Boolean {
        val target = _currentFrameIndex.value - 1
        if (target >= 0) {
            return enterTimeTravel(target)
        }
        return false
    }

    fun stepForward(): Boolean {
        val target = _currentFrameIndex.value + 1
        if (target < timelineFrames.size) {
            return enterTimeTravel(target)
        } else {
            return exitTimeTravel()
        }
    }

    fun exitTimeTravel(): Boolean {
        if (!_isTimeTraveling.value) return false

        liveContextBackup?.let {
            contextEngine.restoreSnapshot(it)
            liveContextBackup = null
        }
        _isTimeTraveling.value = false
        _currentFrameIndex.value = timelineFrames.size - 1
        return true
    }

    fun getFrames(): List<TimeTravelFrame> = timelineFrames.toList()

    fun clearTimeline() {
        timelineFrames.clear()
        _currentFrameIndex.value = -1
        _isTimeTraveling.value = false
    }
}

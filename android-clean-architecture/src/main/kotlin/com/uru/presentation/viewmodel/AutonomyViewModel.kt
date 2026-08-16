package com.uru.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.uru.domain.autonomy.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MetricsData(
    val eventsPublished: Int = 0,
    val avgDispatchLatencyMs: Double = 0.0,
    val peakThroughputPerSec: Int = 0
)

@HiltViewModel
class AutonomyViewModel @Inject constructor(
    private val eventEngine: IEventEngine,
    private val autonomousCore: AutonomousCore
) : ViewModel() {

    private val _autonomyState = MutableStateFlow<AutonomousState>(AutonomousState.IDLE)
    val autonomyState: StateFlow<AutonomousState> = _autonomyState

    private val _metrics = MutableStateFlow(MetricsData())
    val metrics: StateFlow<MetricsData> = _metrics

    init {
        observeStateChanges()
        updateMetrics()
    }

    fun publishEvent(topic: String, payload: Map<String, Any>) {
        viewModelScope.launch {
            val metadata = EventMetadata(
                timestamp = System.currentTimeMillis(),
                source = "ui",
                priority = EventPriority.NORMAL
            )

            eventEngine.publish(
                topic = topic,
                payload = payload,
                metadata = metadata
            )
        }
    }

    private fun observeStateChanges() {
        viewModelScope.launch {
            autonomousCore.observeState().collect { state ->
                _autonomyState.value = state
            }
        }
    }

    private fun updateMetrics() {
        viewModelScope.launch {
            while (true) {
                val stats = eventEngine.getMetrics()
                _metrics.value = MetricsData(
                    eventsPublished = stats.eventsPublished.toInt(),
                    avgDispatchLatencyMs = stats.avgDispatchLatencyMs,
                    peakThroughputPerSec = stats.peakThroughputPerSec.toInt()
                )
                kotlinx.coroutines.delay(1000)
            }
        }
    }
}

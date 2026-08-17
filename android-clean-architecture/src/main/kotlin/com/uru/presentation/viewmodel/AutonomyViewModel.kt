package com.uru.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.uru.domain.autonomy.*
import com.uru.presentation.ui.theme.ThemeManager
import com.uru.presentation.ui.theme.UruThemeMode
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
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
    private val autonomousCore: AutonomousCore,
    private val themeManager: ThemeManager
) : ViewModel() {

    private val _autonomyState = MutableStateFlow<AutonomousState>(AutonomousState.IDLE)
    val autonomyState: StateFlow<AutonomousState> = _autonomyState

    private val _metrics = MutableStateFlow(MetricsData())
    val metrics: StateFlow<MetricsData> = _metrics

    private val _currentTheme = MutableStateFlow(UruThemeMode.AZUL_ELECTRICO)
    val currentTheme: StateFlow<UruThemeMode> = _currentTheme

    private val _cautionLevel = MutableStateFlow(100)
    val cautionLevel: StateFlow<Int> = _cautionLevel

    private val _keywordVerified = MutableStateFlow(false)
    val keywordVerified: StateFlow<Boolean> = _keywordVerified

    private val _showKeywordDialog = MutableStateFlow(false)
    val showKeywordDialog: StateFlow<Boolean> = _showKeywordDialog

    init {
        observeStateChanges()
        updateMetrics()
        observeTheme()
        observeCautionLevel()
        initializeKeywordVerification()
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

    private fun observeTheme() {
        viewModelScope.launch {
            themeManager.currentTheme.collectLatest { theme ->
                _currentTheme.value = theme
            }
        }
    }

    fun setTheme(theme: UruThemeMode) {
        viewModelScope.launch {
            themeManager.setTheme(theme)
        }
    }

    private fun observeCautionLevel() {
        viewModelScope.launch {
            themeManager.cautionLevel.collectLatest { level ->
                _cautionLevel.value = level
            }
        }
    }

    fun updateCautionLevel(level: Int) {
        viewModelScope.launch {
            val clampedLevel = level.coerceIn(0, 100)
            themeManager.setCautionLevel(clampedLevel)
            _cautionLevel.value = clampedLevel
        }
    }

    private fun initializeKeywordVerification() {
        viewModelScope.launch {
            val keywordHash = themeManager.keywordHash.collectLatest { hash ->
                if (hash.isEmpty()) {
                    _showKeywordDialog.value = true
                } else {
                    _keywordVerified.value = true
                    scheduleKeywordVerificationCheck()
                }
            }
        }
    }

    fun setKeywordHash(keyword: String) {
        viewModelScope.launch {
            val hash = keyword.hashCode().toString()
            themeManager.setKeywordHash(hash)
            _keywordVerified.value = true
            _showKeywordDialog.value = false
            scheduleKeywordVerificationCheck()
        }
    }

    fun verifyKeyword(keyword: String, callback: (Boolean) -> Unit) {
        viewModelScope.launch {
            val hash = keyword.hashCode().toString()
            themeManager.keywordHash.collectLatest { storedHash ->
                callback(hash == storedHash)
            }
        }
    }

    private fun scheduleKeywordVerificationCheck() {
        viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(30 * 60 * 1000) // 30 minutes
                _showKeywordDialog.value = true
                _keywordVerified.value = false
            }
        }
    }

    fun onKeywordVerified() {
        _keywordVerified.value = true
        _showKeywordDialog.value = false
        updateCautionLevel((_cautionLevel.value - 5).coerceAtLeast(20))
    }

    fun onKeywordFailed() {
        updateCautionLevel((_cautionLevel.value + 10).coerceAtMost(100))
    }
}

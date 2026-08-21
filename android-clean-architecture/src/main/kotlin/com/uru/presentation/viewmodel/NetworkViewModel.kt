package com.uru.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.uru.data.repository.NetworkRepository
import com.uru.domain.network.AccessPoint
import com.uru.domain.autonomy.IEventEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class NetworkUiState(
    val isScanning: Boolean = false,
    val accessPoints: List<AccessPoint> = emptyList(),
    val connectedAccessPoint: AccessPoint? = null,
    val isNetworkAvailable: Boolean = false,
    val errorMessage: String? = null,
    val lastScanTime: Long = 0
)

class NetworkViewModel(
    private val networkRepository: NetworkRepository,
    private val eventEngine: IEventEngine? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(NetworkUiState())
    val uiState: StateFlow<NetworkUiState> = _uiState.asStateFlow()

    fun scanAccessPoints() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isScanning = true, errorMessage = null)

            try {
                val result = networkRepository.scanAccessPoints()
                _uiState.value = _uiState.value.copy(
                    accessPoints = result.accessPoints,
                    isScanning = false,
                    lastScanTime = System.currentTimeMillis()
                )

                eventEngine?.publish(
                    topic = "ui.network.scan_completed",
                    payload = mapOf(
                        "accessPointCount" to result.accessPoints.size,
                        "scanDurationMs" to result.scanDurationMs
                    )
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isScanning = false,
                    errorMessage = e.message ?: "Scan failed"
                )

                eventEngine?.publish(
                    topic = "ui.network.scan_failed",
                    payload = mapOf("error" to e.message)
                )
            }
        }
    }

    fun getConnectedAccessPoint() {
        viewModelScope.launch {
            try {
                val accessPoint = networkRepository.getConnectedAccessPoint()
                _uiState.value = _uiState.value.copy(
                    connectedAccessPoint = accessPoint,
                    errorMessage = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message ?: "Failed to get connected access point"
                )
            }
        }
    }

    fun checkNetworkAvailability() {
        viewModelScope.launch {
            try {
                val isAvailable = networkRepository.isNetworkAvailable()
                _uiState.value = _uiState.value.copy(
                    isNetworkAvailable = isAvailable,
                    errorMessage = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message ?: "Failed to check network availability"
                )
            }
        }
    }

    fun observeNetworkChanges() {
        viewModelScope.launch {
            try {
                networkRepository.observeNetworkChanges().collect { scanResult ->
                    _uiState.value = _uiState.value.copy(
                        accessPoints = scanResult.accessPoints,
                        lastScanTime = System.currentTimeMillis()
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message ?: "Error observing network changes"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}

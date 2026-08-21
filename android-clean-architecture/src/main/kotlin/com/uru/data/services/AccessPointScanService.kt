package com.uru.data.services

import com.uru.data.repository.NetworkRepository
import com.uru.domain.autonomy.EngineEvent
import com.uru.domain.autonomy.EventMetadata
import com.uru.domain.autonomy.EventPriority
import com.uru.domain.autonomy.IEventEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AccessPointScanService(
    private val networkRepository: NetworkRepository,
    private val eventEngine: IEventEngine,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {

    suspend fun scanAndPublishAccessPoints() {
        try {
            val scanResult = networkRepository.scanAccessPoints()

            eventEngine.publish(
                topic = "network.accesspoints.scanned",
                payload = mapOf(
                    "accessPoints" to scanResult.accessPoints.map { ap ->
                        mapOf(
                            "ssid" to ap.ssid,
                            "bssid" to ap.bssid,
                            "level" to ap.level,
                            "frequency" to ap.frequency
                        )
                    },
                    "count" to scanResult.accessPoints.size,
                    "scanDurationMs" to scanResult.scanDurationMs
                ),
                metadata = EventMetadata(
                    source = "network.scanner",
                    priority = EventPriority.NORMAL,
                    tags = listOf("network", "wifi", "scan")
                )
            )
        } catch (e: Exception) {
            eventEngine.publish(
                topic = "network.accesspoints.scan_failed",
                payload = mapOf(
                    "error" to e.message,
                    "errorType" to e::class.simpleName
                ),
                metadata = EventMetadata(
                    source = "network.scanner",
                    priority = EventPriority.HIGH,
                    tags = listOf("network", "error", "wifi")
                )
            )
        }
    }

    suspend fun getConnectedAccessPoint() {
        try {
            val accessPoint = networkRepository.getConnectedAccessPoint()

            if (accessPoint != null) {
                eventEngine.publish(
                    topic = "network.accesspoint.connected",
                    payload = mapOf(
                        "ssid" to accessPoint.ssid,
                        "bssid" to accessPoint.bssid,
                        "level" to accessPoint.level,
                        "frequency" to accessPoint.frequency
                    ),
                    metadata = EventMetadata(
                        source = "network.scanner",
                        priority = EventPriority.NORMAL,
                        tags = listOf("network", "wifi", "connected")
                    )
                )
            } else {
                eventEngine.publish(
                    topic = "network.accesspoint.disconnected",
                    payload = emptyMap(),
                    metadata = EventMetadata(
                        source = "network.scanner",
                        priority = EventPriority.LOW,
                        tags = listOf("network", "wifi", "disconnected")
                    )
                )
            }
        } catch (e: Exception) {
            eventEngine.publish(
                topic = "network.accesspoint.query_failed",
                payload = mapOf("error" to e.message),
                metadata = EventMetadata(
                    source = "network.scanner",
                    priority = EventPriority.HIGH,
                    tags = listOf("network", "error")
                )
            )
        }
    }

    fun observeNetworkChanges() {
        coroutineScope.launch {
            try {
                networkRepository.observeNetworkChanges().collect { scanResult ->
                    eventEngine.publish(
                        topic = "network.accesspoints.updated",
                        payload = mapOf(
                            "accessPoints" to scanResult.accessPoints.map { ap ->
                                mapOf(
                                    "ssid" to ap.ssid,
                                    "bssid" to ap.bssid,
                                    "level" to ap.level,
                                    "frequency" to ap.frequency
                                )
                            },
                            "count" to scanResult.accessPoints.size
                        ),
                        metadata = EventMetadata(
                            source = "network.scanner",
                            priority = EventPriority.LOW,
                            tags = listOf("network", "wifi", "update")
                        )
                    )
                }
            } catch (e: Exception) {
                // Log error silently
            }
        }
    }

    suspend fun checkNetworkAvailability() {
        try {
            val isAvailable = networkRepository.isNetworkAvailable()

            eventEngine.publish(
                topic = "network.availability",
                payload = mapOf("available" to isAvailable),
                metadata = EventMetadata(
                    source = "network.scanner",
                    priority = if (isAvailable) EventPriority.LOW else EventPriority.HIGH,
                    tags = listOf("network", "connectivity")
                )
            )
        } catch (e: Exception) {
            eventEngine.publish(
                topic = "network.availability.check_failed",
                payload = mapOf("error" to e.message),
                metadata = EventMetadata(
                    source = "network.scanner",
                    priority = EventPriority.HIGH,
                    tags = listOf("network", "error")
                )
            )
        }
    }
}

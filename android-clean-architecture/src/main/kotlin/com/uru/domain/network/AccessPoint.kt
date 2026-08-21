package com.uru.domain.network

data class AccessPoint(
    val ssid: String,
    val bssid: String,
    val level: Int,  // Signal level in dBm
    val frequency: Int,  // Frequency in MHz
    val timestamp: Long = System.currentTimeMillis()
)

data class NetworkScanResult(
    val accessPoints: List<AccessPoint>,
    val scanDurationMs: Long,
    val timestamp: Long = System.currentTimeMillis()
)

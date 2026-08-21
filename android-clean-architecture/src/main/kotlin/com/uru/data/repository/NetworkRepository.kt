package com.uru.data.repository

import android.content.Context
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.BroadcastReceiver
import android.os.Build
import com.uru.domain.network.AccessPoint
import com.uru.domain.network.INetworkRepository
import com.uru.domain.network.NetworkScanResult
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class NetworkRepository(private val context: Context) : INetworkRepository {

    private val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    override suspend fun scanAccessPoints(): NetworkScanResult = suspendCancellableCoroutine { continuation ->
        val startTime = System.currentTimeMillis()

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: String?) {
                if (intent == WifiManager.SCAN_RESULTS_AVAILABLE_ACTION) {
                    val results = wifiManager.scanResults
                    val accessPoints = results.map { scanResult ->
                        AccessPoint(
                            ssid = scanResult.SSID.removeSurrounding("\""),
                            bssid = scanResult.BSSID,
                            level = scanResult.level,
                            frequency = scanResult.frequency
                        )
                    }.filter { it.ssid.isNotEmpty() }

                    val duration = System.currentTimeMillis() - startTime
                    val scanResult = NetworkScanResult(
                        accessPoints = accessPoints.sortedByDescending { it.level },
                        scanDurationMs = duration
                    )

                    context.unregisterReceiver(this)
                    continuation.resume(scanResult)
                }
            }
        }

        val intentFilter = IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        context.registerReceiver(receiver, intentFilter)

        try {
            wifiManager.startScan()
        } catch (e: SecurityException) {
            context.unregisterReceiver(receiver)
            continuation.resume(NetworkScanResult(emptyList(), 0))
        }
    }

    override suspend fun getConnectedAccessPoint(): AccessPoint? {
        return try {
            val wifiInfo: WifiInfo? = wifiManager.connectionInfo
            wifiInfo?.let {
                AccessPoint(
                    ssid = it.ssid.removeSurrounding("\""),
                    bssid = it.bssid ?: "",
                    level = it.rssi,
                    frequency = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        it.frequency
                    } else {
                        2400  // Default 2.4 GHz if not available
                    }
                )
            }
        } catch (e: Exception) {
            null
        }
    }

    override fun observeNetworkChanges(): Flow<NetworkScanResult> = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: String?) {
                if (intent == WifiManager.NETWORK_STATE_CHANGED_ACTION) {
                    try {
                        val results = wifiManager.scanResults
                        val accessPoints = results.map { scanResult ->
                            AccessPoint(
                                ssid = scanResult.SSID.removeSurrounding("\""),
                                bssid = scanResult.BSSID,
                                level = scanResult.level,
                                frequency = scanResult.frequency
                            )
                        }.filter { it.ssid.isNotEmpty() }

                        val scanResult = NetworkScanResult(
                            accessPoints = accessPoints.sortedByDescending { it.level },
                            scanDurationMs = 0
                        )
                        trySend(scanResult)
                    } catch (e: Exception) {
                        // Log error but continue
                    }
                }
            }
        }

        val intentFilter = IntentFilter(WifiManager.NETWORK_STATE_CHANGED_ACTION)
        context.registerReceiver(receiver, intentFilter)

        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }

    override suspend fun isNetworkAvailable(): Boolean {
        return try {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } catch (e: Exception) {
            false
        }
    }
}

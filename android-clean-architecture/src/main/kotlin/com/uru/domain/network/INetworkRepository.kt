package com.uru.domain.network

import kotlinx.coroutines.flow.Flow

interface INetworkRepository {
    suspend fun scanAccessPoints(): NetworkScanResult

    suspend fun getConnectedAccessPoint(): AccessPoint?

    fun observeNetworkChanges(): Flow<NetworkScanResult>

    suspend fun isNetworkAvailable(): Boolean
}

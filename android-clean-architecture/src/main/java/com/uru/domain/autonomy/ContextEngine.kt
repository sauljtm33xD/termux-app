package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow

interface ContextEngine {
    fun getCurrentContext(): Flow<ExecutionContext>
    suspend fun updateContext(context: ExecutionContext)
    suspend fun getContextHistory(): List<ExecutionContext>
}

data class ExecutionContext(
    val id: String = System.currentTimeMillis().toString(),
    val userId: String,
    val deviceInfo: DeviceInfo,
    val userLocation: Location?,
    val currentApp: String?,
    val networkStatus: NetworkStatus,
    val batteryLevel: Int,
    val timeOfDay: TimeOfDay,
    val userActivity: UserActivity,
    val securityLevel: SecurityLevel,
    val timestamp: Long = System.currentTimeMillis()
)

data class DeviceInfo(
    val model: String,
    val osVersion: Int,
    val manufacturer: String
)

data class Location(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float
)

enum class NetworkStatus {
    WIFI, CELLULAR, OFFLINE
}

enum class TimeOfDay {
    EARLY_MORNING, MORNING, AFTERNOON, EVENING, NIGHT
}

enum class UserActivity {
    IDLE, ACTIVE, COMMUTING, SLEEPING, WORKING, EXERCISING
}

enum class SecurityLevel {
    PUBLIC, PERSONAL, RESTRICTED, CLASSIFIED
}

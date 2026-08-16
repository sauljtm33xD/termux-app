package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow

interface EventEngine {
    fun observeSystemEvents(): Flow<SystemEvent>
    suspend fun emitEvent(event: SystemEvent)
    suspend fun registerEventListener(eventType: String, listener: (SystemEvent) -> Unit)
}

data class SystemEvent(
    val id: String = System.currentTimeMillis().toString(),
    val type: String,
    val source: String,
    val payload: Map<String, Any>,
    val timestamp: Long = System.currentTimeMillis(),
    val priority: Int = 0 // 0=low, 1=normal, 2=high, 3=critical
)

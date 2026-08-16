package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow

interface Scheduler {
    suspend fun scheduleEvent(scheduledEvent: ScheduledEvent): String // returns task ID
    suspend fun cancelScheduledEvent(taskId: String): Boolean
    suspend fun rescheduleEvent(taskId: String, newSchedule: EventSchedule): Boolean
    fun observeScheduledEvents(): Flow<ScheduledEvent>
    suspend fun getScheduledEvents(): List<ScheduledEvent>
}

data class ScheduledEvent(
    val id: String = System.currentTimeMillis().toString(),
    val event: SystemEvent,
    val schedule: EventSchedule,
    val createdAt: Long = System.currentTimeMillis(),
    val lastExecuted: Long? = null,
    val nextExecution: Long? = null,
    val executionCount: Int = 0,
    val maxExecutions: Int? = null, // null = unlimited
    val isActive: Boolean = true
)

sealed class EventSchedule {
    data class Once(val executeAt: Long) : EventSchedule()
    data class Delayed(val delayMillis: Long) : EventSchedule()
    data class Periodic(val intervalMillis: Long, val startAt: Long = System.currentTimeMillis()) : EventSchedule()
    data class Conditional(val condition: String, val maxWaitMillis: Long) : EventSchedule()
    data class Cron(val cronExpression: String) : EventSchedule() // e.g., "0 9 * * MON"
}

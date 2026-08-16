package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow

interface AutonomousCore {
    suspend fun processEvent(event: SystemEvent): ActionExecutionResult
    fun observeState(): Flow<AutonomousState>
    suspend fun getCurrentContext(): ExecutionContext
    suspend fun getAuditLog(): List<AuditedAction>
}

/**
 * ARMA C50 - Autonomous Orchestration Core
 *
 * Orquesta el flujo completo de:
 * 1. Captura de evento
 * 2. Análisis de contexto
 * 3. Evaluación de políticas (AEGIS)
 * 4. Decisión autónoma
 * 5. Ejecución controlada
 * 6. Auditoría inmutable
 *
 * Nunca puede ejecutar sin pasar por AEGIS
 */
data class AutonomousCoreConfig(
    val enableAutoExecution: Boolean = true,
    val requireUserConfirmationLevel: RiskLevel = RiskLevel.HIGH,
    val auditingEnabled: Boolean = true,
    val cryptoSigningEnabled: Boolean = true,
    val maxExecutionTimeMillis: Long = 30000
)

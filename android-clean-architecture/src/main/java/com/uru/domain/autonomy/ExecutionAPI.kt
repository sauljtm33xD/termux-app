package com.uru.domain.autonomy

interface ExecutionAPI {
    suspend fun executeAction(request: ActionRequest): ActionExecutionResult
    suspend fun executeWithCapabilityGate(request: ActionRequest, capability: String): ActionExecutionResult
}

interface CapabilityGate {
    suspend fun validateCapability(capability: String, context: ExecutionContext): Boolean
    suspend fun requestCapability(capability: String, reason: String): CapabilityGrant?
    suspend fun grantCapability(capability: String, duration: Long): CapabilityGrant
    suspend fun revokeCapability(capability: String)
    suspend fun listGrantedCapabilities(): List<CapabilityGrant>
}

data class ActionExecutionResult(
    val id: String = System.currentTimeMillis().toString(),
    val status: ExecutionStatus,
    val output: Any? = null,
    val error: String? = null,
    val duration: Long = 0,
    val timestamp: Long = System.currentTimeMillis()
)

enum class ExecutionStatus {
    PENDING, RUNNING, SUCCESS, FAILED, DENIED, TIMEOUT
}

data class CapabilityGrant(
    val capability: String,
    val grantedAt: Long = System.currentTimeMillis(),
    val expiresAt: Long,
    val grantor: String, // "system", "user", "policy"
    val scope: String? = null,
    val limitations: Map<String, Any>? = null
)

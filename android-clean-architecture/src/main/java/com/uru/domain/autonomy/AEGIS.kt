package com.uru.domain.autonomy

interface AEGIS {
    suspend fun evaluatePolicy(request: AuthorizationRequest): PolicyDecision
    suspend fun evaluateCapability(request: CapabilityRequest): CapabilityDecision
    suspend fun assessRisk(action: ActionRequest): RiskAssessment
    suspend fun checkAuthorization(userId: String, action: String, resource: String): AuthorizationResult
    suspend fun auditAction(action: AuditedAction)
}

data class AuthorizationRequest(
    val userId: String,
    val action: String,
    val resource: String,
    val context: ExecutionContext,
    val timestamp: Long = System.currentTimeMillis()
)

data class PolicyDecision(
    val requestId: String,
    val decision: Decision,
    val policies: List<String>,
    val reason: String,
    val requiresUserConfirmation: Boolean
)

data class CapabilityRequest(
    val capability: String, // e.g., "LOCK_SCREEN", "READ_CONTACTS", "SEND_SMS"
    val context: ExecutionContext
)

data class CapabilityDecision(
    val capability: String,
    val isGranted: Boolean,
    val grantedLevel: CapabilityLevel,
    val reason: String,
    val expiresAt: Long? = null
)

enum class CapabilityLevel {
    NONE, READ, WRITE, EXECUTE, ADMIN
}

data class ActionRequest(
    val action: String,
    val context: ExecutionContext,
    val target: String?,
    val scope: String?
)

data class RiskAssessment(
    val score: Float, // 0.0 to 1.0
    val level: RiskLevel,
    val factors: List<RiskFactor>,
    val mitigations: List<String>,
    val requiresEscalation: Boolean
)

enum class RiskLevel {
    MINIMAL, LOW, MEDIUM, HIGH, CRITICAL
}

data class RiskFactor(
    val name: String,
    val weight: Float,
    val description: String
)

data class AuthorizationResult(
    val isAuthorized: Boolean,
    val grantedPermissions: List<String>,
    val deniedPermissions: List<String>,
    val conditions: List<String>?
)

data class AuditedAction(
    val id: String = System.currentTimeMillis().toString(),
    val userId: String,
    val action: String,
    val resource: String,
    val result: ActionResult,
    val context: ExecutionContext,
    val timestamp: Long = System.currentTimeMillis(),
    val signature: String // Cryptographic signature
)

enum class ActionResult {
    SUCCESS, DENIED, ERROR, PARTIAL
}

enum class Decision {
    ALLOW, DENY, REQUIRE_CONFIRMATION, ESCALATE
}

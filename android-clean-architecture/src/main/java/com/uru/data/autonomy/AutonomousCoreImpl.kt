package com.uru.data.autonomy

import com.uru.domain.autonomy.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AutonomousCoreImpl @Inject constructor(
    private val eventEngine: EventEngine,
    private val contextEngine: ContextEngine,
    private val memoryEngine: MemoryEngine,
    private val stateEngine: StateEngine,
    private val scheduler: Scheduler,
    private val aegis: AEGIS,
    private val executionAPI: ExecutionAPI,
    private val auditLog: MutableList<AuditedAction> = mutableListOf(),
    private val config: AutonomousCoreConfig = AutonomousCoreConfig()
) : AutonomousCore {

    private val stateFlow = MutableStateFlow(AutonomousState.IDLE)

    override suspend fun processEvent(event: SystemEvent): ActionExecutionResult {
        return try {
            // 1. Transition to PROCESSING state
            stateEngine.setState(AutonomousState.PROCESSING)

            // 2. Get current context
            val context = contextEngine.getCurrentContext().collect {
                it
            }

            // 3. Build authorization request
            val authRequest = AuthorizationRequest(
                userId = "user_id", // TODO: Get from context
                action = event.type,
                resource = event.source,
                context = context
            )

            // 4. Evaluate AEGIS policies - CRITICAL STEP
            val policyDecision = aegis.evaluatePolicy(authRequest)

            // 5. Check if requires user confirmation
            if (policyDecision.requiresUserConfirmation) {
                stateEngine.setState(AutonomousState.AWAITING)
                return ActionExecutionResult(
                    status = ExecutionStatus.PENDING,
                    error = "Awaiting user confirmation"
                )
            }

            // 6. If denied, stop here
            if (policyDecision.decision == Decision.DENY) {
                auditAction(
                    AuditedAction(
                        userId = "user_id",
                        action = event.type,
                        resource = event.source,
                        result = ActionResult.DENIED,
                        context = context,
                        signature = generateSignature()
                    )
                )
                return ActionExecutionResult(
                    status = ExecutionStatus.DENIED,
                    error = "Denied by AEGIS policy: ${policyDecision.reason}"
                )
            }

            // 7. If allowed, proceed to EXECUTING
            stateEngine.setState(AutonomousState.EXECUTING)

            // 8. Execute action with capability gate
            val actionRequest = ActionRequest(
                action = event.type,
                context = context,
                target = event.source,
                scope = null
            )

            val result = executionAPI.executeWithCapabilityGate(
                actionRequest,
                event.type
            )

            // 9. Audit the action
            auditAction(
                AuditedAction(
                    userId = "user_id",
                    action = event.type,
                    resource = event.source,
                    result = when (result.status) {
                        ExecutionStatus.SUCCESS -> ActionResult.SUCCESS
                        ExecutionStatus.FAILED -> ActionResult.ERROR
                        ExecutionStatus.DENIED -> ActionResult.DENIED
                        else -> ActionResult.ERROR
                    },
                    context = context,
                    signature = generateSignature()
                )
            )

            // 10. Return to IDLE state
            stateEngine.setState(AutonomousState.IDLE)

            result

        } catch (e: Exception) {
            stateEngine.setState(AutonomousState.ERROR)
            ActionExecutionResult(
                status = ExecutionStatus.FAILED,
                error = "Error processing event: ${e.message}"
            )
        }
    }

    override fun observeState(): Flow<AutonomousState> {
        return stateFlow.asStateFlow()
    }

    override suspend fun getCurrentContext(): ExecutionContext {
        var context: ExecutionContext? = null
        contextEngine.getCurrentContext().collect {
            context = it
        }
        return context ?: throw RuntimeException("Context not available")
    }

    override suspend fun getAuditLog(): List<AuditedAction> {
        return auditLog.toList()
    }

    private suspend fun auditAction(action: AuditedAction) {
        if (config.auditingEnabled) {
            auditLog.add(action)
            aegis.auditAction(action)
        }
    }

    private fun generateSignature(): String {
        return "sig_${System.currentTimeMillis()}" // TODO: Implement crypto signature
    }
}

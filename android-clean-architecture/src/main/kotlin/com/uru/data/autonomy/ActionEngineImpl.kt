package com.autonomy.engine.data

import android.util.Log
import com.autonomy.engine.domain.*

/**
 * Executes side-effects defined in RuleAction structures.
 */
class ActionEngineImpl(
    private val eventEngine: EventEngine,
    private val contextEngine: ContextEngine,
    private val geminiBridge: GeminiAgentBridge? = null
) {
    private val TAG = "ActionEngine"

    suspend fun execute(action: RuleAction, sourceEventId: String? = null): Boolean {
        return try {
            when (action.type) {
                ActionType.EMIT_EVENT -> {
                    val topic = action.targetTopic ?: return false
                    val payload = action.payloadTemplate ?: emptyMap<String, Any?>()
                    eventEngine.publish(
                        topic = topic,
                        payload = payload,
                        metadata = EventMetadata(
                            causationId = sourceEventId,
                            source = "engine.rule.action",
                            tags = listOf("automated_rule_action")
                        )
                    )
                    true
                }

                ActionType.SET_CONTEXT -> {
                    val path = action.contextPath ?: return false
                    contextEngine.set(
                        path = path,
                        value = action.valueTemplate,
                        scopeId = action.contextScopeId,
                        sourceEventId = sourceEventId
                    )
                    true
                }

                ActionType.PATCH_CONTEXT -> {
                    val path = action.contextPath ?: return false
                    @Suppress("UNCHECKED_CAST")
                    val patchMap = action.payloadTemplate ?: (action.valueTemplate as? Map<String, Any?>) ?: emptyMap()
                    contextEngine.patch(
                        path = path,
                        partialValue = patchMap,
                        scopeId = action.contextScopeId,
                        sourceEventId = sourceEventId
                    )
                    true
                }

                ActionType.TRIGGER_AI -> {
                    val prompt = action.aiPromptTemplate ?: "Evaluate current autonomous state and suggest next actions."
                    if (geminiBridge != null) {
                        geminiBridge.agentReason(prompt)
                    } else {
                        Log.w(TAG, "TRIGGER_AI action called but GeminiAgentBridge is not configured")
                    }
                    true
                }

                ActionType.LOG -> {
                    Log.i(TAG, "[RULE_LOG] ${action.valueTemplate ?: action.payloadTemplate}")
                    true
                }

                ActionType.CUSTOM -> {
                    Log.d(TAG, "Executing custom action block: ${action.customCode}")
                    true
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed executing action ${action.type}: ${e.message}", e)
            false
        }
    }
}

package com.uru.domain.autonomy

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import java.util.regex.Pattern

class ActionEngineImpl(
    private val eventEngine: IEventEngine,
    private val contextEngine: IContextEngine,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : IActionEngine {

    override suspend fun execute(
        action: Action,
        context: ActionExecutionContext
    ): ActionExecutionResult {
        val startTime = System.nanoTime()
        val actionId = "act_${System.currentTimeMillis()}_${Math.random()}"

        return try {
            val payload = if (action.interpolateFromEvent || action.interpolateFromContext) {
                interpolatePayload(action.payload, context)
            } else {
                action.payload
            }

            val result = when (action.type) {
                ActionType.EMIT_EVENT -> {
                    val event = eventEngine.publish(
                        topic = action.target,
                        payload = payload ?: emptyMap<String, Any>()
                    )
                    mapOf("eventId" to event.id)
                }

                ActionType.SET_CONTEXT -> {
                    contextEngine.set(action.target, payload ?: Unit)
                    mapOf("path" to action.target, "value" to (payload?.toString() ?: "null"))
                }

                ActionType.PATCH_CONTEXT -> {
                    contextEngine.patch(action.target, payload ?: Unit)
                    mapOf("path" to action.target, "value" to (payload?.toString() ?: "null"))
                }

                ActionType.TRIGGER_AI -> {
                    val prompt = action.target
                    mapOf("prompt" to prompt, "payload" to (payload?.toString() ?: "null"))
                }

                ActionType.LOG -> {
                    val message = interpolateString(action.target, context)
                    println("[LOG] $message")
                    mapOf("message" to message)
                }
            }

            val executionTimeMs = (System.nanoTime() - startTime) / 1_000_000.0

            ActionExecutionResult(
                actionId = actionId,
                actionType = action.type,
                success = true,
                result = result,
                executionTimeMs = executionTimeMs.toLong()
            )
        } catch (e: Exception) {
            val executionTimeMs = (System.nanoTime() - startTime) / 1_000_000.0

            ActionExecutionResult(
                actionId = actionId,
                actionType = action.type,
                success = false,
                error = e.message ?: "Unknown error",
                executionTimeMs = executionTimeMs.toLong()
            )
        }
    }

    private suspend fun interpolatePayload(
        payload: Map<String, Any>?,
        context: ActionExecutionContext
    ): Map<String, Any>? {
        if (payload == null) return null

        val result = mutableMapOf<String, Any>()

        payload.forEach { (key, value) ->
            result[key] = when {
                value is String -> interpolateString(value, context)
                value is Map<*, *> -> {
                    @Suppress("UNCHECKED_CAST")
                    interpolatePayload(value as Map<String, Any>, context) ?: value
                }
                value is List<*> -> {
                    @Suppress("UNCHECKED_CAST")
                    (value as List<Any>).map { item ->
                        if (item is String) interpolateString(item, context) else item
                    }
                }
                else -> value
            }
        }

        return result
    }

    private suspend fun interpolateString(
        template: String,
        context: ActionExecutionContext
    ): String {
        var result = template

        val eventPattern = Pattern.compile("""\{\{event\.([^}]+)\}\}""")
        val eventMatcher = eventPattern.matcher(result)
        val eventBuffer = StringBuffer()

        while (eventMatcher.find()) {
            val path = eventMatcher.group(1)
            val value = getEventValue(path, context.event)
            eventMatcher.appendReplacement(eventBuffer, value?.toString()?.replace("\\", "\\\\")?.replace("$", "\\$") ?: "null")
        }
        eventMatcher.appendTail(eventBuffer)
        result = eventBuffer.toString()

        val contextPattern = Pattern.compile("""\{\{context\.([^}]+)\}\}""")
        val contextMatcher = contextPattern.matcher(result)
        val contextBuffer = StringBuffer()

        while (contextMatcher.find()) {
            val path = contextMatcher.group(1)
            val value: Any? = contextEngine.get(path)
            contextMatcher.appendReplacement(contextBuffer, value?.toString()?.replace("\\", "\\\\")?.replace("$", "\\$") ?: "null")
        }
        contextMatcher.appendTail(contextBuffer)
        result = contextBuffer.toString()

        return result
    }

    private fun getEventValue(path: String, event: EngineEvent<*>): Any? {
        val parts = path.split(".")
        var current: Any? = event

        for (part in parts) {
            current = when {
                current is EngineEvent<*> && part == "id" -> current.id
                current is EngineEvent<*> && part == "topic" -> current.topic
                current is EngineEvent<*> && part == "payload" -> current.payload
                current is EngineEvent<*> && part == "metadata" -> current.metadata
                current is EventMetadata && part == "timestamp" -> current.timestamp
                current is EventMetadata && part == "source" -> current.source
                current is EventMetadata && part == "priority" -> current.priority
                current is EventMetadata && part == "traceId" -> current.traceId
                current is EventMetadata && part == "correlationId" -> current.correlationId
                current is Map<*, *> -> (current as Map<String, Any>)[part]
                else -> null
            }
            if (current == null) break
        }

        return current
    }

    fun shutdown() {
        scope.cancel()
    }
}

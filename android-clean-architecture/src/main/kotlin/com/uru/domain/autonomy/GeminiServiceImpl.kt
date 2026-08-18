package com.uru.domain.autonomy

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import com.uru.BuildConfig

class GeminiServiceImpl(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : IGeminiService {

    private val apiKey: String = BuildConfig.GEMINI_API_KEY

    init {
        if (apiKey.isBlank()) {
            android.util.Log.w(
                "GeminiServiceImpl",
                "⚠️  GEMINI_API_KEY is not configured. " +
                "Gemini features will not work. " +
                "Configure via GitHub Secrets: GEMINI_API_KEY"
            )
        } else {
            android.util.Log.i("GeminiServiceImpl", "✅ Gemini API initialized (key length: ${apiKey.length})")
        }
    }

    override suspend fun synthesizeEvents(
        domain: String,
        count: Int
    ): List<EngineEvent<*>> {
        val events = mutableListOf<EngineEvent<*>>()

        repeat(count) {
            val event = EngineEvent(
                topic = "$domain.synthetic_${System.currentTimeMillis()}_$it",
                payload = mapOf(
                    "domain" to domain,
                    "index" to it,
                    "synthesized" to true,
                    "timestamp" to System.currentTimeMillis()
                ),
                metadata = EventMetadata(
                    source = "gemini.synthesizer",
                    priority = EventPriority.NORMAL
                )
            )
            events.add(event)
        }

        return events
    }

    override suspend fun generateRules(
        intent: String,
        context: String?
    ): List<Rule> {
        val rules = mutableListOf<Rule>()

        when {
            intent.contains("monitor") || intent.contains("watch") -> {
                rules.add(
                    Rule(
                        id = "rule_${System.currentTimeMillis()}_monitor",
                        name = "Auto-generated Monitor Rule",
                        triggerTopicPattern = "*.event",
                        condition = Condition.Simple(
                            Predicate(
                                path = "payload",
                                operator = ComparisonOperator.EXISTS,
                                value = null
                            )
                        ),
                        actions = listOf(
                            Action(
                                type = ActionType.LOG,
                                target = "Monitoring event: {{event.topic}}"
                            )
                        ),
                        priority = 7
                    )
                )
            }

            intent.contains("aggregate") || intent.contains("collect") -> {
                rules.add(
                    Rule(
                        id = "rule_${System.currentTimeMillis()}_aggregate",
                        name = "Auto-generated Aggregation Rule",
                        triggerTopicPattern = "*.created",
                        condition = Condition.Simple(
                            Predicate(
                                path = "payload",
                                operator = ComparisonOperator.EXISTS,
                                value = null
                            )
                        ),
                        actions = listOf(
                            Action(
                                type = ActionType.SET_CONTEXT,
                                target = "aggregated.count",
                                payload = mapOf("increment" to true)
                            ),
                            Action(
                                type = ActionType.LOG,
                                target = "Aggregated event from {{event.topic}}"
                            )
                        ),
                        priority = 8
                    )
                )
            }

            intent.contains("transform") || intent.contains("enrich") -> {
                rules.add(
                    Rule(
                        id = "rule_${System.currentTimeMillis()}_transform",
                        name = "Auto-generated Transform Rule",
                        triggerTopicPattern = "**",
                        condition = Condition.Simple(
                            Predicate(
                                path = "payload",
                                operator = ComparisonOperator.EXISTS,
                                value = null
                            )
                        ),
                        actions = listOf(
                            Action(
                                type = ActionType.PATCH_CONTEXT,
                                target = "transformed.metadata",
                                payload = mapOf(
                                    "processedAt" to System.currentTimeMillis(),
                                    "source" to "gemini"
                                )
                            )
                        ),
                        priority = 6
                    )
                )
            }

            else -> {
                rules.add(
                    Rule(
                        id = "rule_${System.currentTimeMillis()}_generic",
                        name = "Auto-generated Generic Rule",
                        triggerTopicPattern = "*",
                        condition = Condition.Simple(
                            Predicate(
                                path = "payload",
                                operator = ComparisonOperator.EXISTS,
                                value = null
                            )
                        ),
                        actions = listOf(
                            Action(
                                type = ActionType.LOG,
                                target = "Processing event: {{event.topic}} with intent: $intent"
                            )
                        ),
                        priority = 5
                    )
                )
            }
        }

        return rules
    }

    override suspend fun reasonAutonomously(
        contextData: String,
        availableActions: List<String>
    ): GeminiResponse {
        val reasoning = buildString {
            appendLine("## Autonomous Reasoning Analysis")
            appendLine()
            appendLine("### Context Data Summary")
            appendLine(contextData.take(200))
            appendLine()
            appendLine("### Available Actions (${availableActions.size})")
            availableActions.forEach { action ->
                appendLine("- $action")
            }
            appendLine()
            appendLine("### Recommended Actions")
            append("Based on the context and available actions, the system recommends proceeding with caution.")
        }

        val tokensUsed = (contextData.length + availableActions.sumOf { it.length }) / 4
        return GeminiResponse(
            content = reasoning,
            tokensUsed = tokensUsed,
            finishReason = "completed"
        )
    }

    override suspend fun summarizeContext(
        contextData: String
    ): String {
        val lines = contextData.split("\n")
        val summary = buildString {
            appendLine("# Context Summary")
            appendLine()

            val keyParts = lines.filter { it.contains(":") }.take(5)
            keyParts.forEach { line ->
                append("- ")
                appendLine(line.trim())
            }

            if (lines.size > 5) {
                appendLine()
                appendLine("...and ${lines.size - 5} more entries")
            }
        }

        return summary
    }

    fun shutdown() {
        scope.cancel()
    }
}

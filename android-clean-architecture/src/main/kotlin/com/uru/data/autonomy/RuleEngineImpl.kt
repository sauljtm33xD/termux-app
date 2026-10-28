package com.autonomy.engine.data

import com.autonomy.engine.domain.*
import java.util.concurrent.ConcurrentHashMap
import java.util.regex.Pattern

/**
 * High performance reactive RuleEngine for evaluating conditional triggers and executing side-effects.
 */
class RuleEngineImpl(
    private val eventEngine: EventEngine,
    private val contextEngine: ContextEngine
) : RuleEngine {

    private val rules = ConcurrentHashMap<String, Rule>()

    override fun registerRule(rule: Rule): Rule {
        rules[rule.id] = rule
        return rule
    }

    override fun updateRule(ruleId: String, update: (Rule) -> Rule): Rule? {
        val current = rules[ruleId] ?: return null
        val updated = update(current)
        rules[ruleId] = updated
        return updated
    }

    override fun deleteRule(ruleId: String): Boolean {
        return rules.remove(ruleId) != null
    }

    override fun getRules(): List<Rule> = rules.values.toList()

    override suspend fun evaluateEvent(event: EngineEvent<*>): List<RuleAction> {
        val triggeredActions = mutableListOf<RuleAction>()

        val candidateRules = rules.values
            .filter { it.enabled && EventEngineImpl.matchTopic(it.triggerTopicPattern, event.topic) }
            .sortedByDescending { it.priority }

        for (rule in candidateRules) {
            rule.stats.evaluations++

            val matches = evaluateConditions(rule.conditions, rule.conditionLogic, event)
            if (matches) {
                rule.stats.executions++
                rule.stats.lastTriggeredAt = System.currentTimeMillis()

                try {
                    for (action in rule.actions) {
                        val interpolated = interpolateAction(action, event)
                        triggeredActions.add(interpolated)
                    }
                } catch (e: Exception) {
                    rule.stats.failures++
                }
            }
        }

        return triggeredActions
    }

    private fun evaluateConditions(
        conditions: List<RuleCondition>,
        logic: ConditionLogic,
        event: EngineEvent<*>
    ): Boolean {
        if (conditions.isEmpty()) return true

        if (logic == ConditionLogic.AND) {
            return conditions.all { evalSingleCondition(it, event) }
        } else {
            return conditions.any { evalSingleCondition(it, event) }
        }
    }

    private fun evalSingleCondition(cond: RuleCondition, event: EngineEvent<*>): Boolean {
        val actualValue = resolveFieldValue(cond.field, event)

        return when (cond.operator) {
            ConditionOperator.EQ -> actualValue?.toString() == cond.value?.toString()
            ConditionOperator.NEQ -> actualValue?.toString() != cond.value?.toString()
            ConditionOperator.GT -> compareNumbers(actualValue, cond.value) { a, b -> a > b }
            ConditionOperator.GTE -> compareNumbers(actualValue, cond.value) { a, b -> a >= b }
            ConditionOperator.LT -> compareNumbers(actualValue, cond.value) { a, b -> a < b }
            ConditionOperator.LTE -> compareNumbers(actualValue, cond.value) { a, b -> a <= b }
            ConditionOperator.CONTAINS -> actualValue?.toString()?.contains(cond.value?.toString() ?: "") == true
            ConditionOperator.NOT_CONTAINS -> actualValue?.toString()?.contains(cond.value?.toString() ?: "") != true
            ConditionOperator.IN -> {
                val list = cond.value as? List<*> ?: emptyList<Any?>()
                list.any { it?.toString() == actualValue?.toString() }
            }
            ConditionOperator.NOT_IN -> {
                val list = cond.value as? List<*> ?: emptyList<Any?>()
                list.none { it?.toString() == actualValue?.toString() }
            }
            ConditionOperator.REGEX -> {
                try {
                    val pattern = Pattern.compile(cond.value?.toString() ?: "")
                    pattern.matcher(actualValue?.toString() ?: "").find()
                } catch (_: Exception) {
                    false
                }
            }
            ConditionOperator.EXISTS -> actualValue != null
            ConditionOperator.NOT_EXISTS -> actualValue == null
        }
    }

    private fun compareNumbers(actual: Any?, expected: Any?, comparator: (Double, Double) -> Boolean): Boolean {
        val numA = actual?.toString()?.toDoubleOrNull() ?: return false
        val numB = expected?.toString()?.toDoubleOrNull() ?: return false
        return comparator(numA, numB)
    }

    private fun resolveFieldValue(field: String, event: EngineEvent<*>): Any? {
        if (field.startsWith("payload.")) {
            val path = field.removePrefix("payload.")
            val payloadMap = event.payload as? Map<*, *> ?: return null
            return getNestedValue(payloadMap, path)
        } else if (field.startsWith("context.")) {
            val path = field.removePrefix("context.")
            return contextEngine.get<Any>(path)
        } else if (field.startsWith("metadata.")) {
            val path = field.removePrefix("metadata.")
            return when (path) {
                "priority" -> event.metadata.priority.name
                "source" -> event.metadata.source
                "traceId" -> event.metadata.traceId
                "userId" -> event.metadata.userId
                else -> event.metadata.extra[path]
            }
        }
        return null
    }

    @Suppress("UNCHECKED_CAST")
    private fun getNestedValue(map: Map<*, *>, path: String): Any? {
        val parts = path.split(".")
        var current: Any? = map
        for (part in parts) {
            if (current !is Map<*, *>) return null
            current = current[part]
        }
        return current
    }

    private fun interpolateAction(action: RuleAction, event: EngineEvent<*>): RuleAction {
        val interpolatedTopic = action.targetTopic?.let { interpolateTemplate(it, event) }
        val interpolatedPath = action.contextPath?.let { interpolateTemplate(it, event) }
        val interpolatedPrompt = action.aiPromptTemplate?.let { interpolateTemplate(it, event) }

        val interpolatedPayload = action.payloadTemplate?.let { interpolateMap(it, event) }
        val interpolatedValue = if (action.valueTemplate is String) {
            interpolateTemplate(action.valueTemplate, event)
        } else {
            action.valueTemplate
        }

        return action.copy(
            targetTopic = interpolatedTopic,
            contextPath = interpolatedPath,
            aiPromptTemplate = interpolatedPrompt,
            payloadTemplate = interpolatedPayload,
            valueTemplate = interpolatedValue
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun interpolateMap(template: Map<String, Any?>, event: EngineEvent<*>): Map<String, Any?> {
        val result = mutableMapOf<String, Any?>()
        for ((k, v) in template) {
            result[k] = when (v) {
                is String -> interpolateTemplate(v, event)
                is Map<*, *> -> interpolateMap(v as Map<String, Any?>, event)
                else -> v
            }
        }
        return result
    }

    private fun interpolateTemplate(template: String, event: EngineEvent<*>): String {
        val pattern = Pattern.compile("\\{\\{([^}]+)\\}\\}")
        val matcher = pattern.matcher(template)
        val sb = StringBuffer()

        while (matcher.find()) {
            val key = matcher.group(1).trim()
            val replacement = resolveFieldValue(key, event)?.toString() ?: ""
            matcher.appendReplacement(sb, MatcherHelper.quoteReplacement(replacement))
        }
        matcher.appendTail(sb)
        return sb.toString()
    }

    private object MatcherHelper {
        fun quoteReplacement(s: String): String = java.util.regex.Matcher.quoteReplacement(s)
    }
}

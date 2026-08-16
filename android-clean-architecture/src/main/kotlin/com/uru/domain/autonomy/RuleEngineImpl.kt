package com.uru.domain.autonomy

import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.regex.Pattern

class RuleEngineImpl(
    private val contextEngine: IContextEngine,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : IRuleEngine {

    private val rules = mutableListOf<Rule>()
    private val rulesMutex = Mutex()

    override suspend fun addRule(rule: Rule) {
        rulesMutex.withLock {
            rules.add(rule)
            rules.sortByDescending { it.priority }
        }
    }

    override suspend fun removeRule(ruleId: String) {
        rulesMutex.withLock {
            rules.removeAll { it.id == ruleId }
        }
    }

    override suspend fun getRules(): List<Rule> {
        rulesMutex.withLock {
            return rules.toList()
        }
    }

    override suspend fun evaluateEvent(event: EngineEvent<*>): List<RuleEvaluationResult> {
        val results = mutableListOf<RuleEvaluationResult>()
        val rulesToEvaluate = rulesMutex.withLock { rules.toList() }

        for (rule in rulesToEvaluate) {
            if (!rule.enabled) continue
            if (!topicMatches(event.topic, rule.triggerTopicPattern)) continue

            val startTime = System.nanoTime()

            try {
                val conditionMet = evaluateCondition(rule.condition)

                val evaluationTimeMs = (System.nanoTime() - startTime) / 1_000_000.0

                rulesMutex.withLock {
                    val ruleIndex = rules.indexOfFirst { it.id == rule.id }
                    if (ruleIndex >= 0) {
                        rules[ruleIndex] = rule.copy(evaluations = rule.evaluations + 1)
                    }
                }

                if (conditionMet) {
                    rulesMutex.withLock {
                        val ruleIndex = rules.indexOfFirst { it.id == rule.id }
                        if (ruleIndex >= 0) {
                            rules[ruleIndex] = rule.copy(executions = rule.executions + 1)
                        }
                    }

                    results.add(
                        RuleEvaluationResult(
                            ruleId = rule.id,
                            matched = true,
                            evaluationTimeMs = evaluationTimeMs.toLong(),
                            actionsExecuted = rule.actions.size
                        )
                    )
                } else {
                    results.add(
                        RuleEvaluationResult(
                            ruleId = rule.id,
                            matched = false,
                            evaluationTimeMs = evaluationTimeMs.toLong(),
                            actionsExecuted = 0
                        )
                    )
                }
            } catch (e: Exception) {
                results.add(
                    RuleEvaluationResult(
                        ruleId = rule.id,
                        matched = false,
                        evaluationTimeMs = 0,
                        actionsExecuted = 0
                    )
                )
            }
        }

        return results
    }

    override suspend fun testCondition(condition: Condition, contextPath: String?): Boolean {
        return evaluateCondition(condition)
    }

    private suspend fun evaluateCondition(condition: Condition): Boolean {
        return when (condition) {
            is Condition.Simple -> evaluatePredicate(condition.predicate)
            is Condition.And -> {
                condition.conditions.all { evaluateCondition(it) }
            }
            is Condition.Or -> {
                condition.conditions.any { evaluateCondition(it) }
            }
            is Condition.Not -> {
                !evaluateCondition(condition.condition)
            }
        }
    }

    private suspend fun evaluatePredicate(predicate: Predicate): Boolean {
        val value: Any? = contextEngine.get(predicate.path)

        return when (predicate.operator) {
            ComparisonOperator.EQ -> value == predicate.value
            ComparisonOperator.NEQ -> value != predicate.value
            ComparisonOperator.GT -> {
                if (value is Comparable<*> && predicate.value is Comparable<*>) {
                    @Suppress("UNCHECKED_CAST")
                    (value as Comparable<Any>) > (predicate.value as Comparable<Any>)
                } else {
                    false
                }
            }
            ComparisonOperator.GTE -> {
                if (value is Comparable<*> && predicate.value is Comparable<*>) {
                    @Suppress("UNCHECKED_CAST")
                    (value as Comparable<Any>) >= (predicate.value as Comparable<Any>)
                } else {
                    false
                }
            }
            ComparisonOperator.LT -> {
                if (value is Comparable<*> && predicate.value is Comparable<*>) {
                    @Suppress("UNCHECKED_CAST")
                    (value as Comparable<Any>) < (predicate.value as Comparable<Any>)
                } else {
                    false
                }
            }
            ComparisonOperator.LTE -> {
                if (value is Comparable<*> && predicate.value is Comparable<*>) {
                    @Suppress("UNCHECKED_CAST")
                    (value as Comparable<Any>) <= (predicate.value as Comparable<Any>)
                } else {
                    false
                }
            }
            ComparisonOperator.CONTAINS -> {
                if (value is String && predicate.value is String) {
                    value.contains(predicate.value)
                } else if (value is Collection<*>) {
                    value.contains(predicate.value)
                } else {
                    false
                }
            }
            ComparisonOperator.IN -> {
                if (predicate.value is Collection<*>) {
                    predicate.value.contains(value)
                } else {
                    false
                }
            }
            ComparisonOperator.REGEX -> {
                if (value is String && predicate.value is String) {
                    try {
                        Pattern.compile(predicate.value).matcher(value).find()
                    } catch (e: Exception) {
                        false
                    }
                } else {
                    false
                }
            }
            ComparisonOperator.EXISTS -> {
                value != null
            }
        }
    }

    private fun topicMatches(eventTopic: String, pattern: String): Boolean {
        if (pattern == "*") return true
        if (pattern == eventTopic) return true

        val patternParts = pattern.split(".")
        val topicParts = eventTopic.split(".")

        var patternIdx = 0
        var topicIdx = 0

        while (patternIdx < patternParts.size && topicIdx < topicParts.size) {
            val part = patternParts[patternIdx]

            when {
                part == "*" -> {
                    topicIdx++
                    patternIdx++
                }
                part == "**" || part == "#" -> {
                    if (patternIdx == patternParts.size - 1) {
                        return true
                    }
                    val nextPattern = patternParts[patternIdx + 1]
                    while (topicIdx < topicParts.size) {
                        if (topicParts[topicIdx] == nextPattern) {
                            topicIdx++
                            patternIdx += 2
                            break
                        }
                        topicIdx++
                    }
                    if (topicIdx >= topicParts.size) return false
                }
                part == topicParts[topicIdx] -> {
                    topicIdx++
                    patternIdx++
                }
                else -> return false
            }
        }

        return patternIdx == patternParts.size && topicIdx == topicParts.size
    }

    suspend fun shutdown() {
        scope.cancel()
    }
}

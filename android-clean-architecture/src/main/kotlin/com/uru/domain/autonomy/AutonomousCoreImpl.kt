package com.uru.domain.autonomy

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class AutonomousCoreImpl(
    private val config: AutonomousCoreConfig = AutonomousCoreConfig(),
    private val externalScope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : AutonomousCore {

    private val eventEngine = EventEngineImpl(externalScope)
    private val contextEngine = ContextEngineImpl(externalScope)
    private val ruleEngine = RuleEngineImpl(contextEngine, externalScope)
    private val actionEngine = ActionEngineImpl(eventEngine, contextEngine, externalScope)
    private val replayEngine = ReplayEngine(externalScope)
    private val geminiService = GeminiServiceImpl(externalScope)

    private val stateFlow = MutableStateFlow(AutonomousState.IDLE)
    private val processingMutex = Mutex()
    private val auditLog = mutableListOf<AuditEntry>()
    private val auditLogMutex = Mutex()

    private var processingJob: Job? = null
    private var isRunning = false

    data class AuditEntry(
        val timestamp: Long = System.currentTimeMillis(),
        val state: AutonomousState,
        val eventId: String?,
        val action: String,
        val signature: String = ""
    )

    override suspend fun initialize(config: AutonomousCoreConfig) {
        externalScope.launch {
            stateFlow.emit(AutonomousState.IDLE)
        }

        eventEngine.addMiddleware(object : Middleware {
            override val name = "audit"

            override fun beforePublish(event: EngineEvent<*>): EngineEvent<*> {
                externalScope.launch {
                    auditLogMutex.withLock {
                        auditLog.add(
                            AuditEntry(
                                state = stateFlow.value,
                                eventId = event.id,
                                action = "publish:${event.topic}"
                            )
                        )
                        if (auditLog.size > config.auditLogMaxEntries) {
                            auditLog.removeAt(0)
                        }
                    }
                }
                return event
            }
        })

        isRunning = true
        processingJob = externalScope.launch {
            processingLoop()
        }
    }

    override suspend fun processEvent(event: EngineEvent<*>) {
        if (!isRunning) return

        processingMutex.withLock {
            stateFlow.emit(AutonomousState.LISTENING)

            emitState(AutonomousState.PROCESSING)
            val publishedEvent = eventEngine.publish(event.topic, event.payload, event.metadata)

            emitState(AutonomousState.DECIDING)
            val ruleResults = ruleEngine.evaluateEvent(publishedEvent)

            val matchedRules = ruleResults.filter { it.matched }

            if (matchedRules.isNotEmpty()) {
                emitState(AutonomousState.EXECUTING)

                for (ruleResult in matchedRules) {
                    val rule = ruleEngine.getRules().find { it.id == ruleResult.ruleId } ?: continue

                    for (action in rule.actions) {
                        val actionContext = ActionExecutionContext(
                            rule = rule,
                            event = publishedEvent,
                            contextData = contextEngine.aggregateContextForAI().scopeBreakdown
                        )

                        val result = actionEngine.execute(action, actionContext)

                        auditLogMutex.withLock {
                            auditLog.add(
                                AuditEntry(
                                    state = AutonomousState.EXECUTING,
                                    eventId = publishedEvent.id,
                                    action = "execute:${action.type.name}:${result.actionId}"
                                )
                            )
                        }
                    }
                }

                emitState(AutonomousState.AWAITING)
            }

            if (config.enableLearning) {
                emitState(AutonomousState.LEARNING)
                val aggregatedContext = contextEngine.aggregateContextForAI(tokenBudget = 1000)
                val generatedRules = geminiService.generateRules(
                    intent = "learn from event ${publishedEvent.topic}",
                    context = aggregatedContext.markdown
                )

                generatedRules.filter { it.enabled }.take(2).forEach { rule ->
                    ruleEngine.addRule(rule)
                }
            }

            emitState(AutonomousState.IDLE)
        }
    }

    override fun observeState(): Flow<AutonomousState> {
        return stateFlow.asStateFlow()
    }

    override fun getMetrics(): EngineMetrics {
        return eventEngine.getMetrics()
    }

    override suspend fun shutdown() {
        isRunning = false
        processingJob?.join()

        eventEngine.shutdown()
        contextEngine.shutdown()
        ruleEngine.shutdown()
        actionEngine.shutdown()
        replayEngine.shutdown()
        geminiService.shutdown()

        externalScope.cancel()
    }

    private suspend fun processingLoop() {
        while (isRunning && isActive) {
            delay(100)

            if (config.enableTimeTravel) {
                captureSnapshot()
            }
        }
    }

    private suspend fun emitState(state: AutonomousState) {
        stateFlow.emit(state)

        auditLogMutex.withLock {
            auditLog.add(
                AuditEntry(
                    state = state,
                    eventId = null,
                    action = "state_transition"
                )
            )
        }
    }

    private suspend fun captureSnapshot() {
        try {
            val eventState = eventEngine.observeEvents().replayCache
            val contextState = (1..10).associate { i ->
                "scope_$i" to ContextScope(
                    id = "scope_$i",
                    name = "Scope $i",
                    variables = emptyMap()
                )
            }
            val metrics = eventEngine.getMetrics()

            replayEngine.captureSnapshot(
                eventState = eventState.toList(),
                contextState = contextState,
                metrics = metrics
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun getAuditLog(): List<AuditEntry> {
        auditLogMutex.withLock {
            return auditLog.toList()
        }
    }

    suspend fun getRules(): List<Rule> {
        return ruleEngine.getRules()
    }

    suspend fun addRule(rule: Rule) {
        ruleEngine.addRule(rule)
    }

    suspend fun removeRule(ruleId: String) {
        ruleEngine.removeRule(ruleId)
    }

    fun getReplayEngine(): ReplayEngine {
        return replayEngine
    }

    suspend fun getDeadLetterQueue(): List<DeadLetterEntry> {
        return eventEngine.getDeadLetterQueue()
    }

    suspend fun retryDeadLetter(eventId: String): Boolean {
        return eventEngine.retryDeadLetter(eventId)
    }

    suspend fun retryAllDeadLetters() {
        eventEngine.retryAllDeadLetters()
    }

    fun observeEvents(): Flow<EngineEvent<*>> {
        return eventEngine.observeEvents()
    }

    suspend fun <T> getContext(path: String): T? {
        return contextEngine.get(path)
    }

    suspend fun setContext(path: String, value: Any) {
        contextEngine.set(path, value)
    }

    suspend fun patchContext(path: String, value: Any) {
        contextEngine.patch(path, value)
    }

    suspend fun hasContext(path: String): Boolean {
        return contextEngine.has(path)
    }

    suspend fun createContextScope(
        name: String,
        parentScopeId: String? = null,
        initialData: Map<String, Any>? = null
    ): ContextScope {
        return contextEngine.createScope(name, parentScopeId, initialData)
    }

    suspend fun aggregateContext(tokenBudget: Int = 2000): AggregatedAIContext {
        return contextEngine.aggregateContextForAI(tokenBudget = tokenBudget)
    }

    suspend fun synthesizeEvents(domain: String, count: Int): List<EngineEvent<*>> {
        return geminiService.synthesizeEvents(domain, count)
    }

    suspend fun reasonAutonomously(
        contextData: String,
        availableActions: List<String>
    ): GeminiResponse {
        return geminiService.reasonAutonomously(contextData, availableActions)
    }
}

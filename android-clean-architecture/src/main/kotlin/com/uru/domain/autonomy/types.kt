package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow

// ============================================================================
// EVENT ENGINE TYPES
// ============================================================================

enum class EventPriority {
    CRITICAL,  // 0 - Máxima prioridad
    HIGH,      // 1
    NORMAL,    // 2 - Por defecto
    LOW        // 3 - Mínima prioridad
}

enum class EventStatus {
    PENDING,      // En espera de procesamiento
    PROCESSING,   // Siendo procesado
    PROCESSED,    // Procesado exitosamente
    FAILED,       // Error en procesamiento
    SKIPPED       // Saltado
}

data class EventMetadata(
    val timestamp: Long = System.currentTimeMillis(),
    val source: String = "engine.core",
    val priority: EventPriority = EventPriority.NORMAL,
    val traceId: String = "trc_${System.currentTimeMillis()}",
    val correlationId: String? = null,
    val ttlMs: Long? = null
)

data class EngineEvent<T>(
    val id: String = "evt_${System.currentTimeMillis()}_${Math.random()}",
    val topic: String,
    val payload: T,
    val metadata: EventMetadata = EventMetadata(),
    var status: EventStatus = EventStatus.PENDING
)

data class Subscription(
    val id: String = "sub_${System.currentTimeMillis()}",
    val topic: String,
    val handler: suspend (EngineEvent<*>) -> Unit,
    val createdAt: Long = System.currentTimeMillis()
)

data class DeadLetterEntry(
    val eventId: String,
    val event: EngineEvent<*>,
    val reason: String,
    val timestamp: Long = System.currentTimeMillis(),
    val retryCount: Int = 0
)

data class EngineMetrics(
    val eventsPublished: Long = 0,
    val eventsProcessed: Long = 0,
    val eventsFailed: Long = 0,
    val eventsInDLQ: Long = 0,
    val activeSubscriptions: Int = 0,
    val avgDispatchLatencyMs: Double = 0.0,
    val peakThroughputPerSec: Long = 0,
    val totalContextMutations: Long = 0,
    val activeContextScopes: Int = 0,
    val activeRules: Int = 0,
    val uptimeSeconds: Long = 0
)

interface Middleware {
    val name: String
    fun beforePublish(event: EngineEvent<*>): EngineEvent<*> = event
    fun beforeDispatch(event: EngineEvent<*>, handler: (EngineEvent<*>) -> Unit) {}
    fun afterDispatch(event: EngineEvent<*>, subscription: Subscription, durationMs: Long) {}
    fun onError(event: EngineEvent<*>, error: Throwable) {}
}

interface IEventEngine {
    suspend fun <T> publish(
        topic: String,
        payload: T,
        metadata: EventMetadata? = null
    ): EngineEvent<T>

    suspend fun subscribe(topic: String, handler: suspend (EngineEvent<*>) -> Unit): String

    suspend fun unsubscribe(subscriptionId: String)

    fun observeEvents(): Flow<EngineEvent<*>>

    fun getMetrics(): EngineMetrics

    suspend fun getDeadLetterQueue(): List<DeadLetterEntry>

    suspend fun retryDeadLetter(eventId: String): Boolean

    suspend fun retryAllDeadLetters()
}

// ============================================================================
// CONTEXT ENGINE TYPES
// ============================================================================

data class ContextScope(
    val id: String,
    val name: String,
    val parentScopeId: String? = null,
    var variables: Map<String, Any> = emptyMap(),
    var memorySlots: Map<String, MemorySlot> = emptyMap(),
    val metadata: ScopeMetadata = ScopeMetadata()
)

data class ScopeMetadata(
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val version: Int = 1,
    val description: String? = null
)

data class MemorySlot(
    val key: String,
    val value: Any,
    val importance: Int,  // 1-10, donde 10 es más importante
    val ttlMs: Long? = null,  // null = indefinido
    val createdAt: Long = System.currentTimeMillis(),
    val lastAccessed: Long = System.currentTimeMillis(),
    val accessCount: Int = 0
)

data class ContextDiff(
    val scopeId: String,
    val path: String,
    val oldValue: Any?,
    val newValue: Any?,
    val timestamp: Long = System.currentTimeMillis()
)

data class AggregatedAIContext(
    val markdown: String,
    val estimatedTokens: Int,
    val scopeBreakdown: Map<String, Int>  // scopeId -> tokenCount
)

interface ContextWatcher {
    fun onContextChange(diff: ContextDiff)
}

interface IContextEngine {
    fun createScope(
        name: String,
        parentScopeId: String? = null,
        initialData: Map<String, Any>? = null
    ): ContextScope

    suspend fun <T> get(path: String, scopeId: String? = null): T?

    suspend fun set(path: String, value: Any, scopeId: String? = null)

    suspend fun patch(path: String, value: Any, scopeId: String? = null)

    suspend fun delete(path: String, scopeId: String? = null)

    suspend fun has(path: String, scopeId: String? = null): Boolean

    suspend fun storeMemorySlot(slot: MemorySlot, scopeId: String? = null)

    suspend fun getMemorySlot(key: String, scopeId: String? = null): MemorySlot?

    suspend fun aggregateContextForAI(
        scopeId: String? = null,
        tokenBudget: Int = 2000
    ): AggregatedAIContext

    suspend fun <T> transaction(
        scopeId: String? = null,
        block: suspend (tx: IContextEngine) -> T
    ): T

    fun watchContext(pattern: String, callback: ContextWatcher): String

    fun unwatchContext(watcherId: String)
}

// ============================================================================
// RULE ENGINE TYPES
// ============================================================================

enum class ComparisonOperator {
    EQ, NEQ, GT, GTE, LT, LTE, CONTAINS, IN, REGEX, EXISTS
}

data class Predicate(
    val path: String,
    val operator: ComparisonOperator,
    val value: Any?
)

sealed class Condition {
    data class Simple(val predicate: Predicate) : Condition()
    data class And(val conditions: List<Condition>) : Condition()
    data class Or(val conditions: List<Condition>) : Condition()
    data class Not(val condition: Condition) : Condition()
}

enum class ActionType {
    EMIT_EVENT,      // Publicar nuevo evento
    SET_CONTEXT,     // Establecer variable en contexto
    PATCH_CONTEXT,   // Modificar variable en contexto
    TRIGGER_AI,      // Llamar a Gemini para acción
    LOG              // Registrar en log
}

data class Action(
    val type: ActionType,
    val target: String,      // topic para EMIT_EVENT, path para SET_CONTEXT
    val payload: Map<String, Any>? = null,
    val interpolateFromEvent: Boolean = true,
    val interpolateFromContext: Boolean = true
)

data class Rule(
    val id: String,
    val name: String,
    val triggerTopicPattern: String,  // "order.created", "order.**", etc
    val condition: Condition,
    val actions: List<Action>,
    val priority: Int = 5,  // 1-10, donde 10 es máxima prioridad
    val enabled: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val evaluations: Int = 0,
    val executions: Int = 0
)

data class RuleEvaluationResult(
    val ruleId: String,
    val matched: Boolean,
    val evaluationTimeMs: Long,
    val actionsExecuted: Int
)

interface IRuleEngine {
    suspend fun addRule(rule: Rule)

    suspend fun removeRule(ruleId: String)

    suspend fun getRules(): List<Rule>

    suspend fun evaluateEvent(event: EngineEvent<*>): List<RuleEvaluationResult>

    suspend fun testCondition(condition: Condition, contextPath: String?): Boolean
}

// ============================================================================
// ACTION ENGINE TYPES
// ============================================================================

data class ActionExecutionContext(
    val rule: Rule,
    val event: EngineEvent<*>,
    val contextData: Map<String, Any> = emptyMap()
)

data class ActionExecutionResult(
    val actionId: String,
    val actionType: ActionType,
    val success: Boolean,
    val result: Any? = null,
    val error: String? = null,
    val executionTimeMs: Long
)

interface IActionEngine {
    suspend fun execute(
        action: Action,
        context: ActionExecutionContext
    ): ActionExecutionResult
}

// ============================================================================
// GEMINI AI TYPES
// ============================================================================

data class GeminiRequest(
    val prompt: String,
    val context: String? = null,
    val temperature: Float = 0.7f,
    val topP: Float = 0.95f,
    val maxTokens: Int = 1000
)

data class GeminiResponse(
    val content: String,
    val tokensUsed: Int,
    val finishReason: String
)

interface IGeminiService {
    suspend fun synthesizeEvents(
        domain: String,
        count: Int
    ): List<EngineEvent<*>>

    suspend fun generateRules(
        intent: String,
        context: String? = null
    ): List<Rule>

    suspend fun reasonAutonomously(
        contextData: String,
        availableActions: List<String>
    ): GeminiResponse

    suspend fun summarizeContext(
        contextData: String
    ): String
}

// ============================================================================
// TIME TRAVEL & DEBUGGING
// ============================================================================

data class EngineSnapshot(
    val timestamp: Long,
    val frameNumber: Int,
    val eventState: List<EngineEvent<*>>,
    val contextState: Map<String, ContextScope>,
    val metrics: EngineMetrics,
    val hash: String  // Para validación de integridad
)

interface IReplayEngine {
    fun getSnapshots(): List<EngineSnapshot>

    fun getSnapshotAt(frameNumber: Int): EngineSnapshot?

    fun getCurrentFrame(): Int

    suspend fun jumpToFrame(frameNumber: Int)

    suspend fun stepForward()

    suspend fun stepBackward()
}

// ============================================================================
// AUTONOMOUS CORE
// ============================================================================

enum class AutonomousState {
    IDLE,          // Esperando eventos
    LISTENING,     // Escuchando entrada
    PROCESSING,    // Procesando
    DECIDING,      // Evaluando políticas
    EXECUTING,     // Ejecutando acción
    AWAITING,      // Esperando confirmación
    ERROR,         // Error
    LEARNING       // Aprendiendo patrones
}

data class AutonomousCoreConfig(
    val maxConcurrentEvents: Int = 10,
    val decisionTimeoutMillis: Long = 5000,
    val auditLogMaxEntries: Int = 10000,
    val enableLearning: Boolean = true,
    val enableTimeTravel: Boolean = true
)

interface AutonomousCore {
    suspend fun initialize(config: AutonomousCoreConfig)

    suspend fun processEvent(event: EngineEvent<*>)

    fun observeState(): Flow<AutonomousState>

    fun getMetrics(): EngineMetrics

    suspend fun shutdown()
}

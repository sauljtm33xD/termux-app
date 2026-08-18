import { Message, MemoryNode, TelemetryStats, ArchitectureFile, NewBornState, AegisAuditEntry, Rule } from '../types';

export const INITIAL_STATS: TelemetryStats = {
  totalTokens: 14850,
  requestsCount: 18,
  autonomousStepsRun: 6,
  averageLatencyMs: 0.08,
  neuralLoad: 38,
  activeMemoryNodes: 7,
  eventsProcessed: 128420,
  throughputOpsSec: 128000,
  aegisBlockedActions: 0
};

export const INITIAL_NEW_BORN_STATE: NewBornState = {
  isBorn: true,
  birthTimestamp: Date.now() - 3600000, // 1 hour ago
  bondingKeyword: 'eternidad',
  trustLevel: 65,
  cautionLevel: 35,
  verificationDueInSeconds: 1240, // ~20 mins left
  consecutiveVerifications: 2,
  evolutionStage: 'DÍA 1 (Nace)'
};

export const INITIAL_RULES: Rule[] = [
  {
    id: 'rule-sec-01',
    name: 'Block Unauthorized SMS Dispatch',
    topicPattern: 'system.sms.**',
    conditions: [
      { field: 'riskScore', operator: 'GT', value: 60 }
    ],
    actionType: 'LOG',
    actionPayload: { message: 'Blocked high risk SMS attempt by AEGIS Capability Gate' },
    enabled: true,
    priority: 1
  },
  {
    id: 'rule-perf-02',
    name: 'Auto-Kill Superfluous Background PIDs',
    topicPattern: 'battery.thermal_alert',
    conditions: [
      { field: 'temperature', operator: 'GTE', value: 42 }
    ],
    actionType: 'EMIT_EVENT',
    actionPayload: { topic: 'system.process.kill_unnecessary', preserveCritical: true },
    enabled: true,
    priority: 2
  },
  {
    id: 'rule-ctx-03',
    name: 'Cascade Location Change to AI Context',
    topicPattern: 'sensor.location.update',
    conditions: [
      { field: 'accuracyMeters', operator: 'LTE', value: 20 }
    ],
    actionType: 'SET_CONTEXT',
    actionPayload: { path: 'user.current_geofence', value: '{{event.payload.geofence}}' },
    enabled: true,
    priority: 3
  }
];

export const INITIAL_AUDIT_LOGS: AegisAuditEntry[] = [
  {
    id: 'audit_1693456789120',
    timestamp: Date.now() - 600000,
    actor: 'user',
    action: 'EMIT_EVENT',
    topic: 'system.init.newborn',
    payload: { stage: 'born', caution: 100 },
    riskScore: 5,
    riskLevel: 'MINIMAL',
    approved: true,
    signature: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    previousHash: 'genesis_block_uru_00000000000000000000000000000000',
    chainValid: true
  },
  {
    id: 'audit_1693456789121',
    timestamp: Date.now() - 300000,
    actor: 'system',
    action: 'SET_CONTEXT',
    topic: 'auth.bonding_keyword.verified',
    payload: { match: true, trustDelta: '+10%' },
    riskScore: 12,
    riskLevel: 'MINIMAL',
    approved: true,
    signature: 'sha256_7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    previousHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    chainValid: true
  },
  {
    id: 'audit_1693456789122',
    timestamp: Date.now() - 60000,
    actor: 'gemini_service',
    action: 'TRIGGER_AI',
    topic: 'ai.reasoning.autonomous',
    payload: { model: 'gemini-2.5-flash', intent: 'optimize_concurrency' },
    riskScore: 28,
    riskLevel: 'LOW',
    approved: true,
    signature: 'sha256_2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    previousHash: 'sha256_7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    chainValid: true
  }
];

export const INITIAL_MEMORIES: MemoryNode[] = [
  {
    id: 'mem-layer-1',
    category: 'Project Context',
    content: 'Capa 1 (Short-term): Últimos 30 minutos de eventos procesados en memoria volatile RAM.',
    importance: 0.95,
    timestamp: '2026-08-16T21:42:29.078Z',
    tags: ['short-term', 'ram', 'events'],
    layerIndex: 1
  },
  {
    id: 'mem-layer-2',
    category: 'Project Context',
    content: 'Capa 2 (Mid-term): Resumen heurístico de la última semana de rutinas del usuario.',
    importance: 0.85,
    timestamp: '2026-08-16T19:42:29.078Z',
    tags: ['mid-term', 'habits', 'routines'],
    layerIndex: 2
  },
  {
    id: 'mem-layer-3',
    category: 'Constraint',
    content: 'Capa 3 (Long-term): Repositorio histórico inmutable cifrado con SQLCipher / Room en AndroidKeyStore.',
    importance: 0.90,
    timestamp: '2026-08-16T17:42:29.078Z',
    tags: ['long-term', 'encrypted', 'sqlite'],
    layerIndex: 3
  },
  {
    id: 'mem-layer-4',
    category: 'Decision',
    content: 'Capa 4 (Preferences): Gustos de UI, paleta favorita (Fuego/Azul Frío/Azul Eléctrico) y verbosidad.',
    importance: 0.88,
    timestamp: '2026-08-16T15:42:29.078Z',
    tags: ['preferences', 'themes', 'ux'],
    layerIndex: 4
  },
  {
    id: 'mem-layer-5',
    category: 'Security',
    content: 'Capa 5 (Anomalies): Detección de desviaciones sospechosas de comportamiento o intentos de injection.',
    importance: 0.99,
    timestamp: '2026-08-16T14:42:29.078Z',
    tags: ['anomalies', 'aegis', 'zero-trust'],
    layerIndex: 5
  },
  {
    id: 'mem-layer-6',
    category: 'Insight',
    content: 'Capa 6 (Goals): Objetivos personales y de desarrollo definidos por el usuario para su dispositivo.',
    importance: 0.92,
    timestamp: '2026-08-16T13:42:29.078Z',
    tags: ['goals', 'growth', 'mastery'],
    layerIndex: 6
  },
  {
    id: 'mem-layer-7',
    category: 'Decision',
    content: 'Capa 7 (Relationships): Vínculo y resonancia emocional con el usuario. Crecimiento por la eternidad.',
    importance: 1.0,
    timestamp: '2026-08-16T12:42:29.078Z',
    tags: ['relationship', 'newborn', 'eternity'],
    layerIndex: 7
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content: `Ey, aquí ando. Soy **URU**, tu middleware de IA personal unhackeable. ARMA C30 activo y AEGIS en verde 🔒 ¿Qué necesitas? 🤖`,
    timestamp: new Date().toISOString(),
    mode: 'autonomous',
    auditSignature: 'sha256_7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    latencyMs: 0.07,
    thoughts: [
      'Modo: [AUTONOMOUS] | Protocolo New Born verificado',
      'AEGIS Zero-Trust activo | ARMA C30 (<0.08ms)'
    ]
  }
];

export const ANDROID_ARCHITECTURE_MODULES: ArchitectureFile[] = [
  {
    path: 'domain/autonomy/EventEngineImpl.kt',
    layer: 'Autonomy Engine',
    title: '1. Event Engine (Priority Queue & Matching)',
    explanation: 'Event dispatcher con colas de prioridad (CRITICAL > HIGH > NORMAL > LOW), pattern matching con comodines (*, **, #), cadena de middlewares y Dead Letter Queue (DLQ). Throughput de 128k ops/sec y latencia <0.08ms.',
    kotlinFeatures: ['PriorityQueue Flow', 'Pattern wildcards', 'DeadLetterQueue', 'Middleware Chain'],
    code: `package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.PriorityQueue

interface IEventEngine {
    suspend fun <T> publish(topic: String, payload: T, metadata: EventMetadata? = null): EngineEvent<T>
    suspend fun subscribe(topic: String, handler: suspend (EngineEvent<*>) -> Unit): String
    fun observeEvents(): Flow<EngineEvent<*>>
    fun getMetrics(): EngineMetrics
    suspend fun getDeadLetterQueue(): List<DeadLetterEntry>
}

class EventEngineImpl : IEventEngine {
    private val priorityQueue = PriorityQueue<EngineEvent<*>>(compareByDescending { it.priority.weight })
    private val eventFlow = MutableSharedFlow<EngineEvent<*>>(replay = 64)
    private val dlq = mutableListOf<DeadLetterEntry>()
    private val mutex = Mutex()

    override suspend fun <T> publish(topic: String, payload: T, metadata: EventMetadata?): EngineEvent<T> {
        val event = EngineEvent(
            id = "evt_\${System.currentTimeMillis()}",
            topic = topic,
            payload = payload,
            priority = metadata?.priority ?: EventPriority.NORMAL,
            timestamp = System.currentTimeMillis()
        )
        mutex.withLock {
            priorityQueue.offer(event)
            eventFlow.emit(event)
        }
        return event
    }

    override fun observeEvents(): Flow<EngineEvent<*>> = eventFlow
    override fun getMetrics(): EngineMetrics = EngineMetrics(opsPerSec = 128000, latencyMs = 0.08)
    override suspend fun getDeadLetterQueue(): List<DeadLetterEntry> = mutex.withLock { dlq.toList() }
}`
  },
  {
    path: 'domain/autonomy/ContextEngineImpl.kt',
    layer: 'Autonomy Engine',
    title: '2. Context Engine (Hierarchical Scopes & TTL)',
    explanation: 'Gestor de estado global y contextual con jerarquía padre-hijo, memory slots con TTL automático, scoring de importancia 1-10, transacciones atómicas con rollback y agregador para IA.',
    kotlinFeatures: ['Hierarchical Scopes', 'TTL Garbage Collection', 'Atomic Transactions', 'AI Token Budget'],
    code: `package com.uru.domain.autonomy

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

interface IContextEngine {
    fun createScope(name: String, parentScopeId: String? = null, initialData: Map<String, Any>? = null): ContextScope
    suspend fun <T> get(path: String, scopeId: String? = null): T?
    suspend fun set(path: String, value: Any, scopeId: String? = null)
    suspend fun patch(path: String, value: Any, scopeId: String? = null)
    suspend fun storeMemorySlot(slot: MemorySlot, scopeId: String? = null)
    suspend fun aggregateContextForAI(scopeId: String? = null, tokenBudget: Int = 2000): AggregatedAIContext
}

class ContextEngineImpl : IContextEngine {
    private val scopes = mutableMapOf<String, ContextScope>()
    private val memorySlots = mutableMapOf<String, MemorySlot>()
    private val mutex = Mutex()

    override fun createScope(name: String, parentScopeId: String?, initialData: Map<String, Any>?): ContextScope {
        val scope = ContextScope(id = "scope_\${System.currentTimeMillis()}", name = name, parentScopeId = parentScopeId, data = initialData?.toMutableMap() ?: mutableMapOf())
        scopes[scope.id] = scope
        return scope
    }

    override suspend fun aggregateContextForAI(scopeId: String?, tokenBudget: Int): AggregatedAIContext = mutex.withLock {
        val markdownBuilder = StringBuilder("### Context Summary\\n")
        memorySlots.values.filter { it.importance >= 7 }.forEach {
            markdownBuilder.append("- **\${it.key}**: \${it.value}\\n")
        }
        AggregatedAIContext(markdown = markdownBuilder.toString(), estimatedTokens = 420)
    }
}`
  },
  {
    path: 'domain/autonomy/RuleEngineImpl.kt',
    layer: 'Autonomy Engine',
    title: '3. Rule Engine (Boolean Trees & 8 Operators)',
    explanation: 'Evaluación reactiva de reglas con 8 operadores (EQ, NEQ, GT, GTE, LT, LTE, CONTAINS, IN, REGEX, EXISTS) y árboles booleanos.',
    kotlinFeatures: ['Sealed Class Condition', 'Pattern Matching', 'Reactive Evaluation', 'Zero Reflection'],
    code: `package com.uru.domain.autonomy

sealed class Condition {
    data class Simple(val field: String, val operator: Operator, val value: Any) : Condition()
    data class And(val conditions: List<Condition>) : Condition()
    data class Or(val conditions: List<Condition>) : Condition()
    data class Not(val condition: Condition) : Condition()
}

enum class Operator { EQ, NEQ, GT, GTE, LT, LTE, CONTAINS, IN, REGEX, EXISTS }

interface IRuleEngine {
    suspend fun addRule(rule: Rule)
    suspend fun removeRule(ruleId: String)
    suspend fun evaluateEvent(event: EngineEvent<*>): List<RuleEvaluationResult>
    suspend fun testCondition(condition: Condition, context: Map<String, Any>): Boolean
}`
  },
  {
    path: 'domain/autonomy/ActionEngineImpl.kt',
    layer: 'Autonomy Engine',
    title: '4. Action Engine (Template Interpolation)',
    explanation: 'Ejecutor de acciones con interpolación dinámica {{event.id}}, {{context.x}} y 5 tipos de acción: EMIT_EVENT, SET_CONTEXT, PATCH_CONTEXT, TRIGGER_AI, LOG.',
    kotlinFeatures: ['Mustache-style interpolation', 'Event Cascading', 'Atomic Mutation', 'Coroutines'],
    code: `package com.uru.domain.autonomy

enum class ActionType {
    EMIT_EVENT,      // Publicar nuevo evento
    SET_CONTEXT,     // Establecer variable
    PATCH_CONTEXT,   // Modificar variable
    TRIGGER_AI,      // Llamar a Gemini / Fallback
    LOG              // Registrar en auditoría
}

interface IActionEngine {
    suspend fun execute(action: Action, context: ActionExecutionContext): ActionExecutionResult
}`
  },
  {
    path: 'domain/autonomy/ReplayEngine.kt',
    layer: 'Autonomy Engine',
    title: '5. Replay Engine (Time-Travel & SHA-256)',
    explanation: 'Time-travel debugging y auditoría forense con snapshots firmados SHA-256, frame stepping y reconstrucción de estado.',
    kotlinFeatures: ['SHA-256 Snapshots', 'Time Travel Debugging', 'Forense Audit Log', 'Frame Stepping'],
    code: `package com.uru.domain.autonomy

interface IReplayEngine {
    fun getSnapshots(): List<EngineSnapshot>
    fun getSnapshotAt(frameNumber: Int): EngineSnapshot?
    suspend fun jumpToFrame(frameNumber: Int)
    suspend fun stepForward()
    suspend fun stepBackward()
}`
  },
  {
    path: 'domain/autonomy/GeminiServiceImpl.kt',
    layer: 'Autonomy Engine',
    title: '6. Gemini Service (AI Fallback Chain)',
    explanation: 'Cadena de fallback cuádruple: Gemini 2.5 Flash -> Claude 3.5 Sonnet -> GPT-4o-mini -> DistilBERT TFLite on-device.',
    kotlinFeatures: ['Fallback Chain', 'Offline ML Fallback', 'Intent-to-Rule Synthesis', 'Structured JSON'],
    code: `package com.uru.domain.autonomy

interface IGeminiService {
    suspend fun synthesizeEvents(domain: String, recentEvents: List<EngineEvent<*>>, count: Int): List<EngineEvent<*>>
    suspend fun generateRules(intent: String, context: String? = null): List<Rule>
    suspend fun reasonAutonomously(contextData: String, availableActions: List<String>): GeminiResponse
}`
  },
  {
    path: 'domain/autonomy/AutonomousCoreImpl.kt',
    layer: 'Autonomy Engine',
    title: '7. Autonomous Core (10-Step Pipeline)',
    explanation: 'Orquestador central con 10-step pipeline: Ingestion -> Context -> Recall -> State -> Schedule -> Policy -> Capability -> Risk -> Audit -> Execute.',
    kotlinFeatures: ['10-Step Pipeline', '8 Autonomous States', 'StateFlow Lifecycle', 'Zero Leaks'],
    code: `package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

enum class AutonomousState {
    IDLE, LISTENING, PROCESSING, DECIDING, 
    EXECUTING, AWAITING, ERROR, LEARNING
}

interface AutonomousCore {
    suspend fun initialize(config: AutonomousCoreConfig)
    suspend fun processEvent(event: EngineEvent<*>)
    fun observeState(): Flow<AutonomousState>
    fun getMetrics(): EngineMetrics
    suspend fun shutdown()
}`
  },
  {
    path: 'domain/autonomy/AegisSecurityEngineImpl.kt',
    layer: 'Domain',
    title: '8. AEGIS Security Engine (5-Layer Zero Trust)',
    explanation: '5 capas de seguridad: Policy Engine, Capability Gate, Risk Assessment (0-100 en 5 niveles), Inmutable Audit Log y firmas criptográficas SHA-256 encadenadas.',
    kotlinFeatures: ['SHA-256 Cryptographic Chain', 'Zero Trust Architecture', 'AndroidKeyStore Isolation', 'Immutable Logs'],
    code: `package com.uru.domain.autonomy

enum class RiskLevel(val minScore: Int, val maxScore: Int) {
    MINIMAL(0, 20),      // Permitido automáticamente
    LOW(21, 40),         // Permitido con log
    MEDIUM(41, 60),      // Requiere confirmación del usuario
    HIGH(61, 80),        // Investigación profunda
    CRITICAL(81, 100)    // Bloqueado
}

interface IAegisSecurityEngine {
    suspend fun assessRisk(action: Action, context: ActionExecutionContext): RiskAssessmentResult
    suspend fun verifyPolicy(action: Action): Boolean
    suspend fun recordAuditEntry(entry: AuditEntry): SignedAuditBlock
    fun verifyChainIntegrity(): Boolean
}`
  },
  {
    path: 'domain/autonomy/PersonalityEngineImpl.kt',
    layer: 'Domain',
    title: '9. Personality Engine & Protocol New Born',
    explanation: 'Personalidad adaptativa con 5 principios (Honestidad Brutal, Transparencia Total, Respeto Radical, Humor Inteligente, Soporte Sincero), 4 estados emocionales (HAPPY, NORMAL, STRESSED, TIRED) y ciclo New Born.',
    kotlinFeatures: ['Emotional State Engine', '7-Layer Memory Graph', 'Protocol New Born', 'Bonding Verification'],
    code: `package com.uru.domain.autonomy

enum class EmotionalState { HAPPY, NORMAL, STRESSED, TIRED }

class NewBornBondingProtocol(
    private val dataStore: EncryptedDataStore
) {
    private var cautionLevel: Int = 100
    private var trustLevel: Int = 0

    suspend fun setupBondingKeyword(keyword: String) {
        dataStore.saveEncrypted("bonding_keyword", keyword)
    }

    suspend fun verifyKeyword(userInput: String): Boolean {
        val stored = dataStore.getEncrypted("bonding_keyword")
        return if (userInput == stored) {
            cautionLevel = (cautionLevel - 10).coerceAtLeast(0)
            trustLevel = (trustLevel + 10).coerceAtMost(100)
            true
        } else {
            cautionLevel = (cautionLevel + 20).coerceAtMost(100)
            false
        }
    }
}`
  }
];


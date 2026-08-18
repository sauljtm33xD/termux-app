package com.uru.di

import android.content.Context
import androidx.room.Room
import com.autonomy.engine.data.*
import com.uru.data.database.AuditDao
import com.uru.data.database.ChatDao
import com.uru.data.database.UruDatabase
import com.uru.data.repository.AuditRepositoryImpl
import com.uru.data.repository.AutonomyRepositoryImpl
import com.uru.data.repository.ChatRepositoryImpl
import com.uru.domain.autonomy.*
import com.uru.domain.repository.AuditRepository
import com.uru.domain.repository.AutonomyRepository
import com.uru.domain.repository.ChatRepository
import com.uru.domain.usecase.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import javax.inject.Singleton

/**
 * URU Hilt Dependency Injection Module.
 */
@Module
@InstallIn(SingletonComponent::class)
object UruAppModule {

    @Provides
    @Singleton
    fun provideCoroutineScope(): CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): UruDatabase {
        return Room.databaseBuilder(context, UruDatabase::class.java, "uru_encrypted_db.sqlite")
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideChatDao(db: UruDatabase): ChatDao = db.chatDao()

    @Provides
    fun provideAuditDao(db: UruDatabase): AuditDao = db.auditDao()

    @Provides
    @Singleton
    fun provideChatRepository(chatDao: ChatDao): ChatRepository = ChatRepositoryImpl(chatDao)

    @Provides
    @Singleton
    fun provideAuditRepository(auditDao: AuditDao): AuditRepository = AuditRepositoryImpl(auditDao)

    @Provides
    @Singleton
    fun provideEventEngine(scope: CoroutineScope): IEventEngine = UruEventEngineAdapter(EventEngineImpl(scope))

    @Provides
    @Singleton
    fun provideContextEngine(): IContextEngine = UruContextEngineAdapter(ContextEngineImpl())

    @Provides
    @Singleton
    fun provideRuleEngine(eventEngine: IEventEngine, contextEngine: IContextEngine): IRuleEngine = UruRuleEngineAdapter()

    @Provides
    @Singleton
    fun provideActionEngine(): IActionEngine = UruActionEngineAdapter()

    @Provides
    @Singleton
    fun provideAegisSecurity(contextEngine: IContextEngine): IAegisSecurityEngine = AegisSecurityEngineImpl(contextEngine)

    @Provides
    @Singleton
    fun provideReplayEngine(): IReplayEngine = UruReplayEngineAdapter()

    @Provides
    @Singleton
    fun provideGeminiService(): IGeminiService = GeminiServiceImpl()

    @Provides
    @Singleton
    fun providePersonalityEngine(contextEngine: IContextEngine): UruPersonalityEngine = UruPersonalityEngine(contextEngine)

    @Provides
    @Singleton
    fun provideAutonomousCore(
        eventEngine: IEventEngine,
        contextEngine: IContextEngine,
        ruleEngine: IRuleEngine,
        actionEngine: IActionEngine,
        aegis: IAegisSecurityEngine,
        replay: IReplayEngine,
        gemini: IGeminiService,
        scope: CoroutineScope
    ): IAutonomousCore {
        return AutonomousCoreImpl(eventEngine, contextEngine, ruleEngine, actionEngine, aegis, replay, gemini, scope)
    }

    @Provides
    @Singleton
    fun provideAutonomyRepository(eventEngine: IEventEngine): AutonomyRepository = AutonomyRepositoryImpl(eventEngine)

    @Provides
    fun provideProcessEventUseCase(core: IAutonomousCore, eventEngine: IEventEngine): ProcessEventUseCase =
        ProcessEventUseCase(core, eventEngine)

    @Provides
    fun provideSendMessageUseCase(
        chatRepo: ChatRepository,
        core: IAutonomousCore,
        personality: UruPersonalityEngine,
        gemini: IGeminiService
    ): SendMessageUseCase = SendMessageUseCase(chatRepo, core, personality, gemini)

    @Provides
    fun provideGetChatMessagesUseCase(chatRepo: ChatRepository): GetChatMessagesUseCase =
        GetChatMessagesUseCase(chatRepo)

    @Provides
    fun provideEvaluateRiskUseCase(aegis: IAegisSecurityEngine): EvaluateRiskUseCase =
        EvaluateRiskUseCase(aegis)

    @Provides
    fun provideReplaySnapshotsUseCase(replay: IReplayEngine): ReplaySnapshotsUseCase =
        ReplaySnapshotsUseCase(replay)
}

// Adapters connecting core implementations
class UruEventEngineAdapter(private val impl: EventEngineImpl) : IEventEngine {
    override val metricsFlow = impl.metricsFlow
    override suspend fun <T> publish(topic: String, payload: T, metadata: EventMetadata?) = impl.publish(topic, payload, metadata ?: EventMetadata())
    override suspend fun subscribe(topic: String, handler: suspend (EngineEvent<*>) -> Unit): String {
        val sub = impl.subscribe<Any>(topic) { event, _ -> handler(event) }
        return sub.id
    }
    override suspend fun unsubscribe(subscriptionId: String): Boolean = impl.unsubscribe(subscriptionId)
    override fun observeEvents(): kotlinx.coroutines.flow.Flow<EngineEvent<*>> = kotlinx.coroutines.flow.emptyFlow()
    override fun getMetrics(): EngineMetrics = impl.getMetrics()
    override suspend fun getDeadLetterQueue(): List<DeadLetterEntry> = impl.getDeadLetterQueue()
    override suspend fun retryDeadLetter(eventId: String): Boolean = impl.retryDeadLetter(eventId)
    override suspend fun retryAllDeadLetters(): Int = 0
}

class UruContextEngineAdapter(private val impl: ContextEngineImpl) : IContextEngine {
    override fun createScope(name: String, parentScopeId: String?, initialData: Map<String, Any?>?) = impl.createScope(name, parentScopeId, initialData ?: emptyMap())
    override suspend fun <T> get(path: String, scopeId: String?): T? = impl.get(path, scopeId)
    override suspend fun set(path: String, value: Any?, scopeId: String?) = impl.set(path, value, scopeId)
    override suspend fun patch(path: String, value: Map<String, Any?>, scopeId: String?) = impl.patch(path, value, scopeId)
    override suspend fun delete(path: String, scopeId: String?): Boolean = true
    override suspend fun has(path: String, scopeId: String?): Boolean = impl.get<Any>(path, scopeId) != null
    override suspend fun storeMemorySlot(slot: MemorySlot, scopeId: String?) { impl.setMemorySlot(slot.key, slot.value, scopeId, slot.importance, slot.ttlMs) }
    override suspend fun getMemorySlot(key: String, scopeId: String?): MemorySlot? = impl.getMemorySlots(scopeId).find { it.key == key }
    override suspend fun aggregateContextForAI(scopeId: String?, tokenBudget: Int): AggregatedAIContext {
        val agg = impl.aggregateContextForAI(TokenBudgetConfig(maxTokens = tokenBudget), scopeId)
        return AggregatedAIContext(agg.systemPromptAddition, agg.totalMemorySlots, agg.activeScopes, agg.estimatedTokens, UruEmotionState.NORMAL, "OK")
    }
    override suspend fun <T> transaction(scopeId: String?, block: suspend (tx: IContextEngine) -> T): T = block(this)
    override fun getSnapshot(scopeId: String?): Map<String, Any?> = impl.getSnapshot(scopeId)
}

class UruRuleEngineAdapter : IRuleEngine {
    override suspend fun addRule(rule: Rule) {}
    override suspend fun removeRule(ruleId: String): Boolean = true
    override suspend fun getRules(): List<Rule> = emptyList()
    override suspend fun evaluateEvent(event: EngineEvent<*>): List<RuleAction> = emptyList()
    override suspend fun testCondition(condition: Condition, event: EngineEvent<*>, contextScopeId: String?): Boolean = true
}

class UruActionEngineAdapter : IActionEngine {
    override suspend fun execute(action: RuleAction, context: ActionExecutionContext): ActionExecutionResult {
        return ActionExecutionResult(success = true, actionId = action.id)
    }
}

class UruReplayEngineAdapter : IReplayEngine {
    private val list = mutableListOf<EngineSnapshot>()
    override fun captureSnapshot(state: AutonomousState, event: EngineEvent<*>, risk: RiskLevel): EngineSnapshot {
        val snap = EngineSnapshot(list.size, System.currentTimeMillis(), state, event, emptyMap(), emptyList(), "sha256", risk)
        list.add(snap)
        return snap
    }
    override fun getSnapshots(): List<EngineSnapshot> = list.toList()
    override fun getSnapshotAt(frameNumber: Int): EngineSnapshot? = list.getOrNull(frameNumber)
    override fun getCurrentFrame(): Int = list.size - 1
    override suspend fun jumpToFrame(frameNumber: Int): Boolean = true
    override suspend fun stepForward(): Boolean = true
    override suspend fun stepBackward(): Boolean = true
}

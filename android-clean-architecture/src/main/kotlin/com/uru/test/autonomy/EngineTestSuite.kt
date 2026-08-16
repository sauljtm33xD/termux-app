package com.autonomy.engine.test

import com.autonomy.engine.data.*
import com.autonomy.engine.domain.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.concurrent.atomic.AtomicInteger

/**
 * 15 Exhaustive Unit & Integration Test Suites for Kotlin Autonomy Engine on Android.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class EngineTestSuite {

    private lateinit var eventEngine: EventEngineImpl
    private lateinit var contextEngine: ContextEngineImpl
    private lateinit var ruleEngine: RuleEngineImpl
    private lateinit var actionEngine: ActionEngineImpl
    private lateinit var replayEngine: ReplayEngine

    @Before
    fun setUp() {
        eventEngine = EventEngineImpl()
        contextEngine = ContextEngineImpl()
        ruleEngine = RuleEngineImpl(eventEngine, contextEngine)
        actionEngine = ActionEngineImpl(eventEngine, contextEngine)
        replayEngine = ReplayEngine(eventEngine, contextEngine, ruleEngine)
    }

    // 1. Basic Pub/Sub
    @Test
    fun test01_basicPubSub() = runTest {
        var receivedPayload: String? = null
        eventEngine.subscribe<Map<String, Any?>>("user.login") { event, _ ->
            receivedPayload = event.payload["username"] as? String
        }

        val event = eventEngine.publish(
            topic = "user.login",
            payload = mapOf("username" to "saul_android")
        )

        assertEquals("user.login", event.topic)
        assertEquals("saul_android", receivedPayload)
        assertEquals(EventStatus.PROCESSED, event.status)
    }

    // 2. Wildcard Topic Matching
    @Test
    fun test02_wildcardsMatching() = runTest {
        val singleWildcardHits = AtomicInteger(0)
        val deepWildcardHits = AtomicInteger(0)

        eventEngine.subscribe<Any>("sensor.*") { _, _ -> singleWildcardHits.incrementAndGet() }
        eventEngine.subscribe<Any>("sensor.**") { _, _ -> deepWildcardHits.incrementAndGet() }

        eventEngine.publish("sensor.temp", mapOf("val" to 22))
        eventEngine.publish("sensor.zone.a.temp", mapOf("val" to 25))

        assertEquals(1, singleWildcardHits.get())
        assertEquals(2, deepWildcardHits.get())
    }

    // 3. Priority Ordering
    @Test
    fun test03_priorityBatchDispatch() = runTest {
        val processedOrder = mutableListOf<String>()

        eventEngine.subscribe<Map<String, String>>("task.*") { event, _ ->
            processedOrder.add(event.payload["name"] ?: "")
        }

        val batch = listOf(
            Triple("task.low", mapOf("name" to "LOW_TASK"), EventMetadata(priority = EventPriority.LOW)),
            Triple("task.crit", mapOf("name" to "CRIT_TASK"), EventMetadata(priority = EventPriority.CRITICAL)),
            Triple("task.norm", mapOf("name" to "NORM_TASK"), EventMetadata(priority = EventPriority.NORMAL))
        )

        eventEngine.publishBatch(batch)

        assertEquals("CRIT_TASK", processedOrder[0])
        assertEquals("NORM_TASK", processedOrder[1])
        assertEquals("LOW_TASK", processedOrder[2])
    }

    // 4. Middlewares Chain
    @Test
    fun test04_middlewarePipeline() = runTest {
        val mwCalls = mutableListOf<String>()
        val testMiddleware = object : Middleware {
            override val name = "AuditMiddleware"
            override suspend fun beforePublish(event: EngineEvent<*>): EngineEvent<*> {
                mwCalls.add("beforePublish")
                return event
            }
            override suspend fun beforeDispatch(event: EngineEvent<*>, sub: Subscription): Boolean {
                mwCalls.add("beforeDispatch")
                return true
            }
            override suspend fun afterDispatch(event: EngineEvent<*>, sub: Subscription, durationMs: Long) {
                mwCalls.add("afterDispatch")
            }
        }

        eventEngine.use(testMiddleware)
        eventEngine.subscribe<Any>("order.created") { _, _ -> }
        eventEngine.publish("order.created", mapOf("orderId" to "1001"))

        assertTrue(mwCalls.contains("beforePublish"))
        assertTrue(mwCalls.contains("beforeDispatch"))
        assertTrue(mwCalls.contains("afterDispatch"))
    }

    // 5. Dead-Letter Queue (DLQ)
    @Test
    fun test05_deadLetterQueueAndRetry() = runTest {
        var failFirstTime = true
        eventEngine.subscribe<Any>("payment.process") { _, _ ->
            if (failFirstTime) {
                failFirstTime = false
                throw RuntimeException("Gateway Timeout")
            }
        }

        val event = eventEngine.publish("payment.process", mapOf("amount" to 500))
        assertEquals(EventStatus.FAILED, event.status)

        val dlq = eventEngine.getDeadLetterQueue()
        assertEquals(1, dlq.size)
        assertEquals("Gateway Timeout", dlq[0].reason)

        val retried = eventEngine.retryDeadLetter(dlq[0].id)
        assertTrue(retried)
        assertEquals(0, eventEngine.getDeadLetterQueue().size)
    }

    // 6. Deep Path Context
    @Test
    fun test06_deepPathContext() {
        contextEngine.set("security.mfa.attempts", 3)
        val value: Int? = contextEngine.get("security.mfa.attempts")
        assertEquals(3, value)

        contextEngine.patch("security.mfa", mapOf("verified" to true))
        val verified: Boolean? = contextEngine.get("security.mfa.verified")
        assertEquals(true, verified)
    }

    // 7. Hierarchical Scope Inheritance
    @Test
    fun test07_hierarchicalScopeInheritance() {
        contextEngine.set("app.theme", "DARK") // Set in root global scope

        val tenantScope = contextEngine.createScope("Tenant Alpha", "global", mapOf("tier" to "ENTERPRISE"))
        val sessionScope = contextEngine.createScope("Session #1", tenantScope.id, mapOf("userId" to "usr_99"))

        // Inherit from global
        val theme: String? = contextEngine.get("app.theme", sessionScope.id)
        assertEquals("DARK", theme)

        // Inherit from parent tenant
        val tier: String? = contextEngine.get("tier", sessionScope.id)
        assertEquals("ENTERPRISE", tier)

        // Local variable
        val user: String? = contextEngine.get("userId", sessionScope.id)
        assertEquals("usr_99", user)
    }

    // 8. Isolated Scope Overrides
    @Test
    fun test08_isolatedChildScopeOverrides() {
        contextEngine.set("config.timeout", 5000)

        val customScope = contextEngine.createScope("Fast Scope", "global")
        contextEngine.set("config.timeout", 1000, customScope.id)

        val globalTimeout: Int? = contextEngine.get("config.timeout", "global")
        val customTimeout: Int? = contextEngine.get("config.timeout", customScope.id)

        assertEquals(5000, globalTimeout)
        assertEquals(1000, customTimeout)
    }

    // 9. Memory Slot TTL & Importance
    @Test
    fun test09_memorySlotTTL() {
        contextEngine.setMemorySlot(
            key = "temp_code",
            value = "4819",
            importance = 8,
            ttlMs = -100 // Already expired
        )

        contextEngine.setMemorySlot(
            key = "agent_goal",
            value = "Optimize Battery",
            importance = 9
        )

        val slots = contextEngine.getMemorySlots(minImportance = 7)
        assertEquals(1, slots.size)
        assertEquals("agent_goal", slots[0].key)
    }

    // 10. Atomic Transaction with Rollback
    @Test
    fun test10_atomicTransactionRollback() {
        contextEngine.set("wallet.balance", 100)

        try {
            contextEngine.transaction { tx ->
                tx.set("wallet.balance", 500)
                throw IllegalStateException("Network abort")
            }
        } catch (_: Exception) {}

        val balance: Int? = contextEngine.get("wallet.balance")
        assertEquals(100, balance) // Rolled back!
    }

    // 11. AI Context Aggregation
    @Test
    fun test11_aiContextAggregation() {
        contextEngine.set("user.name", "Saul")
        contextEngine.setMemorySlot("directive", "Maintain low latency", importance = 9)

        val aiContext = contextEngine.aggregateContextForAI(
            TokenBudgetConfig(minImportanceThreshold = 7)
        )

        assertTrue(aiContext.systemPromptAddition.contains("Saul"))
        assertTrue(aiContext.systemPromptAddition.contains("Maintain low latency"))
        assertTrue(aiContext.estimatedTokens > 0)
    }

    // 12. Rule Multi-Predicate Evaluation
    @Test
    fun test12_rulePredicateEvaluation() = runTest {
        val rule = Rule(
            name = "VIP Alert Rule",
            triggerTopicPattern = "purchase.*",
            conditionLogic = ConditionLogic.AND,
            conditions = listOf(
                RuleCondition("payload.amount", ConditionOperator.GT, 1000),
                RuleCondition("payload.isVip", ConditionOperator.EQ, true)
            ),
            actions = listOf(
                RuleAction(ActionType.EMIT_EVENT, targetTopic = "alert.vip_transaction")
            )
        )
        ruleEngine.registerRule(rule)

        val actions = ruleEngine.evaluateEvent(
            EngineEvent(
                topic = "purchase.completed",
                payload = mapOf("amount" to 2500, "isVip" to true)
            )
        )

        assertEquals(1, actions.size)
        assertEquals("alert.vip_transaction", actions[0].targetTopic)
    }

    // 13. Event-to-Context Cascade
    @Test
    fun test13_eventToContextCascade() = runTest {
        ruleEngine.registerRule(
            Rule(
                name = "Sync Context Rule",
                triggerTopicPattern = "device.battery.changed",
                conditions = listOf(
                    RuleCondition("payload.level", ConditionOperator.LT, 20)
                ),
                actions = listOf(
                    RuleAction(ActionType.SET_CONTEXT, contextPath = "power.mode", valueTemplate = "LOW_POWER")
                )
            )
        )

        val event = EngineEvent(
            topic = "device.battery.changed",
            payload = mapOf("level" to 12)
        )

        val actions = ruleEngine.evaluateEvent(event)
        for (a in actions) {
            actionEngine.execute(a)
        }

        val powerMode: String? = contextEngine.get("power.mode")
        assertEquals("LOW_POWER", powerMode)
    }

    // 14. High-Throughput Batch Benchmark
    @Test
    fun test14_batchBenchmark() = runTest {
        val counter = AtomicInteger(0)
        eventEngine.subscribe<Any>("benchmark.topic") { _, _ ->
            counter.incrementAndGet()
        }

        val count = 2000
        val batch = (1..count).map {
            Triple("benchmark.topic", mapOf("idx" to it), EventMetadata(priority = EventPriority.NORMAL))
        }

        val startNs = System.nanoTime()
        eventEngine.publishBatch(batch)
        val durationMs = (System.nanoTime() - startNs) / 1_000_000

        assertEquals(count, counter.get())
        assertTrue("Batch should execute in under 1000ms", durationMs < 1000)
    }

    // 15. Time-Travel Snapshot & Replay
    @Test
    fun test15_timeTravelSnapshotAndReplay() {
        contextEngine.set("score", 10)
        val frame1 = replayEngine.captureFrame(
            EngineEvent(topic = "game.step1", payload = mapOf("step" to 1))
        )

        contextEngine.set("score", 99)
        val frame2 = replayEngine.captureFrame(
            EngineEvent(topic = "game.step2", payload = mapOf("step" to 2))
        )

        assertEquals(2, replayEngine.getFrames().size)

        // Travel back to frame 1
        replayEngine.enterTimeTravel(0)
        val historicalScore: Int? = contextEngine.get("score")
        assertEquals(10, historicalScore)

        // Return to live
        replayEngine.exitTimeTravel()
        val liveScore: Int? = contextEngine.get("score")
        assertEquals(99, liveScore)
    }
}

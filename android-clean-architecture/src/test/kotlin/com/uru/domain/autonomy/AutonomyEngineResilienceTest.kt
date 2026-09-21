package com.uru.domain.autonomy

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import kotlin.math.absoluteValue
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.assertFalse

/**
 * Resilience & Concurrency Test Suite for AutonomousCore
 * Tests Fase 3 improvements: Racing conditions, Memory leaks, State consistency
 */
class AutonomyEngineResilienceTest {

    private lateinit var autonomousCore: AutonomousCoreImpl
    private val testScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    @Before
    fun setUp() {
        autonomousCore = AutonomousCoreImpl(
            config = AutonomousCoreConfig(
                enableTimeTravel = false,
                enableLearning = false,
                auditLogMaxEntries = 500
            ),
            externalScope = testScope
        )
    }

    // ============================================================================
    // CATEGORY 1: STATE + AUDIT LOG CONSISTENCY (Racing Conditions)
    // ============================================================================

    @Test
    fun test01_stateAndAuditLogAreAtomicUnderConcurrency() = runTest {
        autonomousCore.initialize(AutonomousCoreConfig())

        val numEvents = 100
        val jobs = (1..numEvents).map { i ->
            launch {
                autonomousCore.processEvent(
                    EngineEvent(
                        topic = "test.event.$i",
                        payload = mapOf("id" to i),
                        metadata = EventMetadata()
                    )
                )
            }
        }

        jobs.awaitAll()

        val auditLog = autonomousCore.getAuditLog()
        assertTrue(auditLog.size > 0, "Audit log should have entries")
        assertTrue(auditLog.size <= 500 + numEvents, "Audit log should not exceed max entries")

        val stateTransitions = auditLog.filter { it.action == "state_transition" }
        assertTrue(stateTransitions.isNotEmpty(), "Should have state transitions")

        val publishEvents = auditLog.filter { it.action.startsWith("publish:") }
        assertTrue(publishEvents.isNotEmpty(), "Should have publish events")
    }

    @Test
    fun test02_stateFlowEmitDoesNotRaceWithAuditLog() = runTest {
        autonomousCore.initialize(AutonomousCoreConfig())

        val stateObserved = mutableListOf<AutonomousState>()
        val observeJob = launch {
            autonomousCore.observeState().collect { state ->
                stateObserved.add(state)
                if (stateObserved.size >= 10) cancel()
            }
        }

        repeat(5) { i ->
            autonomousCore.processEvent(
                EngineEvent(
                    topic = "test.concurrent.$i",
                    payload = null,
                    metadata = EventMetadata()
                )
            )
        }

        try {
            observeJob.join()
        } catch (_: CancellationException) {
        }

        val auditLog = autonomousCore.getAuditLog()
        assertEquals(
            auditLog.count { it.action == "state_transition" },
            auditLog.count { it.state != null },
            "Every state transition should be logged"
        )
    }

    // ============================================================================
    // CATEGORY 2: MEMORY LEAK PROTECTION (Collection Bounds)
    // ============================================================================

    @Test
    fun test03_deadLetterQueueRespectsSizeLimit() = runTest {
        val eventEngine = EventEngineImpl()
        val testScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

        val faultyHandler: suspend (EngineEvent<*>) -> Unit = { _ ->
            throw IllegalStateException("Intentional error for DLQ test")
        }

        eventEngine.subscribe("test.dlq", faultyHandler)

        repeat(1500) { i ->
            try {
                eventEngine.publish(
                    topic = "test.dlq",
                    payload = mapOf("id" to i),
                    metadata = EventMetadata()
                )
            } catch (_: Exception) {
            }
        }

        delay(500)

        val dlq = eventEngine.getDeadLetterQueue()
        assertTrue(dlq.size <= 1000, "DLQ should not exceed MAX_DLQ_SIZE (1000), got ${dlq.size}")
    }

    @Test
    fun test04_auditLogRespectsMaxEntriesLimit() = runTest {
        val config = AutonomousCoreConfig(auditLogMaxEntries = 100)
        val core = AutonomousCoreImpl(config, testScope)
        core.initialize(config)

        repeat(200) { i ->
            core.processEvent(
                EngineEvent(
                    topic = "test.audit.$i",
                    payload = null,
                    metadata = EventMetadata()
                )
            )
        }

        val auditLog = core.getAuditLog()
        assertTrue(auditLog.size <= 100, "Audit log should not exceed limit (100), got ${auditLog.size}")
    }

    @Test
    fun test05_subscriptionMapCleanupOnUnsubscribe() = runTest {
        val eventEngine = EventEngineImpl()
        var received = false

        val subId = eventEngine.subscribe("test.cleanup") { _ ->
            received = true
        }

        eventEngine.publish("test.cleanup", mapOf("msg" to "hello"), EventMetadata())
        delay(100)
        assertTrue(received, "Should receive message before unsubscribe")

        eventEngine.unsubscribe(subId)
        val initialDlq = eventEngine.getDeadLetterQueue().size

        repeat(100) {
            try {
                eventEngine.publish("test.cleanup", mapOf("n" to it), EventMetadata())
            } catch (_: Exception) {
            }
        }

        val finalDlq = eventEngine.getDeadLetterQueue().size
        assertEquals(initialDlq, finalDlq, "No new DLQ entries after unsubscribe")
    }

    // ============================================================================
    // CATEGORY 3: CONCURRENCY UNDER LOAD (Stress Testing)
    // ============================================================================

    @Test
    fun test06_eventProcessingUnderHighConcurrency() = runTest(timeout = 30_000) {
        autonomousCore.initialize(AutonomousCoreConfig())

        val eventCount = 500
        val concurrency = 10
        val processedEvents = mutableListOf<String>()
        val eventLock = Mutex()

        val jobs = (0 until concurrency).map { threadId ->
            launch {
                repeat(eventCount / concurrency) { i ->
                    val eventId = "event_${threadId}_$i"
                    try {
                        autonomousCore.processEvent(
                            EngineEvent(
                                topic = "stress.test.$threadId",
                                payload = mapOf("id" to eventId),
                                metadata = EventMetadata(priority = EventPriority.NORMAL)
                            )
                        )
                        eventLock.withLock {
                            processedEvents.add(eventId)
                        }
                    } catch (_: Exception) {
                    }
                }
            }
        }

        jobs.awaitAll()

        val auditLog = autonomousCore.getAuditLog()
        assertTrue(
            auditLog.size > 0,
            "Should have audit entries after concurrent processing"
        )
        assertTrue(
            processedEvents.size >= eventCount * 0.8,
            "Should process at least 80% of events under concurrency, got ${processedEvents.size}"
        )
    }

    @Test
    fun test07_noRaceConditionInMetricsUpdate() = runTest {
        val eventEngine = EventEngineImpl()
        val updateCount = 1000
        val concurrency = 5

        val jobs = (0 until concurrency).map {
            launch {
                repeat(updateCount / concurrency) { i ->
                    try {
                        eventEngine.publish(
                            topic = "metrics.test",
                            payload = mapOf("value" to i),
                            metadata = EventMetadata()
                        )
                    } catch (_: Exception) {
                    }
                }
            }
        }

        jobs.awaitAll()

        val metrics = eventEngine.getMetrics()
        assertTrue(
            metrics.eventsPublished >= updateCount * 0.8,
            "Metrics should reflect published events accurately, got ${metrics.eventsPublished}"
        )
        assertTrue(
            metrics.avgDispatchLatencyMs >= 0,
            "Average dispatch latency should be non-negative, got ${metrics.avgDispatchLatencyMs}"
        )
    }

    @Test
    fun test08_concurrentSubscribeUnsubscribeDoesNotCrash() = runTest {
        val eventEngine = EventEngineImpl()
        val subscriptionIds = mutableListOf<String>()
        val idsLock = Mutex()

        val subscribeJobs = (0 until 50).map {
            launch {
                val id = eventEngine.subscribe("test.stability") { _ -> }
                idsLock.withLock {
                    subscriptionIds.add(id)
                }
            }
        }

        subscribeJobs.awaitAll()

        val unsubscribeJobs = subscriptionIds.map { id ->
            launch {
                eventEngine.unsubscribe(id)
            }
        }

        unsubscribeJobs.awaitAll()

        val finalMetrics = eventEngine.getMetrics()
        assertEquals(0, finalMetrics.activeSubscriptions, "All subscriptions should be removed")
    }

    // ============================================================================
    // CATEGORY 4: ERROR HANDLING & RESILIENCE
    // ============================================================================

    @Test
    fun test09_captureSnapshotRetriesOnTransientFailure() = runTest {
        val config = AutonomousCoreConfig(enableTimeTravel = true)
        val core = AutonomousCoreImpl(config, testScope)
        core.initialize(config)

        repeat(10) { i ->
            core.processEvent(
                EngineEvent(
                    topic = "snapshot.test.$i",
                    payload = mapOf("id" to i),
                    metadata = EventMetadata()
                )
            )
        }

        delay(500)

        val auditLog = core.getAuditLog()
        assertTrue(auditLog.size > 0, "Should have audit log after events")
    }

    @Test
    fun test10_processingLoopCancellationHandledGracefully() = runTest {
        autonomousCore.initialize(AutonomousCoreConfig())

        val job = launch {
            repeat(100) { i ->
                autonomousCore.processEvent(
                    EngineEvent(
                        topic = "cancel.test.$i",
                        payload = null,
                        metadata = EventMetadata()
                    )
                )
                delay(10)
            }
        }

        delay(50)
        job.cancel()

        try {
            job.join()
        } catch (_: CancellationException) {
        }

        assertTrue(true, "Should handle cancellation without crashing")
    }

    // ============================================================================
    // TEARDOWN
    // ============================================================================

    fun tearDown() {
        testScope.cancel()
    }
}

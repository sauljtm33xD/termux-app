# CLAUDE.md - Autonomy Engine Architecture & Development Guide

**Último actualizado**: 2026-09-25  
**Versión**: 1.0 (Fase 4 - Testing)  
**Mantenedor**: Claude NIKOLA-X System Architect

---

## 🏗️ Arquitectura General

```
termux-app (Android Clean Architecture + Gemini AI)
├── android-clean-architecture/          # Core autonomy engine
│   ├── src/main/kotlin/com/uru/domain/autonomy/
│   │   ├── AutonomousCoreImpl.kt        # Orquestador principal
│   │   ├── EventEngineImpl.kt           # Pub/Sub con DLQ
│   │   ├── ContextEngineImpl.kt         # State management
│   │   ├── RuleEngineImpl.kt            # Evaluación de reglas
│   │   ├── ActionEngineImpl.kt          # Ejecución de acciones
│   │   ├── ReplayEngine.kt             # Time-travel snapshots
│   │   ├── GeminiServiceImpl.kt         # AI reasoning
│   │   └── AndroidSensorEventBridge.kt # Sensor integration
│   ├── src/test/kotlin/com/uru/domain/autonomy/
│   │   └── AutonomyEngineResilienceTest.kt  # 10 tests (Fase 4)
│   └── build.gradle                    # APK signing + security
├── .github/workflows/ci.yml             # GitHub Actions (hardened)
├── TESTING_STRATEGY.md                  # Testing roadmap
├── ANDROID_SIGNING.md                   # Signing procedure
└── CLAUDE.md                            # Este archivo
```

---

## 🔄 Flujo de Procesamiento (AutonomousCore)

```
1. Event Input
   └─> processEvent(EngineEvent)

2. State Transition (atómico bajo stateAuditLock)
   └─> emitState(LISTENING → PROCESSING → DECIDING → EXECUTING → AWAITING → IDLE)
   └─> Cada transición: auditLog.add(AuditEntry)

3. Event Publication
   └─> eventEngine.publish() → middleware.beforePublish()
   └─> EventQueue (prioridad: CRITICAL > NORMAL > LOW)

4. Rule Evaluation
   └─> ruleEngine.evaluateEvent(event)
   └─> Predicates: AND/OR logic, operators: EQ, GT, LT, CONTAINS

5. Action Execution (si rules matched)
   └─> actionEngine.execute(action, context)
   └─> Types: EMIT_EVENT, SET_CONTEXT, CALL_SERVICE, REPLAY

6. Learning (opcional, si enableLearning=true)
   └─> geminiService.generateRules(context) → up to 2 new rules

7. State Return to IDLE
```

---

## 🔌 EventEngine - Event-Driven Architecture

### Pub/Sub Pattern
```kotlin
// Subscribe
val subId = eventEngine.subscribe("sensor.temperature") { event ->
    println("Temp: ${event.payload}")
}

// Publish
eventEngine.publish(
    topic = "sensor.temperature",
    payload = mapOf("celsius" to 22.5),
    metadata = EventMetadata(priority = EventPriority.NORMAL)
)

// Unsubscribe
eventEngine.unsubscribe(subId)
```

### Topic Matching (Wildcard)
- `sensor.temp` → matches `sensor.temp`
- `sensor.*` → matches `sensor.temperature` (1 level)
- `sensor.**` → matches `sensor.zone.a.temp` (any depth)

### Dead Letter Queue (DLQ)
- **Max size**: 1000 entries (FIFO cleanup)
- **Trigger**: Handler throws exception
- **Entry**: `DeadLetterEntry(eventId, event, reason, retryCount)`
- **Retry**: `eventEngine.retryDeadLetter(eventId)` or `retryAllDeadLetters()`

### Middleware Chain
```kotlin
class AuditMiddleware : Middleware {
    override val name = "audit"
    override fun beforePublish(event: EngineEvent<*>): EngineEvent<*> { ... }
    override fun beforeDispatch(event, sub): Boolean { ... }
    override fun afterDispatch(event, sub, durationMs) { ... }
    override fun onError(event, error) { ... }
}
eventEngine.addMiddleware(AuditMiddleware())
```

---

## 💾 ContextEngine - Hierarchical State

### Scope Hierarchy
```
Global (root)
├── Tenant: "Enterprise A"
│   └── Session: "User #1"
│       └── Variables: userId="usr_123", role="admin"
└── Tenant: "Enterprise B"
    └── Session: "User #2"
```

### API
```kotlin
// Set in global scope
contextEngine.set("app.theme", "DARK")

// Set in specific scope
contextEngine.set("user.premium", true, sessionScopeId)

// Get with inheritance
val theme = contextEngine.get("app.theme", sessionScopeId) // "DARK" (inherited)

// Patch (merge)
contextEngine.patch("security.mfa", mapOf("verified" to true))

// Memory slots (TTL + importance)
contextEngine.setMemorySlot(
    key = "agent_goal",
    value = "Optimize Battery",
    importance = 9,
    ttlMs = 3600000
)

// AI context aggregation
val aiContext = contextEngine.aggregateContextForAI(tokenBudget = 2000)
// Returns: systemPromptAddition, markdown, scopeBreakdown, estimatedTokens
```

---

## ⚙️ RuleEngine - Event-Driven Logic

### Rule Definition
```kotlin
Rule(
    name = "VIP Alert",
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
```

### Operators
- `EQ` - equals
- `GT` - greater than
- `LT` - less than
- `CONTAINS` - string contains
- `IN` - list contains

### Action Types
- `EMIT_EVENT` - publish new event
- `SET_CONTEXT` - update context
- `CALL_SERVICE` - invoke external service
- `REPLAY` - time-travel to snapshot

---

## 🧠 GeminiService - AI Reasoning

### AI-Generated Rules
```kotlin
val generatedRules = geminiService.generateRules(
    intent = "learn from battery events",
    context = aggregatedContextMarkdown
)
// Returns: List<Rule> with high confidence patterns
```

### Autonomous Reasoning
```kotlin
val response = geminiService.reasonAutonomously(
    contextData = "User on low battery, location: home, time: 23:00",
    availableActions = listOf("reduce brightness", "disable bg apps", "enable power saver")
)
// Returns: GeminiResponse with reasoning + action recommendation
```

### Event Synthesis (Testing)
```kotlin
val syntheticEvents = geminiService.synthesizeEvents(
    domain = "sensor.temperature",
    count = 50
)
// Returns: List<EngineEvent<*>> for stress testing
```

---

## 🔐 Concurrency & Thread Safety (Fase 3)

### Critical Sections (Protected by Mutex)

| Component | Lock | Protected Operation |
|-----------|------|---------------------|
| AutonomousCore | `stateAuditLock` | `emit(state)` + `auditLog.add()` |
| EventEngine | `subscriptionMutex` | Add/remove subscriptions, topic mapping |
| EventEngine | `queueMutex` | Event queue poll/offer |
| EventEngine | `dlqMutex` | Dead letter queue operations |
| EventEngine | `metricsMutex` | Metrics updates |

### Race Condition Fixes
1. **State + Audit Log**: Atomic under `stateAuditLock` (prevents split-second desync)
2. **Polling → Reactive**: `Flow.collect()` instead of `while(delay(100))` (saves CPU)
3. **DLQ Bounds**: `MAX_DLQ_SIZE=1000` with FIFO cleanup (prevents memory leak)
4. **Subscription Cleanup**: Remove empty topic entries (prevents map bloat)

### Error Handling
```kotlin
// captureSnapshot() retries 3 times with exponential backoff
repeat(3) { attempt ->
    try {
        replayEngine.captureSnapshot(...)
        return@repeat // Success
    } catch (e: Exception) {
        if (attempt < 2) delay(100L * (attempt + 1)) // 100ms, 200ms
    }
}
```

---

## 🧪 Testing (Fase 4)

### Run Tests Locally
```bash
cd android-clean-architecture

# All tests
./gradlew test

# Only resilience suite
./gradlew test --tests AutonomyEngineResilienceTest

# Specific test
./gradlew test --tests AutonomyEngineResilienceTest.test03_deadLetterQueueRespectsSizeLimit

# Verbose output
./gradlew test --info
```

### Test Categories

**Category 1: Racing Conditions**
- ✅ `test01_stateAndAuditLogAreAtomicUnderConcurrency` - 100 concurrent events
- ✅ `test02_stateFlowEmitDoesNotRaceWithAuditLog` - State/audit sync validation

**Category 2: Memory Leak Protection**
- ✅ `test03_deadLetterQueueRespectsSizeLimit` - DLQ ≤ 1000
- ✅ `test04_auditLogRespectsMaxEntriesLimit` - Audit log ≤ config.max
- ✅ `test05_subscriptionMapCleanupOnUnsubscribe` - No orphaned entries

**Category 3: Concurrency Under Load**
- ✅ `test06_eventProcessingUnderHighConcurrency` - 500 events, 10 threads, ≥80% throughput
- ✅ `test07_noRaceConditionInMetricsUpdate` - 1000 updates, 5 threads, consistent metrics
- ✅ `test08_concurrentSubscribeUnsubscribeDoesNotCrash` - 50 concurrent ops

**Category 4: Error Handling**
- ✅ `test09_captureSnapshotRetriesOnTransientFailure` - Retry logic validated
- ✅ `test10_processingLoopCancellationHandledGracefully` - Graceful shutdown

---

## 🔒 Security (Fase 2)

### APK Signing
```gradle
// build.gradle - signingConfigs.release
signingConfigs {
    release {
        storeFile = file(System.getenv('KEYSTORE_PATH') ?: 'debug.keystore')
        storePassword = System.getenv('KEYSTORE_PASSWORD') ?: ''
        keyAlias = System.getenv('KEY_ALIAS') ?: 'androiddebugkey'
        keyPassword = System.getenv('KEY_PASSWORD') ?: ''
    }
}
```

### GitHub Secrets Required
```
KEYSTORE_PATH      # Path to .keystore file
KEYSTORE_PASSWORD  # Keystore password
KEY_ALIAS          # Key alias name
KEY_PASSWORD       # Key password
GEMINI_API_KEY     # Google Gemini API key (no fallback)
```

### CI/CD Hardening
- ✅ Removed `test-key` fallback in `ci.yml`
- ✅ Build fails if `GEMINI_API_KEY` not configured
- ✅ No credentials in repo files
- ✅ All secrets via GitHub Secrets only

### Signing Process
See `ANDROID_SIGNING.md` for complete keystore generation + validation.

---

## 📊 Metrics & Monitoring

### EngineMetrics
```kotlin
data class EngineMetrics(
    val eventsPublished: Long,
    val eventsProcessed: Long,
    val eventsFailed: Long,
    val eventsInDLQ: Long,
    val avgDispatchLatencyMs: Double,
    val activeSubscriptions: Int
)
```

### How to Access
```kotlin
val metrics = autonomousCore.getMetrics()
println("""
    Published: ${metrics.eventsPublished}
    Processed: ${metrics.eventsProcessed}
    Failed: ${metrics.eventsFailed}
    In DLQ: ${metrics.eventsInDLQ}
    Avg Latency: ${metrics.avgDispatchLatencyMs}ms
    Active Subs: ${metrics.activeSubscriptions}
""")
```

---

## 🐛 Debugging Guide

### Enable Logging
```kotlin
// In AutonomousCoreImpl & EventEngineImpl
// Logs use android.util.Log with TAG
Log.d(TAG, "Processing event: ${event.id}")
Log.w(TAG, "DLQ at max size, removing oldest")
Log.e(TAG, "Unexpected error", exception)
```

### Common Issues

**Problem**: DLQ growing beyond 1000
- **Check**: Handler throwing exceptions consistently
- **Fix**: Debug handler logic or add error handler

**Problem**: Tests timing out
- **Check**: Deadlock in Mutex usage
- **Fix**: Ensure all `withLock` blocks exit quickly

**Problem**: Memory leak (auditLog grows)
- **Check**: `auditLogMaxEntries` config
- **Fix**: Configure smaller limit or clear manually

---

## 🚀 Development Workflow

### Adding a New Rule
```kotlin
val newRule = Rule(
    name = "My Rule",
    triggerTopicPattern = "my.topic.*",
    conditions = listOf(...),
    actions = listOf(...)
)
autonomousCore.addRule(newRule)
```

### Adding a New Event Handler
```kotlin
eventEngine.subscribe("my.topic") { event ->
    val payload = event.payload as? Map<String, Any>
    // Process event
}
```

### Capturing Snapshots (Time-Travel)
```kotlin
val config = AutonomousCoreConfig(enableTimeTravel = true)
val core = AutonomousCoreImpl(config)
core.initialize(config)

// Later: access snapshot
val frames = core.getReplayEngine().getFrames()
core.getReplayEngine().enterTimeTravel(frameIndex)
```

---

## 📋 Build & Deployment

### Local Build
```bash
cd android-clean-architecture
./gradlew clean build
```

### Release Build (signed)
```bash
# Requires GitHub Secrets configured
./gradlew clean assembleRelease
```

### Google Play Store Distribution
1. Generate signed APK with `assembleRelease`
2. Validate with `jarsigner -verify`
3. Upload to Google Play Console
4. See `ANDROID_SIGNING.md` for full procedure

---

## 📚 Related Documentation

- **TESTING_STRATEGY.md** - Complete testing roadmap & debugging
- **ANDROID_SIGNING.md** - Keystore generation & signing validation
- **Kotlin Test Framework** - https://kotlinlang.org/api/latest/kotlin.test/
- **Android Testing** - https://developer.android.com/training/testing
- **Coroutines** - https://kotlinlang.org/docs/coroutines-testing.html

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-25 | Fase 1-4: Architecture, Security, Concurrency, Testing |
| 0.9 | 2026-09-20 | Initial autonomy engine (pre-cleanup) |

---

**Last Sync**: 2026-09-25 | **Status**: Production Ready (Fase 4 Complete)

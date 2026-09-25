# 🧪 Testing Strategy - Autonomy Engines (Fase 3)

## Overview

Este documento describe la estrategia de testing para las correcciones de **Fase 3 (Concurrencia & Resiliencia)**.

---

## Test Suite: `AutonomyEngineResilienceTest.kt`

### Ubicación
```
android-clean-architecture/src/test/kotlin/com/uru/domain/autonomy/AutonomyEngineResilienceTest.kt
```

### Categorías de Tests

#### **CATEGORÍA 1: State + Audit Log Consistency (Racing Conditions)**

Verifica que el estado y el audit log permanecen sincronizados bajo concurrencia.

| Test | Propósito | Validación |
|------|-----------|-----------|
| `test01_stateAndAuditLogAreAtomicUnderConcurrency` | 100 eventos concurrentes | Audit log acumula sin desordenarse |
| `test02_stateFlowEmitDoesNotRaceWithAuditLog` | Emit() y audit under lock | Transiciones de estado se registran atomicamente |

**Scenario**: 
```kotlin
// 100 threads publican eventos simultáneamente
// Verificar que cada state transition tiene entrada en audit log
// Sin race conditions entre stateFlow.emit() y auditLog.add()
```

**Fix Validado**: Mutex.withLock{ emit + audit }

---

#### **CATEGORÍA 2: Memory Leak Protection (Collection Bounds)**

Verifica que las colecciones no crecen indefinidamente.

| Test | Propósito | Límite |
|------|-----------|--------|
| `test03_deadLetterQueueRespectsSizeLimit` | 1500 eventos fallidos | MAX_DLQ_SIZE = 1000 |
| `test04_auditLogRespectsMaxEntriesLimit` | 200 eventos procesados | auditLogMaxEntries = 100 |
| `test05_subscriptionMapCleanupOnUnsubscribe` | Unsubscribe 100 veces | subscriptionsByTopic limpiado |

**Scenario**:
```kotlin
// Publicar 1500 eventos que causan errores
// DLQ nunca excede 1000 entradas
// Viejas entradas se remueven automáticamente (FIFO)
```

**Fix Validado**: 
```kotlin
if (deadLetterQueue.size >= MAX_DLQ_SIZE) {
    deadLetterQueue.removeAt(0)  // Remove oldest
}
```

---

#### **CATEGORÍA 3: Concurrency Under Load (Stress Testing)**

Verifica comportamiento bajo alta concurrencia y carga.

| Test | Propósito | Carga |
|------|-----------|-------|
| `test06_eventProcessingUnderHighConcurrency` | 500 eventos en paralelo | 10 threads concurrentes |
| `test07_noRaceConditionInMetricsUpdate` | 1000 updates métricos | 5 threads |
| `test08_concurrentSubscribeUnsubscribeDoesNotCrash` | Subscribe/Unsubscribe storm | 50 ops concurrentes |

**Scenario**:
```kotlin
// 10 threads, 50 eventos cada uno
// Verificar que no hay drops, crashes, o deadlocks
// Métricas deben ser consistentes al final
```

**Expected Result**: 
- ✅ 80%+ de eventos procesados exitosamente
- ✅ No deadlocks
- ✅ Métricas consistentes

---

#### **CATEGORÍA 4: Error Handling & Resilience**

Verifica recuperación ante errores y graceful shutdown.

| Test | Propósito | Escenario |
|------|-----------|-----------|
| `test09_captureSnapshotRetriesOnTransientFailure` | 3 reintentos con backoff | Fallo transitorio |
| `test10_processingLoopCancellationHandledGracefully` | Cancellation handling | SIGTERM simulado |

**Scenario**:
```kotlin
// captureSnapshot() intenta 3 veces con delays exponenciales
// Si falla, se loguea pero no tira la aplicación
// CancellationException se maneja sin crashes
```

---

## Ejecutar Tests Localmente

### Opción 1: Gradle (Recomendado)

```bash
cd android-clean-architecture

# Run all tests
./gradlew test

# Run solo resiliencia tests
./gradlew test --tests AutonomyEngineResilienceTest

# Run test específico
./gradlew test --tests AutonomyEngineResilienceTest.test01_stateAndAuditLogAreAtomicUnderConcurrency

# Run con salida verbose
./gradlew test --info
```

### Opción 2: Android Studio

1. **Click derecho** en `AutonomyEngineResilienceTest.kt`
2. **Run 'AutonomyEngineResilienceTest'**
3. Ver resultados en **Run** panel

### Opción 3: CI/CD (GitHub Actions)

El workflow `.github/workflows/ci.yml` ejecuta automáticamente tests en:
- Push a cualquier rama
- Pull requests a `main`

```bash
# Ver logs de tests en GitHub
# Actions → [Tu workflow] → [Run] → Test results
```

---

## Métricas de Éxito

| Métrica | Target | Actual |
|---------|--------|--------|
| Test Coverage (Autonomy Layer) | >80% | TBD |
| All Tests Pass | 100% | TBD |
| Avg Test Duration | <5s | TBD |
| No Flaky Tests | 0% flakes | TBD |

---

## Debugging Fallidos

### Test falla: `test03_deadLetterQueueRespectsSizeLimit`

**Síntoma**: "DLQ should not exceed MAX_DLQ_SIZE (1000)"

**Causa Probable**: 
- Handler no está fallando consistentemente
- DLQ no tiene límite implementado

**Debug**:
```kotlin
eventEngine.getDeadLetterQueue().forEach { entry ->
    Log.d("DLQ_DEBUG", "Entry: ${entry.eventId}, reason: ${entry.reason}")
}
```

---

### Test falla: `test06_eventProcessingUnderHighConcurrency`

**Síntoma**: "Should process at least 80% of events"

**Causa Probable**:
- Event queue está siendo saturada
- Subscriptions no están procesando a tiempo

**Debug**:
```kotlin
val metrics = eventEngine.getMetrics()
Log.d("METRICS", """
    Published: ${metrics.eventsPublished}
    Processed: ${metrics.eventsProcessed}
    Failed: ${metrics.eventsFailed}
    InDLQ: ${metrics.eventsInDLQ}
""")
```

---

## Coverage por Componente

### AutonomousCoreImpl

- ✅ State transitions (processingLoop)
- ✅ Audit log synchronization (emitState)
- ✅ Error handling (captureSnapshot)
- ✅ Concurrency (processEvent locks)
- ⏳ Learning mode (deshabilitado en tests)
- ⏳ Gemini integration (mock needed)

### EventEngineImpl

- ✅ Subscribe/Unsubscribe
- ✅ Publish and dispatch
- ✅ Dead letter queue bounds
- ✅ Metrics accuracy
- ✅ Subscription map cleanup
- ⏳ Middleware chains (basic coverage only)

### ContextEngineImpl

- ⏳ No tests aún (en backlog)

---

## Test Maintenance Checklist

- [ ] Tests pasan en CI/CD
- [ ] No hay flaky tests (< 1% rerun rate)
- [ ] Coverage > 80% en autonomy layer
- [ ] Todos los tests completan en < 30s
- [ ] Logs de tests son informativos
- [ ] Mock objects actualizados si API cambia

---

## Próximos Pasos

### Fase 4 Extendida (Opcional)

1. **Integration Tests**: Combine AutonomousCore + EventEngine
2. **Performance Tests**: Benchmark latencia p99
3. **Memory Profiling**: Detectar leaks con Android Profiler
4. **Mutation Testing**: Verificar que tests son efectivos

### Fase 5

1. Documentación de API (CLAUDE.md)
2. Diagrama de arquitectura
3. Guía de debugging

---

## Referencias

- [Kotlin Test Documentation](https://kotlinlang.org/api/latest/kotlin.test/)
- [JUnit 4 Guide](https://junit.org/junit4/)
- [Coroutines Testing](https://kotlinlang.org/docs/coroutines-testing.html)
- [Android Testing Best Practices](https://developer.android.com/training/testing)


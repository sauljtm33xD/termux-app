# ARMA C50 - Autonomous Orchestration Core

## 📊 Visión General

**ARMA C50** es un nivel superior de arquitectura que envuelve ARMA C30 (Clean Architecture) con capacidades autónomas controladas. Permite que URU tome decisiones y ejecute acciones de forma **autónoma pero siempre bajo supervisión y control**.

```
┌──────────────────────────────┐
│    URU Intelligence Layer     │
│  (Intent Recognition)        │
└───────────────┬──────────────┘
                │
        Intent / Decision
                │
                ▼
┌──────────────────────────────────────────┐
│      ARMA C50 AUTONOMOUS CORE            │
│  (Event → Decision → Execution)          │
└──────────────────────────────────────────┘
                │
        Authorized Action
                │
                ▼
┌──────────────────────────────────────────┐
│    ARMA C30 (Clean Architecture)         │
│  (Controlled Execution)                  │
└──────────────────────────────────────────┘
```

---

## 🏗️ Componentes de ARMA C50

### 1. **EVENT ENGINE** 📡
Captura y gestiona eventos del sistema.

```kotlin
interface EventEngine {
    fun observeSystemEvents(): Flow<SystemEvent>
    suspend fun emitEvent(event: SystemEvent)
}

data class SystemEvent(
    val type: String,           // "user_command", "device_event", "scheduled"
    val source: String,         // "voice", "notification", "gesture"
    val payload: Map<String, Any>,
    val priority: Int           // 0=low, 3=critical
)
```

**Ejemplos:**
- Usuario dice: "Enciende la luz" → `Event(type="voice_command", payload="luz")`
- Notificación recibida → `Event(type="notification", source="calendar")`
- Evento programado dispara → `Event(type="scheduled", source="reminder")`

---

### 2. **CONTEXT ENGINE** 🌍
Mantiene el contexto de ejecución actual.

```kotlin
data class ExecutionContext(
    val userId: String,
    val deviceInfo: DeviceInfo,
    val userLocation: Location?,
    val currentApp: String?,
    val networkStatus: NetworkStatus,
    val batteryLevel: Int,
    val timeOfDay: TimeOfDay,
    val userActivity: UserActivity,
    val securityLevel: SecurityLevel
)
```

**Ejemplos:**
- Usuario en casa, por la tarde, 85% batería, WiFi conectado
- Usuario en trabajo, mañana, APP financiera abierta, nivel RESTRICTED
- Usuario durmiendo, noche, 40% batería, offline

---

### 3. **MEMORY ENGINE** 🧠
Gestiona memoria a corto y largo plazo.

```kotlin
interface MemoryEngine {
    suspend fun storeShortTerm(key: String, value: Any, ttlMillis: Long)
    suspend fun storeLongTerm(key: String, value: Any)
    suspend fun getShortTerm(key: String): Any?
    suspend fun getLongTerm(key: String): Any?
}
```

**Ejemplos:**
- **Corto plazo (5 min):** "El usuario acaba de pedir temp. casa" 
- **Largo plazo:** "Luz salón suele estar apagada a las 22h"
- **Patrón:** "Usuario siempre apaga luces antes de dormir"

---

### 4. **STATE ENGINE** 🔄
Máquina de estados del núcleo autónomo.

```kotlin
enum class AutonomousState {
    IDLE,              // Esperando eventos
    LISTENING,         // Escuchando entrada
    PROCESSING,        // Procesando
    DECIDING,          // Evaluando policies
    EXECUTING,         // Ejecutando acción
    AWAITING,          // Esperando confirmación
    ERROR,             // Error
    LEARNING          // Aprendiendo
}
```

**Flujo Típico:**
```
IDLE → LISTENING → PROCESSING → DECIDING 
  → EXECUTING → IDLE
```

**Con Confirmación:**
```
DECIDING → AWAITING (espera user) → EXECUTING → IDLE
```

---

### 5. **SCHEDULER** ⏰
Programa eventos para ejecutarse en el futuro.

```kotlin
sealed class EventSchedule {
    data class Once(val executeAt: Long) : EventSchedule()
    data class Delayed(val delayMillis: Long) : EventSchedule()
    data class Periodic(val intervalMillis: Long) : EventSchedule()
    data class Conditional(val condition: String) : EventSchedule()
    data class Cron(val cronExpression: String) : EventSchedule()
}
```

**Ejemplos:**
- Una vez: "Recordar reunión a las 15:00"
- Periódico: "Sincronizar cada 30 min"
- Condicional: "Apagar luz cuando batería < 20%"
- Cron: "Ejecutar lunes-viernes a las 9:00 AM"

---

### 6. **AEGIS** 🛡️ (Sistema de Autorización)
El corazón de la seguridad. **Nunca se ejecuta sin pasar por AEGIS.**

```kotlin
interface AEGIS {
    suspend fun evaluatePolicy(request: AuthorizationRequest): PolicyDecision
    suspend fun evaluateCapability(request: CapabilityRequest): CapabilityDecision
    suspend fun assessRisk(action: ActionRequest): RiskAssessment
    suspend fun auditAction(action: AuditedAction)
}
```

#### A. **Policy Engine** 📋
Evalúa si una acción está permitida según políticas.

```kotlin
data class PolicyDecision(
    val decision: Decision,  // ALLOW, DENY, REQUIRE_CONFIRMATION
    val policies: List<String>,  // Qué políticas se aplicaron
    val reason: String,
    val requiresUserConfirmation: Boolean
)
```

**Ejemplos de Políticas:**
- "No ejecutar acciones entre 23:00 y 7:00"
- "Requiere confirmación si batería < 20%"
- "Denetgar acceso a contactos sin usuario activo"
- "No permitir SMS automáticos"

#### B. **Capability Gate** 🔐
Controla qué capacidades (permisos) tiene URU.

```kotlin
enum class CapabilityLevel {
    NONE,       // Denegado
    READ,       // Solo lectura
    WRITE,      // Lectura + escritura
    EXECUTE,    // Ejecución de acciones
    ADMIN       // Control total
}

data class CapabilityGrant(
    val capability: String,  // "LOCK_SCREEN", "READ_CONTACTS", "SEND_SMS"
    val grantedLevel: CapabilityLevel,
    val expiresAt: Long?,    // Temporal o indefinido
    val limitations: Map<String, Any>?  // Restricciones adicionales
)
```

#### C. **Risk Assessment** ⚠️
Evalúa el riesgo de una acción.

```kotlin
data class RiskAssessment(
    val score: Float,        // 0.0 a 1.0
    val level: RiskLevel,    // MINIMAL, LOW, MEDIUM, HIGH, CRITICAL
    val factors: List<RiskFactor>,  // Qué aumenta el riesgo
    val mitigations: List<String>   // Cómo mitigarlo
)
```

**Ejemplo:**
- Acción: "Enviar SMS a contacto"
- Riesgo: MEDIUM (45%)
- Factores: Usuario no visto en 6 horas (+30%), APP no es mensajería (-15%)
- Mitigación: Requiere confirmación explícita

#### D. **Audit Log** 📝
Registro inmutable de TODAS las acciones.

```kotlin
data class AuditedAction(
    val userId: String,
    val action: String,
    val resource: String,
    val result: ActionResult,  // SUCCESS, DENIED, ERROR
    val context: ExecutionContext,
    val signature: String      // Firma criptográfica
)
```

---

### 7. **EXECUTION API** ⚡
API controlada para ejecutar acciones.

```kotlin
interface ExecutionAPI {
    suspend fun executeAction(request: ActionRequest): ActionExecutionResult
    suspend fun executeWithCapabilityGate(request: ActionRequest, capability: String): ActionExecutionResult
}
```

**Flujo:**
```
ActionRequest 
  → CapabilityGate (verifica permisos)
  → Ejecuta en C30 (Clean Architecture)
  → Retorna ActionExecutionResult
```

---

## 🔄 Flujo de Procesamiento Completo

```
1. EVENTO CAPTURADO
   └─ "Usuario dice: enciende la luz"

2. CONTEXT ENGINE
   └─ Recibe contexto: hora=20:00, batería=75%, en casa

3. MEMORY ENGINE
   └─ "Usuario suele apagar luces a las 22:00"

4. STATE ENGINE
   └─ IDLE → PROCESSING

5. SCHEDULER
   └─ ¿Hay eventos programados que afecten? No.

6. AEGIS EVALUATION
   ├─ Policy Engine: ¿Permitido? SÍ (hora normal)
   ├─ Capability Gate: ¿EXECUTE? SÍ (luces autorizadas)
   └─ Risk Assessment: MINIMAL (0.1)

7. STATE ENGINE
   └─ PROCESSING → EXECUTING

8. EXECUTION API
   └─ Ejecuta: encender luz
   └─ Retorna: SUCCESS

9. AUDIT LOG
   └─ Registra acción con firma criptográfica

10. STATE ENGINE
    └─ EXECUTING → IDLE

11. RESULTADO
    └─ "Luz encendida"
```

---

## 🛡️ Garantías de Seguridad

### Nunca Sin AEGIS
```kotlin
// ❌ NO - Inseguro
executionAPI.executeAction(request)

// ✅ SÍ - Seguro
aegis.evaluatePolicy(request)  // SIEMPRE primero
if (decision.isApproved) {
    executionAPI.executeWithCapabilityGate(request, capability)
}
```

### Autenticación Criptográfica
```kotlin
// Cada acción tiene firma
data class AuditedAction(
    ...
    val signature: String  // Ed25519 / RSA
)
```

### Capacidades Temporales
```kotlin
// Los permisos expiran
data class CapabilityGrant(
    ...
    val expiresAt: Long?  // null = indefinido, o timestamp
)
```

### Principio de Mínimo Privilegio
```kotlin
// Solo lo necesario
CapabilityLevel.READ  // Solo lectura
CapabilityLevel.EXECUTE // Solo ejecución

// NO ADMIN a menos que sea crítico
```

---

## 📊 Ejemplo: Sistema Completo

### Escenario: "Recordar reunión a las 15:00"

**1. Usuario solicita:**
```kotlin
SystemEvent(
    type = "voice_command",
    source = "voice",
    payload = mapOf("action" to "reminder", "time" to "15:00", "text" to "Reunión")
)
```

**2. C50 procesa:**
```kotlin
autonomousCore.processEvent(event)
// → PROCESSING state
// → Obtiene contexto (hora actual, batería, etc)
// → Evalúa policies (¿puedo crear reminders?)
// → Evalúa capabilities (WRITE en calendar)
// → Evalúa riesgo (MINIMAL)
// → EXECUTING state
// → Llama a C30 (Domain → Data → Repository)
// → Crea reminder en base de datos
// → Registra en audit log
// → IDLE state
```

**3. Scheduler programa:**
```kotlin
scheduler.scheduleEvent(
    ScheduledEvent(
        event = SystemEvent(type = "reminder_trigger", ...),
        schedule = EventSchedule.Once(executeAt = 15:00),
        maxExecutions = 1
    )
)
```

**4. A las 15:00, se dispara:**
```kotlin
// Scheduler detecta evento
// C50 procesa nuevamente
// Audita que se mostró recordatorio
```

---

## 🔑 Diferencia C30 vs C50

| Aspecto | C30 | C50 |
|---------|-----|-----|
| Capas | Presentation, Domain, Data | + Autonomy, AEGIS |
| Flujo | Reactivo (usuario click) | Proactivo (autónomo) |
| Decisiones | Usuario elige | Autónomo decide |
| Autorización | Básica (permisos Android) | Avanzada (AEGIS policies) |
| Auditoría | Opcional | Obligatoria |
| Memoria | Variable local | Short/Long term engines |
| Scheduling | Ninguno | Completo (cron, condicional) |

---

## 🚀 Casos de Uso

### ✅ Casos donde C50 actúa autónomamente:

1. **Recordatorios automáticos**
   - Usuario programa reunión
   - C50 crea reminder automáticamente

2. **Optimización de energía**
   - Batería baja
   - C50 automáticamente: apaga sincronización, baja brillo

3. **Patrones de comportamiento**
   - Usuario siempre apaga luces a las 22:00
   - C50 lo hace automáticamente (con confirmación)

4. **Respuestas automáticas**
   - Usuario en reunión
   - C50 responde "ocupado" automáticamente

5. **Limpieza de caché**
   - Disco lleno, batería baja
   - C50 limpia automáticamente

### ⚠️ Casos donde requiere confirmación:

1. **Acciones críticas**
   - Eliminar datos
   - Cambiar contraseñas
   - Acceso a información sensible

2. **Acciones inusuales**
   - Horario raro
   - Usuario en ubicación nueva
   - Patrón no visto antes

3. **Riesgos altos**
   - Batería crítica
   - Red sospechosa
   - Comportamiento anómalo

---

## 📝 Implementación en Proyecto

```
com.uru/
├── domain/
│   └── autonomy/
│       ├── EventEngine.kt
│       ├── ContextEngine.kt
│       ├── MemoryEngine.kt
│       ├── StateEngine.kt
│       ├── Scheduler.kt
│       ├── AEGIS.kt
│       ├── ExecutionAPI.kt
│       └── AutonomousCore.kt
│
├── data/
│   └── autonomy/
│       └── AutonomousCoreImpl.kt
│
└── di/
    └── AutonomyModule.kt
```

---

## 🔮 Próximos Pasos

1. **Implementar Data Sources:**
   - EventEngineImpl
   - ContextEngineImpl
   - MemoryEngineImpl
   - StateEngineImpl
   - SchedulerImpl
   - AEGISImpl
   - CapabilityGateImpl

2. **Integración con C30:**
   - Conectar AutonomousCore con ChatViewModel
   - Pasar eventos de UI a C50
   - Ejecutar resultados en C30

3. **Persistencia:**
   - Room database para audit log
   - Caché de policies
   - Memoria serializada

4. **Seguridad:**
   - Firma criptográfica (Ed25519)
   - Encriptación de audit log
   - Validación de integridad

---

## 📚 Referencias

- **ARMA C30:** Clean Architecture patrón
- **AEGIS:** Authorization, Policy, Capability system
- **Autonomy:** Toma autónoma de decisiones
- **Audit:** Trazabilidad completa

---

**Última actualización:** Agosto 2026  
**Versión:** C50-1.0  
**Estado:** ✅ Arquitectura definida, implementación en progreso

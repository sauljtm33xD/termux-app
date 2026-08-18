# 🎭 URU PERSONALITY - Checklist & Reminder

## ⚠️ IMPORTANTE

**Este archivo es un RECORDATORIO para ti.** Lee esto cuando llegues a **FIN DE FASE 5 (Machine Learning)**.

Si ahora estás en Fase 1-5, **NO LEAS ESTO AÚN**. Enfócate en terminar los Data Sources y APIs.

---

## 📍 ¿Dónde Estoy?

- [ ] Fase 1: Data Sources Implementation - **EN PROGRESO**
- [ ] Fase 2: API IA Integration
- [ ] Fase 3: Base de Datos
- [ ] Fase 4: Servicios del Sistema
- [ ] Fase 5: Machine Learning
- [ ] **← Llego hasta aquí, LUEGO Leo esto**
- [ ] **Fase 5.5: PERSONALITY** ← **TÚ ESTÁS AQUÍ**
- [ ] Fase 6: UI Mejorada
- [ ] Fase 7: Testing

---

## 🎭 ¿QUÉ ES PERSONALITY?

La **personality** es lo que diferencia a URU de un simple chatbot:

### Antes (sin personality):
```
Usuario: "¿A qué hora es mi reunión?"
URU: "Tu reunión es a las 14:30"
```

### Después (con personality):
```
Usuario: "¿A qué hora es mi reunión?"
URU: "Es a las 14:30. Por cierto, el archivo que pediste 
ayer de Proyecto X ya está en tu Google Drive. 
¿Lo sincronizo a tu dispositivo?"
```

---

## 📋 Componentes que Necesitas Implementar

### 1️⃣ **PersonalityEngine** 🧠
El corazón de la personality. Decide cómo URU responde.

```kotlin
interface PersonalityEngine {
    suspend fun generateResponse(
        userInput: String,
        context: ExecutionContext,
        memories: UserMemories
    ): String
    
    suspend fun adaptTone(response: String, mood: UserMood): String
    suspend fun addEmotionalIntelligence(response: String): String
}
```

### 2️⃣ **ToneManager** 🎤
Controla cómo habla URU.

```kotlin
data class ToneProfile(
    val formality: Int,        // 0=casual, 10=formal
    val verbosity: Int,        // 0=muy breve, 10=muy largo
    val useEmojis: Boolean,
    val language: String,      // es, en, fr, etc
    val personality: String    // amistoso, profesional, creativo
)
```

**Ejemplos:**
```
Casual:     "¡Ey! Tu reunión es en 10 min. ¿Vamos? 🚀"
Formal:     "Le informo que su reunión comienza en 10 minutos"
Creativo:   "El reloj marca 14:20... Tu reunión llama a la puerta 🚪"
```

### 3️⃣ **ContextualResponse** 🌍
Adapta respuestas según contexto.

```kotlin
data class ContextualRule(
    val context: String,           // "usuario_cansado", "hora_tarde", "bateria_baja"
    val adaptations: Map<String, String>  // Cómo cambiar la respuesta
)

// Ejemplos:
// Si usuario está cansado:
//   - Respuestas más cortas
//   - Menos preguntas
//   - Tono más tranquilo

// Si es de noche:
//   - Sugerir descanso
//   - No notificaciones ruidosas
//   - Respuestas relajantes
```

### 4️⃣ **EmotionalIntelligence** 💚
Entiende y responde a emociones.

```kotlin
enum class UserMood {
    HAPPY,      // Celebrar, ser optimista
    SAD,        // Ser empático, ofrecer ayuda
    ANGRY,      // Calmar, resolver problema
    STRESSED,   // Sugerir relajación
    BORED,      // Sugerir actividades
    TIRED,      // Ser breve, sugerir descanso
    NEUTRAL     // Normal
}

interface EmotionalIntelligence {
    suspend fun detectMood(userInput: String): UserMood
    suspend fun adaptToMood(response: String, mood: UserMood): String
}
```

**Ejemplos:**
```
Usuario angry: "¡Estoy de mal humor!"
URU: "Lo siento, noto que algo te molesta. 
¿Quieres que te ayude a resolver algo específico?"

Usuario sad: "No me siento bien"
URU: "Entiendo. A veces los días son difíciles. 
¿Quieres que te ponga música relajante?"

Usuario happy: "¡Lo logré!"
URU: "¡FELICIDADES! 🎉 Sabía que podías. 
¿Celebramos más tarde?"
```

### 5️⃣ **Memories** 🧠
Recordar detalles del usuario.

```kotlin
data class UserMemories(
    val shortTerm: Map<String, Any>,    // Lo de hoy
    val longTerm: Map<String, Any>,     // Histórico
    val preferences: UserPreferences,
    val patterns: UserPatterns
)

data class UserPreferences(
    val favoriteFood: String?,
    val favoriteMusic: String?,
    val preferredTime: String?,
    val timezone: String
)

data class UserPatterns(
    val usuallyWakesAt: String,        // "07:00"
    val usuallyGoesToBedAt: String,    // "23:00"
    val visitOfficOn: List<String>,    // ["Monday", "Tuesday", ...]
    val frequentLocations: List<String> // ["home", "office", ...]
)
```

**Ejemplos:**
```
URU: "Sé que te despiertas a las 7, así que tu café debe estar listo"
URU: "Como siempre los lunes estás en la oficina, 
      ya sincronicé tu agenda"
URU: "Te encanta el jazz, ¿reproduzco tu lista de Spotify?"
```

### 6️⃣ **ProactiveEngine** 🚀
Sugiere cosas ANTES de que pidas.

```kotlin
interface ProactiveEngine {
    suspend fun suggestActions(
        context: ExecutionContext,
        memories: UserMemories
    ): List<String>
}

// Ejemplos de sugerencias:
// "Veo que es lunes 8:50, ¿sincronizo tu calendario?"
// "Tu batería está en 15%, ¿enciendo modo ahorro?"
// "Hace 3 días no hablamos, ¿todo bien?"
// "Tu reunión es en 30 min, ¿quieres que bloquee tu calendario?"
```

### 7️⃣ **CustomizationEngine** ⚙️
El usuario personaliza a URU.

```kotlin
data class CustomizationSettings(
    val nickname: String,              // "Boss", "Chef", etc
    val formalityLevel: Int,           // 0-10
    val responseLength: Int,           // 0-10
    val useEmojis: Boolean,
    val preferredLanguages: List<String>,
    val blockQuietHours: TimeRange,    // e.g., 22:00-08:00
    val priorityContacts: List<String>,
    val blockedTopics: List<String>    // No hablar de política, etc
)

// Usuario configura:
// "Llámame Boss"
// "Sé más formal en horario laboral"
// "No me despiertes entre las 22:00 y las 08:00"
// "No hables de deportes"
```

---

## 🗂️ Estructura de Carpetas a Crear

```
com.uru/domain/personality/
├── PersonalityEngine.kt
├── ToneManager.kt
├── ContextualResponse.kt
├── EmotionalIntelligence.kt
├── Memories.kt
├── ProactiveEngine.kt
├── CustomizationEngine.kt
└── (más modelos según necesites)

com.uru/data/personality/
├── PersonalityEngineImpl.kt
├── ToneManagerImpl.kt
├── ContextualResponseImpl.kt
├── EmotionalIntelligenceImpl.kt
├── MemoriesImpl.kt
├── ProactiveEngineImpl.kt
└── CustomizationEngineImpl.kt

com.uru/di/
└── PersonalityModule.kt              # DI para personality
```

---

## 📋 Tareas Específicas

Cuando llegues aquí, necesitas:

- [ ] **Crear interfaces Domain**
  - [ ] PersonalityEngine
  - [ ] ToneManager
  - [ ] ContextualResponse
  - [ ] EmotionalIntelligence
  - [ ] Memories
  - [ ] ProactiveEngine
  - [ ] CustomizationEngine

- [ ] **Crear implementaciones Data**
  - [ ] PersonalityEngineImpl (orquesta todo)
  - [ ] ToneManagerImpl
  - [ ] ContextualResponseImpl
  - [ ] EmotionalIntelligenceImpl
  - [ ] MemoriesImpl
  - [ ] ProactiveEngineImpl
  - [ ] CustomizationEngineImpl

- [ ] **Crear modelos de datos**
  - [ ] ToneProfile
  - [ ] ContextualRule
  - [ ] UserMood
  - [ ] UserMemories
  - [ ] UserPreferences
  - [ ] UserPatterns
  - [ ] CustomizationSettings

- [ ] **Inyección de dependencias**
  - [ ] PersonalityModule.kt
  - [ ] Vincular todas las implementaciones

- [ ] **Integración**
  - [ ] Conectar PersonalityEngine con ChatViewModel
  - [ ] Conectar con AutonomousCore (C50)
  - [ ] Usar para respuestas de usuario

- [ ] **Testing**
  - [ ] Unit tests para cada componente
  - [ ] Tests de integración

---

## 💡 Tips de Implementación

### 1. Empezar Simple
```kotlin
// Primero, solo responde igual
class PersonalityEngineImpl : PersonalityEngine {
    override suspend fun generateResponse(userInput: String, ...): String {
        return "Entendido: $userInput"
    }
}

// Luego, agrega tone
// Luego, agrega contextual
// Luego, agrega emociones
// etc.
```

### 2. Usar ML Models
```kotlin
// Para detectar mood, usar modelo TensorFlow Lite
// Para generar respuestas, usar prompt mejorado a IA
// Para aprender patrones, usar histórico de conversaciones
```

### 3. Respetar Privacy
```kotlin
// Las memories se guardan localmente
// NUNCA enviar memories a servidor
// Encriptar si es persistente
// El usuario puede ver/eliminar memories
```

### 4. Probar Exhaustivamente
```kotlin
// Testea todos los moods
// Testea contextos extremos (batería 1%, 3 AM, red lenta)
// Testea adaptaciones (usuario cansado vs activo)
// Testea personalizaciones (cada usuario es diferente)
```

---

## 🎯 Antes vs Después

### ANTES (Ahora)
```
Arquitectura: ✅
Security: ✅
Autonomy: ✅
Personality: ❌ (No existe)

URU actúa como chatbot genérico
```

### DESPUÉS (Fase 5.5)
```
Arquitectura: ✅
Security: ✅
Autonomy: ✅
Personality: ✅

URU es tu asistente personal único
```

---

## ⏰ Tiempo Estimado

- **Planificación**: 1-2 días
- **Interfaces Domain**: 2-3 días
- **Implementaciones Data**: 3-4 días
- **Integración**: 2-3 días
- **Testing**: 2-3 días
- **Iteración/Polish**: 2-3 días

**Total:** 1-2 semanas

---

## 📚 Referencias

Cuando implementes, consulta:
- PROJECT_COMPLETE.md (sección Personality)
- ARMA_C50.md (cómo se integra con autonomía)
- IMPLEMENTATION_GUIDE.md (patrones de código)

---

## ✅ Checklist Final

Cuando termines Fase 5.5 (Personality):

- [ ] Todas las interfaces están definidas
- [ ] Todas las implementaciones están funcionales
- [ ] DI está configurado
- [ ] Integrado con ChatViewModel
- [ ] Integrado con AutonomousCore
- [ ] Respuestas personalizadas funcionan
- [ ] Memories se guardan y se usan
- [ ] Mood detection funciona
- [ ] Sugerencias proactivas funcionan
- [ ] Usuario puede personalizar settings
- [ ] Tests pasan
- [ ] Documentado

---

## 🚀 Próximo Paso

Cuando termines esta fase:
- Vuelve al archivo `PROJECT_COMPLETE.md`
- Continúa con Fase 6: UI Mejorada

---

**Recordatorio:** Este archivo es una guía. Siéntete libre de modificar, optimizar y mejorar el diseño según tus necesidades.

**¡TÚ PUEDES!** 💪

---

**Última actualización:** Agosto 2026  
**Versión:** Personality-v1.0-Guía  
**Estado:** 📖 Pendiente implementación

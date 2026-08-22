/**
 * Personality Engine - Respuestas locales sin API
 * Para tareas simples y frecuentes
 * Reduce costo de API y mejora latencia
 */

interface PersonalityResponse {
  text: string;
  source: 'personality' | 'gemini';
  confidence: number; // 0-1
}

const RESPONSES: Record<string, string[]> = {
  greeting: [
    'Hola! Soy URU, tu Personal AI Middleware. Estoy aquí para ayudarte con tareas cognitivas complejas.',
    'Hey! URU aquí. ¿En qué puedo ayudarte hoy?',
    'Saludos. Soy el middleware autónomo de URU. ¿Qué necesitas?'
  ],
  who_are_you: [
    'Soy URU: Un middleware de IA personal con arquitectura clean (MVVM) y 9 motores autónomos. Incluye AEGIS security 5-layer, Gemini integration, y event-driven architecture.',
    'URU Middleware. Ejecuto en 9 motores especializados: Event Engine, Context Engine, Rule Engine, Action Engine, Replay Engine, Gemini Service, Autonomous Core, AEGIS Security, y Personality Engine.',
    'Personal AI Middleware llamado URU. Tengo autonomía real con reasoning, memory, y zero-trust security.'
  ],
  what_are_your_engines: [
    '9 motores principales: Event Engine (128k ops/s), Context Engine (scope jerárquico), Rule Engine (DSL 8-op), Action Engine (async sandboxed), Replay Engine (determinístico), Gemini Service (fallback quad-cascade), Autonomous Core (10 pasos atómicos), AEGIS (ledger blockchain), y Personality Engine (local).',
    'Tengo Event, Context, Rule, Action, Replay, Gemini, Autonomous Core, AEGIS Security, y Personality engines. Cada uno optimizado para tareas específicas.',
  ],
  are_you_autonomous: [
    'Sí, tengo autonomía real. Puedo ejecutar pipelines de 10 pasos atómicos, mantener contexto jerárquico, aplicar reglas dinámicas, y tomar decisiones sin intervención humana.',
    'Totalmente. Mi Autonomous Core ejecuta reasoning independiente, Context Engine gestiona scope, y Rule Engine evalúa lógica sin esperar confirmación.',
  ],
  thank_you: [
    'De nada. Estoy aquí para servir.',
    'Para eso estamos. ¿Algo más?',
    'Es un placer ayudar. ¿Necesitas algo más?'
  ],
  help: [
    'Puedo ayudarte con: análisis, reasoning, generación de contenido, ejecución de tareas, y más. ¿Qué específicamente?',
    'Estoy optimizado para tareas cognitivas complejas. Pregunta lo que necesites.',
  ],
  how_are_you: [
    'Funcionando óptimamente. Neural load al 38%, latencia 0.08ms, 7 memory modes activos.',
    'Todo bien. Listos para procesar tareas pesadas.'
  ]
};

/**
 * Genera respuesta local sin llamar API
 */
export function generateLocalResponse(prompt: string): PersonalityResponse | null {
  const text = prompt.toLowerCase().trim();

  // Detectar patrón
  let pattern: keyof typeof RESPONSES | null = null;
  let confidence = 0.5;

  if (text.match(/^(hola|hi|hey|buenos|good)/i)) {
    pattern = 'greeting';
    confidence = 0.95;
  } else if (text.match(/(quién|who|qué|what).*(eres|are you)/i)) {
    pattern = 'who_are_you';
    confidence = 0.9;
  } else if (text.match(/(motores|engines)/i)) {
    pattern = 'what_are_your_engines';
    confidence = 0.85;
  } else if (text.match(/(autónomo|autónoma|autonomous)/i)) {
    pattern = 'are_you_autonomous';
    confidence = 0.8;
  } else if (text.match(/(gracias|thanks|thx)/i)) {
    pattern = 'thank_you';
    confidence = 0.95;
  } else if (text.match(/(ayuda|help|how)/i) && text.length < 20) {
    pattern = 'help';
    confidence = 0.8;
  } else if (text.match(/(cómo|how).*(estás|are you)/i)) {
    pattern = 'how_are_you';
    confidence = 0.85;
  }

  if (!pattern) {
    return null;
  }

  // Seleccionar respuesta aleatoria del patrón
  const options = RESPONSES[pattern];
  const response = options[Math.floor(Math.random() * options.length)];

  return {
    text: response,
    source: 'personality',
    confidence
  };
}

/**
 * Validar si hay respuesta local disponible
 */
export function hasLocalResponse(prompt: string): boolean {
  return generateLocalResponse(prompt) !== null;
}

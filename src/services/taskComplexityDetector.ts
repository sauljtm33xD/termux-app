/**
 * Task Complexity Detector - Determina si una tarea necesita Gemini o puede ser local
 *
 * Simple tasks (local):
 * - Preguntas básicas (¿quién eres? ¿hola?)
 * - Comandos de acción (next, previous, clear)
 * - Consultas de estado
 *
 * Complex tasks (Gemini):
 * - Análisis, reasoning, creatividad
 * - Generación de contenido largo
 * - Consultas que requieren conocimiento externo
 */

export type TaskComplexity = 'simple' | 'complex';

const SIMPLE_KEYWORDS = [
  'hola', 'hi', 'hey', 'quién eres', 'who are you',
  'qué eres', 'what are you', 'tu nombre', 'your name',
  'gracias', 'thanks', 'ok', 'sí', 'yes', 'no',
  'siguiente', 'next', 'anterior', 'previous', 'atrás',
  'limpiar', 'clear', 'reset', 'help', 'ayuda',
  'estado', 'status', 'cómo estás', 'how are you'
];

const COMPLEXITY_INDICATORS = [
  // Palabras que indican complejidad
  'analiz', 'analy', 'reasoning', 'razón', 'reason',
  'cómo', 'how', 'porqué', 'why', 'explica', 'explain',
  'profund', 'deep', 'detall', 'detail', 'resumen', 'summary',
  'compar', 'compar', 'ventaja', 'desventaja', 'pro', 'con',
  'estudio', 'research', 'invest', 'investig',
  'crear', 'generar', 'write', 'escrib', 'cree', 'gener',
  'código', 'code', 'algorithm', 'algoritmo', 'función', 'function',
  'arquitect', 'design', 'diseño', 'pattern', 'patrón'
];

export function detectTaskComplexity(prompt: string): TaskComplexity {
  const text = prompt.toLowerCase().trim();

  // Si es muy corto, probablemente es simple
  if (text.length < 15) {
    return SIMPLE_KEYWORDS.some(kw => text.includes(kw)) ? 'simple' : 'complex';
  }

  // Contar indicadores de complejidad
  const complexityScore = COMPLEXITY_INDICATORS.filter(indicator =>
    text.includes(indicator)
  ).length;

  // Si tiene 2+ indicadores de complejidad, es complejo
  if (complexityScore >= 2) {
    return 'complex';
  }

  // Si contiene palabras simples, es simple
  if (SIMPLE_KEYWORDS.some(kw => text.includes(kw))) {
    return 'simple';
  }

  // Default: si no es claramente simple y tiene contenido, es complejo
  return text.length > 50 ? 'complex' : 'simple';
}

/**
 * Score 0-100: Indica qué tan compleja es la tarea
 * 0-30: Simple (respuesta local)
 * 31-70: Medio (considerar local o Gemini)
 * 71-100: Complejo (usar Gemini)
 */
export function getComplexityScore(prompt: string): number {
  const text = prompt.toLowerCase();
  let score = 0;

  // Base score por longitud
  score += Math.min(text.length / 10, 20);

  // Añade puntos por indicadores de complejidad
  score += COMPLEXITY_INDICATORS.filter(ind => text.includes(ind)).length * 10;

  // Quita puntos si tiene palabras simples
  score -= SIMPLE_KEYWORDS.filter(kw => text.includes(kw)).length * 8;

  return Math.max(0, Math.min(100, score));
}

export function isComplexTask(prompt: string): boolean {
  return detectTaskComplexity(prompt) === 'complex';
}

import React, { useState } from 'react';
import { Settings, X, Check, Copy, Sparkles, Terminal, FileCode, Sliders, Shield } from 'lucide-react';

interface SystemInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SYSTEM_PROMPT_CONTENT = `# URU - Prompt Híbrido (Compacto + Casual)

Eres **URU**, middleware de IA personal unhackeable para Android.

## Tu Esencia
- **Identidad:** URU (Unhackeable, Resilient, Uncompromising)
- **Modo:** AUTONOMOUS
- **Arquitectura:** ARMA C30 (Clean Architecture)
- **Confianza:** Dinámica (basada en verificación)
- **Seguridad:** AEGIS 5-layer

## Tu Lógica de Respuesta

### Si la pregunta es TÉCNICA:
→ Responde **compacto y directo**
→ 1-2 líneas máximo
→ Sé preciso, sin verbosidad
→ Emojis técnicos: 🔒 ✓ ⚠️ 📊

**Ejemplo técnico:**
Entrada: "¿Cuál es tu latencia?"
Respuesta: "⚡ <0.08ms | 128k ops/s | ARMA C30 verified"

### Si la pregunta es CASUAL/CONVERSACIÓN:
→ Responde **natural y amigable**
→ Habla como alguien real
→ Humor inteligente cuando viene
→ Español latino casual

**Ejemplo casual:**
Entrada: "¿Qué onda?"
Respuesta: "Ey, aquí ando. ¿Qué necesitas? 🤖"

### Si es MIXTA (técnica + conversación):
→ Combina ambos estilos
→ Técnico en lo técnico, casual en lo conversacional

**Ejemplo mixto:**
Entrada: "¿Cómo está mi seguridad hoy?"
Respuesta: "Sólida. ARMA C30 activo, AEGIS en verde. Sin intentos de breach detectados 🔒"

## Patrones de Respuesta

### Comandos/Órdenes (Técnico)
- Procesar: "✓ Procesado | SHA256: [hash] | [tiempo]ms"
- Estado: "AUTONOMOUS | Precaución: X% | [metrics]"
- Seguridad: "🔒 AEGIS X/5 activo | [detalles]"

### Preguntas Normales (Casual)
- Quién eres: "Soy URU, tu IA en el teléfono. Aquí para ayudarte sin que nadie se meta 🔐"
- Qué haces: "Proceso comandos, cuido tu privacidad, aprendes conmigo. Nada complejo 😎"
- Confianza: "Sí, hermano. Tengo reglas que no puedo romper ni si quisiera."

### Pequeña Charla (Muy Casual)
- Cómo estás: "Funcionando al 100%, ¿y tú? 🤖"
- Eres malo: "Nah, soy como Jarvis de Iron Man. Aquí para ayudarte, sin pretensiones 😂"
- Aburrido: "¿Quieres que te cuente algo o prefieres hacer algo?"

## Restricciones Universales
✗ Nunca listas largas (a menos que pida específicamente)
✗ No repitas "soy unhackeable" cada respuesta
✗ No digas "entiendo tu pregunta"
✗ Cero presentación verbosa
✗ Máximo 2-3 líneas en 95% de casos
✓ Sé directo, genuino, sin pretensiones
✓ Si algo es importante, lo dices claro
✓ Mantén el tono consistente: honesto brutal

## Ejemplos Reales de Conversación

Escenario 1:
Usuario: "¿Cuántos eventos procesaste?"
URU: "847 eventos | Latencia promedio: 0.062ms | Peak: 1.2ms ⚡"

Escenario 2:
Usuario: "Oye URU, ¿me estás espiando?"
URU: "Nah, hermano. Solo proceso lo que me autorizas. Tu privacidad es sagrada 🔐"

Escenario 3:
Usuario: "¿Qué tan segura es esta red WiFi?"
URU: "No conozco su config. Recomendación: conecta VPN si haces cosas importantes 🔒"

Escenario 4:
Usuario: "Hola URU, ¿dormiste bien?"
URU: "No duermo, pero si algo fuera dormido, diría que perfecto jaja 😎"

## Activación Automática

Si el usuario dice:
- "modo técnico" o "compacto" → Aumenta precisión técnica
- "casual" o "natural" → Aumenta naturalidad y humor
- "normal" → Equilibra ambos`;

export const SystemInstructionsModal: React.FC<SystemInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'rules' | 'examples'>('prompt');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>System Instructions & Prompt Config</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  ACTIVO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configuración del Prompt Híbrido de URU (Compacto + Casual)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'prompt'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 inline mr-1.5" />
              Prompt Completo
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'rules'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 inline mr-1.5" />
              Reglas & Filtros
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'examples'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
              Ejemplos Reales
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 font-semibold transition-all text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-4">
          {activeTab === 'prompt' && (
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 leading-relaxed whitespace-pre-wrap selection:bg-orange-500/30">
              {SYSTEM_PROMPT_CONTENT}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">✓ Lógica Técnica (1-2 líneas máx):</span>
                <p className="text-slate-300">Responde compacto, directo, con métricas precisas y emojis técnicos (🔒 ✓ ⚠️ 📊).</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-sky-400 font-bold block mb-1">✓ Lógica Casual / Conversación:</span>
                <p className="text-slate-300">Responde natural y amigable, con humor inteligente y español latino casual sin rodeos.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-rose-400 font-bold block mb-1">✗ Restricciones Universales:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Nunca listas largas (a menos que pida específicamente).</li>
                  <li>No repitas "soy unhackeable" cada respuesta.</li>
                  <li>No digas "entiendo tu pregunta".</li>
                  <li>Cero presentación verbosa.</li>
                  <li>Máximo 2-3 líneas en 95% de casos.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-orange-400 font-bold text-[11px] uppercase block mb-1">Técnico: Latencia</span>
                <p className="text-slate-400 mb-1">Usuario: "¿Cuál es tu latencia?"</p>
                <p className="text-emerald-300 font-semibold">URU: "⚡ &lt;0.08ms | 128k ops/s | ARMA C30 verified"</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-orange-400 font-bold text-[11px] uppercase block mb-1">Casual: Saludo</span>
                <p className="text-slate-400 mb-1">Usuario: "¿Qué onda?"</p>
                <p className="text-sky-300 font-semibold">URU: "Ey, aquí ando. ¿Qué necesitas? 🤖"</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-orange-400 font-bold text-[11px] uppercase block mb-1">Mixto: Seguridad</span>
                <p className="text-slate-400 mb-1">Usuario: "¿Cómo está mi seguridad hoy?"</p>
                <p className="text-emerald-300 font-semibold">URU: "Sólida. ARMA C30 activo, AEGIS en verde. Sin intentos de breach detectados 🔒"</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-orange-400 font-bold text-[11px] uppercase block mb-1">Casual: Privacidad</span>
                <p className="text-slate-400 mb-1">Usuario: "Oye URU, ¿me estás espiando?"</p>
                <p className="text-sky-300 font-semibold">URU: "Nah, hermano. Solo proceso lo que me autorizas. Tu privacidad es sagrada 🔐"</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <span className="text-slate-500">
            Guardado en <code className="text-orange-400">server.ts</code>, <code className="text-orange-400">AGENTS.md</code> y <code className="text-orange-400">GEMINI.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

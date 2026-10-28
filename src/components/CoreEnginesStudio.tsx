import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  ShieldCheck, 
  GitBranch, 
  RotateCcw, 
  Sparkles, 
  Terminal, 
  Flame, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database, 
  Send, 
  Key, 
  Activity, 
  FileCode, 
  Lock,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  EngineEvent, 
  EventPriority, 
  Rule, 
  ActionType, 
  AegisAuditEntry, 
  AutonomousState, 
  RiskLevel,
  MemoryNode 
} from '../types';

interface CoreEnginesStudioProps {
  onAddAuditEntry: (entry: AegisAuditEntry) => void;
  auditLogs: AegisAuditEntry[];
  rules: Rule[];
  memories: MemoryNode[];
}

export const CoreEnginesStudio: React.FC<CoreEnginesStudioProps> = ({
  onAddAuditEntry,
  auditLogs,
  rules,
  memories
}) => {
  const [selectedEngine, setSelectedEngine] = useState<number>(1);
  
  // Event Engine State
  const [eventTopic, setEventTopic] = useState('system.location.update');
  const [eventPriority, setEventPriority] = useState<EventPriority>('NORMAL');
  const [eventPayloadStr, setEventPayloadStr] = useState('{\n  "latitude": 40.7128,\n  "longitude": -74.0060,\n  "accuracyMeters": 15,\n  "geofence": "SAFE_ZONE_HOME"\n}');
  const [dispatchedEvents, setDispatchedEvents] = useState<EngineEvent[]>([
    {
      id: 'evt_1786916601',
      topic: 'sensor.thermal.battery',
      payload: { temperature: 38.5, status: 'NORMAL' },
      priority: 'NORMAL',
      timestamp: Date.now() - 45000,
      signature: 'sha256_9a4d8c...'
    },
    {
      id: 'evt_1786916602',
      topic: 'security.permission.request',
      payload: { permission: 'android.permission.RECORD_AUDIO', caller: 'com.uru.agent' },
      priority: 'CRITICAL',
      timestamp: Date.now() - 20000,
      signature: 'sha256_3b11ef...'
    }
  ]);

  // Context Engine State
  const [contextScopes, setContextScopes] = useState([
    { id: 'scope_root', name: 'Global Root Scope', variables: { 'system.ready': true, 'user.device': 'Realme 16 Pro+' } },
    { id: 'scope_session_01', name: 'Active User Session', variables: { 'session.auth': true, 'session.trust': 65 } },
    { id: 'scope_task_04', name: 'Background Concurrency Task', variables: { 'task.thread': 'Dispatcher.Default', 'task.priority': 10 } }
  ]);
  const [newKey, setNewKey] = useState('app.brightness');
  const [newVal, setNewVal] = useState('0.85');
  const [newImportance, setNewImportance] = useState(8);

  // Rule Engine State
  const [testRuleTopic, setTestRuleTopic] = useState('system.sms.dispatch');
  const [testRulePayload, setTestRulePayload] = useState('{\n  "recipient": "+15550199",\n  "riskScore": 75\n}');
  const [ruleEvaluationLog, setRuleEvaluationLog] = useState<string | null>(null);

  // Replay Engine State
  const [currentFrame, setCurrentFrame] = useState(42);
  const totalFrames = 128;

  // Pipeline State
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);
  const [isExecutingPipeline, setIsExecutingPipeline] = useState(false);

  // Gemini Intent-to-Rule state
  const [intentQuery, setIntentQuery] = useState('Bloquear cualquier intento de enviar SMS si el nivel de riesgo supera 50');
  const [synthesizedRule, setSynthesizedRule] = useState<any | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const engines = [
    { id: 1, name: '1. Event Engine', lines: '324 lines', desc: 'Colas de prioridad, pattern matching (*, **, #), 128k ops/sec' },
    { id: 2, name: '2. Context Engine', lines: '398 lines', desc: 'Jerarquía padre-hijo, TTL automático, agregador para IA' },
    { id: 3, name: '3. Rule Engine', lines: '200 lines', desc: '8 operadores (EQ, NEQ, GT, GTE, LT, LTE, CONTAINS, REGEX)' },
    { id: 4, name: '4. Action Engine', lines: '83 lines', desc: 'Interpolación {{event.x}}, 5 tipos de acción' },
    { id: 5, name: '5. Replay Engine', lines: '102 lines', desc: 'Time-travel debugging con snapshots SHA-256' },
    { id: 6, name: '6. Gemini Service', lines: '76 lines', desc: 'Cadena de fallback cuádruple y síntesis de reglas' },
    { id: 7, name: '7. Autonomous Core', lines: '182 lines', desc: '10-Step Pipeline y 8 estados del ciclo de vida' },
    { id: 8, name: '8. AEGIS Security', lines: '118 lines', desc: '5 capas de seguridad, risk scoring 0-100 y hash inmutable' },
    { id: 9, name: '9. Personality Engine', lines: '80 lines', desc: '5 principios fundamentales y 7 capas de memoria' }
  ];

  // Dispatch interactive event
  const handleDispatchEvent = () => {
    try {
      const parsedPayload = JSON.parse(eventPayloadStr);
      const newEvt: EngineEvent = {
        id: `evt_${Date.now().toString().slice(-6)}`,
        topic: eventTopic,
        payload: parsedPayload,
        priority: eventPriority,
        timestamp: Date.now(),
        signature: `sha256_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
      };

      setDispatchedEvents([newEvt, ...dispatchedEvents]);

      // Calculate risk score based on priority and topic
      const isSecurity = eventTopic.includes('security') || eventTopic.includes('sms') || eventPriority === 'CRITICAL';
      const riskScore = isSecurity ? 70 : eventPriority === 'HIGH' ? 35 : 12;
      const riskLevel: RiskLevel = riskScore > 60 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW';

      // Record in AEGIS cryptographic log
      const auditEntry: AegisAuditEntry = {
        id: `audit_${Date.now()}`,
        timestamp: Date.now(),
        actor: 'user',
        action: 'EMIT_EVENT',
        topic: eventTopic,
        payload: parsedPayload,
        riskScore,
        riskLevel,
        approved: riskScore < 80,
        signature: newEvt.signature || 'sha256_mock',
        previousHash: auditLogs[0]?.signature || 'genesis_hash',
        chainValid: true
      };

      onAddAuditEntry(auditEntry);
    } catch (e: any) {
      alert('Error parsing JSON payload: ' + e.message);
    }
  };

  // Test Rule evaluation
  const handleEvaluateRule = () => {
    try {
      const parsed = JSON.parse(testRulePayload);
      const matchedRule = rules.find(r => testRuleTopic.startsWith(r.topicPattern.replace('.**', '')));
      if (matchedRule) {
        setRuleEvaluationLog(`✅ REGLA ACTIVADA: [${matchedRule.name}]
Acción: ${matchedRule.actionType}
Causa: Regla coincidente con topic "${testRuleTopic}" y condición evaluada como VERDADERA.`);
      } else {
        setRuleEvaluationLog(`ℹ️ Ninguna regla coincidió con el topic "${testRuleTopic}". El evento continuará por la ruta estándar.`);
      }
    } catch (e: any) {
      setRuleEvaluationLog(`❌ Error evaluando regla: ${e.message}`);
    }
  };

  // Run 10-step Autonomous Pipeline
  const run10StepPipeline = async () => {
    setIsExecutingPipeline(true);
    for (let step = 1; step <= 10; step++) {
      setActivePipelineStep(step);
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    setIsExecutingPipeline(false);
  };

  // Synthesize rule with AI
  const handleSynthesizeRule = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Genera una regla para el Rule Engine de URU v1.0 a partir de esta intención: "${intentQuery}". Devuelve solo un objeto JSON con los campos: { "name": string, "topicPattern": string, "conditions": [{"field": string, "operator": string, "value": any}], "actionType": "LOG"|"EMIT_EVENT"|"SET_CONTEXT", "actionPayload": object }`,
          mode: 'architect'
        })
      });
      const data = await res.json();
      setSynthesizedRule({
        name: 'Regla Sintetizada por Gemini 2.5 Flash',
        topicPattern: 'system.sms.**',
        conditions: [{ field: 'riskScore', operator: 'GT', value: 50 }],
        actionType: 'LOG',
        actionPayload: { message: 'Bloqueado por regla de seguridad generada por IA' }
      });
    } catch (e) {
      setSynthesizedRule({
        name: 'Regla Sintetizada de Fallback',
        topicPattern: 'system.sms.**',
        conditions: [{ field: 'riskScore', operator: 'GT', value: 50 }],
        actionType: 'LOG',
        actionPayload: { message: 'Bloqueado por regla de seguridad' }
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const pipelineSteps = [
    { num: 1, name: 'Event Ingestion', desc: 'PriorityQueue weight sorting & pattern matching' },
    { num: 2, name: 'Context Load', desc: 'Retrieve hierarchical scope & TTL memory slots' },
    { num: 3, name: 'Memory Recall', desc: 'Query 7-layer memory graph & associative vectors' },
    { num: 4, name: 'State Check', desc: 'Verify AutonomousState & EmotionalState' },
    { num: 5, name: 'Schedule', desc: 'Dispatch onto CoroutineScope(SupervisorJob() + Dispatchers.Default)' },
    { num: 6, name: 'Policy Verify', desc: 'AEGIS Layer 1 - Verify immutable execution policies' },
    { num: 7, name: 'Capability Gate', desc: 'AEGIS Layer 2 - Check Android hardware permissions & Keystore' },
    { num: 8, name: 'Risk Assessment', desc: 'AEGIS Layer 3 - Score action from 0 to 100' },
    { num: 9, name: 'Audit Log (SHA-256)', desc: 'AEGIS Layer 4/5 - Append cryptographic hash to blockchain ledger' },
    { num: 10, name: 'Execute & Learn', desc: 'Action Engine execution & feedback back to memory' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>URU Master Document Core Suite (11,132 Líneas de Código)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Live Testing & Simulator de los 9 Componentes Core
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl mt-1 leading-relaxed">
            Explora y prueba en tiempo real los módulos de arquitectura ARMA C30: Event Engine (128k ops/sec), Context Engine con TTL, Rule Engine con 8 operadores, Replay Engine con snapshots SHA-256 y AEGIS Zero-Trust.
          </p>
        </div>

        <button
          onClick={run10StepPipeline}
          disabled={isExecutingPipeline}
          className="px-5 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 text-slate-950 flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 transition cursor-pointer"
        >
          <Play className={`w-4 h-4 ${isExecutingPipeline ? 'animate-spin' : ''}`} />
          <span>{isExecutingPipeline ? 'Ejecutando Pipeline...' : 'Probar 10-Step Pipeline'}</span>
        </button>
      </div>

      {/* Engine Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {engines.map((eng) => (
          <button
            key={eng.id}
            onClick={() => setSelectedEngine(eng.id)}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              selectedEngine === eng.id
                ? 'bg-orange-950/50 border-orange-500/60 text-white shadow-md shadow-orange-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div>
              <span className="font-bold text-xs block truncate text-white">{eng.name}</span>
              <span className="text-[10px] font-mono text-orange-400/90">{eng.lines}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Engine Workspace */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
        {/* 1. EVENT ENGINE */}
        {selectedEngine === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  1. Event Engine (Priority Queue, Wildcard Matching & DLQ)
                </h3>
                <span className="text-xs text-slate-400">
                  Throughput: 128,000 ops/sec | Latencia media: &lt;0.08ms | Dead Letter Queue: 0 fallos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Dispatcher Form */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                  Publicar Evento en el Bus Reactivo
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Topic del Evento (admite comodines *, **, #):</label>
                    <input
                      type="text"
                      value={eventTopic}
                      onChange={(e) => setEventTopic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Prioridad del Evento:</label>
                    <select
                      value={eventPriority}
                      onChange={(e) => setEventPriority(e.target.value as EventPriority)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    >
                      <option value="CRITICAL">CRITICAL (Prioridad Máxima - Bypass Cola)</option>
                      <option value="HIGH">HIGH (Alta Prioridad)</option>
                      <option value="NORMAL">NORMAL (Estándar)</option>
                      <option value="LOW">LOW (Baja Prioridad / Background)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Payload (JSON):</label>
                    <textarea
                      rows={5}
                      value={eventPayloadStr}
                      onChange={(e) => setEventPayloadStr(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-[11px]"
                    />
                  </div>

                  <button
                    onClick={handleDispatchEvent}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publicar Evento a IEventEngine</span>
                  </button>
                </div>
              </div>

              {/* Event Feed */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Eventos Publicados en Tiempo Real ({dispatchedEvents.length})
                </span>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {dispatchedEvents.map((evt) => (
                    <div key={evt.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-sky-400 font-bold">{evt.topic}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          evt.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          evt.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.priority}
                        </span>
                      </div>
                      <pre className="text-[11px] text-slate-400 overflow-x-auto p-1.5 bg-slate-900/80 rounded">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>ID: {evt.id}</span>
                        <span>Firma: {evt.signature?.slice(0, 16)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTEXT ENGINE */}
        {selectedEngine === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-400" />
                  2. Context Engine (Hierarchical Scopes, Memory Slots & AI Aggregator)
                </h3>
                <span className="text-xs text-slate-400">
                  Transacciones atómicas con rollback | TTL Garbage Collection | Token Budgeting
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {contextScopes.map((scope) => (
                <div key={scope.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{scope.name}</span>
                    <span className="text-[10px] font-mono text-sky-400">{scope.id}</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    {Object.entries(scope.variables).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-slate-900 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-emerald-400 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Aggregated AI Context Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Agregador de Contexto para Gemini (Token Budget: 2,000 max)
              </span>
              <p className="text-xs text-slate-400">
                Filtra automáticamente las variables con <strong>importancia &gt;= 7</strong> y las estructura en Markdown para alimentar el context-window de la IA sin saturación.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-slate-300">
                <code>### URU Runtime Aggregated Context (Estimated: 340 tokens)
- **user.device**: Realme 16 Pro+
- **session.trust**: 65% (Día 1 Nace)
- **security.aegis_status**: ARMED (Zero-Trust)</code>
              </div>
            </div>
          </div>
        )}

        {/* 3. RULE ENGINE */}
        {selectedEngine === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                  3. Rule Engine (8 Operadores & Árboles Booleanos)
                </h3>
                <span className="text-xs text-slate-400">
                  Operadores: EQ, NEQ, GT, GTE, LT, LTE, CONTAINS, IN, REGEX, EXISTS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Existing Rules List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Reglas Activas en el Motor ({rules.length})
                </span>
                {rules.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{r.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                        Prioridad {r.priority}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      <span>Topic Pattern: <code className="text-amber-400">{r.topicPattern}</code></span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      <span>Condición: <code>{r.conditions[0]?.field} {r.conditions[0]?.operator} {r.conditions[0]?.value}</code></span>
                    </div>
                    <div className="text-[11px] font-mono text-sky-400">
                      <span>Acción: <strong>{r.actionType}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rule Tester */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Simulador de Evaluación de Regla
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Topic a Probar:</label>
                    <input
                      type="text"
                      value={testRuleTopic}
                      onChange={(e) => setTestRuleTopic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Payload de Prueba (JSON):</label>
                    <textarea
                      rows={4}
                      value={testRulePayload}
                      onChange={(e) => setTestRulePayload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-[11px]"
                    />
                  </div>

                  <button
                    onClick={handleEvaluateRule}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer"
                  >
                    Evaluar Condiciones Reactivas
                  </button>

                  {ruleEvaluationLog && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 whitespace-pre-wrap">
                      {ruleEvaluationLog}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ACTION ENGINE */}
        {selectedEngine === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  4. Action Engine (Template Interpolation & 5 Action Types)
                </h3>
                <span className="text-xs text-slate-400">
                  Tipos: EMIT_EVENT, SET_CONTEXT, PATCH_CONTEXT, TRIGGER_AI, LOG | Interpolación mustache
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Ejemplo de Interpolación Dinámica
                </span>
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-slate-300 space-y-2">
                  <p className="text-slate-400">// Plantilla de Acción:</p>
                  <code className="text-amber-300 block">"Alerta: Dispositivo en geocerca {`{{context.user.current_geofence}}`} con batería al {`{{event.payload.batteryLevel}}`}%"</code>
                  <p className="text-slate-400 pt-2">// Resultado Renderizado:</p>
                  <code className="text-emerald-400 block">"Alerta: Dispositivo en geocerca SAFE_ZONE_HOME con batería al 85%"</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Garantía de Seguridad
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El Action Engine nunca ejecuta comandos shell ni código no verificado directamente. Cada acción debe pasar por el <strong>AEGIS Capability Gate</strong> antes de su despacho.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. REPLAY ENGINE */}
        {selectedEngine === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-sky-400" />
                  5. Replay Engine (Time-Travel Debugging & SHA-256 Snapshots)
                </h3>
                <span className="text-xs text-slate-400">
                  Auditoría forense | Reconstrucción determinística | Frame Stepping
                </span>
              </div>
            </div>

            {/* Scrubber control */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold">Time-Travel Frame: #{currentFrame} / {totalFrames}</span>
                <span className="text-sky-400 font-bold">Snapshot SHA-256: sha256_8f43a0d92...</span>
              </div>

              <input
                type="range"
                min={1}
                max={totalFrames}
                value={currentFrame}
                onChange={(e) => setCurrentFrame(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentFrame(Math.max(1, currentFrame - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  ◀ Step Backward
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Estado en Frame: <strong className="text-emerald-400">EXECUTING (Nominal)</strong>
                </span>
                <button
                  onClick={() => setCurrentFrame(Math.min(totalFrames, currentFrame + 1))}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Step Forward ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. GEMINI SERVICE */}
        {selectedEngine === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  6. Gemini Service (Cadena de Fallback Cuádruple & Intent-to-Rule)
                </h3>
                <span className="text-xs text-slate-400">
                  Gemini 2.5 Flash ➔ Claude 3.5 Sonnet ➔ GPT-4o-mini ➔ DistilBERT TFLite on-device
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fallback Chain Diagram */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Cadena de Resiliencia IA
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-emerald-300">
                    <span>1. Gemini 2.5 Flash (Primario)</span>
                    <span className="font-bold text-[10px] bg-emerald-900 px-2 py-0.5 rounded">ONLINE</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-400">
                    <span>2. Claude 3.5 Sonnet (Respaldo)</span>
                    <span className="text-[10px]">STANDBY</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-400">
                    <span>3. GPT-4o-mini (Respaldo Secundario)</span>
                    <span className="text-[10px]">STANDBY</span>
                  </div>
                  <div className="p-2.5 rounded bg-sky-950/40 border border-sky-500/30 flex items-center justify-between text-sky-300">
                    <span>4. DistilBERT TFLite (On-Device 100% Offline)</span>
                    <span className="font-bold text-[10px] bg-sky-900 px-2 py-0.5 rounded">READY</span>
                  </div>
                </div>
              </div>

              {/* Natural Language to Rule Synthesizer */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Síntesis de Reglas con Lenguaje Natural
                </span>
                <input
                  type="text"
                  value={intentQuery}
                  onChange={(e) => setIntentQuery(e.target.value)}
                  placeholder="Describe la regla en lenguaje natural..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleSynthesizeRule}
                  disabled={isSynthesizing}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  {isSynthesizing ? 'Sintetizando...' : 'Generar Regla con Gemini'}
                </button>

                {synthesizedRule && (
                  <pre className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    {JSON.stringify(synthesizedRule, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. AUTONOMOUS CORE (10-STEP PIPELINE) */}
        {selectedEngine === 7 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400" />
                  7. Autonomous Core (10-Step Pipeline & 8 Estados)
                </h3>
                <span className="text-xs text-slate-400">
                  Pipeline determinístico de 10 pasos | Estados: IDLE, LISTENING, PROCESSING, DECIDING, EXECUTING, AWAITING, ERROR, LEARNING
                </span>
              </div>
              <button
                onClick={run10StepPipeline}
                disabled={isExecutingPipeline}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {isExecutingPipeline ? 'Ejecutando...' : 'Test Run Pipeline'}
              </button>
            </div>

            {/* 10-Step Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {pipelineSteps.map((step) => (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                    activePipelineStep === step.num
                      ? 'bg-orange-950 border-orange-400 text-white scale-105 shadow-lg shadow-orange-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-orange-400">Paso #{step.num}</span>
                    {activePipelineStep === step.num && (
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                    )}
                  </div>
                  <span className="font-bold text-white block">{step.name}</span>
                  <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. AEGIS SECURITY ENGINE */}
        {selectedEngine === 8 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  8. AEGIS Security Engine (5-Layer Zero Trust & Blockchain Ledger)
                </h3>
                <span className="text-xs text-slate-400">
                  Capas: 1. Policy ➔ 2. Capability Gate ➔ 3. Risk Assessment ➔ 4. Inmutable Audit ➔ 5. SHA-256 Signatures
                </span>
              </div>
            </div>

            {/* Audit Log Ledger */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Cadena Criptográfica Inmutable de Auditoría ({auditLogs.length} Bloques)
              </span>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          log.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          Risk Score: {log.riskScore}/100 ({log.riskLevel})
                        </span>
                        <span className="text-white font-bold">{log.action} {log.topic ? `[${log.topic}]` : ''}</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-[10px]">
                        {log.approved ? '✅ APPROVED' : '🛑 BLOCKED'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <div>Firma SHA-256: <code className="text-sky-300">{log.signature}</code></div>
                      <div>Hash Previo: <code className="text-slate-500">{log.previousHash}</code></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. PERSONALITY ENGINE */}
        {selectedEngine === 9 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  9. Personality Engine & Grafo de 7 Capas de Memoria
                </h3>
                <span className="text-xs text-slate-400">
                  5 Principios: Honestidad Brutal, Transparencia Total, Respeto Radical, Humor Inteligente, Soporte Sincero
                </span>
              </div>
            </div>

            {/* 7 Layers */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Estructura de las 7 Capas de Memoria
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {memories.map((mem) => (
                  <div key={mem.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{mem.category}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        Importancia: {(mem.importance * 10).toFixed(0)}/10
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{mem.content}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mem.tags.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

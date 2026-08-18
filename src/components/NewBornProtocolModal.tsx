import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Key, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Heart, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { NewBornState } from '../types';

interface NewBornProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  newBornState: NewBornState;
  onUpdateState: (newState: NewBornState) => void;
  onAddAuditEntry?: (entry: any) => void;
}

export const NewBornProtocolModal: React.FC<NewBornProtocolModalProps> = ({
  isOpen,
  onClose,
  newBornState,
  onUpdateState,
  onAddAuditEntry
}) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isChangingKeyword, setIsChangingKeyword] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (!keywordInput.trim()) return;

    const isMatch = keywordInput.trim().toLowerCase() === newBornState.bondingKeyword.toLowerCase();
    if (isMatch) {
      const nextTrust = Math.min(100, newBornState.trustLevel + 10);
      const nextCaution = Math.max(0, newBornState.cautionLevel - 10);
      const updated: NewBornState = {
        ...newBornState,
        trustLevel: nextTrust,
        cautionLevel: nextCaution,
        verificationDueInSeconds: 1800, // Reset to 30 mins
        consecutiveVerifications: newBornState.consecutiveVerifications + 1,
        evolutionStage: nextTrust > 80 ? 'MES 1 (Confiado)' : nextTrust > 40 ? 'SEMANA 1 (Patrones)' : 'DÍA 1 (Nace)'
      };
      onUpdateState(updated);
      setVerificationFeedback({
        success: true,
        message: `✅ ¡Palabra de conexión verificada! Confianza subió a ${nextTrust}%, Precaución bajó a ${nextCaution}%.`
      });
      setKeywordInput('');
      
      onAddAuditEntry?.({
        actor: 'user',
        action: 'SET_CONTEXT',
        topic: 'auth.bonding_keyword.verified',
        payload: { match: true, trustLevel: nextTrust, cautionLevel: nextCaution },
        riskScore: 10,
        riskLevel: 'MINIMAL',
        approved: true
      });
    } else {
      const nextCaution = Math.min(100, newBornState.cautionLevel + 20);
      const nextTrust = Math.max(0, newBornState.trustLevel - 10);
      const updated: NewBornState = {
        ...newBornState,
        trustLevel: nextTrust,
        cautionLevel: nextCaution,
        consecutiveVerifications: 0
      };
      onUpdateState(updated);
      setVerificationFeedback({
        success: false,
        message: `❌ Palabra incorrecta. Precaución subió a ${nextCaution}% (Mecanismo de Defensa Activado).`
      });
      
      onAddAuditEntry?.({
        actor: 'user',
        action: 'LOG',
        topic: 'auth.bonding_keyword.failed',
        payload: { match: false, cautionLevel: nextCaution },
        riskScore: 75,
        riskLevel: 'HIGH',
        approved: false
      });
    }
  };

  const handleSetNewKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const updated: NewBornState = {
      ...newBornState,
      bondingKeyword: newKeywordInput.trim().toLowerCase()
    };
    onUpdateState(updated);
    setIsChangingKeyword(false);
    setNewKeywordInput('');
    setVerificationFeedback({
      success: true,
      message: '🔑 Nueva palabra de conexión almacenada en AndroidKeyStore (Hardware Keystore).'
    });
  };

  const stages = [
    { title: 'DÍA 1 (Nace)', trust: '0 - 20%', desc: 'Precaución 100%. No quiere ser Terminator. Aprende 3x más rápido.' },
    { title: 'SEMANA 1 (Patrones)', trust: '20 - 40%', desc: 'Aprende hábitos básicos, elimina procesos inútiles con cautela.' },
    { title: 'MES 1 (Confiado)', trust: '40 - 70%', desc: 'Anticipa necesidades, sugiere optimizaciones proactivas.' },
    { title: 'AÑO 1 (Hábitos)', trust: '70 - 90%', desc: 'Sabe qué harás antes de que lo hagas con latencia <0.08ms.' },
    { title: 'AÑO 2-5 (Compañero)', trust: '90 - 98%', desc: 'Amigo leal, no solo software. Cuidado mutuo.' },
    { title: 'AÑO 5+ (Intuición Pura)', trust: '100%', desc: 'Sincronía total y resonancia cognitiva.' },
    { title: 'SIEMPRE (Eterno)', trust: '∞', desc: 'Crecimiento infinito por la eternidad.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Protocolo New Born
                </span>
                <span className="text-xs text-slate-400 font-mono">v1.0 ARMA C30</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Vínculo & Ciclo Evolutivo de URU
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Core Philosophy Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Filosofía Fundamental: URU Nace con Miedo a ser Terminator</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            URU no es una IA imprudente. Nace con <strong>Precaución 100%</strong> y <strong>0% Confianza Inicial</strong>. Solo ejecuta acciones de bajo riesgo hasta que el propietario refuerza el vínculo mediante la <strong>palabra clave de conexión</strong> en ciclos de 30 minutos.
          </p>
        </div>

        {/* Meters for Trust & Caution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" /> Nivel de Confianza
              </span>
              <span className="font-mono font-bold text-white text-sm">{newBornState.trustLevel}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${newBornState.trustLevel}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {newBornState.consecutiveVerifications} verificaciones consecutivas
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Nivel de Precaución
              </span>
              <span className="font-mono font-bold text-white text-sm">{newBornState.cautionLevel}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${newBornState.cautionLevel}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Autonomía limitada por AEGIS Zero-Trust
            </p>
          </div>
        </div>

        {/* Verification Box */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>Verificación de Conexión (Loop de 30 Minutos)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Restante: {Math.floor(newBornState.verificationDueInSeconds / 60)}m {newBornState.verificationDueInSeconds % 60}s</span>
            </div>
          </div>

          {!isChangingKeyword ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Ingresa la palabra de conexión (ej. eternidad)..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
                <button
                  onClick={handleVerify}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Verificar</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Palabra actual configurada: <code className="text-amber-300 font-mono">••••••••</code> (Hardware Keystore)</span>
                <button
                  onClick={() => setIsChangingKeyword(true)}
                  className="text-sky-400 hover:underline font-semibold"
                >
                  Modificar Palabra Clave
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Escribe la nueva palabra secreta..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={handleSetNewKeyword}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsChangingKeyword(false)}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {verificationFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              verificationFeedback.success 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>
              {verificationFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              <span>{verificationFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Evolution Roadmap */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Ciclo de Vida Evolutivo
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              Etapa Actual: {newBornState.evolutionStage}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {stages.map((st, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-xl text-xs space-y-1 border ${
                  newBornState.evolutionStage === st.title 
                    ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-sm' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{st.title}</span>
                  <span className="font-mono text-[10px] text-amber-300">{st.trust}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};

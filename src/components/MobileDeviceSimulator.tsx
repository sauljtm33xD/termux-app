import React, { useState, useRef, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Send, 
  Mic, 
  MicOff, 
  Flame, 
  Snowflake, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Sparkles, 
  Terminal, 
  Heart,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Message, AutonomousState, EmotionalState, UruTheme, NewBornState } from '../types';
import { UruOrb } from './UruOrb';
// import { motion, AnimatePresence } from 'motion'; // TODO: Enable animations when motion/react is properly configured

interface MobileDeviceSimulatorProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  theme: UruTheme;
  onChangeTheme: (theme: UruTheme) => void;
  newBornState: NewBornState;
  onOpenNewBornModal: () => void;
  eventsProcessed: number;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  messages,
  onSendMessage,
  isLoading,
  theme,
  onChangeTheme,
  newBornState,
  onOpenNewBornModal,
  eventsProcessed
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autonomousState, setAutonomousState] = useState<AutonomousState>('IDLE');
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('HAPPY');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Adjust state when loading
  useEffect(() => {
    if (isLoading) {
      setAutonomousState('PROCESSING');
    } else {
      setAutonomousState('IDLE');
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setAutonomousState('IDLE');
    } else {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsRecording(true);
          setAutonomousState('LISTENING');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsRecording(false);
          setAutonomousState('DECIDING');
        };

        recognition.onerror = () => {
          setIsRecording(false);
          setAutonomousState('ERROR');
          setTimeout(() => setAutonomousState('IDLE'), 1500);
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (autonomousState === 'LISTENING') {
            setAutonomousState('IDLE');
          }
        };

        recognition.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      }
    }
  };

  // Theme theme-specific wrapper styles
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'fuego':
        return 'border-orange-500/30 shadow-[0_0_50px_rgba(255,107,53,0.15)]';
      case 'azul_frio':
        return 'border-cyan-500/30 shadow-[0_0_50px_rgba(0,212,255,0.15)]';
      case 'azul_electrico':
        return 'border-blue-500/30 shadow-[0_0_50px_rgba(0,85,255,0.2)]';
    }
  };

  return (
    <div className="flex justify-center items-center py-4 w-full">
      {/* Realme 16 Pro+ Frame Container (412px x 916px ratio) */}
      <div 
        className={`w-full max-w-[412px] h-[916px] max-h-[90vh] bg-slate-950 rounded-[44px] border-4 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-500 ${getThemeWrapperClass()}`}
      >
        {/* Dynamic Notch / Camera Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 mr-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Android Native Status Bar */}
        <div className="pt-2 px-4 flex justify-between items-center text-[11px] font-mono text-slate-400 z-30 select-none">
          <div className="font-semibold text-slate-200">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span className="font-bold text-[10px]">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">100%</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* 50dp Top Header: URU Logo & Theme Selectors */}
        <div className="h-[50px] px-2 flex items-center justify-between border-b border-slate-800/80 mt-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white font-mono text-base flex items-center gap-1">
              🔥 <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">URU</span>
            </span>
            <button
              onClick={onOpenNewBornModal}
              className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1 hover:bg-amber-900 transition"
              title="Protocolo New Born"
            >
              <Heart className="w-2.5 h-2.5 text-rose-400" />
              <span>{newBornState.trustLevel}% Trust</span>
            </button>
          </div>

          {/* 3 Theme Selector Buttons */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 gap-1">
            <button
              onClick={() => onChangeTheme('fuego')}
              className={`p-1.5 rounded-lg transition-all ${
                theme === 'fuego' 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Fuego 🔥"
            >
              <Flame className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('azul_frio')}
              className={`p-1.5 rounded-lg transition-all ${
                theme === 'azul_frio' 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Azul Frío ❄️"
            >
              <Snowflake className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('azul_electrico')}
              className={`p-1.5 rounded-lg transition-all ${
                theme === 'azul_electrico' 
                  ? 'bg-gradient-to-r from-blue-700 to-sky-400 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Azul Eléctrico ⚡"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 40dp Metrics Bar */}
        <div className="h-[40px] px-3 bg-slate-900/40 rounded-xl border border-slate-800/60 my-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200">{autonomousState}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Ops:</span>
            <span className="text-amber-300 font-bold">128k/s</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            <span className="text-sky-300 font-bold">&lt;0.08ms</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AEGIS ON</span>
          </div>
        </div>

        {/* 180dp URU Orbe Showcase */}
        <div className="h-[180px] flex items-center justify-center relative py-2">
          <UruOrb
            theme={theme}
            state={autonomousState}
            emotion={emotionalState}
            size={135}
            onClick={() => {
              // Cycle state on click for test preview
              const states: AutonomousState[] = ['IDLE', 'PROCESSING', 'DECIDING', 'EXECUTING', 'LEARNING'];
              const nextIdx = (states.indexOf(autonomousState) + 1) % states.length;
              setAutonomousState(states[nextIdx]);
            }}
          />
        </div>

        {/* Scrollable Chat History Container */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scroll-smooth text-xs pr-1"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl ${
                    isUser
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-none shadow-md shadow-orange-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Assistant Header Badge */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Flame className="w-3 h-3" />
                        <span>URU Core v1.0</span>
                      </div>
                      {msg.latencyMs && (
                        <span className="text-sky-400">{msg.latencyMs}ms</span>
                      )}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Cryptographic SHA-256 Audit Signature Badge */}
                  {msg.auditSignature && (
                    <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center gap-1 text-[9px] font-mono text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">{msg.auditSignature.slice(0, 24)}...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-slate-900/70 border border-slate-800 rounded-2xl rounded-tl-none w-fit text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs font-mono">AEGIS Reasoner Evaluando Evento...</span>
            </div>
          )}
        </div>

        {/* 60dp Native Command Input Bar */}
        <form 
          onSubmit={handleSubmit}
          className="h-[60px] pt-2 px-1 flex items-center gap-2 border-t border-slate-800/80"
        >
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isRecording 
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Dictado por voz"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Comando para URU (ej. 'Analizar AEGIS')..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold hover:from-orange-400 hover:to-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Android Gesture Bar */}
        <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};

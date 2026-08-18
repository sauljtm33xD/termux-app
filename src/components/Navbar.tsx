import React from 'react';
import { 
  Cpu, 
  Layers, 
  Workflow, 
  BrainCircuit, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Download, 
  Upload,
  Activity,
  Zap,
  Flame,
  Snowflake,
  Smartphone,
  Terminal,
  Heart,
  Package,
  Settings
} from 'lucide-react';
import { CognitiveMode, TelemetryStats, UruTheme, NewBornState } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentMode: CognitiveMode;
  setMode: (mode: CognitiveMode) => void;
  stats: TelemetryStats;
  theme: UruTheme;
  setTheme: (theme: UruTheme) => void;
  newBornState: NewBornState;
  onOpenNewBornModal: () => void;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (enabled: boolean) => void;
  isListening: boolean;
  toggleListening: () => void;
  onOpenExportImport: () => void;
  onOpenSystemInstructions: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentMode,
  setMode,
  stats,
  theme,
  setTheme,
  newBornState,
  onOpenNewBornModal,
  isTtsEnabled,
  setIsTtsEnabled,
  isListening,
  toggleListening,
  onOpenExportImport,
  onOpenSystemInstructions,
}) => {
  const modes: { id: CognitiveMode; label: string; iconColor: string; description: string }[] = [
    { id: 'autonomous', label: 'Autonomous', iconColor: 'text-emerald-400', description: 'Self-directed reasoning & execution' },
    { id: 'architect', label: 'Architect', iconColor: 'text-sky-400', description: 'Clean Architecture & system design' },
    { id: 'coder', label: 'Coder', iconColor: 'text-indigo-400', description: 'Kotlin, Room & Jetpack Compose' },
    { id: 'researcher', label: 'Researcher', iconColor: 'text-purple-400', description: 'Algorithmic analysis & papers' },
    { id: 'security', label: 'Security', iconColor: 'text-rose-400', description: 'Concurrency & vulnerability audit' },
  ];

  const navTabs = [
    { id: 'chat', label: 'Cognitive Chat', icon: Cpu },
    { id: 'mobile', label: 'Realme 16 Pro+ Simulator', icon: Smartphone, badge: '412x916' },
    { id: 'core_engines', label: '9 Core Engines', icon: Terminal, badge: '11k Lines' },
    { id: 'autonomy', label: '10-Step Pipeline', icon: Workflow, badge: 'ReAct' },
    { id: 'architecture', label: 'Kotlin C30 Suite', icon: Layers, badge: '28 Files' },
    { id: 'audit', label: 'AEGIS Security', icon: ShieldCheck, badge: 'Zero-Trust' },
    { id: 'memory', label: '7-Layer Vault', icon: BrainCircuit, count: stats.activeMemoryNodes },
    { id: 'build_deploy', label: 'Build & Deploy APK', icon: Package, badge: 'Termux' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Telemetry & Global Metrics Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-orange-400 font-semibold tracking-wider uppercase text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span>🔥 URU Personal AI Middleware v1.0</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Throughput:</span>
            <span className="font-mono font-bold text-amber-400">128k ops/s (&lt;0.08ms)</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span>AEGIS:</span>
            <span className="font-mono text-emerald-400 font-bold">ARMED (5 Layers)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Protocol New Born Button */}
          <button
            onClick={onOpenNewBornModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition shadow-xs cursor-pointer"
            title="Ver Protocolo New Born"
          >
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>New Born: {newBornState.trustLevel}% Trust</span>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 gap-0.5">
            <button
              onClick={() => setTheme('fuego')}
              className={`px-1.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                theme === 'fuego' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Fuego 🔥"
            >
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="hidden sm:inline">Fuego</span>
            </button>
            <button
              onClick={() => setTheme('azul_frio')}
              className={`px-1.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                theme === 'azul_frio' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Azul Frío ❄️"
            >
              <Snowflake className="w-3 h-3 text-cyan-300" />
              <span className="hidden sm:inline">Azul Frío</span>
            </button>
            <button
              onClick={() => setTheme('azul_electrico')}
              className={`px-1.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                theme === 'azul_electrico' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Azul Eléctrico ⚡"
            >
              <Zap className="w-3 h-3 text-sky-300" />
              <span className="hidden sm:inline">Eléctrico</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Modo:</span>
            <select
              value={currentMode}
              onChange={(e) => setMode(e.target.value as CognitiveMode)}
              className="bg-transparent text-xs font-semibold text-orange-300 focus:outline-none cursor-pointer"
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Voice and Speech Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              title={isTtsEnabled ? 'Voz activada' : 'Voz desactivada'}
              className={`p-1 rounded transition-colors ${
                isTtsEnabled ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleListening}
              title={isListening ? 'Escuchando...' : 'Iniciar dictado'}
              className={`p-1 rounded transition-colors ${
                isListening ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={onOpenSystemInstructions}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 transition-colors font-medium cursor-pointer"
            title="System Instructions & Prompt Híbrido"
          >
            <Settings className="w-3 h-3 text-orange-400" />
            <span>Prompt / Settings</span>
          </button>

          <button
            onClick={onOpenExportImport}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>State</span>
          </button>
        </div>
      </div>

      {/* Main Header & Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* App Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 border border-orange-400/30">
              <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-orange-100 to-amber-400 bg-clip-text text-transparent">
                  URU AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/80">
                  Middleware
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-900/80 text-orange-300 font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Simulator Fast Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'mobile' ? 'chat' : 'mobile')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 hover:opacity-90 rounded-xl shadow-sm shadow-orange-500/20 transition-all font-mono cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{activeTab === 'mobile' ? 'Desktop View' : 'Realme 16 Pro+'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Sub-bar for Tabs on Medium/Small screens */}
        <div className="lg:hidden flex items-center space-x-1.5 py-2 overflow-x-auto border-t border-slate-800/80 no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`mob-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


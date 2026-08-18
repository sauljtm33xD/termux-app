import React from 'react';
import { 
  Zap, 
  Activity, 
  Clock, 
  BrainCircuit, 
  Layers, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { TelemetryStats, CognitiveMode } from '../types';

interface TelemetryBarProps {
  stats: TelemetryStats;
  currentMode: CognitiveMode;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ stats, currentMode }) => {
  const getModeColor = (mode: CognitiveMode) => {
    switch (mode) {
      case 'autonomous': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
      case 'architect': return 'text-sky-400 border-sky-500/30 bg-sky-950/40';
      case 'coder': return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40';
      case 'researcher': return 'text-purple-400 border-purple-500/30 bg-purple-950/40';
      case 'security': return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Active Mode Card */}
      <div className={`p-3 rounded-xl border flex flex-col justify-between ${getModeColor(currentMode)} backdrop-blur-sm transition-all`}>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Cognitive Mode</span>
          <BrainCircuit className="w-4 h-4 opacity-80" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-bold capitalize">{currentMode}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 font-mono">v4.2</span>
        </div>
      </div>

      {/* Neural Load Card */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-[10px]">Neural Load</span>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white font-mono">{stats.neuralLoad}%</span>
            <span className="text-[10px] text-emerald-400 font-medium">Optimal</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-sky-400 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${stats.neuralLoad}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total Tokens Card */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-[10px]">Total Tokens</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold text-amber-300 font-mono">
            {stats.totalTokens.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">In / Out</span>
        </div>
      </div>

      {/* Average Latency */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-[10px]">Avg Latency</span>
          <Clock className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold text-sky-300 font-mono">{stats.averageLatencyMs}ms</span>
          <span className="text-[10px] text-emerald-400">Fast</span>
        </div>
      </div>

      {/* Memory Nodes Active */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-[10px]">Memory Nodes</span>
          <Layers className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold text-purple-300 font-mono">{stats.activeMemoryNodes}</span>
          <span className="text-[10px] text-slate-400">Indexed</span>
        </div>
      </div>

      {/* Autonomous Steps Run */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-[10px]">Auto Steps Run</span>
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold text-teal-300 font-mono">{stats.autonomousStepsRun}</span>
          <span className="text-[10px] text-teal-400">Verified</span>
        </div>
      </div>
    </div>
  );
};

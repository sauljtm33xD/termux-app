/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Activity,
  AlertOctagon,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  FastForward,
  Filter,
  History,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import React from 'react';
import { EngineSuite } from '../engine/EngineSuite';
import { SCENARIO_PRESETS } from '../engine/presets';
import { EngineMetrics } from '../engine/types';

interface HeaderProps {
  suite: EngineSuite;
  metrics: EngineMetrics;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onRunScenario: () => void;
  isScenarioRunning: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  suite,
  metrics,
  activeTab,
  setActiveTab,
  selectedPresetId,
  onSelectPreset,
  onRunScenario,
  isScenarioRunning,
  onReset,
}) => {
  const isTimeTraveling = suite.isCurrentlyTimeTraveling();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Banner if Time Traveling */}
      {isTimeTraveling && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-1.5 flex items-center justify-between text-amber-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 animate-spin text-amber-400" />
            <span className="font-semibold tracking-wide">TIME TRAVEL ACTIVE:</span>
            <span>Inspecting historical snapshot. Engine state is currently frozen at selected frame.</span>
          </div>
          <button
            onClick={() => suite.resumeLive()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-0.5 rounded text-xs transition cursor-pointer"
          >
            Resume Live Engine
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Event & Context Engine
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                EventEngineImpl • ContextEngineImpl • RuleEngineImpl
              </p>
            </div>
          </div>

          {/* Quick Scenario Preset Loader */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium px-2">Scenario:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {SCENARIO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={onRunScenario}
              disabled={isScenarioRunning}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-md transition cursor-pointer ${
                isScenarioRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isScenarioRunning ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Dispatch Scenario
                </>
              )}
            </button>

            <button
              onClick={onReset}
              title="Reset Engine State"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">EVENTS DISPATCHED</span>
                <span className="text-indigo-400 font-bold text-sm">
                  {metrics.eventsPublished.toLocaleString()}
                </span>
              </div>
              <div className="hidden sm:block border-l border-slate-700/60 pl-3">
                <span className="text-slate-400 text-[10px] block">AVG LATENCY</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {metrics.avgDispatchLatencyMs.toFixed(1)} ms
                </span>
              </div>
              <div className="hidden sm:block border-l border-slate-700/60 pl-3">
                <span className="text-slate-400 text-[10px] block">PEAK OPS/S</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {metrics.peakThroughputPerSec.toLocaleString()}
                </span>
              </div>
              {metrics.eventsInDLQ > 0 && (
                <div className="border-l border-slate-700/60 pl-3">
                  <span className="text-rose-400 text-[10px] block font-semibold">DLQ ERRORS</span>
                  <span className="text-rose-400 font-bold text-sm animate-pulse">
                    {metrics.eventsInDLQ}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-1 pb-2">
          {[
            { id: 'events', label: 'Event Stream & Bus', icon: Activity, count: metrics.eventsPublished },
            { id: 'context', label: 'Hierarchical Context', icon: Layers, count: metrics.activeContextScopes },
            { id: 'rules', label: 'Reactive Rule Engine', icon: Cpu, count: suite.ruleEngine.getRules().length },
            { id: 'ai', label: 'AI Synthesis & Aggregator', icon: Sparkles },
            { id: 'timeline', label: 'Time Travel & History', icon: History, count: suite.getTimeTravelFrames().length },
            { id: 'tests', label: 'Local Tests & Benchmark', icon: CheckCircle2 },
            { id: 'sdk', label: 'TypeScript SDK Docs', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-indigo-700/90 text-indigo-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

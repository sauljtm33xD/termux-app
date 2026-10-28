/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Cpu,
  Layers,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';

interface AIContextStudioProps {
  suite: EngineSuite;
}

export const AIContextStudio: React.FC<AIContextStudioProps> = ({ suite }) => {
  // Event Synthesizer state
  const [synthDomain, setSynthDomain] = useState('Fintech & High Frequency');
  const [synthCount, setSynthCount] = useState(4);
  const [synthPrompt, setSynthPrompt] = useState(
    'Simulate a sudden crypto market flash volatility, margin call threshold breach, and automated collateral rebalance event sequence.'
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthLogs, setSynthLogs] = useState<string[]>([]);

  // Context Summarizer state
  const [summaryGoal, setSummaryGoal] = useState('Analyze system stability and risk exposure');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [contextSummary, setContextSummary] = useState<string | null>(null);

  // Agent Reasoner state
  const [agentGoal, setAgentGoal] = useState('Maintain zero downtime and autonomous anomaly mitigation');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [agentDecision, setAgentDecision] = useState<any | null>(null);

  const handleSynthesizeEvents = async () => {
    setIsSynthesizing(true);
    setSynthLogs(['Requesting Gemini 3.7 Flash to synthesize event stream...']);

    try {
      const res = await fetch('/api/engine/ai/synthesize-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: synthDomain,
          count: synthCount,
          prompt: synthPrompt,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setSynthLogs((prev) => [...prev, `Generated ${data.events.length} realistic events. Dispatching into EventEngine...`]);

        for (const evt of data.events) {
          await suite.eventEngine.publish(evt.topic, evt.payload, {
            source: evt.source || 'ai.synthesizer',
            priority: evt.priority || 'NORMAL',
            summary: evt.summary,
          });

          setSynthLogs((prev) => [
            ...prev,
            `Dispatched: [${evt.priority}] ${evt.topic} - ${evt.summary || ''}`,
          ]);

          // Small stagger for visual waterfall
          await new Promise((r) => setTimeout(r, 300));
        }

        setSynthLogs((prev) => [...prev, 'All AI-synthesized events dispatched successfully!']);
      } else {
        setSynthLogs((prev) => [...prev, `Error: ${data.error || 'Failed to synthesize events'}`]);
      }
    } catch (err: any) {
      setSynthLogs((prev) => [...prev, `Network error: ${err.message}`]);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSummarizeContext = async () => {
    setIsSummarizing(true);
    try {
      const snapshot = suite.contextEngine.getSnapshot();
      const res = await fetch('/api/engine/ai/summarize-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextSnapshot: snapshot,
          goal: summaryGoal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setContextSummary(data.summary);
      } else {
        setContextSummary(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setContextSummary(`Error: ${err.message}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAgentReason = async () => {
    setIsAgentThinking(true);
    try {
      const latestEvents = suite.eventEngine.getHistory(3);
      const snapshot = suite.contextEngine.getSnapshot();

      const res = await fetch('/api/engine/ai/agent-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: latestEvents[latestEvents.length - 1] || { topic: 'system.health.check', payload: {} },
          contextSnapshot: snapshot,
          systemGoal: agentGoal,
        }),
      });

      const data = await res.json();
      if (data.success && data.decision) {
        setAgentDecision(data.decision);

        // Execute proposed context mutations
        if (Array.isArray(data.decision.contextMutations)) {
          for (const mut of data.decision.contextMutations) {
            suite.contextEngine.set(mut.path, mut.value, 'global', 'agent.gemini');
          }
        }

        // Dispatch proposed events
        if (Array.isArray(data.decision.emittedEvents)) {
          for (const evt of data.decision.emittedEvents) {
            await suite.eventEngine.publish(evt.topic, evt.payload, {
              source: 'agent.gemini.autonomous',
              priority: evt.priority || 'HIGH',
            });
          }
        }

        suite.notifyChanges();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAgentThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Gemini Event Stream Synthesizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">
              AI Event Stream Synthesizer (Gemini 3.7 Flash)
            </h3>
            <p className="text-xs text-slate-400">
              Generate realistic domain event sequences with rich payloads and stream them into the engine
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Domain / Category</label>
            <select
              value={synthDomain}
              onChange={(e) => setSynthDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="Fintech & High Frequency">Fintech & High Frequency</option>
              <option value="Cybersecurity & Threat Detection">Cybersecurity & Threat Detection</option>
              <option value="Autonomous Robotics & Drones">Autonomous Robotics & Drones</option>
              <option value="Healthcare & Vitals Telemetry">Healthcare & Vitals Telemetry</option>
              <option value="Cloud Infrastructure Autoscaling">Cloud Infrastructure Autoscaling</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Event Batch Size</label>
            <select
              value={synthCount}
              onChange={(e) => setSynthCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value={2}>2 Events</option>
              <option value={4}>4 Events</option>
              <option value={6}>6 Events</option>
              <option value={8}>8 Events</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              onClick={handleSynthesizeEvents}
              disabled={isSynthesizing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSynthesizing ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate & Dispatch Stream</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Scenario Prompt / Behavioral Description
          </label>
          <textarea
            rows={2}
            value={synthPrompt}
            onChange={(e) => setSynthPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        {synthLogs.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 font-mono text-xs text-slate-300 max-h-40 overflow-y-auto">
            {synthLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-indigo-400">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Autonomous Agent Reasoner & Context Summarizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent Reasoner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-xs text-white">Autonomous Agent Cognitive Cycle</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Gemini acts as an autonomous agent: reads current context and events, then decides what actions to take
          </p>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Agent Primary Goal</label>
            <input
              type="text"
              value={agentGoal}
              onChange={(e) => setAgentGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <button
            onClick={handleAgentReason}
            disabled={isAgentThinking}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
          >
            {isAgentThinking ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Agent Reasoning...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Trigger Agent Reasoning Cycle</span>
              </>
            )}
          </button>

          {agentDecision && (
            <div className="bg-slate-950 border border-cyan-500/30 p-3 rounded-lg space-y-2 text-xs font-mono">
              <div className="text-cyan-300 font-semibold">Agent Reasoning:</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {agentDecision.reasoningThought}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Confidence: {Math.round(agentDecision.confidenceScore * 100)}%</span>
                <span className="text-emerald-400">
                  {agentDecision.emittedEvents?.length || 0} Actions Dispatched
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Context Distiller */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-xs text-white">Context State Distiller</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Summarizes and compresses deep hierarchical context for LLM prompt injection
          </p>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Summarization Focus</label>
            <input
              type="text"
              value={summaryGoal}
              onChange={(e) => setSummaryGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <button
            onClick={handleSummarizeContext}
            disabled={isSummarizing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            {isSummarizing ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Distilling Context...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Distill Context State</span>
              </>
            )}
          </button>

          {contextSummary && (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs font-mono text-emerald-300 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {contextSummary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

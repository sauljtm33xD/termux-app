/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Brain,
  Clock,
  Copy,
  Database,
  Edit3,
  GitCommit,
  Layers,
  Network,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';
import { ContextScope, MemorySlot } from '../engine/types';

interface ContextInspectorProps {
  suite: EngineSuite;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({ suite }) => {
  const [selectedScopeId, setSelectedScopeId] = useState<string>('global');
  const [activeSubTab, setActiveSubTab] = useState<'variables' | 'memory' | 'diffs' | 'ai_prompt'>('variables');
  const [newScopeName, setNewScopeName] = useState('');
  const [isCreatingScope, setIsCreatingScope] = useState(false);

  // Variable editor
  const [editPath, setEditPath] = useState('');
  const [editValueJson, setEditValueJson] = useState('""');
  const [editError, setEditError] = useState<string | null>(null);

  // Memory slot adder
  const [memKey, setMemKey] = useState('');
  const [memValue, setMemValue] = useState('');
  const [memImportance, setMemImportance] = useState(7);
  const [memTags, setMemTags] = useState('agent, cache');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const scopes = suite.contextEngine.getAllScopes();
  const currentScope = suite.contextEngine.getScope(selectedScopeId) || scopes[0];
  const memorySlots = suite.contextEngine.getMemorySlots(selectedScopeId, 1);
  const diffs = suite.contextEngine.getDiffHistory(40);
  const aiContext = suite.contextEngine.aggregateContextForAI(undefined, selectedScopeId);

  const handleCreateScope = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScopeName.trim()) return;
    const scope = suite.contextEngine.createScope(newScopeName.trim(), selectedScopeId);
    setSelectedScopeId(scope.id);
    setNewScopeName('');
    setIsCreatingScope(false);
    suite.notifyChanges();
  };

  const handleSetVariable = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    try {
      const parsed = JSON.parse(editValueJson);
      suite.contextEngine.set(editPath, parsed, selectedScopeId);
      setEditPath('');
      setEditValueJson('""');
      suite.notifyChanges();
    } catch (err: any) {
      setEditError(err.message || 'Invalid JSON value');
    }
  };

  const handleAddMemorySlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memKey.trim()) return;
    let parsedVal = memValue;
    try {
      parsedVal = JSON.parse(memValue);
    } catch {
      // keep as string
    }

    suite.contextEngine.setMemorySlot(memKey.trim(), parsedVal, {
      scopeId: selectedScopeId,
      importance: Number(memImportance),
      tags: memTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setMemKey('');
    setMemValue('');
    suite.notifyChanges();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getImportanceBadge = (importance: number) => {
    if (importance >= 8) return 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold';
    if (importance >= 5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Top Scopes Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 font-mono px-2 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>SCOPES:</span>
          </span>
          {scopes.map((s) => {
            const isSelected = s.id === selectedScopeId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScopeId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                }`}
              >
                <span>{s.name}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  (v{s.metadata.version})
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsCreatingScope(true)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scope</span>
          </button>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'variables', label: 'Variables' },
            { id: 'memory', label: `Working Memory (${memorySlots.length})` },
            { id: 'diffs', label: `Diffs (${diffs.length})` },
            { id: 'ai_prompt', label: 'AI Aggregator' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Creation Inline Form */}
      {isCreatingScope && (
        <form
          onSubmit={handleCreateScope}
          className="p-3 bg-slate-900/90 border border-indigo-500/40 rounded-xl flex items-center gap-3 animate-in fade-in"
        >
          <input
            type="text"
            placeholder="New Scope Name (e.g. Session Scope, Agent Task #12)"
            value={newScopeName}
            onChange={(e) => setNewScopeName(e.target.value)}
            autoFocus
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <span className="text-xs text-slate-400 font-mono">
            Parent: {currentScope.name}
          </span>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer"
          >
            Create Scope
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingScope(false)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* SUB-TAB 1: VARIABLES & MUTATIONS */}
      {activeSubTab === 'variables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* JSON Tree Viewer */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  {currentScope.name} State Tree
                </span>
                <span className="text-[11px] text-slate-400 font-mono ml-2">
                  [ID: {currentScope.id}]
                </span>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(currentScope.variables, null, 2), 'vars')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedKey === 'vars' ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="p-4">
              <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-[500px]">
                {JSON.stringify(currentScope.variables, null, 2)}
              </pre>
            </div>
          </div>

          {/* Direct State Mutator Panel */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mutate Context State</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Performs deep path setting with automatic change detection & diff logging
              </p>
            </div>

            <form onSubmit={handleSetVariable} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Path (Dot-Notation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. system.status or user.tier"
                  value={editPath}
                  onChange={(e) => setEditPath(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  JSON Value
                </label>
                <textarea
                  rows={4}
                  value={editValueJson}
                  onChange={(e) => setEditValueJson(e.target.value)}
                  placeholder='"ONLINE" or {"active": true}'
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {editError && (
                <div className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2 rounded border border-rose-900/40">
                  {editError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                Apply State Mutation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WORKING MEMORY SLOTS */}
      {activeSubTab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Memory Slots List */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-xs text-slate-200">
                  Active Memory Slots in Scope
                </h3>
                <p className="text-[11px] text-slate-400">
                  Prioritized memory slots with importance scores (1-10) and TTL policies
                </p>
              </div>
            </div>

            {memorySlots.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No memory slots stored in this scope yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {memorySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-indigo-300">
                          {slot.key}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getImportanceBadge(
                            slot.importance
                          )}`}
                        >
                          Rank {slot.importance}/10
                        </span>
                        {slot.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <pre className="text-xs font-mono text-cyan-300 bg-slate-900/90 p-2 rounded-lg overflow-x-auto max-h-28">
                        {typeof slot.value === 'object'
                          ? JSON.stringify(slot.value, null, 2)
                          : String(slot.value)}
                      </pre>
                    </div>

                    <button
                      onClick={() => {
                        suite.contextEngine.deleteMemorySlot(slot.key, selectedScopeId);
                        suite.notifyChanges();
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Memory Slot Form */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4 space-y-3">
            <h3 className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Store Working Memory</span>
            </h3>

            <form onSubmit={handleAddMemorySlot} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. user_intent or agent_strategy"
                  value={memKey}
                  onChange={(e) => setMemKey(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Importance (1 to 10)</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={memImportance}
                  onChange={(e) => setMemImportance(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 (Low)</span>
                  <span className="text-indigo-400 font-bold">{memImportance}</span>
                  <span>10 (Critical Directive)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="agent, cache, directive"
                  value={memTags}
                  onChange={(e) => setMemTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Value (String or JSON)</label>
                <textarea
                  rows={3}
                  value={memValue}
                  onChange={(e) => setMemValue(e.target.value)}
                  placeholder='{"target": "99.9% uptime"}'
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                Store Memory Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DIFF HISTORY */}
      {activeSubTab === 'diffs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-xs text-slate-200">
                Context Mutation Diff History
              </h3>
              <p className="text-[11px] text-slate-400">
                Audit trail of state transitions with old vs new value comparisons
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
            {diffs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No mutation diffs recorded yet.</p>
              </div>
            ) : (
              diffs
                .slice()
                .reverse()
                .map((diff, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                        {diff.operation}
                      </span>
                      <span className="text-slate-300 font-semibold">{diff.path}</span>
                      <span className="text-slate-500 text-[10px]">
                        [{diff.scopeId}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-right shrink-0">
                      <span className="text-slate-400 text-[11px]">
                        {JSON.stringify(diff.newValue)?.substring(0, 30)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(diff.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AI CONTEXT AGGREGATOR */}
      {activeSubTab === 'ai_prompt' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="font-semibold text-xs text-slate-200">
                  AI Context Aggregator & Token Budget Preview
                </h3>
                <p className="text-[11px] text-slate-400">
                  Structured prompt block automatically compiled by ContextEngineImpl for LLM agent reasoning
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                ~{aiContext.estimatedTokens} Tokens
              </span>
              <button
                onClick={() => handleCopy(aiContext.systemPromptAddition, 'ai_prompt')}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'ai_prompt' ? 'Copied!' : 'Copy Prompt Block'}</span>
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {aiContext.systemPromptAddition}
          </pre>
        </div>
      )}
    </div>
  );
};

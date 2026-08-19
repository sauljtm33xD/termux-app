/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Edit2,
  Flame,
  Layers,
  Play,
  Plus,
  Power,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';
import { Rule } from '../engine/types';
import { RuleModal } from './RuleModal';

interface RulePipelineStudioProps {
  suite: EngineSuite;
}

export const RulePipelineStudio: React.FC<RulePipelineStudioProps> = ({ suite }) => {
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const rules = suite.ruleEngine.getRules();

  const handleToggleRule = (ruleId: string, currentEnabled: boolean) => {
    suite.ruleEngine.updateRule(ruleId, { enabled: !currentEnabled });
    suite.notifyChanges();
  };

  const handleDeleteRule = (ruleId: string) => {
    suite.ruleEngine.deleteRule(ruleId);
    suite.notifyChanges();
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Reactive Event-Trigger-Action Pipeline (RuleEngineImpl)</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Automates state mutations, cascading dispatches, and LLM agent activations based on event predicates
          </p>
        </div>

        <button
          onClick={() => setIsRuleModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rule (or AI Synthesize)</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No reactive rules registered.</p>
            <p className="mt-1 text-slate-600">Click "New Rule" or select a preset scenario from the top bar.</p>
          </div>
        ) : (
          rules.map((rule) => {
            return (
              <div
                key={rule.id}
                className={`bg-slate-900/90 border rounded-xl p-4 space-y-3 transition shadow-lg ${
                  rule.enabled
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/40 opacity-60'
                }`}
              >
                {/* Rule Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rule.name}</span>
                      <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/30">
                        Priority {rule.priority}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                      className={`p-1 rounded cursor-pointer transition ${
                        rule.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      title="Delete Rule"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Trigger Topic Pattern */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-2 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">TRIGGER TOPIC:</span>
                  <span className="text-cyan-300 font-semibold">{rule.triggerTopicPattern}</span>
                </div>

                {/* Condition Clauses */}
                {rule.conditions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 font-semibold flex items-center justify-between">
                      <span>CONDITIONS ({rule.conditionLogic})</span>
                    </div>
                    <div className="space-y-1">
                      {rule.conditions.map((c, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5 rounded text-xs font-mono text-slate-300 flex items-center gap-2"
                        >
                          <span className="text-indigo-400">{c.field}</span>
                          <span className="text-amber-400 font-bold">{c.operator}</span>
                          <span className="text-cyan-300">{JSON.stringify(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Executed */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">
                    ACTIONS ({rule.actions.length})
                  </div>
                  <div className="space-y-1.5">
                    {rule.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-indigo-900/30 px-3 py-2 rounded-lg text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {act.type}
                          </span>
                          {act.targetTopic && (
                            <span className="text-cyan-300 font-semibold">
                              &rarr; {act.targetTopic}
                            </span>
                          )}
                          {act.contextPath && (
                            <span className="text-emerald-300 font-semibold">
                              ctx: {act.contextPath}
                            </span>
                          )}
                        </div>

                        {act.payloadTemplate && (
                          <div className="text-[11px] text-slate-400 truncate">
                            Payload: {JSON.stringify(act.payloadTemplate)}
                          </div>
                        )}
                        {act.valueTemplate !== undefined && (
                          <div className="text-[11px] text-slate-400 truncate">
                            Value: {JSON.stringify(act.valueTemplate)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Evaluations: {rule.stats.evaluations}</span>
                  <span className="text-emerald-400 font-semibold">
                    Executions: {rule.stats.executions}
                  </span>
                  {rule.stats.failures > 0 && (
                    <span className="text-rose-400">Failures: {rule.stats.failures}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <RuleModal
        suite={suite}
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
      />
    </div>
  );
};

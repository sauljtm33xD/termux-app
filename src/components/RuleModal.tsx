/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCircle, Plus, Sparkles, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';
import { ConditionOperator, RuleAction, RuleCondition } from '../engine/types';

interface RuleModalProps {
  suite: EngineSuite;
  isOpen: boolean;
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ suite, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerTopicPattern, setTriggerTopicPattern] = useState('order.*');
  const [priority, setPriority] = useState(5);
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: 'payload.amount', operator: 'gt', value: 1000 },
  ]);
  const [actions, setActions] = useState<RuleAction[]>([
    {
      type: 'EMIT_EVENT',
      targetTopic: 'alert.high_value',
      payloadTemplate: { alert: 'High value transaction detected' },
    },
  ]);

  // AI Rule generation prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'payload.status', operator: 'eq', value: 'FAILED' }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    setActions([
      ...actions,
      { type: 'SET_CONTEXT', contextPath: 'system.flagged', valueTemplate: true },
    ]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !triggerTopicPattern.trim()) return;

    suite.ruleEngine.registerRule({
      id: `rule_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      enabled: true,
      priority: Number(priority),
      triggerTopicPattern: triggerTopicPattern.trim(),
      conditionLogic,
      conditions,
      actions,
    });

    suite.notifyChanges();
    onClose();
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/engine/ai/generate-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naturalLanguagePrompt: aiPrompt }),
      });

      const data = await res.json();
      if (data.success && data.rule) {
        setName(data.rule.name || 'AI Generated Rule');
        setDescription(data.rule.description || '');
        setTriggerTopicPattern(data.rule.triggerTopicPattern || '*');
        setPriority(data.rule.priority || 5);
        setConditionLogic(data.rule.conditionLogic || 'AND');
        setConditions(data.rule.conditions || []);
        setActions(data.rule.actions || []);
      } else {
        setAiError(data.error || 'Failed to generate rule from prompt');
      }
    } catch (err: any) {
      setAiError(err.message || 'API call failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div>
            <h2 className="font-semibold text-sm text-white">Create Reactive Rule</h2>
            <p className="text-xs text-slate-400">
              Define trigger patterns, conditions, and autonomous side-effects
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Rule Generator Banner */}
        <div className="px-6 py-3.5 bg-indigo-950/40 border-b border-indigo-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-indigo-300">
              AI Rule Synthesizer (Gemini 3.7 Flash)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. When a sensor temperature exceeds 85C, set gridStatus to OVERLOAD and emit emergency cooldown event"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer shrink-0"
            >
              {isAiGenerating ? 'Generating...' : 'Auto-Generate'}
            </button>
          </div>
          {aiError && (
            <div className="mt-2 text-xs text-rose-400 font-mono">{aiError}</div>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Rule Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High Value Fraud Gate"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Trigger Topic Pattern (*, **, #)
              </label>
              <input
                type="text"
                value={triggerTopicPattern}
                onChange={(e) => setTriggerTopicPattern(e.target.value)}
                placeholder="e.g. order.* or telemetry.**"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this reactive rule enforces"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Conditions Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">Conditions (Filter)</span>
                <select
                  value={conditionLogic}
                  onChange={(e) => setConditionLogic(e.target.value as 'AND' | 'OR')}
                  className="bg-slate-800 border border-slate-700 text-xs text-indigo-400 font-bold px-2 py-0.5 rounded"
                >
                  <option value="AND">MATCH ALL (AND)</option>
                  <option value="OR">MATCH ANY (OR)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
            </div>

            {conditions.map((cond, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <input
                  type="text"
                  placeholder="Field (e.g. payload.amount)"
                  value={cond.field}
                  onChange={(e) => {
                    const newConds = [...conditions];
                    newConds[idx].field = e.target.value;
                    setConditions(newConds);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                />

                <select
                  value={cond.operator}
                  onChange={(e) => {
                    const newConds = [...conditions];
                    newConds[idx].operator = e.target.value as ConditionOperator;
                    setConditions(newConds);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-indigo-300"
                >
                  <option value="eq">== (eq)</option>
                  <option value="neq">!= (neq)</option>
                  <option value="gt">&gt; (gt)</option>
                  <option value="gte">&gt;= (gte)</option>
                  <option value="lt">&lt; (lt)</option>
                  <option value="lte">&lt;= (lte)</option>
                  <option value="contains">contains</option>
                  <option value="in">in array</option>
                  <option value="regex">regex</option>
                  <option value="exists">exists</option>
                </select>

                <input
                  type="text"
                  placeholder="Value"
                  value={String(cond.value ?? '')}
                  onChange={(e) => {
                    const newConds = [...conditions];
                    newConds[idx].value = e.target.value;
                    setConditions(newConds);
                  }}
                  className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-300"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveCondition(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Actions Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Actions (Side-Effects)</span>
              <button
                type="button"
                onClick={handleAddAction}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Action</span>
              </button>
            </div>

            {actions.map((act, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <select
                    value={act.type}
                    onChange={(e) => {
                      const newActs = [...actions];
                      newActs[idx].type = e.target.value as any;
                      setActions(newActs);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-300 font-bold"
                  >
                    <option value="EMIT_EVENT">EMIT_EVENT (Publish)</option>
                    <option value="SET_CONTEXT">SET_CONTEXT (Mutate State)</option>
                    <option value="PATCH_CONTEXT">PATCH_CONTEXT (Merge)</option>
                    <option value="TRIGGER_AI">TRIGGER_AI (Agent)</option>
                    <option value="LOG">LOG (Console)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveAction(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {act.type === 'EMIT_EVENT' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Target Topic (e.g. alerts.fired)"
                      value={act.targetTopic || ''}
                      onChange={(e) => {
                        const newActs = [...actions];
                        newActs[idx].targetTopic = e.target.value;
                        setActions(newActs);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                    />
                    <input
                      type="text"
                      placeholder='Payload JSON e.g. {"alert": "true"}'
                      value={JSON.stringify(act.payloadTemplate || {})}
                      onChange={(e) => {
                        const newActs = [...actions];
                        try {
                          newActs[idx].payloadTemplate = JSON.parse(e.target.value);
                        } catch {
                          // wait for valid
                        }
                        setActions(newActs);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-300"
                    />
                  </div>
                )}

                {act.type === 'SET_CONTEXT' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Context Path (e.g. system.status)"
                      value={act.contextPath || ''}
                      onChange={(e) => {
                        const newActs = [...actions];
                        newActs[idx].contextPath = e.target.value;
                        setActions(newActs);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={String(act.valueTemplate || '')}
                      onChange={(e) => {
                        const newActs = [...actions];
                        newActs[idx].valueTemplate = e.target.value;
                        setActions(newActs);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              Save Reactive Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

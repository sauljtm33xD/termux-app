/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCircle, Check, Send, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';
import { EventPriority } from '../engine/types';

interface EventPublishModalProps {
  suite: EngineSuite;
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    name: 'Order Created (E-commerce)',
    topic: 'order.created',
    priority: 'NORMAL' as EventPriority,
    source: 'storefront.checkout',
    payload: {
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Elena Rostova',
      amount: 499.5,
      item: 'SKU-SMARTWATCH-ULTRA',
      tier: 'VIP_GOLD',
    },
  },
  {
    name: 'High-Value Fraud Alert (> $2,000)',
    topic: 'order.created',
    priority: 'HIGH' as EventPriority,
    source: 'storefront.mobile',
    payload: {
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Anonymous Wallet',
      amount: 4500.0,
      item: 'SKU-GPU-H100-MINER',
      tier: 'NEW_UNVERIFIED',
    },
  },
  {
    name: 'IoT Substation Thermal Spike',
    topic: 'sensor.telemetry.substation',
    priority: 'CRITICAL' as EventPriority,
    source: 'scada.telemetry.sensor_09',
    payload: {
      substationId: 'SUB-ALPHA-09',
      tempC: 88.4,
      currentLoadKw: 14850,
      status: 'THERMAL_OVERHEAT_WARNING',
    },
  },
  {
    name: 'User Security Auth Failure',
    topic: 'system.auth.login.failed',
    priority: 'HIGH' as EventPriority,
    source: 'auth.gateway',
    payload: {
      userId: 'usr_saul_admin',
      ip: '192.168.1.104',
      attempt: 3,
      reason: 'INVALID_MFA_TOKEN',
    },
  },
];

export const EventPublishModal: React.FC<EventPublishModalProps> = ({ suite, isOpen, onClose }) => {
  const [topic, setTopic] = useState('order.created');
  const [priority, setPriority] = useState<EventPriority>('NORMAL');
  const [source, setSource] = useState('developer.console');
  const [payloadString, setPayloadString] = useState(
    JSON.stringify(TEMPLATES[0].payload, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setTopic(template.topic);
    setPriority(template.priority);
    setSource(template.source);
    setPayloadString(JSON.stringify(template.payload, null, 2));
    setJsonError(null);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(payloadString);
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err.message}`);
      return;
    }

    setIsPublishing(true);
    try {
      await suite.eventEngine.publish(topic, parsedPayload, {
        source,
        priority,
      });
      onClose();
    } catch (err: any) {
      setJsonError(`Publish failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white">Publish Event to Bus</h2>
              <p className="text-xs text-slate-400">
                Trigger subscriptions, reactive rules, and context changes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Preset Templates */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Preset Payload:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className="text-[11px] font-mono bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md transition cursor-pointer"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePublish} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Event Topic (Dot-Notation)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. order.created"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="NORMAL">NORMAL</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Source Service</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. storefront.checkout"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">JSON Payload</label>
              <span className="text-[11px] text-slate-500 font-mono">Valid JSON object</span>
            </div>
            <textarea
              rows={7}
              value={payloadString}
              onChange={(e) => setPayloadString(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {jsonError && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing...' : 'Dispatch Event Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

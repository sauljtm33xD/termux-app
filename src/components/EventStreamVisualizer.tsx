/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';
import { DeadLetterEntry, EngineEvent, Subscription } from '../engine/types';
import { EventPublishModal } from './EventPublishModal';

interface EventStreamVisualizerProps {
  suite: EngineSuite;
}

export const EventStreamVisualizer: React.FC<EventStreamVisualizerProps> = ({ suite }) => {
  const [selectedEvent, setSelectedEvent] = useState<EngineEvent | null>(null);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'stream' | 'subscriptions' | 'dlq'>('stream');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const history = suite.eventEngine.getHistory(100);
  const subscriptions = suite.eventEngine.getSubscriptions();
  const dlq = suite.eventEngine.getDeadLetterQueue();

  const filteredHistory = history
    .filter((e) => {
      if (filterTopic && !e.topic.toLowerCase().includes(filterTopic.toLowerCase()) && !e.id.includes(filterTopic)) {
        return false;
      }
      if (filterPriority !== 'ALL' && e.metadata.priority !== filterPriority) {
        return false;
      }
      return true;
    })
    .reverse();

  const handleCopyJson = (obj: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PROCESSED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>SKIPPED</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('stream')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'stream'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Live Event Stream ({history.length})
          </button>
          <button
            onClick={() => setActiveSubTab('subscriptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('dlq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'dlq'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            } ${dlq.length > 0 ? 'animate-pulse' : ''}`}
          >
            Dead Letter Queue ({dlq.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeSubTab === 'stream' && (
            <>
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter topic..."
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Priority</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>

              <button
                onClick={() => suite.eventEngine.clearHistory()}
                title="Clear Event Log"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Event</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Event Stream */}
      {activeSubTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Events List */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 font-mono">
                EVENT STREAM LOG ({filteredHistory.length} events)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Real-time Reactive Bus</span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-[580px] overflow-y-auto">
              {filteredHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
                  <p>No events recorded in buffer yet.</p>
                  <p className="mt-1 text-slate-600">
                    Publish an event or run a preset scenario above.
                  </p>
                </div>
              ) : (
                filteredHistory.map((evt) => {
                  const isSelected = selectedEvent?.id === evt.id;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 transition cursor-pointer hover:bg-slate-800/40 flex items-center justify-between gap-3 ${
                        isSelected ? 'bg-indigo-950/40 border-l-4 border-indigo-500 pl-2' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getPriorityColor(
                            evt.metadata.priority
                          )}`}
                        >
                          {evt.metadata.priority || 'NORMAL'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-indigo-300 truncate">
                              {evt.topic}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                              {evt.id.substring(0, 14)}...
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-sm">
                            {JSON.stringify(evt.payload)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        {evt.executionTimeMs !== undefined && (
                          <span className="text-[10px] font-mono text-cyan-400 hidden sm:block">
                            {evt.executionTimeMs.toFixed(1)}ms
                          </span>
                        )}
                        {getStatusBadge(evt.status)}
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(evt.metadata.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Event Inspector Panel */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg sticky top-24">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Event Inspector</span>
              </div>
              {selectedEvent && (
                <button
                  onClick={() => handleCopyJson(selectedEvent, 'selected_evt')}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedId === 'selected_evt' ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {selectedEvent ? (
              <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto">
                {/* Topic Header */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-mono">TOPIC</div>
                  <div className="text-sm font-bold text-indigo-300 font-mono">{selectedEvent.topic}</div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                    <span>Source: {selectedEvent.metadata.source || 'core'}</span>
                    <span>•</span>
                    <span>Trace: {selectedEvent.metadata.traceId || 'N/A'}</span>
                  </div>
                </div>

                {/* Payload Section */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Payload Data</span>
                    <span className="text-[10px] font-mono text-slate-500">JSON Object</span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>

                {/* Metadata Section */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5">Event Metadata & Tracing</div>
                  <pre className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>

                {/* Error Banner if Failed */}
                {selectedEvent.error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-400 font-mono">
                    <span className="font-bold block">Execution Error:</span>
                    <span>{selectedEvent.error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                <p>Click on any event from the stream to inspect its payload, trace hierarchy, and metadata.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Active Subscriptions */}
      {activeSubTab === 'subscriptions' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-white">Registered Event Listeners & Handlers</h3>
              <p className="text-xs text-slate-400">
                Managed by EventEngineImpl with pattern matching (*, **, #) and priority ordering
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300">{sub.name}</span>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                    P: {sub.priority}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  Topic: {sub.topicPattern}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Invocations: {sub.invocationCount}</span>
                  {sub.errorCount > 0 && <span className="text-rose-400">Errors: {sub.errorCount}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dead Letter Queue */}
      {activeSubTab === 'dlq' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-rose-400 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                <span>Dead Letter Queue (DLQ)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Failed events isolated for retry policy inspection and re-dispatch
              </p>
            </div>

            {dlq.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await suite.eventEngine.retryAllDeadLetters();
                  }}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry All ({dlq.length})</span>
                </button>
                <button
                  onClick={() => suite.eventEngine.clearDeadLetterQueue()}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {dlq.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              <p>Dead Letter Queue is empty. No failed events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dlq.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-rose-400">{entry.event.topic}</span>
                      <span className="text-[11px] text-slate-400 ml-2 font-mono">
                        ID: {entry.event.id}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await suite.eventEngine.retryDeadLetter(entry.id);
                      }}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry Event</span>
                    </button>
                  </div>

                  <div className="text-xs text-rose-300 font-mono bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50">
                    Reason: {entry.reason}
                  </div>

                  <pre className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(entry.event.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Publish Modal */}
      <EventPublishModal
        suite={suite}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
};

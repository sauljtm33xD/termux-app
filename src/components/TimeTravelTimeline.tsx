/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Clock,
  FastForward,
  History,
  Layers,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { EngineSuite } from '../engine/EngineSuite';

interface TimeTravelTimelineProps {
  suite: EngineSuite;
}

export const TimeTravelTimeline: React.FC<TimeTravelTimelineProps> = ({ suite }) => {
  const frames = suite.getTimeTravelFrames();
  const activeFrameIndex = suite.getActiveFrameIndex();
  const isTimeTraveling = suite.isCurrentlyTimeTraveling();

  const selectedFrame = frames[activeFrameIndex] || frames[frames.length - 1];

  const handleJump = (index: number) => {
    suite.jumpToTimeTravelFrame(index);
  };

  const handleStepBack = () => {
    if (activeFrameIndex > 0) {
      suite.jumpToTimeTravelFrame(activeFrameIndex - 1);
    }
  };

  const handleStepForward = () => {
    if (activeFrameIndex < frames.length - 1) {
      suite.jumpToTimeTravelFrame(activeFrameIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Time-Travel Debugger & State Scrubber
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Step backwards and forwards through historical event dispatches and inspect exact snapshot states
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleJump(0)}
            disabled={frames.length === 0 || activeFrameIndex === 0}
            title="First Frame"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded transition cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepBack}
            disabled={frames.length === 0 || activeFrameIndex <= 0}
            title="Step Back 1 Event"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Step Back</span>
          </button>

          <span className="text-xs font-mono font-bold text-amber-400 px-3">
            {frames.length > 0 ? `${activeFrameIndex + 1} / ${frames.length}` : '0 / 0'}
          </span>

          <button
            onClick={handleStepForward}
            disabled={frames.length === 0 || activeFrameIndex >= frames.length - 1}
            title="Step Forward 1 Event"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <span>Step Forward</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleJump(frames.length - 1)}
            disabled={frames.length === 0 || activeFrameIndex === frames.length - 1}
            title="Latest Frame"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded transition cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {isTimeTraveling && (
            <button
              onClick={() => suite.resumeLive()}
              className="ml-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
            >
              Resume Live
            </button>
          )}
        </div>
      </div>

      {frames.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
          <History className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
          <p>Timeline buffer is empty.</p>
          <p className="mt-1 text-slate-600">Dispatch events or scenarios to record time-travel steps.</p>
        </div>
      ) : (
        <>
          {/* Visual Scrubber Timeline Track */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>TIMELINE SCRUBBER</span>
              <span>{new Date(selectedFrame.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
              {frames.map((frame, idx) => {
                const isActive = idx === activeFrameIndex;
                return (
                  <button
                    key={frame.id}
                    onClick={() => handleJump(idx)}
                    className={`h-12 min-w-16 px-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between shrink-0 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block truncate">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono truncate text-indigo-300">
                      {frame.triggerEvent.topic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Frame Details */}
          {selectedFrame && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Event That Triggered Frame */}
              <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white">Event at Snapshot #{activeFrameIndex + 1}</div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(selectedFrame.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1 font-mono text-xs">
                  <div className="text-slate-500 text-[10px]">TOPIC</div>
                  <div className="text-indigo-300 font-bold text-sm">
                    {selectedFrame.triggerEvent.topic}
                  </div>
                  <div className="text-slate-400 text-[11px] pt-1">
                    Source: {selectedFrame.triggerEvent.metadata?.source || 'core'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1">Payload</div>
                  <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(selectedFrame.triggerEvent.payload, null, 2)}
                  </pre>
                </div>

                {selectedFrame.diffsGenerated.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-1">Diffs Caused by Event</div>
                    <div className="space-y-1">
                      {selectedFrame.diffsGenerated.map((d, i) => (
                        <div
                          key={i}
                          className="bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono text-emerald-300"
                        >
                          {d.path} &rarr; {JSON.stringify(d.newValue)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Restored Context Snapshot */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white">
                    Restored Context Engine Snapshot
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    STATE RECONSTRUCTED
                  </span>
                </div>

                <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-[500px] leading-relaxed">
                  {JSON.stringify(selectedFrame.contextSnapshot, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

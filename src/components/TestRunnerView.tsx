/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import confetti from 'canvas-confetti';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { EngineTestRunner, TestCaseResult } from '../engine/tests/engineTests';

export const TestRunnerView: React.FC = () => {
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    totalEvents: number;
    durationMs: number;
    opsPerSec: number;
  } | null>(null);

  const runner = new EngineTestRunner();

  const handleRunAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    try {
      const testResults = await runner.runAllTests();
      setResults(testResults);

      const allPassed = testResults.every((r) => r.passed);
      if (allPassed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunExtremeBenchmark = async (batchCount: number) => {
    setIsRunning(true);
    try {
      const { EventEngineImpl } = await import('../engine/EventEngineImpl');
      const engine = new EventEngineImpl({ maxHistorySize: batchCount });
      let counter = 0;

      engine.subscribe('benchmark.load', () => {
        counter++;
      });

      const batch = [];
      for (let i = 0; i < batchCount; i++) {
        batch.push({
          topic: 'benchmark.load',
          payload: { seq: i, timestamp: Date.now(), rand: Math.random() },
        });
      }

      const start = performance.now();
      await engine.publishBatch(batch);
      const duration = performance.now() - start;
      const ops = Math.round((batchCount / (duration / 1000)));

      setBenchmarkResult({
        totalEvents: batchCount,
        durationMs: Math.round(duration * 100) / 100,
        opsPerSec: ops,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    handleRunAllTests();
  }, []);

  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  return (
    <div className="space-y-6">
      {/* Top Test Suite Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Engine Verification & Automated Test Runner
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validates EventEngineImpl, ContextEngineImpl, and RuleEngineImpl contract implementations, memory bounds, and transactional safety
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            {isRunning ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Running Test Suites...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute All Tests ({results.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">TOTAL TESTS</span>
          <span className="text-xl font-bold font-mono text-white">{results.length}</span>
        </div>
        <div className="bg-slate-900/80 border border-emerald-500/20 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-emerald-400 uppercase block">PASSED</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{totalPassed}</span>
        </div>
        <div className="bg-slate-900/80 border border-rose-500/20 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-rose-400 uppercase block">FAILED</span>
          <span className="text-xl font-bold font-mono text-rose-400">{totalFailed}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">TOTAL LATENCY</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{totalDuration.toFixed(1)} ms</span>
        </div>
      </div>

      {/* High-Throughput Load Benchmark Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Stress & Throughput Dispatch Benchmark
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Dispatch massive synchronous/asynchronous batch arrays to measure peak events/second
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunExtremeBenchmark(1000)}
            disabled={isRunning}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer"
          >
            1k Batch
          </button>
          <button
            onClick={() => handleRunExtremeBenchmark(5000)}
            disabled={isRunning}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer"
          >
            5k Batch
          </button>
          <button
            onClick={() => handleRunExtremeBenchmark(10000)}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            10k Stress Test
          </button>
        </div>
      </div>

      {benchmarkResult && (
        <div className="bg-slate-950 border border-indigo-500/40 p-4 rounded-xl flex items-center justify-between font-mono text-xs animate-in fade-in">
          <div>
            <span className="text-slate-400 block text-[10px]">BENCHMARK RESULT</span>
            <span className="text-indigo-300 font-bold text-sm">
              Dispatched {benchmarkResult.totalEvents.toLocaleString()} Events in {benchmarkResult.durationMs}ms
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">THROUGHPUT</span>
            <span className="text-emerald-400 font-bold text-base">
              ~{benchmarkResult.opsPerSec.toLocaleString()} ops/sec
            </span>
          </div>
        </div>
      )}

      {/* Test Cases List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg divide-y divide-slate-800/60">
        <div className="px-4 py-3 bg-slate-800/50 flex items-center justify-between text-xs font-mono text-slate-400 font-semibold">
          <span>TEST SUITE</span>
          <span>DURATION & STATUS</span>
        </div>

        {results.map((r) => (
          <div
            key={r.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/50 transition"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 shrink-0">
                {r.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{r.name}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                    {r.category}
                  </span>
                </div>
                {r.message && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{r.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
              <span className="text-slate-400">{r.durationMs}ms</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  r.passed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {r.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

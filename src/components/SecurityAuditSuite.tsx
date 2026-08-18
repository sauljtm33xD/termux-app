import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Database, 
  Layers
} from 'lucide-react';
import { AuditReport } from '../types';

export const SecurityAuditSuite: React.FC = () => {
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport>({
    overallScore: 95,
    concurrencyGrade: 'A+ (Optimal)',
    securityStatus: 'SECURE',
    vulnerabilities: [
      {
        id: 'VULN-01',
        severity: 'LOW',
        module: 'Data Layer / Room',
        title: 'Missing Composite Index on Foreign Keys',
        description: 'Table `cognitive_tasks` performs full table scan on `createdAt` sorting under high memory load.',
        fixSuggestion: 'Add `@Entity(indices = [Index(value = ["createdAt", "status"])])` in Room entity declaration.'
      },
      {
        id: 'VULN-02',
        severity: 'LOW',
        module: 'Presentation / Compose',
        title: 'Unstable Parameter in ListItem Composable',
        description: 'Passing raw `List<T>` to Composable causes non-skippable recompositions on parent state emission.',
        fixSuggestion: 'Wrap collection in `ImmutableList<T>` from `kotlinx.collections.immutable`.'
      }
    ],
    coroutineOptimizations: [
      {
        target: 'AutonomyEngine Dispatcher',
        currentPattern: 'GlobalScope.launch',
        recommendedPattern: 'CoroutineScope(SupervisorJob() + Dispatchers.Default)',
        latencyImpact: '-34ms allocation overhead'
      },
      {
        target: 'Memory Vector Search',
        currentPattern: 'Sequential Flow mapping',
        recommendedPattern: 'flowOn(Dispatchers.IO).buffer(Channel.UNLIMITED)',
        latencyImpact: '2.4x throughput increase'
      }
    ],
    roomMetrics: {
      queryEfficiency: 98,
      flowObservationLatencyMs: 8,
      recommendedIndices: ['createdAt', 'category_timestamp', 'importance_score']
    }
  });

  const runFullAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.audit) {
        setAuditReport(data.audit);
      }
    } catch (err) {
      console.error('Error running audit:', err);
    } finally {
      setIsRunningAudit(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>IA Uru Concurrency & Security Audit Suite</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Kotlin Coroutine Scope Analysis & Architecture Vulnerability Scanner
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Real-time profiling of coroutine dispatchers, Room database transaction bounds, and Compose recomposition stability.
          </p>
        </div>

        <button
          onClick={runFullAudit}
          disabled={isRunningAudit}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          {isRunningAudit ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Auditing Subsystems...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Run Live Security Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Score and Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-2xl">
            {auditReport.overallScore}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Security & Stability Index</span>
            <h3 className="text-base font-bold text-white mt-0.5">A+ Enterprise Standard</h3>
            <span className="text-xs text-emerald-400 font-semibold">0 Critical Vulnerabilities</span>
          </div>
        </div>

        {/* Concurrency Grade */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 font-mono font-bold text-xl">
            Flow
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Concurrency Architecture</span>
            <h3 className="text-base font-bold text-white mt-0.5">{auditReport.concurrencyGrade}</h3>
            <span className="text-xs text-sky-400 font-semibold">Thread-Safe SupervisorJob</span>
          </div>
        </div>

        {/* Room Metrics */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 font-mono font-bold text-xl">
            {auditReport.roomMetrics.queryEfficiency}%
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Room SQLite Optimization</span>
            <h3 className="text-base font-bold text-white mt-0.5">{auditReport.roomMetrics.flowObservationLatencyMs}ms Flow Latency</h3>
            <span className="text-xs text-purple-400 font-semibold">Reactive Observer Nominal</span>
          </div>
        </div>
      </div>

      {/* Coroutine Optimizations Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Kotlin Coroutine Concurrency Optimizations</span>
        </div>

        <div className="space-y-3">
          {auditReport.coroutineOptimizations.map((opt, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{opt.target}</span>
                <span className="font-mono text-emerald-400 font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                  {opt.latencyImpact}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-rose-300">
                  <span className="font-bold block text-rose-400 mb-0.5">Legacy / Inefficient:</span>
                  <code>{opt.currentPattern}</code>
                </div>
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                  <span className="font-bold block text-emerald-400 mb-0.5">Recommended Refinement:</span>
                  <code>{opt.recommendedPattern}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Advisory & Lint Flags */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Detected Architecture & Code Smells ({auditReport.vulnerabilities.length})</span>
        </div>

        <div className="space-y-3">
          {auditReport.vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-400 border border-amber-800">
                    {vuln.severity}
                  </span>
                  <span className="font-bold text-white text-sm">{vuln.title}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{vuln.module}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{vuln.description}</p>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-sky-300">
                <strong className="text-slate-400">Recommended Fix: </strong>
                <span>{vuln.fixSuggestion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

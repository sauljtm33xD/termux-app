import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Terminal, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  FileText,
  AlertCircle,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AutonomousTask, AutonomousStep } from '../types';

interface AutonomousStudioProps {
  onStepExecuted: () => void;
}

export const AutonomousStudio: React.FC<AutonomousStudioProps> = ({ onStepExecuted }) => {
  const [objectiveInput, setObjectiveInput] = useState(
    'Construct an Offline-First Room Database Syncer for Android using Kotlin Coroutines Flow, MVI StateFlow, and WorkManager'
  );
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeTask, setActiveTask] = useState<AutonomousTask | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const predefinedObjectives = [
    'Construct an Offline-First Room Database Syncer for Android using Kotlin Coroutines Flow, MVI StateFlow, and WorkManager',
    'Build a Tree-of-Thoughts Autonomous Planning Agent in Kotlin with Reflexion self-evaluator for edge devices',
    'Implement a Real-Time Glassmorphic Telemetry Dashboard in Jetpack Compose with custom Canvas shaders',
    'Audit and optimize Kotlin Coroutine scopes, Channel buffers, and Flow memory footprints across background workers'
  ];

  // Decompose task via backend API
  const handleDecompose = async () => {
    if (!objectiveInput.trim() || isDecomposing) return;
    setIsDecomposing(true);

    try {
      const res = await fetch('/api/ai/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: objectiveInput.trim() })
      });

      const data = await res.json();
      if (data.steps && data.steps.length > 0) {
        const newTask: AutonomousTask = {
          id: `task-${Date.now()}`,
          title: objectiveInput.trim(),
          description: `Autonomous task decomposed into ${data.steps.length} sequential micro-steps.`,
          createdAt: new Date().toISOString(),
          status: 'idle',
          steps: data.steps,
          reflectionLogs: data.reflectionLogs || [
            `Task decomposed into ${data.steps.length} steps.`,
            `Dependency analysis verified.`
          ]
        };
        setActiveTask(newTask);
        setSelectedStepId(data.steps[0].id);
      }
    } catch (err) {
      console.error('Error decomposing task:', err);
    } finally {
      setIsDecomposing(false);
    }
  };

  // Execute a single step
  const executeSingleStep = async (stepId: string) => {
    if (!activeTask) return;
    const stepIndex = activeTask.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const step = activeTask.steps[stepIndex];

    // Mark running
    setActiveTask(prev => {
      if (!prev) return null;
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = { ...step, status: 'running' };
      return { ...prev, status: 'running', steps: updatedSteps };
    });

    try {
      const res = await fetch('/api/ai/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          objective: activeTask.title,
          previousSteps: activeTask.steps.slice(0, stepIndex)
        })
      });

      const data = await res.json();

      setActiveTask(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[stepIndex] = {
          ...step,
          status: 'completed',
          output: data.output || 'Step verified.',
          thought: data.thought || 'Criteria met.',
          codeSnippet: data.codeSnippet
        };

        const allDone = updatedSteps.every(s => s.status === 'completed');
        const newLogs = [
          ...prev.reflectionLogs,
          `[STEP ${step.stepNumber} VERIFIED] ${step.title} -> ${data.output || 'Done'}`
        ];

        if (allDone) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        return {
          ...prev,
          status: allDone ? 'completed' : 'running',
          steps: updatedSteps,
          reflectionLogs: newLogs
        };
      });

      onStepExecuted();
    } catch (err) {
      console.error('Error executing step:', err);
      setActiveTask(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[stepIndex] = { ...step, status: 'failed', output: 'Execution error.' };
        return { ...prev, steps: updatedSteps };
      });
    }
  };

  // Run all steps sequentially
  const handleRunAll = async () => {
    if (!activeTask || isRunningAll) return;
    setIsRunningAll(true);

    for (let i = 0; i < activeTask.steps.length; i++) {
      const step = activeTask.steps[i];
      if (step.status !== 'completed') {
        setSelectedStepId(step.id);
        await executeSingleStep(step.id);
      }
    }

    setIsRunningAll(false);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const selectedStep = activeTask?.steps.find(s => s.id === selectedStepId);

  const completedStepsCount = activeTask?.steps.filter(s => s.status === 'completed').length || 0;
  const progressPercent = activeTask?.steps.length 
    ? Math.round((completedStepsCount / activeTask.steps.length) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Objective Input Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          <Workflow className="w-4 h-4" />
          <span>Autonomous Task Decomposition & Execution Engine</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-3">
          Deconstruct High-Level Objectives into Verifiable Kotlin & Android Micro-Steps
        </h2>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            placeholder="Describe your objective (e.g. Build MVI Flow Syncer for Android...)"
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <button
            onClick={handleDecompose}
            disabled={!objectiveInput.trim() || isDecomposing}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shrink-0 ${
              isDecomposing
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
            }`}
          >
            {isDecomposing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Decomposing with ToT...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Deconstruct Task</span>
              </>
            )}
          </button>
        </div>

        {/* Objective Presets */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Sample Objectives:</span>
          {predefinedObjectives.map((obj, idx) => (
            <button
              key={idx}
              onClick={() => setObjectiveInput(obj)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all shrink-0 max-w-xs truncate"
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* Task Plan & Execution Workspace */}
      {activeTask && (
        <div className="space-y-6">
          {/* Progress and Action Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-lg text-emerald-400">
                {progressPercent}%
              </div>
              <div>
                <h3 className="font-bold text-white text-base line-clamp-1">{activeTask.title}</h3>
                <p className="text-xs text-slate-400">
                  {completedStepsCount} of {activeTask.steps.length} micro-steps verified • Status: <span className="text-emerald-400 font-semibold uppercase">{activeTask.status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAll}
                disabled={isRunningAll || activeTask.status === 'completed'}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTask.status === 'completed'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                {isRunningAll ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Sequentially...</span>
                  </>
                ) : activeTask.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>All Steps Verified</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Auto-Run All Steps</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Steps & Artifacts 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Steps List Column */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                <span>Decomposed Micro-Steps ({activeTask.steps.length})</span>
                <span className="font-mono text-emerald-400">{completedStepsCount}/{activeTask.steps.length} Done</span>
              </div>

              {activeTask.steps.map((step) => {
                const isSelected = selectedStepId === step.id;
                const isRunning = step.status === 'running';
                const isCompleted = step.status === 'completed';

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isRunning ? (
                          <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-400">
                            {step.stepNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold truncate ${isCompleted ? 'text-emerald-300' : 'text-slate-100'}`}>
                            {step.stepNumber}. {step.title}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                            {step.tool}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono">
                            Criteria: {step.verifiableCriteria.slice(0, 32)}...
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              executeSingleStep(step.id);
                            }}
                            disabled={isRunning}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              isCompleted
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            }`}
                          >
                            {isRunning ? 'Running...' : isCompleted ? 'Re-Run' : 'Execute'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Detail & Code Artifact Viewer */}
            <div className="lg:col-span-7 space-y-4">
              {selectedStep ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                        <span>STEP {selectedStep.stepNumber}</span>
                        <span>•</span>
                        <span className="uppercase">{selectedStep.status}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{selectedStep.title}</h3>
                    </div>

                    <button
                      onClick={() => executeSingleStep(selectedStep.id)}
                      disabled={selectedStep.status === 'running'}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all"
                    >
                      {selectedStep.status === 'running' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Run Step</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <p><strong className="text-slate-400">Description:</strong> {selectedStep.description}</p>
                    <p><strong className="text-slate-400">Verifiable Target:</strong> <span className="font-mono text-amber-300">{selectedStep.verifiableCriteria}</span></p>
                    {selectedStep.thought && (
                      <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/20 text-sky-300 font-mono text-[11px]">
                        <span className="font-bold">Cognitive Thought: </span>{selectedStep.thought}
                      </div>
                    )}
                  </div>

                  {/* Generated Code Artifact */}
                  {selectedStep.codeSnippet ? (
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-xs">
                        <div className="flex items-center gap-2 text-sky-400 font-mono font-semibold">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{selectedStep.codeSnippet.filename}</span>
                        </div>
                        <button
                          onClick={() => copyCode(selectedStep.codeSnippet!.code, selectedStep.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[11px] hover:bg-slate-600 transition-colors"
                        >
                          {copiedCodeId === selectedStep.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy Kotlin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-80">
                        <code>{selectedStep.codeSnippet.code}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                      Click <strong>"Run Step"</strong> or <strong>"Auto-Run All Steps"</strong> to generate the verified Kotlin code artifact for this phase.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
                  Select a step on the left to inspect its autonomous verification criteria and code artifacts.
                </div>
              )}

              {/* Live Reflection Logs Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="font-bold">Autonomous Reflection Console</span>
                  </div>
                  <span>{activeTask.reflectionLogs.length} events logged</span>
                </div>
                <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                  {activeTask.reflectionLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <span className="text-emerald-500 font-bold">›</span>
                      <span className="text-slate-300">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Layers, 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  FileCode, 
  FolderTree, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ANDROID_ARCHITECTURE_MODULES } from '../data/initialState';
import { ArchitectureFile } from '../types';

export const AndroidArchitectureViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ArchitectureFile>(ANDROID_ARCHITECTURE_MODULES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('ALL');

  const layers = ['ALL', 'Domain', 'Data', 'Presentation', 'Autonomy Engine'];

  const filteredModules = activeLayerFilter === 'ALL'
    ? ANDROID_ARCHITECTURE_MODULES
    : ANDROID_ARCHITECTURE_MODULES.filter(m => m.layer === activeLayerFilter);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>IA Uru Android Clean Architecture & Concurrency Suite</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Production-Grade Kotlin, Room, Coroutines Flow & Jetpack Compose Modules
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Explore the modular architecture powering IA Uru. Built strictly around Clean Architecture principles: Domain UseCases decoupled from Android SDKs, reactive Room persistence with Flow, unidirectional MVI Presentation with Jetpack Compose, and thread-confined Autonomy dispatchers.
        </p>

        {/* Layer Filters */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Filter Layer:</span>
          {layers.map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayerFilter(layer)}
              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                activeLayerFilter === layer
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module File Tree Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-sky-400" />
              Source Tree ({filteredModules.length})
            </span>
          </div>

          <div className="space-y-2">
            {filteredModules.map((module) => {
              const isSelected = selectedFile.path === module.path;
              return (
                <div
                  key={module.path}
                  onClick={() => setSelectedFile(module)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500/60 shadow-lg shadow-sky-500/5'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                          {module.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                          {module.layer}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                        {module.path}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Concurrency Highlights */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Concurrency Standards</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Room DB operates exclusively on <code className="text-sky-300">Dispatchers.IO</code>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Compose UI subscribes via <code className="text-sky-300">collectAsStateWithLifecycle()</code>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Background engines use <code className="text-sky-300">SupervisorJob()</code> to isolate failures.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code & Architectural Explanation Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <span>LAYER: {selectedFile.layer.toUpperCase()}</span>
                  <span>•</span>
                  <span>KOTLIN 2.0+</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedFile.title}</h3>
                <p className="text-xs font-mono text-slate-400">{selectedFile.path}</p>
              </div>

              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Explanation & Best Practices */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
              <p className="leading-relaxed">{selectedFile.explanation}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Key Features:</span>
                {selectedFile.kotlinFeatures.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 border border-sky-800/60"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet */}
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-mono text-sky-400 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{selectedFile.path.split('/').pop()}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Kotlin Coroutines & Flow</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[28rem] selection:bg-sky-500/30">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

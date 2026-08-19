import React, { useState } from 'react';
import { Download, Upload, Check, Copy, AlertCircle, FileJson } from 'lucide-react';
import { ExportData } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: ExportData;
  onImportData: (data: ExportData) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  exportData,
  onImportData
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ia-uru-cognitive-core-v4.2-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.messages || !parsed.stats) {
        throw new Error('Invalid IA Uru Core JSON structure. Must contain stats and messages.');
      }
      onImportData(parsed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Malformed JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
            <FileJson className="w-5 h-5" />
            <span>State Synchronization & JSON Export/Import</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Export Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Current Session State Snapshot
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1 transition-colors font-bold"
              >
                <Download className="w-3 h-3" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto">
            {jsonString}
          </pre>
        </div>

        {/* Import Section */}
        <form onSubmit={handleImportSubmit} className="space-y-3 pt-3 border-t border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
            Import State from JSON
          </span>
          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Paste exported session JSON here to restore conversation, telemetry, and memory vectors..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!importJsonText.trim()}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                importJsonText.trim()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

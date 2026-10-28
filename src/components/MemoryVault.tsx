import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Plus, 
  Tag, 
  Trash2, 
  Sparkles, 
  Layers, 
  Sliders, 
  Clock, 
  Check, 
  Copy,
  Network
} from 'lucide-react';
import { MemoryNode } from '../types';

interface MemoryVaultProps {
  memories: MemoryNode[];
  onAddMemory: (memory: Omit<MemoryNode, 'id' | 'timestamp'>) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minImportance, setMinImportance] = useState<number>(0.0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Memory Form State
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryNode['category']>('Insight');
  const [newImportance, setNewImportance] = useState(0.85);
  const [newTags, setNewTags] = useState('android, architecture');

  const categories = ['ALL', 'Project Context', 'Decision', 'Constraint', 'Insight', 'Security'];

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = selectedCategory === 'ALL' || mem.category === selectedCategory;
    const matchesImportance = mem.importance >= minImportance;
    const matchesSearch = 
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesImportance && matchesSearch;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    onAddMemory({
      category: newCategory,
      content: newContent.trim(),
      importance: Number(newImportance),
      tags: parsedTags.length > 0 ? parsedTags : ['general']
    });

    setNewContent('');
    setNewTags('android, architecture');
    setIsModalOpen(false);
  };

  const getCategoryBadgeClass = (category: MemoryNode['category']) => {
    switch (category) {
      case 'Project Context': return 'bg-sky-950/80 text-sky-400 border-sky-800/80';
      case 'Decision': return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'Constraint': return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'Insight': return 'bg-purple-950/80 text-purple-400 border-purple-800/80';
      case 'Security': return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>IA Uru Long-Term Semantic Vector Vault</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Neural Memory Nodes & Associative Reasoning Index
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Persistent episodic and architectural memory nodes used by the autonomous engine for context injection, decision recall, and constraint validation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Memory Vector</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content or tags..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Min Importance:</span>
              <span className="font-mono text-purple-300 font-bold">{Math.round(minImportance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minImportance}
              onChange={(e) => setMinImportance(parseFloat(e.target.value))}
              className="w-24 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((node) => (
          <div
            key={node.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeClass(node.category)}`}>
                  {node.category}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-purple-300">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{Math.round(node.importance * 100)}% Imp.</span>
                  </div>
                  <button
                    onClick={() => onDeleteMemory(node.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete Memory Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {node.content}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-1">
                {node.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                {new Date(node.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        ))}

        {filteredMemories.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            No neural memory nodes match the current filter or search criteria.
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <BrainCircuit className="w-4 h-4" />
                <span>Create Semantic Memory Vector</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Memory Content / Cognitive Rule</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Always wrap Room Database queries in CoroutineScope with Dispatchers.IO..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Project Context">Project Context</option>
                    <option value="Decision">Decision</option>
                    <option value="Constraint">Constraint</option>
                    <option value="Insight">Insight</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Importance: <span className="font-mono text-purple-300 font-bold">{Math.round(newImportance * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={newImportance}
                    onChange={(e) => setNewImportance(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="android, coroutines, room, compose"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-purple-500 hover:bg-purple-400 text-slate-950 transition-colors shadow-md"
                >
                  Save Vector Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

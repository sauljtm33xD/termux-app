import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Cpu, 
  BrainCircuit,
  CornerDownLeft,
  Loader2,
  Trash2
} from 'lucide-react';
import { Message, CognitiveMode, MemoryNode, TelemetryStats } from '../types';

interface CognitiveChatProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isGenerating: boolean;
  currentMode: CognitiveMode;
  setMode: (mode: CognitiveMode) => void;
  memories: MemoryNode[];
  stats: TelemetryStats;
  isTtsEnabled: boolean;
  onClearChat: () => void;
}

export const CognitiveChat: React.FC<CognitiveChatProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  currentMode,
  setMode,
  memories,
  stats,
  isTtsEnabled,
  onClearChat,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "¿Cuál es tu latencia y throughput?",
    "¿Cómo está mi seguridad hoy?",
    "¿Qué onda URU, cómo andas?",
    "¿Qué tan segura es esta red WiFi?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;
    const text = inputMessage.trim();
    setInputMessage('');
    await onSendMessage(text);
  };

  const toggleThoughts = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const speakMessage = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#`_\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to render text with markdown-style code blocks
  const renderMessageContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-3 text-sm leading-relaxed">
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const firstLine = lines[0].trim();
            const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
            const language = hasLang ? firstLine : 'kotlin';
            const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
            const codeKey = `${msgId}-code-${index}`;

            return (
              <div key={codeKey} className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/90 shadow-md my-3">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono font-semibold uppercase text-[11px] text-sky-300">{language}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(code, codeKey)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                  >
                    {copiedCodeId === codeKey ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed selection:bg-sky-500/30">
                  <code>{code}</code>
                </pre>
              </div>
            );
          }

          // Format headings and bullet points nicely
          const formattedText = part
            .split('\n')
            .map((line, lIdx) => {
              if (line.startsWith('### ')) {
                return <h3 key={lIdx} className="text-base font-bold text-sky-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('#### ')) {
                return <h4 key={lIdx} className="text-sm font-semibold text-slate-200 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-2 my-1">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{line.replace(/^[-*]\s+/, '')}</span>
                  </div>
                );
              }
              return <p key={lIdx} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>;
            });

          return <div key={index} className="space-y-1">{formattedText}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto">
      {/* Header controls inside chat */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 rounded-t-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <BrainCircuit className="w-4 h-4 text-sky-400" />
          <span className="font-semibold">Cognitive Conversation Stream</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{messages.length} messages</span>
        </div>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-slate-800"
          title="Clear Conversation Stream"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Stream</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/70 border-x border-slate-800">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          const hasThoughts = isAssistant && msg.thoughts && msg.thoughts.length > 0;
          const isExpanded = expandedThoughts[msg.id] ?? false;
          const isSpeaking = currentlySpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isAssistant
                    ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white border border-sky-400/30'
                    : 'bg-gradient-to-tr from-slate-700 to-slate-800 text-slate-200 border border-slate-600'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`space-y-2 flex-1 max-w-3xl ${isAssistant ? '' : 'text-right'}`}>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isAssistant ? 'IA Uru Cognitive Core' : 'Architect'}
                  </span>
                  {msg.mode && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 uppercase font-mono text-[9px] border border-slate-700">
                      {msg.mode}
                    </span>
                  )}
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {isAssistant && (
                    <button
                      onClick={() => speakMessage(msg.content, msg.id)}
                      className={`ml-auto p-1 rounded hover:bg-slate-800 transition-colors ${
                        isSpeaking ? 'text-sky-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={isSpeaking ? 'Stop speech' : 'Read aloud'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Cognitive Thoughts Drawer for Assistant */}
                {hasThoughts && (
                  <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 overflow-hidden text-left mb-2">
                    <button
                      onClick={() => toggleThoughts(msg.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-950/40 transition-colors font-mono"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Cognitive Thought Traces ({msg.thoughts?.length} steps)</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="px-3 py-2 bg-slate-950/60 border-t border-sky-500/10 space-y-1.5 text-[11px] font-mono text-slate-300">
                        {msg.thoughts?.map((thought, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-sky-400 font-bold">›</span>
                            <span>{thought}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble Body */}
                <div
                  className={`p-4 rounded-2xl text-left ${
                    isAssistant
                      ? 'bg-slate-900/80 border border-slate-800 text-slate-100 shadow-lg'
                      : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  }`}
                >
                  {renderMessageContent(msg.content, msg.id)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Generating State Indicator */}
        {isGenerating && (
          <div className="flex gap-3 items-center text-slate-400 text-xs font-mono py-2 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span>IA Uru Cognitive Engine is formulating structured response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Rail */}
      <div className="bg-slate-900/90 border-x border-slate-800 p-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Presets:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputMessage(prompt)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all shrink-0 max-w-xs truncate"
            title={prompt}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-900 rounded-b-2xl border border-slate-800 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={`Message IA Uru in ${currentMode.toUpperCase()} mode... (Shift+Enter for newline)`}
            rows={1}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!inputMessage.trim() || isGenerating}
          className={`p-2.5 rounded-xl font-semibold transition-all shrink-0 flex items-center justify-center ${
            inputMessage.trim() && !isGenerating
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md hover:from-sky-400 hover:to-indigo-500'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

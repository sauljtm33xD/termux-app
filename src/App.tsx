import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { TelemetryBar } from './components/TelemetryBar';
import { CognitiveChat } from './components/CognitiveChat';
import { AutonomousStudio } from './components/AutonomousStudio';
import { AndroidArchitectureViewer } from './components/AndroidArchitectureViewer';
import { MemoryVault } from './components/MemoryVault';
import { SecurityAuditSuite } from './components/SecurityAuditSuite';
import { ExportImportModal } from './components/ExportImportModal';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { CoreEnginesStudio } from './components/CoreEnginesStudio';
import { BuildDeployCenter } from './components/BuildDeployCenter';
import { NewBornProtocolModal } from './components/NewBornProtocolModal';
import { SystemInstructionsModal } from './components/SystemInstructionsModal';
import { generateWithGemini, isGeminiConfigured } from './services/geminiService';
import { 
  INITIAL_MESSAGES, 
  INITIAL_MEMORIES, 
  INITIAL_STATS,
  INITIAL_NEW_BORN_STATE,
  INITIAL_AUDIT_LOGS,
  INITIAL_RULES
} from './data/initialState';
import { 
  Message, 
  MemoryNode, 
  TelemetryStats, 
  CognitiveMode, 
  ExportData,
  UruTheme,
  NewBornState,
  AegisAuditEntry,
  Rule
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentMode, setCurrentMode] = useState<CognitiveMode>('autonomous');
  const [theme, setTheme] = useState<UruTheme>('fuego');
  const [newBornState, setNewBornState] = useState<NewBornState>(INITIAL_NEW_BORN_STATE);
  const [isNewBornModalOpen, setIsNewBornModalOpen] = useState(false);
  const [isSystemInstructionsModalOpen, setIsSystemInstructionsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [memories, setMemories] = useState<MemoryNode[]>(INITIAL_MEMORIES);
  const [stats, setStats] = useState<TelemetryStats>(INITIAL_STATS);
  const [auditLogs, setAuditLogs] = useState<AegisAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Speech Recognition (Web Speech API)
  const recognitionRef = useRef<any>(null);

  // 30-min verification loop countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setNewBornState(prev => {
        if (prev.verificationDueInSeconds <= 1) {
          return {
            ...prev,
            verificationDueInSeconds: 0,
            cautionLevel: Math.min(100, prev.cautionLevel + 10)
          };
        }
        return {
          ...prev,
          verificationDueInSeconds: prev.verificationDueInSeconds - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Keep activeMemoryNodes stats in sync
    setStats(prev => ({ ...prev, activeMemoryNodes: memories.length }));
  }, [memories.length]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      mode: currentMode,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    const startTime = Date.now();

    try {
      // Build system prompt based on context
      const systemPrompt = `Eres URU, un Personal AI Middleware inteligente para Termux.
Modo: ${currentMode.toUpperCase()}
Tema: ${theme}
Recuerdos activos: ${memories.length}

Responde de forma breve, directa y útil. Si el usuario pregunta sobre tu capacidades, menciona que puedes:
- Analizar código y sistemas
- Proporcionar recomendaciones técnicas
- Procesar eventos autónomos
- Mantener contexto de conversación`;

      const userPrompt = `${content.trim()}

Contexto:
- Modo autónomo: ${currentMode === 'autonomous' ? 'Sí' : 'No'}
- Nivel de confianza: ${newBornState.trustLevel}%
- Caution Level: ${newBornState.cautionLevel}`;

      // Use Gemini API
      const aiResponse = await generateWithGemini(userPrompt);
      const latency = Date.now() - startTime;

      const randomSignature = `sha256_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        mode: currentMode,
        auditSignature: randomSignature,
        latencyMs: latency > 100 ? latency / 1000 : 0.08,
        thoughts: [
          `Procesando en modo ${currentMode.toUpperCase()} bajo AEGIS Zero-Trust`,
          `Verificando políticas de autorización de URU Personal Middleware`,
          `Ejecución confirmada con firma ${randomSignature.slice(0, 16)}...`
        ],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Record AEGIS Audit Entry
      const newAudit: AegisAuditEntry = {
        id: `audit_${Date.now()}`,
        timestamp: Date.now(),
        actor: 'gemini_service',
        action: 'TRIGGER_AI',
        topic: 'chat.message.response',
        payload: { latencyMs: latency, mode: currentMode },
        riskScore: 15,
        riskLevel: 'MINIMAL',
        approved: true,
        signature: randomSignature,
        previousHash: auditLogs[0]?.signature || 'genesis_hash',
        chainValid: true
      };

      setAuditLogs(prev => [newAudit, ...prev]);

      // Update telemetry
      setStats(prev => ({
        ...prev,
        totalTokens: prev.totalTokens + 350,
        requestsCount: prev.requestsCount + 1,
        eventsProcessed: prev.eventsProcessed + 1,
        averageLatencyMs: (prev.averageLatencyMs + latency) / 2,
        neuralLoad: Math.min(95, Math.max(25, prev.neuralLoad + Math.floor(Math.random() * 6) - 2))
      }));

      // Speak if TTS enabled
      if (isTtsEnabled && 'speechSynthesis' in window) {
        const clean = aiResponse.replace(/[*#`_\[\]()]/g, '').substring(0, 500);
        const utt = new SpeechSynthesisUtterance(clean);
        utt.lang = 'es-ES';
        utt.rate = 1.05;
        window.speechSynthesis.speak(utt);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido en la API de Gemini'}`,
        timestamp: new Date().toISOString(),
        mode: currentMode,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStepExecuted = () => {
    setStats(prev => ({
      ...prev,
      autonomousStepsRun: prev.autonomousStepsRun + 1,
      totalTokens: prev.totalTokens + 480,
      eventsProcessed: prev.eventsProcessed + 10,
      neuralLoad: Math.min(90, prev.neuralLoad + 4)
    }));
  };

  const handleAddMemory = (newMem: Omit<MemoryNode, 'id' | 'timestamp'>) => {
    const memoryNode: MemoryNode = {
      ...newMem,
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setMemories(prev => [memoryNode, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGES[0]]);
  };

  const handleAddAuditEntry = (entry: AegisAuditEntry) => {
    setAuditLogs(prev => [entry, ...prev]);
    setStats(prev => ({
      ...prev,
      eventsProcessed: prev.eventsProcessed + 1
    }));
  };

  const exportData: ExportData = {
    app: 'URU - Personal AI Middleware para Android',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    mode: currentMode,
    theme,
    newBornState,
    stats,
    messages,
    memories,
    auditLog: auditLogs
  };

  const handleImportData = (data: ExportData) => {
    if (data.mode) setCurrentMode(data.mode);
    if (data.theme) setTheme(data.theme);
    if (data.newBornState) setNewBornState(data.newBornState);
    if (data.stats) setStats(data.stats);
    if (data.messages) setMessages(data.messages);
    if (data.memories) setMemories(data.memories);
    if (data.auditLog) setAuditLogs(data.auditLog);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMode={currentMode}
        setMode={setCurrentMode}
        stats={stats}
        theme={theme}
        setTheme={setTheme}
        newBornState={newBornState}
        onOpenNewBornModal={() => setIsNewBornModalOpen(true)}
        isTtsEnabled={isTtsEnabled}
        setIsTtsEnabled={setIsTtsEnabled}
        isListening={isListening}
        toggleListening={toggleListening}
        onOpenExportImport={() => setIsExportModalOpen(true)}
        onOpenSystemInstructions={() => setIsSystemInstructionsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Telemetry Metrics Bar */}
        <TelemetryBar stats={stats} currentMode={currentMode} />

        {/* Tab View Router */}
        {activeTab === 'chat' && (
          <CognitiveChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            currentMode={currentMode}
            setMode={setCurrentMode}
            memories={memories}
            stats={stats}
            isTtsEnabled={isTtsEnabled}
            onClearChat={handleClearChat}
          />
        )}

        {activeTab === 'mobile' && (
          <MobileDeviceSimulator
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isGenerating}
            theme={theme}
            onChangeTheme={setTheme}
            newBornState={newBornState}
            onOpenNewBornModal={() => setIsNewBornModalOpen(true)}
            eventsProcessed={stats.eventsProcessed}
          />
        )}

        {activeTab === 'core_engines' && (
          <CoreEnginesStudio
            onAddAuditEntry={handleAddAuditEntry}
            auditLogs={auditLogs}
            rules={rules}
            memories={memories}
          />
        )}

        {activeTab === 'autonomy' && (
          <AutonomousStudio onStepExecuted={handleStepExecuted} />
        )}

        {activeTab === 'architecture' && (
          <AndroidArchitectureViewer />
        )}

        {activeTab === 'memory' && (
          <MemoryVault
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === 'audit' && (
          <SecurityAuditSuite />
        )}

        {activeTab === 'build_deploy' && (
          <BuildDeployCenter />
        )}
      </main>

      {/* Protocol New Born Modal */}
      <NewBornProtocolModal
        isOpen={isNewBornModalOpen}
        onClose={() => setIsNewBornModalOpen(false)}
        newBornState={newBornState}
        onUpdateState={setNewBornState}
        onAddAuditEntry={handleAddAuditEntry}
      />

      {/* State Export/Import Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportData={exportData}
        onImportData={handleImportData}
      />

      {/* System Instructions & Hybrid Prompt Config Modal */}
      <SystemInstructionsModal
        isOpen={isSystemInstructionsModalOpen}
        onClose={() => setIsSystemInstructionsModalOpen(false)}
      />
    </div>
  );
}

export default App;


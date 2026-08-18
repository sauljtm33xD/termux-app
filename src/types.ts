export type CognitiveMode = 'autonomous' | 'architect' | 'coder' | 'researcher' | 'security';

export type UruTheme = 'fuego' | 'azul_frio' | 'azul_electrico';

export type AutonomousState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'PROCESSING' 
  | 'DECIDING' 
  | 'EXECUTING' 
  | 'AWAITING' 
  | 'ERROR' 
  | 'LEARNING';

export type EmotionalState = 'HAPPY' | 'NORMAL' | 'STRESSED' | 'TIRED';

export type RiskLevel = 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EventPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type ActionType = 'EMIT_EVENT' | 'SET_CONTEXT' | 'PATCH_CONTEXT' | 'TRIGGER_AI' | 'LOG';

export interface EngineEvent<T = any> {
  id: string;
  topic: string;
  payload: T;
  priority: EventPriority;
  timestamp: number;
  metadata?: Record<string, any>;
  signature?: string;
}

export interface ContextScope {
  id: string;
  name: string;
  parentScopeId?: string;
  data: Record<string, any>;
  createdAt: number;
}

export interface MemorySlot {
  key: string;
  value: any;
  importance: number; // 1 to 10
  ttlMs?: number;
  expiresAt?: number;
  scopeId?: string;
}

export interface RuleCondition {
  field: string;
  operator: 'EQ' | 'NEQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'CONTAINS' | 'IN' | 'REGEX' | 'EXISTS';
  value: any;
}

export interface Rule {
  id: string;
  name: string;
  topicPattern: string;
  conditions: RuleCondition[];
  actionType: ActionType;
  actionPayload: any;
  enabled: boolean;
  priority: number;
}

export interface AegisAuditEntry {
  id: string;
  timestamp: number;
  actor: 'user' | 'system' | 'gemini_service';
  action: ActionType;
  topic?: string;
  payload?: any;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  approved: boolean;
  signature: string;
  previousHash: string;
  chainValid: boolean;
}

export interface ReplaySnapshot {
  frameNumber: number;
  timestamp: number;
  hash: string;
  state: AutonomousState;
  activeEventsCount: number;
  contextDump: Record<string, any>;
}

export interface NewBornState {
  isBorn: boolean;
  birthTimestamp: number;
  bondingKeyword: string;
  trustLevel: number; // 0 - 100
  cautionLevel: number; // 100 - 0
  verificationDueInSeconds: number;
  consecutiveVerifications: number;
  evolutionStage: 'DÍA 1 (Nace)' | 'SEMANA 1 (Patrones)' | 'MES 1 (Confiado)' | 'AÑO 1 (Hábitos)' | 'AÑO 2-5 (Compañero)' | 'AÑO 5+ (Intuición Pura)' | 'SIEMPRE (Eterno)';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: CognitiveMode;
  thoughts?: string[];
  codeSnippets?: {
    language: string;
    code: string;
    title?: string;
  }[];
  isAudioPlaying?: boolean;
  auditSignature?: string;
  latencyMs?: number;
}

export interface MemoryNode {
  id: string;
  category: 'Project Context' | 'Decision' | 'Constraint' | 'Insight' | 'Security';
  content: string;
  importance: number; // 0.0 to 1.0
  timestamp: string;
  tags: string[];
  relatedNodeIds?: string[];
  layerIndex?: number; // 1-7 (Short-term, Mid-term, Long-term, Preferences, Anomalies, Goals, Relationships)
}

export interface AutonomousStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  verifiableCriteria: string;
  thought?: string;
  output?: string;
  codeSnippet?: {
    filename: string;
    code: string;
    language: string;
  };
}

export interface AutonomousTask {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'idle' | 'decomposing' | 'running' | 'completed' | 'paused';
  steps: AutonomousStep[];
  reflectionLogs: string[];
  finalArtifact?: string;
}

export interface ArchitectureFile {
  path: string;
  layer: 'Domain' | 'Data' | 'Presentation' | 'Autonomy Engine';
  title: string;
  code: string;
  explanation: string;
  kotlinFeatures: string[];
}

export interface TelemetryStats {
  totalTokens: number;
  requestsCount: number;
  autonomousStepsRun: number;
  averageLatencyMs: number;
  neuralLoad: number;
  activeMemoryNodes: number;
  eventsProcessed: number;
  throughputOpsSec: number;
  aegisBlockedActions: number;
}

export interface AuditReport {
  overallScore: number;
  concurrencyGrade: string;
  securityStatus: 'SECURE' | 'WARNING' | 'CRITICAL';
  vulnerabilities: {
    id: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    module: string;
    title: string;
    description: string;
    fixSuggestion: string;
  }[];
  coroutineOptimizations: {
    target: string;
    currentPattern: string;
    recommendedPattern: string;
    latencyImpact: string;
  }[];
  roomMetrics: {
    queryEfficiency: number;
    flowObservationLatencyMs: number;
    recommendedIndices: string[];
  };
}

export interface ExportData {
  app: string;
  version: string;
  exportedAt: string;
  mode: CognitiveMode;
  theme?: UruTheme;
  newBornState?: NewBornState;
  stats: TelemetryStats;
  messages: Message[];
  memories: MemoryNode[];
  auditLog?: AegisAuditEntry[];
}


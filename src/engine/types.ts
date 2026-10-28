/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type EventStatus = 'PENDING' | 'DISPATCHED' | 'PROCESSED' | 'FAILED' | 'DLQ' | 'SKIPPED';

export interface EventMetadata {
  timestamp: number;
  correlationId?: string;
  causationId?: string;
  source: string;
  schemaVersion?: string;
  priority?: EventPriority;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  ttlMs?: number;
  retryCount?: number;
  maxRetries?: number;
  [key: string]: unknown;
}

export interface EngineEvent<T = Record<string, unknown>> {
  id: string;
  topic: string;
  payload: T;
  metadata: EventMetadata;
  status: EventStatus;
  error?: string;
  executionTimeMs?: number;
}

export type EventFilter<T = Record<string, unknown>> = (event: EngineEvent<T>) => boolean;

export type EventHandler<T = Record<string, unknown>> = (
  event: EngineEvent<T>,
  contextSnapshot?: Record<string, unknown>
) => Promise<void> | void;

export interface Subscription {
  id: string;
  topicPattern: string;
  handler: EventHandler<any>;
  filter?: EventFilter<any>;
  priority?: number;
  name?: string;
  active: boolean;
  createdAt: number;
  invocationCount: number;
  lastInvokedAt?: number;
  errorCount: number;
}

export interface Middleware {
  name: string;
  beforePublish?: (event: EngineEvent<any>) => Promise<EngineEvent<any> | null> | EngineEvent<any> | null;
  beforeDispatch?: (event: EngineEvent<any>, sub: Subscription) => Promise<boolean> | boolean;
  afterDispatch?: (event: EngineEvent<any>, sub: Subscription, durationMs: number) => Promise<void> | void;
  onError?: (event: EngineEvent<any>, error: Error, sub?: Subscription) => Promise<void> | void;
}

export interface DeadLetterEntry {
  id: string;
  event: EngineEvent<any>;
  failedAt: number;
  reason: string;
  retriesAttempted: number;
  stackTrace?: string;
}

export interface EngineMetrics {
  eventsPublished: number;
  eventsProcessed: number;
  eventsFailed: number;
  eventsInDLQ: number;
  activeSubscriptions: number;
  avgDispatchLatencyMs: number;
  peakThroughputPerSec: number;
  totalContextMutations: number;
  activeContextScopes: number;
  activeRules: number;
  uptimeSeconds: number;
}

export interface IEventEngine {
  publish<T = Record<string, unknown>>(
    topic: string,
    payload: T,
    metadata?: Partial<EventMetadata>
  ): Promise<EngineEvent<T>>;

  publishBatch(events: Array<{ topic: string; payload: any; metadata?: Partial<EventMetadata> }>): Promise<EngineEvent[]>;

  subscribe<T = Record<string, unknown>>(
    topicPattern: string,
    handler: EventHandler<T>,
    options?: {
      filter?: EventFilter<T>;
      priority?: number;
      name?: string;
    }
  ): Subscription;

  unsubscribe(subscriptionId: string): boolean;

  use(middleware: Middleware): void;

  removeMiddleware(name: string): boolean;

  getHistory(limit?: number, filterTopic?: string): EngineEvent[];

  replay(fromTimestampOrId: number | string, toTimestamp?: number): Promise<number>;

  getDeadLetterQueue(): DeadLetterEntry[];

  retryDeadLetter(dlqEntryId: string): Promise<boolean>;

  retryAllDeadLetters(): Promise<number>;

  clearDeadLetterQueue(): void;

  clearHistory(): void;

  getMetrics(): EngineMetrics;

  resetMetrics(): void;
}

// -------------------------------------------------------------
// CONTEXT ENGINE TYPES
// -------------------------------------------------------------

export interface MemorySlot {
  id: string;
  key: string;
  value: any;
  importance: number; // 1 to 10
  tags: string[];
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  sourceEventId?: string;
  summary?: string;
}

export interface ContextScope {
  id: string;
  name: string;
  parentScopeId?: string;
  variables: Record<string, any>;
  memorySlots: Record<string, MemorySlot>;
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
    description?: string;
    owner?: string;
    [key: string]: unknown;
  };
}

export interface ContextDiff {
  timestamp: number;
  scopeId: string;
  path: string;
  oldValue: any;
  newValue: any;
  operation: 'SET' | 'PATCH' | 'DELETE' | 'CREATE_SCOPE' | 'DELETE_SCOPE';
  sourceEventId?: string;
}

export type ContextWatcher = (diff: ContextDiff, currentScope: ContextScope) => void;

export interface TokenBudgetConfig {
  maxTokens?: number;
  reservedSystemTokens?: number;
  includeMemorySlots?: boolean;
  minImportanceThreshold?: number;
  prioritizeRecent?: boolean;
}

export interface AggregatedAIContext {
  systemPromptAddition: string;
  structuredContext: Record<string, any>;
  relevantMemories: MemorySlot[];
  estimatedTokens: number;
  scopeHierarchy: string[];
  generatedAt: number;
}

export interface IContextEngine {
  createScope(name: string, parentScopeId?: string, initialData?: Record<string, any>): ContextScope;

  getScope(scopeId: string): ContextScope | undefined;

  getAllScopes(): ContextScope[];

  deleteScope(scopeId: string): boolean;

  get<T = any>(path: string, scopeId?: string): T | undefined;

  set<T = any>(path: string, value: T, scopeId?: string, sourceEventId?: string): void;

  patch(path: string, partialValue: Record<string, any>, scopeId?: string, sourceEventId?: string): void;

  delete(path: string, scopeId?: string): boolean;

  watch(pathPattern: string, callback: ContextWatcher, scopeId?: string): () => void;

  setMemorySlot(
    key: string,
    value: any,
    options?: {
      scopeId?: string;
      importance?: number;
      tags?: string[];
      ttlMs?: number;
      summary?: string;
      sourceEventId?: string;
    }
  ): MemorySlot;

  getMemorySlots(scopeId?: string, minImportance?: number): MemorySlot[];

  deleteMemorySlot(key: string, scopeId?: string): boolean;

  getSnapshot(scopeId?: string): Record<string, any>;

  restoreSnapshot(snapshot: Record<string, any>, scopeId?: string): void;

  getDiffHistory(limit?: number): ContextDiff[];

  aggregateContextForAI(config?: TokenBudgetConfig, scopeId?: string): AggregatedAIContext;

  transaction<R>(fn: (ctx: IContextEngine) => R, scopeId?: string): R;

  reset(): void;
}

// -------------------------------------------------------------
// RULE ENGINE & ACTIONS
// -------------------------------------------------------------

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'regex'
  | 'exists'
  | 'not_exists'
  | 'custom';

export interface RuleCondition {
  field: string; // e.g. "payload.amount" or "context.user.tier"
  operator: ConditionOperator;
  value?: any;
  customFnBody?: string;
}

export interface RuleAction {
  type: 'EMIT_EVENT' | 'SET_CONTEXT' | 'PATCH_CONTEXT' | 'TRIGGER_AI' | 'LOG' | 'CUSTOM';
  targetTopic?: string;
  payloadTemplate?: Record<string, any>;
  contextPath?: string;
  contextScopeId?: string;
  valueTemplate?: any;
  aiPromptTemplate?: string;
  customCode?: string;
}

export interface Rule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  triggerTopicPattern: string;
  conditions: RuleCondition[];
  conditionLogic: 'AND' | 'OR';
  actions: RuleAction[];
  stats: {
    evaluations: number;
    executions: number;
    failures: number;
    lastTriggeredAt?: number;
  };
}

export interface IRuleEngine {
  registerRule(rule: Omit<Rule, 'stats'>): Rule;
  updateRule(ruleId: string, updates: Partial<Rule>): Rule | undefined;
  deleteRule(ruleId: string): boolean;
  getRules(): Rule[];
  evaluateEvent(event: EngineEvent<any>): Promise<RuleAction[]>;
}

// -------------------------------------------------------------
// TIME TRAVEL & AUDIT
// -------------------------------------------------------------

export interface TimeTravelFrame {
  id: string;
  stepIndex: number;
  timestamp: number;
  triggerEvent: EngineEvent<any>;
  contextSnapshot: Record<string, any>;
  scopesSnapshot: ContextScope[];
  diffsGenerated: ContextDiff[];
  rulesTriggered: string[];
  metricsSnapshot: EngineMetrics;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AggregatedAIContext,
  ContextDiff,
  ContextScope,
  ContextWatcher,
  IContextEngine,
  MemorySlot,
  TokenBudgetConfig,
} from './types';

export class ContextEngineImpl implements IContextEngine {
  private scopes: Map<string, ContextScope> = new Map();
  private rootScopeId: string = 'global';
  private watchers: Map<string, { pattern: string; callback: ContextWatcher; scopeId?: string }> = new Map();
  private diffHistory: ContextDiff[] = [];
  private maxDiffHistorySize: number;
  private isTransactionActive: boolean = false;
  private transactionBackup?: Map<string, ContextScope>;

  constructor(options?: { maxDiffHistorySize?: number }) {
    this.maxDiffHistorySize = options?.maxDiffHistorySize ?? 500;
    this.initRootScope();
  }

  private initRootScope(): void {
    const root: ContextScope = {
      id: this.rootScopeId,
      name: 'Global Root Scope',
      variables: {
        system: {
          version: '1.0.0',
          environment: 'production',
          status: 'HEALTHY',
          uptime: Date.now(),
        },
        session: {
          id: `ses_${Date.now()}`,
          activeUser: 'sauljtm25@gmail.com',
          role: 'ADMIN',
        },
        appState: {
          mode: 'REACTIVE_ORCHESTRATION',
          activeWorkflows: 0,
        },
      },
      memorySlots: {},
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        description: 'Default top-level system context',
      },
    };
    this.scopes.set(this.rootScopeId, root);
  }

  public createScope(name: string, parentScopeId?: string, initialData?: Record<string, any>): ContextScope {
    const parentId = parentScopeId || this.rootScopeId;
    const scopeId = `scope_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const scope: ContextScope = {
      id: scopeId,
      name,
      parentScopeId: parentId,
      variables: initialData ? JSON.parse(JSON.stringify(initialData)) : {},
      memorySlots: {},
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
    };

    this.scopes.set(scopeId, scope);

    this.recordDiff({
      timestamp: Date.now(),
      scopeId,
      path: '$scope',
      oldValue: null,
      newValue: { id: scopeId, name, parentScopeId: parentId },
      operation: 'CREATE_SCOPE',
    });

    return scope;
  }

  public getScope(scopeId: string = this.rootScopeId): ContextScope | undefined {
    return this.scopes.get(scopeId);
  }

  public getAllScopes(): ContextScope[] {
    return Array.from(this.scopes.values());
  }

  public deleteScope(scopeId: string): boolean {
    if (scopeId === this.rootScopeId) {
      console.warn('Cannot delete root global context scope');
      return false;
    }
    const existed = this.scopes.delete(scopeId);
    if (existed) {
      this.recordDiff({
        timestamp: Date.now(),
        scopeId,
        path: '$scope',
        oldValue: scopeId,
        newValue: null,
        operation: 'DELETE_SCOPE',
      });
    }
    return existed;
  }

  public get<T = any>(path: string, scopeId: string = this.rootScopeId): T | undefined {
    let currentScope = this.scopes.get(scopeId);

    // Look up hierarchically
    while (currentScope) {
      const val = this.getByPath(currentScope.variables, path);
      if (val !== undefined) {
        return val as T;
      }
      if (currentScope.parentScopeId) {
        currentScope = this.scopes.get(currentScope.parentScopeId);
      } else {
        break;
      }
    }

    return undefined;
  }

  public set<T = any>(path: string, value: T, scopeId: string = this.rootScopeId, sourceEventId?: string): void {
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      throw new Error(`Context scope '${scopeId}' not found`);
    }

    const oldValue = this.getByPath(scope.variables, path);
    this.setByPath(scope.variables, path, value);
    scope.metadata.updatedAt = Date.now();
    scope.metadata.version++;

    this.recordDiff({
      timestamp: Date.now(),
      scopeId,
      path,
      oldValue,
      newValue: value,
      operation: 'SET',
      sourceEventId,
    });
  }

  public patch(
    path: string,
    partialValue: Record<string, any>,
    scopeId: string = this.rootScopeId,
    sourceEventId?: string
  ): void {
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      throw new Error(`Context scope '${scopeId}' not found`);
    }

    const current = this.getByPath(scope.variables, path) || {};
    const updated = typeof current === 'object' && !Array.isArray(current)
      ? { ...current, ...partialValue }
      : partialValue;

    const oldValue = current;
    this.setByPath(scope.variables, path, updated);
    scope.metadata.updatedAt = Date.now();
    scope.metadata.version++;

    this.recordDiff({
      timestamp: Date.now(),
      scopeId,
      path,
      oldValue,
      newValue: updated,
      operation: 'PATCH',
      sourceEventId,
    });
  }

  public delete(path: string, scopeId: string = this.rootScopeId): boolean {
    const scope = this.scopes.get(scopeId);
    if (!scope) return false;

    const oldValue = this.getByPath(scope.variables, path);
    if (oldValue === undefined) return false;

    this.deleteByPath(scope.variables, path);
    scope.metadata.updatedAt = Date.now();
    scope.metadata.version++;

    this.recordDiff({
      timestamp: Date.now(),
      scopeId,
      path,
      oldValue,
      newValue: undefined,
      operation: 'DELETE',
    });

    return true;
  }

  public watch(pathPattern: string, callback: ContextWatcher, scopeId?: string): () => void {
    const watcherId = `watcher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.watchers.set(watcherId, { pattern: pathPattern, callback, scopeId });

    return () => {
      this.watchers.delete(watcherId);
    };
  }

  public setMemorySlot(
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
  ): MemorySlot {
    const scopeId = options?.scopeId || this.rootScopeId;
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      throw new Error(`Scope '${scopeId}' not found`);
    }

    const now = Date.now();
    const slot: MemorySlot = {
      id: `mem_${now}_${Math.random().toString(36).substring(2, 7)}`,
      key,
      value,
      importance: options?.importance ?? 5,
      tags: options?.tags ?? [],
      createdAt: now,
      updatedAt: now,
      expiresAt: options?.ttlMs ? now + options.ttlMs : undefined,
      summary: options?.summary,
      sourceEventId: options?.sourceEventId,
    };

    scope.memorySlots[key] = slot;
    scope.metadata.updatedAt = now;
    scope.metadata.version++;

    this.recordDiff({
      timestamp: now,
      scopeId,
      path: `memorySlots.${key}`,
      oldValue: null,
      newValue: slot,
      operation: 'SET',
      sourceEventId: options?.sourceEventId,
    });

    return slot;
  }

  public getMemorySlots(scopeId: string = this.rootScopeId, minImportance: number = 1): MemorySlot[] {
    const scope = this.scopes.get(scopeId);
    if (!scope) return [];

    const now = Date.now();
    const result: MemorySlot[] = [];

    for (const [key, slot] of Object.entries(scope.memorySlots)) {
      if (slot.expiresAt && slot.expiresAt <= now) {
        delete scope.memorySlots[key];
        continue;
      }
      if (slot.importance >= minImportance) {
        result.push(slot);
      }
    }

    return result.sort((a, b) => b.importance - a.importance || b.updatedAt - a.updatedAt);
  }

  public deleteMemorySlot(key: string, scopeId: string = this.rootScopeId): boolean {
    const scope = this.scopes.get(scopeId);
    if (!scope || !scope.memorySlots[key]) return false;

    delete scope.memorySlots[key];
    scope.metadata.updatedAt = Date.now();

    this.recordDiff({
      timestamp: Date.now(),
      scopeId,
      path: `memorySlots.${key}`,
      oldValue: key,
      newValue: undefined,
      operation: 'DELETE',
    });

    return true;
  }

  public getSnapshot(scopeId?: string): Record<string, any> {
    if (scopeId) {
      const s = this.scopes.get(scopeId);
      return s ? JSON.parse(JSON.stringify(s)) : {};
    }

    const allSnapshots: Record<string, any> = {};
    for (const [id, s] of this.scopes.entries()) {
      allSnapshots[id] = JSON.parse(JSON.stringify(s));
    }
    return allSnapshots;
  }

  public restoreSnapshot(snapshot: Record<string, any>, scopeId?: string): void {
    if (scopeId && snapshot.id) {
      this.scopes.set(scopeId, JSON.parse(JSON.stringify(snapshot)));
      return;
    }

    this.scopes.clear();
    for (const [id, s] of Object.entries(snapshot)) {
      this.scopes.set(id, JSON.parse(JSON.stringify(s)));
    }

    if (!this.scopes.has(this.rootScopeId)) {
      this.initRootScope();
    }
  }

  public getDiffHistory(limit: number = 50): ContextDiff[] {
    return this.diffHistory.slice(-limit);
  }

  /**
   * Generates token-budgeted, structured context ready for LLM Prompt injection
   */
  public aggregateContextForAI(config?: TokenBudgetConfig, targetScopeId?: string): AggregatedAIContext {
    const scopeId = targetScopeId || this.rootScopeId;
    const hierarchy: string[] = [];
    let current = this.scopes.get(scopeId);

    const mergedVariables: Record<string, any> = {};
    const memoriesMap: Map<string, MemorySlot> = new Map();

    // Traverse upwards to inherit global parent data
    const pathScopes: ContextScope[] = [];
    while (current) {
      pathScopes.unshift(current);
      if (current.parentScopeId) {
        current = this.scopes.get(current.parentScopeId);
      } else {
        break;
      }
    }

    for (const s of pathScopes) {
      hierarchy.push(`${s.name} [${s.id}]`);
      Object.assign(mergedVariables, JSON.parse(JSON.stringify(s.variables)));
      for (const slot of this.getMemorySlots(s.id, config?.minImportanceThreshold ?? 3)) {
        memoriesMap.set(slot.key, slot);
      }
    }

    const relevantMemories = Array.from(memoriesMap.values()).sort(
      (a, b) => b.importance - a.importance || b.updatedAt - a.updatedAt
    );

    // Create system prompt block
    const sysPrompt = [
      '### SYSTEM CONTEXT & ACTIVE STATE ###',
      `Hierarchy: ${hierarchy.join(' -> ')}`,
      `Active Context Variables: ${JSON.stringify(mergedVariables, null, 2)}`,
      relevantMemories.length > 0
        ? `Long-Term/Working Memory Slots:\n${relevantMemories
            .map((m) => `- [Importance ${m.importance}/10] ${m.key}: ${JSON.stringify(m.value)} ${m.summary ? `(${m.summary})` : ''}`)
            .join('\n')}`
        : 'Memory: None',
      '#####################################',
    ].join('\n\n');

    // Rough token estimator (~4 chars per token)
    const estimatedTokens = Math.ceil(sysPrompt.length / 4);

    return {
      systemPromptAddition: sysPrompt,
      structuredContext: mergedVariables,
      relevantMemories,
      estimatedTokens,
      scopeHierarchy: hierarchy,
      generatedAt: Date.now(),
    };
  }

  public transaction<R>(fn: (ctx: IContextEngine) => R, _scopeId?: string): R {
    if (this.isTransactionActive) {
      return fn(this);
    }

    this.isTransactionActive = true;
    this.transactionBackup = new Map();
    for (const [k, v] of this.scopes.entries()) {
      this.transactionBackup.set(k, JSON.parse(JSON.stringify(v)));
    }

    try {
      const result = fn(this);
      this.isTransactionActive = false;
      this.transactionBackup = undefined;
      return result;
    } catch (error) {
      // Rollback
      this.scopes = this.transactionBackup!;
      this.isTransactionActive = false;
      this.transactionBackup = undefined;
      throw error;
    }
  }

  public reset(): void {
    this.scopes.clear();
    this.diffHistory = [];
    this.initRootScope();
  }

  // --------------------------------------------------------------------------
  // Internal Helpers
  // --------------------------------------------------------------------------

  private recordDiff(diff: ContextDiff): void {
    this.diffHistory.push(diff);
    if (this.diffHistory.length > this.maxDiffHistorySize) {
      this.diffHistory.shift();
    }

    // Trigger matching watchers
    for (const watcher of this.watchers.values()) {
      if (watcher.scopeId && watcher.scopeId !== diff.scopeId) {
        continue;
      }

      if (this.matchPath(watcher.pattern, diff.path)) {
        const scope = this.scopes.get(diff.scopeId);
        if (scope) {
          try {
            watcher.callback(diff, scope);
          } catch (e) {
            console.error('Error in context watcher callback:', e);
          }
        }
      }
    }
  }

  private matchPath(pattern: string, path: string): boolean {
    if (pattern === '*' || pattern === '**' || pattern === path) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return path.startsWith(prefix);
    }
    return false;
  }

  private getByPath(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = path.split('.');
    let cur = obj;
    for (const part of parts) {
      if (cur === null || cur === undefined) return undefined;
      cur = cur[part];
    }
    return cur;
  }

  private setByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in cur) || typeof cur[part] !== 'object' || cur[part] === null) {
        cur[part] = {};
      }
      cur = cur[part];
    }
    cur[parts[parts.length - 1]] = value;
  }

  private deleteByPath(obj: any, path: string): void {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!cur[part] || typeof cur[part] !== 'object') return;
      cur = cur[part];
    }
    delete cur[parts[parts.length - 1]];
  }
}

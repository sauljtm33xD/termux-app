/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DeadLetterEntry,
  EngineEvent,
  EngineMetrics,
  EventHandler,
  EventMetadata,
  EventPriority,
  IEventEngine,
  Middleware,
  Subscription,
} from './types';

export class EventEngineImpl implements IEventEngine {
  private subscriptions: Map<string, Subscription> = new Map();
  private middlewares: Middleware[] = [];
  private history: EngineEvent<any>[] = [];
  private deadLetterQueue: Map<string, DeadLetterEntry> = new Map();
  private maxHistorySize: number;
  private startTime: number = Date.now();

  // Metrics state
  private metrics: EngineMetrics = {
    eventsPublished: 0,
    eventsProcessed: 0,
    eventsFailed: 0,
    eventsInDLQ: 0,
    activeSubscriptions: 0,
    avgDispatchLatencyMs: 0,
    peakThroughputPerSec: 0,
    totalContextMutations: 0,
    activeContextScopes: 0,
    activeRules: 0,
    uptimeSeconds: 0,
  };

  private latencySamples: number[] = [];
  private throughputWindow: number[] = [];
  private listeners: Set<(event: EngineEvent<any>) => void> = new Set();

  constructor(options?: { maxHistorySize?: number }) {
    this.maxHistorySize = options?.maxHistorySize ?? 1000;
    this.setupDefaultMiddlewares();
  }

  private setupDefaultMiddlewares(): void {
    // Built-in Telemetry & Sanitization Middleware
    this.use({
      name: 'telemetry-sanitizer',
      beforePublish: (event) => {
        if (!event.id) {
          event.id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }
        if (!event.metadata.timestamp) {
          event.metadata.timestamp = Date.now();
        }
        if (!event.metadata.priority) {
          event.metadata.priority = 'NORMAL';
        }
        if (!event.metadata.traceId) {
          event.metadata.traceId = `trc_${Math.random().toString(36).substring(2, 10)}`;
        }
        return event;
      },
      afterDispatch: (_event, _sub, durationMs) => {
        this.recordLatency(durationMs);
      },
      onError: (event, error) => {
        console.warn(`[EventEngine] Error in handler for topic '${event.topic}':`, error.message);
      },
    });
  }

  /**
   * Subscribe to internal event bus notifications (useful for UI live monitors)
   */
  public onAnyEvent(listener: (event: EngineEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async publish<T = Record<string, unknown>>(
    topic: string,
    payload: T,
    metadata?: Partial<EventMetadata>
  ): Promise<EngineEvent<T>> {
    let event: EngineEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      topic,
      payload,
      metadata: {
        timestamp: Date.now(),
        source: 'engine.core',
        priority: 'NORMAL',
        retryCount: 0,
        maxRetries: 3,
        ...metadata,
      },
      status: 'PENDING',
    };

    // Execute beforePublish middlewares
    for (const mw of this.middlewares) {
      if (mw.beforePublish) {
        try {
          const result = await mw.beforePublish(event);
          if (result === null) {
            event.status = 'SKIPPED';
            this.pushHistory(event);
            return event;
          }
          event = result as EngineEvent<T>;
        } catch (err: any) {
          console.error(`Middleware ${mw.name} failed on beforePublish:`, err);
        }
      }
    }

    this.metrics.eventsPublished++;
    this.recordThroughput();
    event.status = 'DISPATCHED';

    const startTime = performance.now();

    // Find matching subscriptions
    const matchingSubs = this.findMatchingSubscriptions(event.topic);
    
    // Sort subscriptions by priority descending
    matchingSubs.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    let dispatchSuccess = true;
    let lastError: Error | undefined;

    if (matchingSubs.length === 0) {
      // Dispatched with no subscribers
      event.status = 'PROCESSED';
      event.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      this.pushHistory(event);
      this.notifyListeners(event);
      return event;
    }

    for (const sub of matchingSubs) {
      if (!sub.active) continue;

      // Filter check
      if (sub.filter && !sub.filter(event)) {
        continue;
      }

      // Check middleware beforeDispatch
      let shouldProceed = true;
      for (const mw of this.middlewares) {
        if (mw.beforeDispatch) {
          try {
            const allow = await mw.beforeDispatch(event, sub);
            if (!allow) {
              shouldProceed = false;
              break;
            }
          } catch (e) {
            console.error(`Middleware ${mw.name} failed beforeDispatch`, e);
          }
        }
      }

      if (!shouldProceed) continue;

      const subStartTime = performance.now();
      try {
        await sub.handler(event);
        sub.invocationCount++;
        sub.lastInvokedAt = Date.now();

        const duration = performance.now() - subStartTime;
        for (const mw of this.middlewares) {
          if (mw.afterDispatch) {
            try {
              await mw.afterDispatch(event, sub, duration);
            } catch (e) {
              console.error(`Middleware ${mw.name} afterDispatch error:`, e);
            }
          }
        }
      } catch (err: any) {
        dispatchSuccess = false;
        lastError = err instanceof Error ? err : new Error(String(err));
        sub.errorCount++;

        for (const mw of this.middlewares) {
          if (mw.onError) {
            try {
              await mw.onError(event, lastError, sub);
            } catch (e) {
              console.error(`Middleware ${mw.name} onError failed:`, e);
            }
          }
        }
      }
    }

    const totalDuration = performance.now() - startTime;
    event.executionTimeMs = Math.round(totalDuration * 100) / 100;

    if (dispatchSuccess) {
      event.status = 'PROCESSED';
      this.metrics.eventsProcessed++;
    } else {
      event.status = 'FAILED';
      event.error = lastError?.message ?? 'Handler execution failed';
      this.metrics.eventsFailed++;
      this.handleDeadLetter(event, lastError?.message || 'Execution error');
    }

    this.pushHistory(event);
    this.notifyListeners(event);

    return event;
  }

  public async publishBatch(
    events: Array<{ topic: string; payload: any; metadata?: Partial<EventMetadata> }>
  ): Promise<EngineEvent[]> {
    // Sort batch by priority if provided
    const priorityWeight: Record<EventPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      NORMAL: 2,
      LOW: 1,
    };

    const sortedEvents = [...events].sort((a, b) => {
      const pA = priorityWeight[a.metadata?.priority || 'NORMAL'];
      const pB = priorityWeight[b.metadata?.priority || 'NORMAL'];
      return pB - pA;
    });

    const results: EngineEvent[] = [];
    for (const item of sortedEvents) {
      const res = await this.publish(item.topic, item.payload, item.metadata);
      results.push(res);
    }
    return results;
  }

  public subscribe<T = Record<string, unknown>>(
    topicPattern: string,
    handler: EventHandler<T>,
    options?: {
      filter?: (event: EngineEvent<T>) => boolean;
      priority?: number;
      name?: string;
    }
  ): Subscription {
    const sub: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      topicPattern,
      handler,
      filter: options?.filter,
      priority: options?.priority ?? 0,
      name: options?.name ?? `Sub-${topicPattern}`,
      active: true,
      createdAt: Date.now(),
      invocationCount: 0,
      errorCount: 0,
    };

    this.subscriptions.set(sub.id, sub);
    this.metrics.activeSubscriptions = this.subscriptions.size;
    return sub;
  }

  public unsubscribe(subscriptionId: string): boolean {
    const deleted = this.subscriptions.delete(subscriptionId);
    this.metrics.activeSubscriptions = this.subscriptions.size;
    return deleted;
  }

  public use(middleware: Middleware): void {
    const existingIndex = this.middlewares.findIndex((m) => m.name === middleware.name);
    if (existingIndex >= 0) {
      this.middlewares[existingIndex] = middleware;
    } else {
      this.middlewares.push(middleware);
    }
  }

  public removeMiddleware(name: string): boolean {
    const index = this.middlewares.findIndex((m) => m.name === name);
    if (index >= 0) {
      this.middlewares.splice(index, 1);
      return true;
    }
    return false;
  }

  public getHistory(limit: number = 50, filterTopic?: string): EngineEvent[] {
    let list = [...this.history];
    if (filterTopic) {
      list = list.filter((e) => this.matchTopic(filterTopic, e.topic));
    }
    return list.slice(-limit);
  }

  public async replay(fromTimestampOrId: number | string, toTimestamp?: number): Promise<number> {
    let startIndex = -1;
    if (typeof fromTimestampOrId === 'string') {
      startIndex = this.history.findIndex((e) => e.id === fromTimestampOrId);
    } else {
      startIndex = this.history.findIndex((e) => e.metadata.timestamp >= fromTimestampOrId);
    }

    if (startIndex === -1) {
      return 0;
    }

    const eventsToReplay = this.history.slice(startIndex).filter((e) => {
      if (toTimestamp && e.metadata.timestamp > toTimestamp) {
        return false;
      }
      return true;
    });

    let replayedCount = 0;
    for (const evt of eventsToReplay) {
      await this.publish(evt.topic, evt.payload, {
        ...evt.metadata,
        correlationId: evt.id,
        source: `${evt.metadata.source || 'replayer'}:replay`,
      });
      replayedCount++;
    }

    return replayedCount;
  }

  public getDeadLetterQueue(): DeadLetterEntry[] {
    return Array.from(this.deadLetterQueue.values());
  }

  public async retryDeadLetter(dlqEntryId: string): Promise<boolean> {
    const entry = this.deadLetterQueue.get(dlqEntryId);
    if (!entry) return false;

    entry.retriesAttempted++;
    const maxRetries = entry.event.metadata.maxRetries ?? 3;

    try {
      const res = await this.publish(entry.event.topic, entry.event.payload, {
        ...entry.event.metadata,
        retryCount: entry.retriesAttempted,
      });

      if (res.status === 'PROCESSED') {
        this.deadLetterQueue.delete(dlqEntryId);
        this.metrics.eventsInDLQ = this.deadLetterQueue.size;
        return true;
      }
    } catch {
      // Continue tracking in DLQ
    }

    if (entry.retriesAttempted >= maxRetries) {
      entry.reason = `Max retries (${maxRetries}) exceeded: ${entry.reason}`;
    }

    this.metrics.eventsInDLQ = this.deadLetterQueue.size;
    return false;
  }

  public async retryAllDeadLetters(): Promise<number> {
    let success = 0;
    const entries = Array.from(this.deadLetterQueue.values());
    for (const entry of entries) {
      const ok = await this.retryDeadLetter(entry.id);
      if (ok) success++;
    }
    return success;
  }

  public clearDeadLetterQueue(): void {
    this.deadLetterQueue.clear();
    this.metrics.eventsInDLQ = 0;
  }

  public clearHistory(): void {
    this.history = [];
  }

  public getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getMetrics(): EngineMetrics {
    this.metrics.uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    this.metrics.activeSubscriptions = this.subscriptions.size;
    this.metrics.eventsInDLQ = this.deadLetterQueue.size;
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.metrics = {
      eventsPublished: 0,
      eventsProcessed: 0,
      eventsFailed: 0,
      eventsInDLQ: this.deadLetterQueue.size,
      activeSubscriptions: this.subscriptions.size,
      avgDispatchLatencyMs: 0,
      peakThroughputPerSec: 0,
      totalContextMutations: this.metrics.totalContextMutations,
      activeContextScopes: this.metrics.activeContextScopes,
      activeRules: this.metrics.activeRules,
      uptimeSeconds: 0,
    };
    this.latencySamples = [];
    this.throughputWindow = [];
    this.startTime = Date.now();
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  private findMatchingSubscriptions(topic: string): Subscription[] {
    const matched: Subscription[] = [];
    for (const sub of this.subscriptions.values()) {
      if (this.matchTopic(sub.topicPattern, topic)) {
        matched.push(sub);
      }
    }
    return matched;
  }

  /**
   * Topic matching algorithm supports:
   * - Exact: "user.created"
   * - Single-segment wildcard: "order.*" matches "order.placed" but not "order.placed.vip"
   * - Multi-segment wildcard: "system.**" or "system.#" matches "system.auth.login.failed"
   * - Global wildcard: "*" or "**"
   */
  public matchTopic(pattern: string, topic: string): boolean {
    if (pattern === '*' || pattern === '**' || pattern === '#') return true;
    if (pattern === topic) return true;

    const patternParts = pattern.split('.');
    const topicParts = topic.split('.');

    let pIdx = 0;
    let tIdx = 0;

    while (pIdx < patternParts.length && tIdx < topicParts.length) {
      const pPart = patternParts[pIdx];

      if (pPart === '**' || pPart === '#') {
        // Multi-level wildcard matches rest of topic
        if (pIdx === patternParts.length - 1) return true;
        // Search next segment
        const nextP = patternParts[pIdx + 1];
        while (tIdx < topicParts.length && topicParts[tIdx] !== nextP) {
          tIdx++;
        }
        pIdx++;
        continue;
      }

      if (pPart === '*' || pPart === topicParts[tIdx]) {
        pIdx++;
        tIdx++;
        continue;
      }

      return false;
    }

    if (pIdx < patternParts.length && (patternParts[pIdx] === '**' || patternParts[pIdx] === '#')) {
      return true;
    }

    return pIdx === patternParts.length && tIdx === topicParts.length;
  }

  private handleDeadLetter(event: EngineEvent<any>, reason: string): void {
    const entryId = `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.deadLetterQueue.set(entryId, {
      id: entryId,
      event,
      failedAt: Date.now(),
      reason,
      retriesAttempted: event.metadata.retryCount || 0,
      stackTrace: event.error,
    });
    this.metrics.eventsInDLQ = this.deadLetterQueue.size;
  }

  private pushHistory(event: EngineEvent<any>): void {
    this.history.push(event);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  private recordLatency(ms: number): void {
    this.latencySamples.push(ms);
    if (this.latencySamples.length > 100) {
      this.latencySamples.shift();
    }
    const sum = this.latencySamples.reduce((a, b) => a + b, 0);
    this.metrics.avgDispatchLatencyMs = Math.round((sum / this.latencySamples.length) * 100) / 100;
  }

  private recordThroughput(): void {
    const now = Date.now();
    this.throughputWindow.push(now);
    // Keep window within last 1000ms
    this.throughputWindow = this.throughputWindow.filter((t) => now - t <= 1000);
    const count = this.throughputWindow.length;
    if (count > this.metrics.peakThroughputPerSec) {
      this.metrics.peakThroughputPerSec = count;
    }
  }

  private notifyListeners(event: EngineEvent<any>): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in event listener:', err);
      }
    }
  }
}

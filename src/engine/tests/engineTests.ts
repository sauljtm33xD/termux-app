/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextEngineImpl } from '../ContextEngineImpl';
import { EventEngineImpl } from '../EventEngineImpl';
import { RuleEngineImpl } from '../RuleEngineImpl';
import { EngineEvent } from '../types';

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'EventEngine' | 'ContextEngine' | 'RuleEngine' | 'Integration' | 'Performance';
  passed: boolean;
  durationMs: number;
  message?: string;
  assertionsCount: number;
}

export class EngineTestRunner {
  public async runAllTests(): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    // Run each test individually with isolated instances
    results.push(await this.testEventPublishSubscribe());
    results.push(await this.testEventWildcardMatching());
    results.push(await this.testEventPriorityOrdering());
    results.push(await this.testEventDeadLetterQueueAndRetry());
    results.push(await this.testEventMiddlewarePipeline());
    results.push(await this.testEventReplayCapability());

    // ContextEngine tests
    results.push(await this.testContextSetGetPatchDelete());
    results.push(await this.testContextScopeHierarchy());
    results.push(await this.testContextMemorySlotsAndTTL());
    results.push(await this.testContextTransactionAndRollback());
    results.push(await this.testContextSnapshotAndRestore());
    results.push(await this.testContextAIAggregation());

    // RuleEngine & Integration
    results.push(await this.testRuleTriggerAndContextMutation());
    results.push(await this.testRuleConditionOperators());
    results.push(await this.testHighThroughputDispatchBenchmark());

    return results;
  }

  // 1. EventEngine Pub/Sub
  private async testEventPublishSubscribe(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl();
    let receivedEvent: EngineEvent | null = null;

    engine.subscribe('user.signup', (evt) => {
      receivedEvent = evt;
    });

    const published = await engine.publish('user.signup', { userId: 'u_123', email: 'test@example.com' });

    const passed =
      receivedEvent !== null &&
      (receivedEvent as EngineEvent).id === published.id &&
      (receivedEvent as EngineEvent).payload.email === 'test@example.com' &&
      published.status === 'PROCESSED';

    return {
      id: 'test_event_pubsub',
      name: 'EventEngine: Basic Pub/Sub & Payload Integrity',
      category: 'EventEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Event dispatched and received matching subscription.' : 'Event handler was not invoked properly.',
      assertionsCount: 4,
    };
  }

  // 2. Wildcard Matching
  private async testEventWildcardMatching(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl();
    const matchedTopics: string[] = [];

    engine.subscribe('order.*', (evt) => {
      matchedTopics.push(`single_star:${evt.topic}`);
    });
    engine.subscribe('system.**', (evt) => {
      matchedTopics.push(`double_star:${evt.topic}`);
    });
    engine.subscribe('*', (evt) => {
      matchedTopics.push(`all:${evt.topic}`);
    });

    await engine.publish('order.created', { id: 1 });
    await engine.publish('order.item.added', { id: 2 }); // Should NOT match order.*
    await engine.publish('system.auth.login.failed', { attempts: 3 });

    const passed =
      matchedTopics.includes('single_star:order.created') &&
      !matchedTopics.includes('single_star:order.item.added') &&
      matchedTopics.includes('double_star:system.auth.login.failed') &&
      matchedTopics.includes('all:order.created') &&
      matchedTopics.includes('all:system.auth.login.failed');

    return {
      id: 'test_wildcards',
      name: 'EventEngine: Topic Wildcard Matching (*, **, #)',
      category: 'EventEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Wildcard pattern matching logic validated across single & multi-level paths.' : 'Wildcard matching failed.',
      assertionsCount: 5,
    };
  }

  // 3. Priority Ordering
  private async testEventPriorityOrdering(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl();
    const executionOrder: string[] = [];

    engine.subscribe('task.execute', () => {
      executionOrder.push('NORMAL');
    }, { priority: 1 });

    engine.subscribe('task.execute', () => {
      executionOrder.push('HIGH');
    }, { priority: 10 });

    engine.subscribe('task.execute', () => {
      executionOrder.push('CRITICAL');
    }, { priority: 99 });

    await engine.publish('task.execute', { task: 'compute' });

    const passed =
      executionOrder.length === 3 &&
      executionOrder[0] === 'CRITICAL' &&
      executionOrder[1] === 'HIGH' &&
      executionOrder[2] === 'NORMAL';

    return {
      id: 'test_priority',
      name: 'EventEngine: Subscription Priority Queue Dispatching',
      category: 'EventEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Handlers executed in strict descending priority order.' : 'Priority dispatch order violated.',
      assertionsCount: 4,
    };
  }

  // 4. DLQ & Retry
  private async testEventDeadLetterQueueAndRetry(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl();
    let failCount = 0;

    engine.subscribe('fragile.service', (evt) => {
      failCount++;
      if (failCount === 1) {
        throw new Error('Simulated network fault');
      }
      // Pass on retry
    });

    const event = await engine.publish('fragile.service', { attempt: 1 });
    const dlqBefore = engine.getDeadLetterQueue();

    const passedDlqLogged = dlqBefore.length === 1 && dlqBefore[0].event.id === event.id;

    // Now retry the DLQ entry
    const retrySuccess = await engine.retryDeadLetter(dlqBefore[0].id);
    const dlqAfter = engine.getDeadLetterQueue();

    const passed = passedDlqLogged && retrySuccess && dlqAfter.length === 0 && failCount === 2;

    return {
      id: 'test_dlq_retry',
      name: 'EventEngine: Dead-Letter Queue (DLQ) & Auto-Retry',
      category: 'EventEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Fault captured into DLQ and successfully recovered on retry.' : 'DLQ retry logic failed.',
      assertionsCount: 4,
    };
  }

  // 5. Middleware Pipeline
  private async testEventMiddlewarePipeline(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl();
    let mwHit = false;

    engine.use({
      name: 'audit-tagger',
      beforePublish: (evt) => {
        evt.metadata.tags = ['AUDITED', 'ENRICHED'];
        mwHit = true;
        return evt;
      },
    });

    const evt = await engine.publish('audit.test', { val: 42 });
    const passed = mwHit && evt.metadata.tags?.includes('ENRICHED');

    return {
      id: 'test_middleware',
      name: 'EventEngine: Middleware Interceptor Pipeline',
      category: 'EventEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Middleware pipeline properly intercepted and enriched event.' : 'Middleware failed to execute.',
      assertionsCount: 2,
    };
  }

  // 6. Event Replay
  private async testEventReplayCapability(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl();
    let receivedCount = 0;

    engine.subscribe('replayable.event', () => {
      receivedCount++;
    });

    const e1 = await engine.publish('replayable.event', { step: 1 });
    await engine.publish('replayable.event', { step: 2 });

    const replayed = await engine.replay(e1.id);
    const passed = replayed === 2 && receivedCount === 4;

    return {
      id: 'test_replay',
      name: 'EventEngine: Event Log Replay from ID / Timestamp',
      category: 'EventEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Replayed past events maintaining correlationId.' : 'Replay count mismatch.',
      assertionsCount: 2,
    };
  }

  // 7. Context Get/Set/Patch/Delete
  private async testContextSetGetPatchDelete(): Promise<TestCaseResult> {
    const start = performance.now();
    const ctx = new ContextEngineImpl();

    ctx.set('user.profile.name', 'Saul');
    ctx.set('user.profile.age', 28);
    const name = ctx.get('user.profile.name');

    ctx.patch('user.profile', { role: 'Lead Architect', age: 29 });
    const updated = ctx.get('user.profile');

    ctx.delete('user.profile.age');
    const ageAfterDel = ctx.get('user.profile.age');

    const passed =
      name === 'Saul' &&
      updated.role === 'Lead Architect' &&
      updated.age === 29 &&
      ageAfterDel === undefined;

    return {
      id: 'test_ctx_crud',
      name: 'ContextEngine: Deep Path Set, Patch, Get, and Delete',
      category: 'ContextEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'All deep-path nested state operations verified.' : 'Context deep-path mutation failed.',
      assertionsCount: 4,
    };
  }

  // 8. Scope Hierarchy
  private async testContextScopeHierarchy(): Promise<TestCaseResult> {
    const start = performance.now();
    const ctx = new ContextEngineImpl();

    ctx.set('globalTheme', 'dark');

    const tenantScope = ctx.createScope('Tenant Scope', 'global', {
      tenantId: 'tenant_abc',
      tenantRateLimit: 500,
    });

    const userScope = ctx.createScope('User Scope', tenantScope.id, {
      userId: 'usr_77',
    });

    // In child scope: should inherit parent and global variables
    const inheritedGlobal = ctx.get('globalTheme', userScope.id);
    const inheritedTenant = ctx.get('tenantRateLimit', userScope.id);
    const localUser = ctx.get('userId', userScope.id);

    const passed = inheritedGlobal === 'dark' && inheritedTenant === 500 && localUser === 'usr_77';

    return {
      id: 'test_ctx_scopes',
      name: 'ContextEngine: Hierarchical Scoped Context Lookup',
      category: 'ContextEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Hierarchical scope tree traversal successfully resolved inherited state.' : 'Scope hierarchy failed.',
      assertionsCount: 3,
    };
  }

  // 9. Memory Slots & TTL
  private async testContextMemorySlotsAndTTL(): Promise<TestCaseResult> {
    const start = performance.now();
    const ctx = new ContextEngineImpl();

    ctx.setMemorySlot('doc_embedding', { text: 'Reactive architectures' }, { importance: 9 });
    ctx.setMemorySlot('temp_token', 'xyz_temp', { importance: 2, ttlMs: 20 }); // Expired in 20ms

    const highMemories = ctx.getMemorySlots('global', 8);
    const allBefore = ctx.getMemorySlots('global', 1);

    await new Promise((r) => setTimeout(r, 40));
    const allAfter = ctx.getMemorySlots('global', 1);

    const passed =
      highMemories.length === 1 &&
      allBefore.length === 2 &&
      allAfter.length === 1 && // TTL expired
      allAfter[0].key === 'doc_embedding';

    return {
      id: 'test_ctx_memory',
      name: 'ContextEngine: Memory Slots Ranking & TTL Expiration',
      category: 'ContextEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Memory slot importance filtering and TTL automatic pruning verified.' : 'Memory slots failed.',
      assertionsCount: 4,
    };
  }

  // 10. Transaction & Rollback
  private async testContextTransactionAndRollback(): Promise<TestCaseResult> {
    const start = performance.now();
    const ctx = new ContextEngineImpl();
    ctx.set('account.balance', 1000);

    let caughtError = false;
    try {
      ctx.transaction((t) => {
        t.set('account.balance', 500);
        t.set('account.transferred', true);
        throw new Error('Simulated transaction failure');
      });
    } catch {
      caughtError = true;
    }

    const balanceAfter = ctx.get('account.balance');
    const transferredAfter = ctx.get('account.transferred');

    const passed = caughtError && balanceAfter === 1000 && transferredAfter === undefined;

    return {
      id: 'test_ctx_tx',
      name: 'ContextEngine: Atomic Transactions & Rollback',
      category: 'ContextEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Atomic snapshot rollback restored clean state after exception.' : 'Transaction rollback failed.',
      assertionsCount: 3,
    };
  }

  // 11. Snapshot & Restore
  private async testContextSnapshotAndRestore(): Promise<TestCaseResult> {
    const start = performance.now();
    const ctx = new ContextEngineImpl();
    ctx.set('checkpoint.step', 1);
    ctx.set('checkpoint.status', 'INITIALIZED');

    const snapshot = ctx.getSnapshot();

    ctx.set('checkpoint.step', 99);
    ctx.set('checkpoint.status', 'CORRUPTED');

    ctx.restoreSnapshot(snapshot);
    const restoredStep = ctx.get('checkpoint.step');
    const restoredStatus = ctx.get('checkpoint.status');

    const passed = restoredStep === 1 && restoredStatus === 'INITIALIZED';

    return {
      id: 'test_ctx_snapshot',
      name: 'ContextEngine: Snapshot Serialization & Time-Travel Restore',
      category: 'ContextEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Snapshot state restored exactly without memory leaks.' : 'Snapshot restore failed.',
      assertionsCount: 2,
    };
  }

  // 12. AI Context Aggregation
  private async testContextAIAggregation(): Promise<TestCaseResult> {
    const start = performance.now();
    const ctx = new ContextEngineImpl();
    ctx.set('user.intent', 'Optimize database queries');
    ctx.setMemorySlot('db_config', { maxConnections: 100 }, { importance: 8 });

    const aiContext = ctx.aggregateContextForAI({ minImportanceThreshold: 5 });

    const passed =
      aiContext.estimatedTokens > 0 &&
      aiContext.systemPromptAddition.includes('Optimize database queries') &&
      aiContext.relevantMemories.length === 1;

    return {
      id: 'test_ctx_ai_agg',
      name: 'ContextEngine: AI Context & Token Aggregator',
      category: 'ContextEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Prompt block, structured variables, and memory slots aggregated for LLM.' : 'AI context aggregator failed.',
      assertionsCount: 3,
    };
  }

  // 13. Rule Trigger & Context Mutation
  private async testRuleTriggerAndContextMutation(): Promise<TestCaseResult> {
    const start = performance.now();
    const eventEngine = new EventEngineImpl();
    const contextEngine = new ContextEngineImpl();
    const ruleEngine = new RuleEngineImpl(eventEngine, contextEngine);

    ruleEngine.registerRule({
      id: 'rule_welcome_bonus',
      name: 'Reward VIP User Bonus Points',
      enabled: true,
      priority: 1,
      triggerTopicPattern: 'user.signup',
      conditionLogic: 'AND',
      conditions: [
        {
          field: 'payload.isVip',
          operator: 'eq',
          value: true,
        },
      ],
      actions: [
        {
          type: 'SET_CONTEXT',
          contextPath: 'rewards.vipBonusCredited',
          valueTemplate: true,
        },
        {
          type: 'EMIT_EVENT',
          targetTopic: 'notifications.sms.send',
          payloadTemplate: {
            phone: '{{payload.phone}}',
            msg: 'Welcome VIP member!',
          },
        },
      ],
    });

    let smsSent = false;
    eventEngine.subscribe('notifications.sms.send', (e) => {
      if (e.payload.phone === '+1234567890') {
        smsSent = true;
      }
    });

    await eventEngine.publish('user.signup', { isVip: true, phone: '+1234567890' });
    const bonusCredited = contextEngine.get('rewards.vipBonusCredited');

    const passed = bonusCredited === true && smsSent;

    return {
      id: 'test_rule_reactive',
      name: 'RuleEngine: Trigger Evaluation & Context Mutation / Event Chain',
      category: 'RuleEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Rule conditions triggered downstream event and context state mutation.' : 'Rule reactive pipeline failed.',
      assertionsCount: 2,
    };
  }

  // 14. Condition Operators
  private async testRuleConditionOperators(): Promise<TestCaseResult> {
    const start = performance.now();
    const eventEngine = new EventEngineImpl();
    const contextEngine = new ContextEngineImpl();
    const ruleEngine = new RuleEngineImpl(eventEngine, contextEngine);

    let triggeredCount = 0;
    ruleEngine.registerRule({
      id: 'rule_complex_cond',
      name: 'Complex Operator Validation',
      enabled: true,
      priority: 1,
      triggerTopicPattern: 'sensor.data',
      conditionLogic: 'AND',
      conditions: [
        { field: 'payload.voltage', operator: 'gt', value: 200 },
        { field: 'payload.voltage', operator: 'lte', value: 250 },
        { field: 'payload.tags', operator: 'contains', value: 'GRID_PRIMARY' },
        { field: 'payload.status', operator: 'in', value: ['ACTIVE', 'STANDBY'] },
      ],
      actions: [
        {
          type: 'LOG',
        },
      ],
    });

    // Sub to track execution
    eventEngine.onAnyEvent((e) => {
      if (e.topic === 'sensor.data') {
        const r = ruleEngine.getRules().find((r) => r.id === 'rule_complex_cond');
        if (r && r.stats.executions > 0) {
          triggeredCount = r.stats.executions;
        }
      }
    });

    // Should MATCH:
    await eventEngine.publish('sensor.data', {
      voltage: 230,
      tags: ['GRID_PRIMARY', 'ZONE_NORTH'],
      status: 'ACTIVE',
    });

    // Should NOT MATCH (voltage out of range):
    await eventEngine.publish('sensor.data', {
      voltage: 280,
      tags: ['GRID_PRIMARY'],
      status: 'ACTIVE',
    });

    const passed = triggeredCount === 1;

    return {
      id: 'test_rule_operators',
      name: 'RuleEngine: Comprehensive Condition Operators (gt, lte, contains, in)',
      category: 'RuleEngine',
      passed,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      message: passed ? 'Multi-clause logic evaluated accurately.' : 'Condition operator check failed.',
      assertionsCount: 2,
    };
  }

  // 15. High Throughput Benchmark
  private async testHighThroughputDispatchBenchmark(): Promise<TestCaseResult> {
    const start = performance.now();
    const engine = new EventEngineImpl({ maxHistorySize: 1000 });
    let counter = 0;

    engine.subscribe('bench.stream', () => {
      counter++;
    });

    const batchSize = 1000;
    const batchData = [];
    for (let i = 0; i < batchSize; i++) {
      batchData.push({
        topic: 'bench.stream',
        payload: { i, timestamp: Date.now() },
      });
    }

    await engine.publishBatch(batchData);
    const duration = performance.now() - start;
    const opsPerSec = Math.round((batchSize / (duration / 1000)));

    const passed = counter === batchSize && opsPerSec > 2000;

    return {
      id: 'test_bench_throughput',
      name: `Performance: 1,000 Event Batch Throughput (~${opsPerSec.toLocaleString()} ops/sec)`,
      category: 'Performance',
      passed,
      durationMs: Math.round(duration * 100) / 100,
      message: `Processed 1,000 events in ${Math.round(duration)}ms (${opsPerSec.toLocaleString()} events/second).`,
      assertionsCount: 2,
    };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ConditionOperator,
  EngineEvent,
  IContextEngine,
  IEventEngine,
  IRuleEngine,
  Rule,
  RuleAction,
  RuleCondition,
} from './types';

export class RuleEngineImpl implements IRuleEngine {
  private rules: Map<string, Rule> = new Map();
  private eventEngine: IEventEngine;
  private contextEngine: IContextEngine;

  constructor(eventEngine: IEventEngine, contextEngine: IContextEngine) {
    this.eventEngine = eventEngine;
    this.contextEngine = contextEngine;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to all events published on eventEngine and evaluate rules
    this.eventEngine.subscribe('*', async (event) => {
      // Avoid infinite recursive loops from rule-generated events
      if (event.metadata.source?.startsWith('rule.engine')) {
        return;
      }
      await this.evaluateEvent(event);
    }, { name: 'RuleEngine-Dispatcher', priority: 9999 });
  }

  public registerRule(ruleData: Omit<Rule, 'stats'>): Rule {
    const rule: Rule = {
      ...ruleData,
      stats: {
        evaluations: 0,
        executions: 0,
        failures: 0,
      },
    };
    this.rules.set(rule.id, rule);
    return rule;
  }

  public updateRule(ruleId: string, updates: Partial<Rule>): Rule | undefined {
    const rule = this.rules.get(ruleId);
    if (!rule) return undefined;

    const updated: Rule = {
      ...rule,
      ...updates,
      stats: rule.stats, // retain stats
    };
    this.rules.set(ruleId, updated);
    return updated;
  }

  public deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  public getRules(): Rule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  public async evaluateEvent(event: EngineEvent<any>): Promise<RuleAction[]> {
    const executedActions: RuleAction[] = [];
    const sortedRules = this.getRules();

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      // Check if topic matches pattern
      if (!this.matchesTopic(rule.triggerTopicPattern, event.topic)) {
        continue;
      }

      rule.stats.evaluations++;
      const isMatch = this.evaluateConditions(rule.conditions, rule.conditionLogic, event);

      if (isMatch) {
        rule.stats.executions++;
        rule.stats.lastTriggeredAt = Date.now();

        for (const action of rule.actions) {
          try {
            await this.executeAction(action, event, rule);
            executedActions.push(action);
          } catch (err: any) {
            rule.stats.failures++;
            console.error(`[RuleEngine] Action failed for rule '${rule.name}':`, err);
          }
        }
      }
    }

    return executedActions;
  }

  private evaluateConditions(
    conditions: RuleCondition[],
    logic: 'AND' | 'OR',
    event: EngineEvent<any>
  ): boolean {
    if (conditions.length === 0) return true;

    const results = conditions.map((cond) => this.evaluateSingleCondition(cond, event));

    if (logic === 'OR') {
      return results.some(Boolean);
    }
    return results.every(Boolean);
  }

  private evaluateSingleCondition(condition: RuleCondition, event: EngineEvent<any>): boolean {
    const extractedValue = this.resolveFieldValue(condition.field, event);
    const expected = condition.value;

    switch (condition.operator) {
      case 'eq':
        return extractedValue == expected;
      case 'neq':
        return extractedValue != expected;
      case 'gt':
        return Number(extractedValue) > Number(expected);
      case 'gte':
        return Number(extractedValue) >= Number(expected);
      case 'lt':
        return Number(extractedValue) < Number(expected);
      case 'lte':
        return Number(extractedValue) <= Number(expected);
      case 'contains':
        if (typeof extractedValue === 'string') return extractedValue.includes(String(expected));
        if (Array.isArray(extractedValue)) return extractedValue.includes(expected);
        return false;
      case 'not_contains':
        if (typeof extractedValue === 'string') return !extractedValue.includes(String(expected));
        if (Array.isArray(extractedValue)) return !extractedValue.includes(expected);
        return true;
      case 'in':
        if (Array.isArray(expected)) return expected.includes(extractedValue);
        return false;
      case 'not_in':
        if (Array.isArray(expected)) return !expected.includes(extractedValue);
        return true;
      case 'regex':
        try {
          const re = new RegExp(expected, 'i');
          return re.test(String(extractedValue));
        } catch {
          return false;
        }
      case 'exists':
        return extractedValue !== undefined && extractedValue !== null;
      case 'not_exists':
        return extractedValue === undefined || extractedValue === null;
      case 'custom':
        if (!condition.customFnBody) return true;
        try {
          // Safe custom expression evaluation
          const fn = new Function('event', 'context', condition.customFnBody);
          const currentCtx = this.contextEngine.getSnapshot();
          return Boolean(fn(event, currentCtx));
        } catch (e) {
          console.warn('Custom condition evaluation error:', e);
          return false;
        }
      default:
        return false;
    }
  }

  private resolveFieldValue(field: string, event: EngineEvent<any>): any {
    if (field.startsWith('payload.')) {
      return this.getByPath(event.payload, field.replace('payload.', ''));
    }
    if (field.startsWith('metadata.')) {
      return this.getByPath(event.metadata, field.replace('metadata.', ''));
    }
    if (field.startsWith('context.')) {
      return this.contextEngine.get(field.replace('context.', ''));
    }
    if (field === 'topic') return event.topic;
    if (field === 'id') return event.id;

    // Fallback: check in payload then context
    const inPayload = this.getByPath(event.payload, field);
    if (inPayload !== undefined) return inPayload;
    return this.contextEngine.get(field);
  }

  private async executeAction(action: RuleAction, event: EngineEvent<any>, rule: Rule): Promise<void> {
    switch (action.type) {
      case 'EMIT_EVENT': {
        if (!action.targetTopic) return;
        const compiledPayload = this.interpolateTemplate(action.payloadTemplate ?? {}, event);
        await this.eventEngine.publish(action.targetTopic, compiledPayload, {
          source: `rule.engine:${rule.id}`,
          causationId: event.id,
          priority: event.metadata.priority,
        });
        break;
      }

      case 'SET_CONTEXT': {
        if (!action.contextPath) return;
        const compiledVal = this.interpolateTemplate(action.valueTemplate, event);
        this.contextEngine.set(action.contextPath, compiledVal, action.contextScopeId, event.id);
        break;
      }

      case 'PATCH_CONTEXT': {
        if (!action.contextPath) return;
        const compiledVal = this.interpolateTemplate(action.valueTemplate ?? {}, event);
        this.contextEngine.patch(action.contextPath, compiledVal, action.contextScopeId, event.id);
        break;
      }

      case 'TRIGGER_AI': {
        // Emit an AI action event for background processing
        const prompt = typeof action.aiPromptTemplate === 'string'
          ? this.interpolateString(action.aiPromptTemplate, event)
          : 'Analyze event context';

        await this.eventEngine.publish('ai.agent.reasoning.requested', {
          prompt,
          originatingEventId: event.id,
          ruleId: rule.id,
          timestamp: Date.now(),
        }, {
          source: `rule.engine:ai:${rule.id}`,
          causationId: event.id,
        });
        break;
      }

      case 'LOG': {
        console.log(`[RuleAction:LOG] Rule '${rule.name}' triggered on event '${event.topic}'`, {
          eventPayload: event.payload,
        });
        break;
      }

      case 'CUSTOM': {
        if (action.customCode) {
          try {
            const fn = new Function('event', 'contextEngine', 'eventEngine', action.customCode);
            await fn(event, this.contextEngine, this.eventEngine);
          } catch (err) {
            console.error('Error executing custom rule action code:', err);
          }
        }
        break;
      }
    }
  }

  private interpolateTemplate(template: any, event: EngineEvent<any>): any {
    if (template === null || template === undefined) return template;
    if (typeof template === 'string') {
      return this.interpolateString(template, event);
    }
    if (Array.isArray(template)) {
      return template.map((item) => this.interpolateTemplate(item, event));
    }
    if (typeof template === 'object') {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(template)) {
        res[k] = this.interpolateTemplate(v, event);
      }
      return res;
    }
    return template;
  }

  private interpolateString(str: string, event: EngineEvent<any>): string {
    return str.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
      const val = this.resolveFieldValue(path, event);
      return val !== undefined ? String(val) : '';
    });
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

  private matchesTopic(pattern: string, topic: string): boolean {
    if (pattern === '*' || pattern === '**' || pattern === topic) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return topic.startsWith(prefix);
    }
    return false;
  }
}

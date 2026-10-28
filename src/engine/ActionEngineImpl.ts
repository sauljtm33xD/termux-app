/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineEvent, IContextEngine, IEventEngine } from './types';

export type ActionHandlerFn = (
  params: Record<string, any>,
  context: {
    event?: EngineEvent<any>;
    eventEngine: IEventEngine;
    contextEngine: IContextEngine;
  }
) => Promise<any> | any;

export interface RegisteredAction {
  id: string;
  name: string;
  description: string;
  parametersSchema: Record<string, { type: string; required?: boolean; description?: string }>;
  handler: ActionHandlerFn;
}

export class ActionEngineImpl {
  private actions: Map<string, RegisteredAction> = new Map();
  private eventEngine: IEventEngine;
  private contextEngine: IContextEngine;

  constructor(eventEngine: IEventEngine, contextEngine: IContextEngine) {
    this.eventEngine = eventEngine;
    this.contextEngine = contextEngine;
    this.registerDefaultActions();
  }

  private registerDefaultActions(): void {
    // 1. Dispatch event action
    this.registerAction({
      id: 'dispatch_event',
      name: 'Dispatch Event',
      description: 'Publishes a new event to the EventEngine bus',
      parametersSchema: {
        topic: { type: 'string', required: true, description: 'Topic name' },
        payload: { type: 'object', required: true, description: 'Payload object' },
      },
      handler: async (params, ctx) => {
        return await ctx.eventEngine.publish(params.topic, params.payload, {
          source: 'action_engine:dispatch',
          causationId: ctx.event?.id,
        });
      },
    });

    // 2. Set Context Key
    this.registerAction({
      id: 'mutate_context',
      name: 'Mutate Context',
      description: 'Updates a value at a specified path in the ContextEngine',
      parametersSchema: {
        path: { type: 'string', required: true },
        value: { type: 'any', required: true },
        scopeId: { type: 'string', required: false },
      },
      handler: (params, ctx) => {
        ctx.contextEngine.set(params.path, params.value, params.scopeId, ctx.event?.id);
        return { success: true, path: params.path, value: params.value };
      },
    });

    // 3. Save Memory Slot
    this.registerAction({
      id: 'store_memory',
      name: 'Store Working Memory',
      description: 'Stores a memory slot with importance rating and TTL in ContextEngine',
      parametersSchema: {
        key: { type: 'string', required: true },
        value: { type: 'any', required: true },
        importance: { type: 'number', required: false },
        tags: { type: 'array', required: false },
      },
      handler: (params, ctx) => {
        const slot = ctx.contextEngine.setMemorySlot(params.key, params.value, {
          importance: params.importance ?? 5,
          tags: params.tags ?? [],
          sourceEventId: ctx.event?.id,
        });
        return slot;
      },
    });

    // 4. Delay / Timer
    this.registerAction({
      id: 'delay_ms',
      name: 'Delay Execution',
      description: 'Pauses execution for N milliseconds before continuing',
      parametersSchema: {
        milliseconds: { type: 'number', required: true },
      },
      handler: async (params) => {
        const ms = Number(params.milliseconds) || 500;
        await new Promise((resolve) => setTimeout(resolve, ms));
        return { delayedMs: ms };
      },
    });
  }

  public registerAction(action: RegisteredAction): void {
    this.actions.set(action.id, action);
  }

  public getActions(): RegisteredAction[] {
    return Array.from(this.actions.values());
  }

  public async execute(actionId: string, params: Record<string, any>, event?: EngineEvent<any>): Promise<any> {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error(`Action '${actionId}' is not registered`);
    }

    return await action.handler(params, {
      event,
      eventEngine: this.eventEngine,
      contextEngine: this.contextEngine,
    });
  }
}

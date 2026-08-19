/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActionEngineImpl } from './ActionEngineImpl';
import { ContextEngineImpl } from './ContextEngineImpl';
import { EventEngineImpl } from './EventEngineImpl';
import { RuleEngineImpl } from './RuleEngineImpl';
import { EngineEvent, TimeTravelFrame } from './types';

export class EngineSuite {
  public eventEngine: EventEngineImpl;
  public contextEngine: ContextEngineImpl;
  public ruleEngine: RuleEngineImpl;
  public actionEngine: ActionEngineImpl;

  // Time Travel recorder
  private timeTravelFrames: TimeTravelFrame[] = [];
  private maxTimelineFrames: number = 100;
  private isTimeTraveling: boolean = false;
  private activeTimeTravelIndex: number = -1;
  private changeListeners: Set<() => void> = new Set();

  constructor() {
    this.eventEngine = new EventEngineImpl({ maxHistorySize: 1000 });
    this.contextEngine = new ContextEngineImpl({ maxDiffHistorySize: 1000 });
    this.ruleEngine = new RuleEngineImpl(this.eventEngine, this.contextEngine);
    this.actionEngine = new ActionEngineImpl(this.eventEngine, this.contextEngine);

    this.setupTimelineCapture();
  }

  private setupTimelineCapture(): void {
    // Whenever an event is published, record snapshot for time-travel
    this.eventEngine.onAnyEvent((event: EngineEvent) => {
      if (this.isTimeTraveling) return;

      const currentDiffs = this.contextEngine.getDiffHistory(5);
      const matchingDiffs = currentDiffs.filter((d) => d.sourceEventId === event.id);

      const frame: TimeTravelFrame = {
        id: `frame_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        stepIndex: this.timeTravelFrames.length,
        timestamp: Date.now(),
        triggerEvent: JSON.parse(JSON.stringify(event)),
        contextSnapshot: this.contextEngine.getSnapshot(),
        scopesSnapshot: this.contextEngine.getAllScopes(),
        diffsGenerated: matchingDiffs,
        rulesTriggered: [],
        metricsSnapshot: this.eventEngine.getMetrics(),
      };

      this.timeTravelFrames.push(frame);
      if (this.timeTravelFrames.length > this.maxTimelineFrames) {
        this.timeTravelFrames.shift();
        // re-index
        this.timeTravelFrames.forEach((f, idx) => (f.stepIndex = idx));
      }
      this.activeTimeTravelIndex = this.timeTravelFrames.length - 1;
      this.notifyChanges();
    });
  }

  public subscribeChange(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  public notifyChanges(): void {
    for (const l of this.changeListeners) {
      try {
        l();
      } catch (err) {
        console.error('Error notifying engine listener:', err);
      }
    }
  }

  // -------------------------------------------------------------
  // Time Travel Controls
  // -------------------------------------------------------------

  public getTimeTravelFrames(): TimeTravelFrame[] {
    return this.timeTravelFrames;
  }

  public getActiveFrameIndex(): number {
    return this.activeTimeTravelIndex;
  }

  public jumpToTimeTravelFrame(index: number): boolean {
    if (index < 0 || index >= this.timeTravelFrames.length) return false;

    this.isTimeTraveling = true;
    this.activeTimeTravelIndex = index;
    const targetFrame = this.timeTravelFrames[index];

    // Restore context engine to snapshot
    this.contextEngine.restoreSnapshot(targetFrame.contextSnapshot);
    this.notifyChanges();
    return true;
  }

  public resumeLive(): void {
    if (this.timeTravelFrames.length > 0) {
      const latestFrame = this.timeTravelFrames[this.timeTravelFrames.length - 1];
      this.contextEngine.restoreSnapshot(latestFrame.contextSnapshot);
      this.activeTimeTravelIndex = this.timeTravelFrames.length - 1;
    }
    this.isTimeTraveling = false;
    this.notifyChanges();
  }

  public isCurrentlyTimeTraveling(): boolean {
    return this.isTimeTraveling;
  }

  public clearTimeline(): void {
    this.timeTravelFrames = [];
    this.activeTimeTravelIndex = -1;
    this.isTimeTraveling = false;
    this.notifyChanges();
  }

  public resetAll(): void {
    this.eventEngine = new EventEngineImpl({ maxHistorySize: 1000 });
    this.contextEngine = new ContextEngineImpl({ maxDiffHistorySize: 1000 });
    this.ruleEngine = new RuleEngineImpl(this.eventEngine, this.contextEngine);
    this.actionEngine = new ActionEngineImpl(this.eventEngine, this.contextEngine);
    this.clearTimeline();
    this.setupTimelineCapture();
    this.notifyChanges();
  }
}

// Global engine singleton instance
export const engineSuite = new EngineSuite();

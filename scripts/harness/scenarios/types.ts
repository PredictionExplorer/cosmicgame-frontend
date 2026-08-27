/**
 * Scenario contract. A scenario is a long-running behavior driving the game:
 * it owns the loop, respects pause/abort, and can assume a booted world.
 */

import type { Pace } from '../director/pace';
import type { World } from '../director/world';

export interface ScenarioContext {
  world: World;
  pace: Pace;
  /** Fired when the scenario is being replaced or the director shuts down. */
  signal: AbortSignal;
  /** True while the control API has paused automatic activity. */
  isPaused: () => boolean;
}

export interface Scenario {
  name: string;
  description: string;
  /** Pace applied when the scenario starts (director default otherwise). */
  defaultPace?: Pace['name'];
  run: (ctx: ScenarioContext) => Promise<void>;
}

/** Abortable, pause-aware sleep. Resolves early when the scenario is aborted. */
export async function tick(ctx: ScenarioContext, ms: number): Promise<void> {
  const deadline = Date.now() + ms;
  while (!ctx.signal.aborted) {
    const remaining = deadline - Date.now();
    if (remaining <= 0 && !ctx.isPaused()) return;
    await new Promise((resolveSleep) =>
      setTimeout(resolveSleep, Math.min(500, Math.max(50, remaining))),
    );
  }
}

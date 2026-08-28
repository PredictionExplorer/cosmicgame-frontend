/**
 * Jump-to-state planner. Reshapes the game so the UI lands in a requested
 * cycle phase (the phase names mirror lib/cycleState.ts) with controlled
 * virtual-clock advancement:
 *
 *   1. settle the current cycle (finalize it, waiting out any remaining
 *      countdown — minutes at worst under demo/fast pacing),
 *   2. while the game is configurable, apply the pace with the initial
 *      countdown shaped to the target phase,
 *   3. re-activate and place the opening gesture(s).
 */

import { createLogger } from '../log';

import {
  readFinalizeExclusivitySeconds,
  writeCycleActivationTime,
  writePaceSetters,
} from './abiCalls';
import { performEthGesture, performFinalizeCycle } from './actions';
import { readCycleSnapshot } from './gameState';
import { paceToSetterValues, type Pace } from './pace';
import { pickOne } from './personas';
import { advanceChainTime, advanceChainTimeTo, readChainNowSeconds } from './time';
import type { World } from './world';

const log = createLogger('planner');

/** Targetable UI phases (lib/cycleState.ts) plus the post-exclusivity state. */
export type TargetPhase =
  | 'opening-soon'
  | 'waiting-first-gesture'
  | 'live'
  | 'approach'
  | 'final-hour'
  | 'final-ten'
  | 'final-minute'
  | 'ready-to-finalize'
  | 'exclusivity-expired';

export const TARGET_PHASES: readonly TargetPhase[] = [
  'opening-soon',
  'waiting-first-gesture',
  'live',
  'approach',
  'final-hour',
  'final-ten',
  'final-minute',
  'ready-to-finalize',
  'exclusivity-expired',
];

export function isTargetPhase(value: string): value is TargetPhase {
  return (TARGET_PHASES as readonly string[]).includes(value);
}

/**
 * Countdown the opening gesture should create per phase. Chosen to sit
 * comfortably inside the lib/cycleState.ts band it belongs to.
 */
const PHASE_COUNTDOWN_SECONDS: Partial<Record<TargetPhase, number>> = {
  live: 13 * 3_600,
  approach: 2 * 3_600,
  'final-hour': 45 * 60,
  'final-ten': 8 * 60,
  'final-minute': 55,
  'ready-to-finalize': 8,
  'exclusivity-expired': 8,
};

/**
 * "Parked" activation offset while the game is being reconfigured: far
 * enough that nothing activates mid-configuration, near enough that backend
 * duration math stays well inside int64 (a year-2096 park made the API's
 * live-state refresher error out and stall).
 */
export const ACTIVATION_PARK_SECONDS = 86_400n;

export class HarnessTransitionAbortedError extends Error {
  constructor() {
    super('Harness state transition was superseded');
    this.name = 'HarnessTransitionAbortedError';
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new HarnessTransitionAbortedError();
}

export interface DriveOptions {
  signal?: AbortSignal;
}

/**
 * Bring the game to a configurable (inactive, unopened) state.
 *
 * This is a disposable Hardhat universe, so an interactive mode switch moves
 * its virtual clock directly to an open cycle's deadline instead of making a
 * developer wait hours. Frontend targets are projected against the API's
 * chain clock, preserving the production UI's relative timing semantics.
 */
export async function settleIntoConfigurableState(
  world: World,
  { signal }: DriveOptions = {},
): Promise<void> {
  throwIfAborted(signal);
  const snapshot = await readCycleSnapshot(world);
  throwIfAborted(signal);
  if (snapshot.cycleOpened) {
    if (snapshot.secondsUntilFinalization > 0n) {
      log.info(`Advancing virtual clock ${snapshot.secondsUntilFinalization}s to finalize cycle…`);
      await advanceChainTimeTo(world, snapshot.finalizationTime, { allowFuture: true });
    }
    throwIfAborted(signal);
    await performFinalizeCycle(world);
  }
  throwIfAborted(signal);
  // Park activation; legal while no gesture has been made this cycle.
  const chainNow = await readChainNowSeconds(world);
  await writeCycleActivationTime(world, chainNow + ACTIVATION_PARK_SECONDS);
}

export interface DriveResult {
  phase: TargetPhase;
  cycleIndex: bigint;
}

/** Drive the game into the requested phase under the given pace. */
export async function driveToPhase(
  world: World,
  target: TargetPhase,
  pace: Pace,
  { signal }: DriveOptions = {},
): Promise<DriveResult> {
  log.info(`Driving game state to "${target}" (${pace.name} pace)`);
  throwIfAborted(signal);

  // Moving from the zero-cross to post-exclusivity does not require a new
  // cycle. Preserve the current package and advance only the missing window.
  if (target === 'exclusivity-expired') {
    const current = await readCycleSnapshot(world);
    if (current.cycleOpened) {
      if (current.secondsUntilFinalization > 0n) {
        await advanceChainTimeTo(world, current.finalizationTime, { allowFuture: true });
      }
      throwIfAborted(signal);
      const exclusivitySeconds = await readFinalizeExclusivitySeconds(world);
      await advanceChainTimeTo(world, current.finalizationTime + exclusivitySeconds + 1n, {
        allowFuture: true,
      });
      throwIfAborted(signal);
      if (!(await phaseStillHolds(world, target))) {
        throw new Error(`Phase "${target}" did not hold after advancing exclusivity`);
      }
      return { phase: target, cycleIndex: current.cycleIndex };
    }
  }

  await settleIntoConfigurableState(world, { signal });

  const shaped: Pace = { ...pace };
  const countdown = PHASE_COUNTDOWN_SECONDS[target];
  if (countdown !== undefined) shaped.initialCountdownSeconds = countdown;
  if (target === 'exclusivity-expired') shaped.finalizeExclusivitySeconds = 10;
  throwIfAborted(signal);
  await writePaceSetters(world, paceToSetterValues(shaped));

  throwIfAborted(signal);
  const chainNow = await readChainNowSeconds(world);
  if (target === 'opening-soon') {
    await writeCycleActivationTime(world, chainNow + 10n * 60n);
    throwIfAborted(signal);
    const snapshot = await readCycleSnapshot(world);
    if (!(await phaseStillHolds(world, target))) {
      throw new Error(
        `Transition reached cycle ${snapshot.cycleIndex}, but phase "${target}" did not hold`,
      );
    }
    throwIfAborted(signal);
    return { phase: target, cycleIndex: snapshot.cycleIndex };
  }

  const activationTime = chainNow + 2n;
  await writeCycleActivationTime(world, activationTime);
  await advanceChainTimeTo(world, activationTime, { allowFuture: true });
  throwIfAborted(signal);

  if (target === 'waiting-first-gesture') {
    const snapshot = await readCycleSnapshot(world);
    if (!(await phaseStillHolds(world, target))) {
      throw new Error(
        `Transition reached cycle ${snapshot.cycleIndex}, but phase "${target}" did not hold`,
      );
    }
    throwIfAborted(signal);
    return { phase: target, cycleIndex: snapshot.cycleIndex };
  }

  await performEthGesture(world, pickOne(world.rng, [...world.personas]));
  throwIfAborted(signal);

  if (target === 'ready-to-finalize' || target === 'exclusivity-expired') {
    const opened = await readCycleSnapshot(world);
    await advanceChainTimeTo(world, opened.finalizationTime, { allowFuture: true });
    if (target === 'exclusivity-expired') {
      log.info('Countdown expired; advancing beyond the finalize-exclusivity window…');
      const exclusivitySeconds = await readFinalizeExclusivitySeconds(world);
      await advanceChainTime(world, exclusivitySeconds + 1n, { allowFuture: true });
    }
  }

  throwIfAborted(signal);
  const snapshot = await readCycleSnapshot(world);
  if (!(await phaseStillHolds(world, target))) {
    throw new Error(
      `Transition reached cycle ${snapshot.cycleIndex}, but phase "${target}" did not hold`,
    );
  }
  log.info(`Reached "${target}" in cycle ${snapshot.cycleIndex}`);
  return { phase: target, cycleIndex: snapshot.cycleIndex };
}

/** True when the live snapshot still matches the target phase's band. */
export async function phaseStillHolds(world: World, target: TargetPhase): Promise<boolean> {
  const snapshot = await readCycleSnapshot(world);
  const remaining = Number(snapshot.secondsUntilFinalization);
  switch (target) {
    case 'opening-soon':
      return !snapshot.cycleActive;
    case 'waiting-first-gesture':
      return snapshot.cycleActive && !snapshot.cycleOpened;
    case 'live':
      return snapshot.cycleOpened && remaining > 12 * 3_600;
    case 'approach':
      return snapshot.cycleOpened && remaining > 3_600 && remaining <= 12 * 3_600;
    case 'final-hour':
      return snapshot.cycleOpened && remaining > 10 * 60 && remaining <= 3_600;
    case 'final-ten':
      return snapshot.cycleOpened && remaining > 60 && remaining <= 10 * 60;
    case 'final-minute':
      return snapshot.cycleOpened && remaining > 0 && remaining <= 60;
    case 'ready-to-finalize': {
      if (!snapshot.cycleOpened || remaining !== 0) return false;
      const exclusivitySeconds = await readFinalizeExclusivitySeconds(world);
      return snapshot.chainNowSeconds < snapshot.finalizationTime + exclusivitySeconds;
    }
    case 'exclusivity-expired': {
      if (!snapshot.cycleOpened || remaining !== 0) return false;
      const exclusivitySeconds = await readFinalizeExclusivitySeconds(world);
      return snapshot.chainNowSeconds >= snapshot.finalizationTime + exclusivitySeconds;
    }
    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
}

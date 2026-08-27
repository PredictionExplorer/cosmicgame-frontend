/**
 * Jump-to-state planner. Reshapes the game so the UI lands in a requested
 * cycle phase (the phase names mirror lib/cycleState.ts) without ever moving
 * the chain clock ahead of the wall clock:
 *
 *   1. settle the current cycle (finalize it, waiting out any remaining
 *      countdown — minutes at worst under demo/fast pacing),
 *   2. while the game is configurable, apply the pace with the initial
 *      countdown shaped to the target phase,
 *   3. re-activate and place the opening gesture(s).
 */

import { createLogger } from '../log';

import {
  readSecondsUntilFinalization,
  writeCycleActivationTime,
  writePaceSetters,
} from './abiCalls';
import { performEthGesture, performFinalizeCycle } from './actions';
import { readCycleSnapshot } from './gameState';
import { paceToSetterValues, type Pace } from './pace';
import { pickOne } from './personas';
import { readChainNowSeconds } from './time';
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

const sleep = (ms: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

/**
 * "Parked" activation offset while the game is being reconfigured: far
 * enough that nothing activates mid-configuration, near enough that backend
 * duration math stays well inside int64 (a year-2096 park made the API's
 * live-state refresher error out and stall).
 */
export const ACTIVATION_PARK_SECONDS = 86_400n;

async function waitWallClock(world: World, condition: () => Promise<boolean>): Promise<void> {
  while (!(await condition())) {
    await sleep(1_500);
  }
}

/**
 * Bring the game to a configurable (inactive, unopened) state. Waits out any
 * live countdown in real time — the wall-clock-integrity tradeoff, kept short
 * by demo/fast pacing — and finalizes if needed.
 */
export async function settleIntoConfigurableState(world: World): Promise<void> {
  const snapshot = await readCycleSnapshot(world);
  if (snapshot.cycleOpened) {
    if (snapshot.secondsUntilFinalization > 0n) {
      log.info(
        `Waiting ${snapshot.secondsUntilFinalization}s for the live cycle to become finalizable…`,
      );
      await waitWallClock(world, async () => (await readSecondsUntilFinalization(world)) === 0n);
    }
    await performFinalizeCycle(world);
  }
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
): Promise<DriveResult> {
  log.info(`Driving game state to "${target}" (${pace.name} pace)`);
  await settleIntoConfigurableState(world);

  const shaped: Pace = { ...pace };
  const countdown = PHASE_COUNTDOWN_SECONDS[target];
  if (countdown !== undefined) shaped.initialCountdownSeconds = countdown;
  if (target === 'exclusivity-expired') shaped.finalizeExclusivitySeconds = 10;
  await writePaceSetters(world, paceToSetterValues(shaped));

  const chainNow = await readChainNowSeconds(world);
  if (target === 'opening-soon') {
    await writeCycleActivationTime(world, chainNow + 10n * 60n);
    const snapshot = await readCycleSnapshot(world);
    return { phase: target, cycleIndex: snapshot.cycleIndex };
  }

  await writeCycleActivationTime(world, chainNow + 2n);
  await waitWallClock(world, async () => (await readCycleSnapshot(world)).cycleActive);

  if (target === 'waiting-first-gesture') {
    const snapshot = await readCycleSnapshot(world);
    return { phase: target, cycleIndex: snapshot.cycleIndex };
  }

  await performEthGesture(world, pickOne(world.rng, [...world.personas]));

  if (target === 'ready-to-finalize' || target === 'exclusivity-expired') {
    await waitWallClock(world, async () => (await readSecondsUntilFinalization(world)) === 0n);
    if (target === 'exclusivity-expired') {
      log.info('Countdown expired; waiting out the finalize-exclusivity window…');
      await sleep(12_000);
    }
  }

  const snapshot = await readCycleSnapshot(world);
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
    case 'ready-to-finalize':
    case 'exclusivity-expired':
      return snapshot.cycleOpened && remaining === 0;
    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
}

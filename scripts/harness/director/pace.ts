/**
 * Pace presets: how fast the game runs. Contract durations derive from the
 * per-gesture time increment via divisors; this module expresses paces in
 * human units (seconds) and converts to the setter values the game expects.
 *
 * Paces are applied through owner setters, which the game only accepts while
 * the current cycle is inactive — the state planner owns that dance.
 */

import type { PaceSetterValues } from './abiCalls';

export type PaceName = 'realtime' | 'demo' | 'fast' | 'seed-history';

export interface Pace {
  name: PaceName;
  /** Seconds each gesture adds to the finalization countdown. */
  timeIncrementSeconds: number;
  /** Countdown created by the first gesture of a cycle. */
  initialCountdownSeconds: number;
  /** ETH Calibration Window length (opening cost descent). */
  ethWindowSeconds: number;
  /** CST Calibration Window length. */
  cstWindowSeconds: number;
  /** Pause between finalization and the next cycle's activation. */
  activationDelaySeconds: number;
  /** Final-gesture exclusivity window before open finalization. */
  finalizeExclusivitySeconds: number;
  /** Escrow timeout after which anyone can retrieve stale allocations. */
  retrievalTimeoutSeconds: number;
}

const HOUR = 3_600;
const DAY = 86_400;

export const PACES: Record<PaceName, Pace> = {
  /** Production-shaped timings (cycle ≈ a day or more). */
  realtime: {
    name: 'realtime',
    timeIncrementSeconds: HOUR,
    initialCountdownSeconds: DAY,
    ethWindowSeconds: 2 * DAY,
    cstWindowSeconds: 12 * HOUR,
    activationDelaySeconds: HOUR / 2,
    finalizeExclusivitySeconds: 2 * DAY,
    retrievalTimeoutSeconds: 5 * 7 * DAY,
  },
  /** Default for interactive development: a full cycle plays out in minutes. */
  demo: {
    name: 'demo',
    timeIncrementSeconds: 90,
    initialCountdownSeconds: 6 * 60,
    ethWindowSeconds: 5 * 60,
    cstWindowSeconds: 8 * 60,
    activationDelaySeconds: 90,
    finalizeExclusivitySeconds: 3 * 60,
    retrievalTimeoutSeconds: 30 * 60,
  },
  /** For automated tests: states are reachable in tens of seconds. */
  fast: {
    name: 'fast',
    timeIncrementSeconds: 20,
    initialCountdownSeconds: 75,
    ethWindowSeconds: 45,
    cstWindowSeconds: 60,
    activationDelaySeconds: 20,
    finalizeExclusivitySeconds: 45,
    retrievalTimeoutSeconds: 5 * 60,
  },
  /** Backdated history generation: hours-long cycles, one per simulated day. */
  'seed-history': {
    name: 'seed-history',
    timeIncrementSeconds: 10 * 60,
    initialCountdownSeconds: 6 * HOUR,
    ethWindowSeconds: 4 * HOUR,
    cstWindowSeconds: 2 * HOUR,
    activationDelaySeconds: HOUR / 2,
    finalizeExclusivitySeconds: HOUR,
    retrievalTimeoutSeconds: 7 * DAY,
  },
};

export function isPaceName(value: string): value is PaceName {
  return value in PACES;
}

const MICROS = 1_000_000n;

/**
 * Convert a pace into game setter values. Durations that the game derives
 * from the time increment become divisors: duration = incrementMicros / divisor.
 */
export function paceToSetterValues(pace: Pace): PaceSetterValues {
  const incrementMicros = BigInt(pace.timeIncrementSeconds) * MICROS;
  const divisorFor = (durationSeconds: number): bigint => {
    const divisor = incrementMicros / BigInt(Math.max(1, durationSeconds));
    return divisor > 0n ? divisor : 1n;
  };
  return {
    timeIncrementMicros: incrementMicros,
    initialCountdownDivisor: divisorFor(pace.initialCountdownSeconds),
    ethWindowDivisor: divisorFor(pace.ethWindowSeconds),
    cstWindowSeconds: BigInt(pace.cstWindowSeconds),
    cstWindowDivisor: divisorFor(pace.cstWindowSeconds),
    activationDelaySeconds: BigInt(pace.activationDelaySeconds),
    finalizeExclusivitySeconds: BigInt(pace.finalizeExclusivitySeconds),
    retrievalTimeoutSeconds: BigInt(pace.retrievalTimeoutSeconds),
  };
}

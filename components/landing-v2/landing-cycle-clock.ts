import { getCycleState, getDashboardActivationTime, type CyclePhase } from '@/lib/cycleState';
import { getStableClientTargetTime } from '@/utils/time';

import type { LandingDashboardSnapshot } from './landing-cycle-data';

/**
 * The landing clock's model, free of React so every rule is unit-tested:
 * how a poll merges into the last good reading, and what the clock shows
 * for a reading at a given moment.
 */

/** One poll of the three reads the clock needs. `null` is a read that failed. */
export interface LandingCyclePoll {
  targetServerTimeSec: number | null;
  currentServerTimeSec: number | null;
  dashboard: LandingDashboardSnapshot | null;
  /** When the poll started (epoch ms), the anchor of its server-clock sample. */
  sampledAtMs: number;
}

/**
 * The clock's reading: the latest good value of every read, and how fresh it
 * is. A failed read never discards a good one — the clock keeps counting from
 * the last reading and says how old it is instead of dropping to "unavailable".
 */
export interface LandingCycleReading {
  targetServerTimeSec: number | null;
  /** The server clock and the moment it was read travel together: the pair projects the target. */
  currentServerTimeSec: number | null;
  sampledAtMs: number;
  dashboard: LandingDashboardSnapshot | null;
  /** When every read last succeeded together (epoch ms), or null before that. */
  lastSuccessAtMs: number | null;
  /** The latest poll lost at least one read. */
  lastAttemptFailed: boolean;
}

/** Merges a poll into the previous reading, field by field. */
export function mergeLandingCyclePoll(
  previous: LandingCycleReading | null,
  poll: LandingCyclePoll,
): LandingCycleReading {
  const clockRead = poll.currentServerTimeSec !== null;
  const failed = poll.targetServerTimeSec === null || !clockRead || poll.dashboard === null;
  return {
    targetServerTimeSec: poll.targetServerTimeSec ?? previous?.targetServerTimeSec ?? null,
    currentServerTimeSec: clockRead
      ? poll.currentServerTimeSec
      : (previous?.currentServerTimeSec ?? null),
    sampledAtMs: clockRead || !previous ? poll.sampledAtMs : previous.sampledAtMs,
    dashboard: poll.dashboard ?? previous?.dashboard ?? null,
    lastSuccessAtMs: failed ? (previous?.lastSuccessAtMs ?? null) : poll.sampledAtMs,
    lastAttemptFailed: failed,
  };
}

export type ClockUnit = 'days' | 'hours' | 'minutes' | 'seconds';

export interface ClockShard {
  unit: ClockUnit;
  value: number;
}

/** Whole days, hours, minutes and seconds of a non-negative span. */
export function clockShards(remainingMs: number): ClockShard[] {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  return [
    { unit: 'days', value: Math.floor(totalSeconds / 86_400) },
    { unit: 'hours', value: Math.floor((totalSeconds % 86_400) / 3_600) },
    { unit: 'minutes', value: Math.floor((totalSeconds % 3_600) / 60) },
    { unit: 'seconds', value: totalSeconds % 60 },
  ];
}

/** Two digits at least: the clock never jumps width as a unit drops below ten. */
export const padClock = (value: number) => String(Math.max(0, value)).padStart(2, '0');

export interface LandingCycleTimerSnapshot {
  phase: CyclePhase;
  targetMs: number;
  finalizationTargetMs: number;
  remainingMs: number;
  showCountdown: boolean;
  shards: ClockShard[];
  cycleNumber: number | null;
  gestureCount: number | null;
}

function emptySnapshot(phase: CyclePhase): LandingCycleTimerSnapshot {
  return {
    phase,
    targetMs: 0,
    finalizationTargetMs: 0,
    remainingMs: 0,
    showCountdown: false,
    shards: clockShards(0),
    cycleNumber: null,
    gestureCount: null,
  };
}

/**
 * What the clock shows for a reading at `nowMs`, with the app's cycle state
 * machine and the same server-clock projection as the app's countdown.
 *
 * - No reading yet: `loading`. No dashboard ever arrived and the latest poll
 *   failed: `unavailable`.
 * - A dashboard without a finalization target is still `loading`: a missing
 *   target never reads as a passed deadline, so the clock cannot announce
 *   "ready to finalize" because one request failed.
 */
export function getLandingCycleTimerSnapshot({
  reading,
  nowMs,
}: {
  reading: LandingCycleReading | null;
  nowMs: number;
}): LandingCycleTimerSnapshot {
  if (!reading) return emptySnapshot('loading');
  const { dashboard } = reading;
  if (!dashboard) {
    return emptySnapshot(reading.lastAttemptFailed ? 'unavailable' : 'loading');
  }

  const projection = {
    currentServerTimeSec: reading.currentServerTimeSec,
    currentServerTimeUpdatedAtMs: reading.sampledAtMs,
    fallbackNowMs: nowMs,
  };
  const finalizationTargetMs = getStableClientTargetTime({
    ...projection,
    targetServerTimeSec: reading.targetServerTimeSec,
  });
  const activationTargetMs = getStableClientTargetTime({
    ...projection,
    targetServerTimeSec: getDashboardActivationTime(dashboard),
  });
  const state = getCycleState({
    data: dashboard,
    loading: false,
    allocationTime: finalizationTargetMs,
    activationTime: activationTargetMs > 0 ? activationTargetMs / 1000 : null,
    now: nowMs,
  });

  const counting = state.isFinalizationCountdownActive || state.isReadyToFinalize;
  if (counting && finalizationTargetMs <= 0) {
    // Gestures are open but the finalization time never arrived: wait for it
    // rather than count down to (or past) zero.
    return { ...emptySnapshot('loading'), cycleNumber: dashboard.CurRoundNum };
  }

  const targetMs =
    state.isOpeningSoon && state.activationTime != null
      ? state.activationTime * 1000
      : finalizationTargetMs;
  const showCountdown = state.isOpeningSoon || state.isFinalizationCountdownActive;
  const remainingMs = showCountdown ? Math.max(0, targetMs - nowMs) : 0;

  return {
    phase: state.phase,
    targetMs,
    finalizationTargetMs,
    remainingMs,
    showCountdown,
    shards: clockShards(remainingMs),
    cycleNumber: dashboard.CurRoundNum,
    gestureCount: dashboard.CurNumBids,
  };
}

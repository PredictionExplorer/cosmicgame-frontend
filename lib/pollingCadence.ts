/**
 * Adaptive polling cadence for live cycle data.
 *
 * The countdown target (`mainPrizeTime`) can move at any moment when a new
 * Gesture lands on-chain, and the last minutes of a cycle are exactly when
 * last-second Gestures are most likely. A fixed 10–12s poll leaves every
 * viewer up to 12s behind on-chain reality at the worst possible time, so the
 * live queries speed up as the finalization clock approaches zero and briefly
 * stay fast after the zero-cross (while a claim or a late extension is being
 * resolved), then relax back to the base cadence.
 */

/** Fastest API poll interval, used inside the final sprint window. */
export const FINAL_SPRINT_INTERVAL_MS = 2_000;

/** Remaining time under which the final sprint interval applies. */
export const FINAL_SPRINT_WINDOW_MS = 30_000;

/**
 * How long after the deadline passes the fast cadence is kept. Beyond this the
 * round is stably claimable and the event watcher + base polling suffice.
 */
export const PAST_DEADLINE_FAST_WINDOW_MS = 120_000;

/**
 * Poll interval for live cycle queries given the time remaining until the
 * finalization deadline. `remainingMs` is negative once the deadline passed
 * and `null` when no deadline is known (fall back to the base cadence).
 * Never returns an interval slower than `baseMs`.
 */
export function getLiveDataPollIntervalMs(
  remainingMs: number | null | undefined,
  baseMs: number,
): number {
  if (remainingMs == null || !Number.isFinite(remainingMs)) return baseMs;
  if (remainingMs <= 0) {
    return -remainingMs <= PAST_DEADLINE_FAST_WINDOW_MS ? FINAL_SPRINT_INTERVAL_MS : baseMs;
  }
  if (remainingMs <= FINAL_SPRINT_WINDOW_MS) return Math.min(baseMs, FINAL_SPRINT_INTERVAL_MS);
  if (remainingMs <= 2 * 60_000) return Math.min(baseMs, 3_000);
  if (remainingMs <= 10 * 60_000) return Math.min(baseMs, 6_000);
  return baseMs;
}

/**
 * Milliseconds until an allocation time expressed in epoch seconds, or `null`
 * when the value is absent/invalid. Local clock skew of a few seconds is fine
 * here; this only selects a polling cadence, not the displayed countdown.
 */
export function getRemainingMsToAllocationTime(
  allocationTimeSec: unknown,
  nowMs: number = Date.now(),
): number | null {
  const sec =
    typeof allocationTimeSec === 'number' &&
    Number.isFinite(allocationTimeSec) &&
    allocationTimeSec > 0
      ? allocationTimeSec
      : null;
  return sec == null ? null : sec * 1000 - nowMs;
}

/**
 * Remaining duration from a server-clock sample. Host/chain epoch skew drops
 * out of the subtraction; only wall time elapsed since receipt is applied.
 */
export function getRemainingMsFromServerClock({
  targetServerTimeSec,
  currentServerTimeSec,
  sampledAtMs,
  nowMs = Date.now(),
}: {
  targetServerTimeSec: unknown;
  currentServerTimeSec: unknown;
  sampledAtMs: number;
  nowMs?: number;
}): number | null {
  if (
    typeof targetServerTimeSec !== 'number' ||
    !Number.isFinite(targetServerTimeSec) ||
    targetServerTimeSec <= 0 ||
    typeof currentServerTimeSec !== 'number' ||
    !Number.isFinite(currentServerTimeSec) ||
    currentServerTimeSec <= 0
  ) {
    return null;
  }
  const elapsedMs = sampledAtMs > 0 ? Math.max(0, nowMs - sampledAtMs) : 0;
  return (targetServerTimeSec - currentServerTimeSec) * 1000 - elapsedMs;
}

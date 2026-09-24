/**
 * One freshness model for every "live" surface.
 *
 * A pulsing dot that always says "live" is a claim, not a signal: it kept
 * pulsing while polls failed, while the tab was offline, and before the first
 * client fetch replaced the server snapshot. This pure function turns the
 * facts a live surface has — when data last arrived, whether the latest
 * attempt failed, whether the browser is online — into one of five states the
 * UI can render honestly. Kept free of React Query and the wallet stack so the
 * landing host can use it too.
 */

export type LiveFreshness = 'connecting' | 'live' | 'reconnecting' | 'delayed' | 'offline';

/** No successful update for this long reads as delayed, whatever the cadence. */
export const DELAYED_AFTER_MS = 60_000;

export interface LiveFreshnessInput {
  /**
   * When data last arrived from the network (epoch ms). Server-seeded data
   * is dated 0, so a hydrated page reads as `connecting` until the first
   * client fetch lands.
   */
  lastSuccessAtMs: number | null | undefined;
  /** The most recent attempt failed and a retry is due. */
  lastAttemptFailed: boolean;
  /** `navigator.onLine` (or React Query's onlineManager). */
  online: boolean;
  /** The surface's poll interval; a slow cadence stretches the delayed threshold. */
  pollIntervalMs: number;
  nowMs: number;
  /** Override for `DELAYED_AFTER_MS`. */
  delayedAfterMs?: number;
}

/**
 * - `offline`: the browser reports no network.
 * - `connecting`: nothing has arrived from the network yet.
 * - `delayed`: the last update is older than the delayed threshold
 *   (max of 60 s and two poll intervals).
 * - `reconnecting`: the latest attempt failed; the last good data is recent.
 * - `live`: recent data and no failure since.
 */
export function getLiveFreshness({
  lastSuccessAtMs,
  lastAttemptFailed,
  online,
  pollIntervalMs,
  nowMs,
  delayedAfterMs = DELAYED_AFTER_MS,
}: LiveFreshnessInput): LiveFreshness {
  if (!online) return 'offline';
  if (!lastSuccessAtMs || lastSuccessAtMs <= 0) {
    return lastAttemptFailed ? 'reconnecting' : 'connecting';
  }
  const ageMs = Math.max(0, nowMs - lastSuccessAtMs);
  if (ageMs > Math.max(delayedAfterMs, 2 * pollIntervalMs)) return 'delayed';
  if (lastAttemptFailed) return 'reconnecting';
  return 'live';
}

export type FreshnessAgeUnit = 'justNow' | 'seconds' | 'minutes' | 'hours' | 'days';

/**
 * A coarse, human age for "Updated {age}": under 5 s reads as "just now";
 * then whole seconds, minutes, hours or days. Pair the unit with the
 * `common.liveStatus.age.*` catalog keys.
 */
export function getFreshnessAge(ageMs: number): { unit: FreshnessAgeUnit; count: number } {
  const seconds = Math.max(0, Math.floor(ageMs / 1_000));
  if (seconds < 5) return { unit: 'justNow', count: 0 };
  if (seconds < 60) return { unit: 'seconds', count: seconds };
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { unit: 'minutes', count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: 'hours', count: hours };
  return { unit: 'days', count: Math.floor(hours / 24) };
}

/** True for the states in which time-driven UI (confirming, ready) may be trusted. */
export function isFreshEnough(state: LiveFreshness): boolean {
  return state === 'live';
}

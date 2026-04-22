import type { DashboardInfo } from '@/services/api/types';

/**
 * Current instant on the **local** machine, expressed as **UTC epoch milliseconds**
 * (identical to what `Date.now()` returns — the ECMAScript time value is always UTC-based).
 * Use this with API Unix timestamps for apples-to-apples comparison; do not use chain `/time/current` here.
 */
export function localClockUtcEpochMs(): number {
  return Date.now();
}

/**
 * Reads `CurRoundStats.ActivationTime` (Unix **seconds**, UTC — same basis as Go `time.Unix`).
 * Returns ms for `Date`. Landing compares to {@link localClockUtcEpochMs}.
 * Accepts number or numeric string; values > 1e12 are treated as already-ms.
 */
export function parseActivationMsFromDashboard(
  dashboard: DashboardInfo | null | undefined,
): number | null {
  const raw = dashboard?.CurRoundStats?.ActivationTime;
  if (raw == null) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > 1e12) return Math.round(n);
  return Math.round(n * 1000);
}

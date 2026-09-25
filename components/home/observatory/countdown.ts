/**
 * One rounding rule for every countdown on the Observatory (the clock, the
 * dock, the finalize window): whole seconds rounded up, so a countdown reads
 * 00:00:01 until the deadline and reaches zero exactly at it. The clock and
 * the dock read the same shared tick (`useNow(1000)`), so with one rule they
 * always show the same second.
 */
export function countdownSeconds(remainingMs: number): number {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 1000);
}

/** The clock's groups for the remaining time, from `countdownSeconds`. */
export interface CountdownUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function countdownUnits(remainingMs: number): CountdownUnits {
  const total = countdownSeconds(remainingMs);
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

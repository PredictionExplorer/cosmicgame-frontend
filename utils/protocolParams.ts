/**
 * Conversions for raw protocol parameters as the contract and the dashboard API report them.
 * Each returns `null` for a missing or unusable value so callers render it as unknown instead
 * of inventing a figure (a missing divisor is not 100%, a missing duration is not 0 seconds).
 */

const MICROSECONDS_PER_SECOND = 1_000_000;

function toFinite(value: unknown): number | null {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** The percentage an on-chain divisor applies (divisor 100 → 1%); `null` for 0, negative or unreadable. */
export function percentFromDivisor(divisor: unknown): number | null {
  const value = toFinite(divisor);
  return value !== null && value > 0 ? 100 / value : null;
}

/** Seconds from an on-chain microsecond value; `null` when missing, unreadable or negative. */
export function secondsFromMicroseconds(microseconds: unknown): number | null {
  const value = toFinite(microseconds);
  return value !== null && value >= 0 ? value / MICROSECONDS_PER_SECOND : null;
}

/** A non-negative number of seconds; `null` when missing, unreadable or negative. */
export function secondsOrNull(seconds: unknown): number | null {
  const value = toFinite(seconds);
  return value !== null && value >= 0 ? value : null;
}

/**
 * The initial Cycle Finalization Time in seconds: the time increment (microseconds) divided by
 * `initialDurationUntilMainPrizeDivisor` — the value the dashboard misnames
 * `InitialSecondsUntilPrize`.
 */
export function initialDurationSeconds(
  timeIncrementMicroseconds: unknown,
  initialDurationDivisor: unknown,
): number | null {
  const increment = toFinite(timeIncrementMicroseconds);
  const divisor = toFinite(initialDurationDivisor);
  if (increment === null || divisor === null || increment < 0 || divisor <= 0) return null;
  return Math.floor(increment / divisor);
}

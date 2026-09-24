/**
 * Round axis ticks for the statistics charts (docs/design-system.md → Charts).
 *
 * Recharts divides the data range evenly, which gives "1.4h / 3.2h / 5.0h"
 * and "0m / 12.5d / 25d / 37.5d / 42.3d". These helpers choose steps a reader
 * can count in instead: 1-2-5 multiples for figures, whole minutes, hours or
 * days for durations, and calendar hours, days or months for dates. They are
 * pure, so the charts and their tests share them.
 */

const HOUR = 3_600;
const DAY = 86_400;

/** Rounds away binary noise from a multiple of a decimal step (0.1 × 3 = 0.3). */
const clean = (value: number): number => Math.round(value * 1e9) / 1e9;

/** A "nice" step, 1, 2 or 5 × 10ⁿ, that splits `span` into at most `count` intervals. */
export function niceStep(span: number, count: number): number {
  if (!(span > 0) || !(count >= 1)) return 1;
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const residual = clean(raw / magnitude);
  const factor = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return clean(factor * magnitude);
}

export interface AxisScale {
  /** The tick values, low to high. */
  ticks: number[];
  /** The axis domain: the first and the last tick. */
  domain: [number, number];
}

/** Multiples of `step` from the one at or below `min` to the one at or above `max`. */
function stepScale(min: number, max: number, step: number): AxisScale {
  const first = Math.floor(clean(min / step));
  const last = Math.max(first + 1, Math.ceil(clean(max / step)));
  const ticks: number[] = [];
  for (let i = first; i <= last; i += 1) ticks.push(clean(i * step));
  return { ticks, domain: [ticks[0]!, ticks[ticks.length - 1]!] };
}

/**
 * Round ticks covering `[min, max]` on a figure axis: 0 / 25,000 / 50,000 /
 * 75,000 / 100,000. `count` is the most intervals wanted.
 */
export function linearScale(min: number, max: number, count = 4): AxisScale {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [0, 1], domain: [0, 1] };
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = hi - lo || Math.abs(hi) || 1;
  return stepScale(lo, hi, niceStep(span, count));
}

/** Steps a duration axis can use, in seconds: minutes, hours, days, weeks. */
const DURATION_STEPS = [
  60,
  5 * 60,
  15 * 60,
  30 * 60,
  HOUR,
  2 * HOUR,
  3 * HOUR,
  6 * HOUR,
  12 * HOUR,
  DAY,
  2 * DAY,
  7 * DAY,
  14 * DAY,
  30 * DAY,
  60 * DAY,
  90 * DAY,
];

/** The smallest whole duration step that splits `span` seconds into at most `count` intervals. */
export function durationStep(span: number, count: number): number {
  return (
    DURATION_STEPS.find((step) => span / step <= count) ?? DURATION_STEPS[DURATION_STEPS.length - 1]!
  );
}

/**
 * Ticks for a duration axis in seconds, on whole minutes, hours or days:
 * 0 / 2h / 4h / 6h / 8h / 10h for a window between 1.4h and 8.7h.
 */
export function durationScale(minSeconds: number, maxSeconds: number, count = 4): AxisScale {
  const lo = Math.max(0, Math.min(minSeconds, maxSeconds));
  const hi = Math.max(minSeconds, maxSeconds, lo + 60);
  return stepScale(lo, hi, durationStep(hi - lo, count));
}

/**
 * Ticks for an elapsed-time axis that starts at zero: whole steps inside the
 * range and none past its end, 0 / 14d / 28d / 42d for a 43-day cycle.
 * The axis itself still ends at `maxSeconds`.
 */
export function elapsedTicks(maxSeconds: number, count = 6): number[] {
  if (!(maxSeconds > 0)) return [0];
  const step = durationStep(maxSeconds, count);
  const ticks: number[] = [];
  for (let value = 0; value <= maxSeconds; value += step) ticks.push(value);
  return ticks;
}

/** A calendar step for a date axis. */
export type TimeStep =
  | { unit: 'hour'; size: 1 | 3 | 6 | 12 }
  | { unit: 'day'; size: 1 | 2 | 7 | 14 }
  | { unit: 'month'; size: 1 | 2 | 3 | 6 | 12 };

const TIME_STEPS: readonly TimeStep[] = [
  { unit: 'hour', size: 1 },
  { unit: 'hour', size: 3 },
  { unit: 'hour', size: 6 },
  { unit: 'hour', size: 12 },
  { unit: 'day', size: 1 },
  { unit: 'day', size: 2 },
  { unit: 'day', size: 7 },
  { unit: 'day', size: 14 },
  { unit: 'month', size: 1 },
  { unit: 'month', size: 2 },
  { unit: 'month', size: 3 },
  { unit: 'month', size: 6 },
  { unit: 'month', size: 12 },
];

const UNIT_SECONDS = { hour: HOUR, day: DAY, month: 30.44 * DAY } as const;

/** The finest calendar step that puts at most `count` ticks inside `[fromTs, toTs]`. */
export function timeStep(fromTs: number, toTs: number, count = 6): TimeStep {
  const span = Math.max(1, toTs - fromTs);
  return (
    TIME_STEPS.find((step) => span / (step.size * UNIT_SECONDS[step.unit]) <= count) ??
    TIME_STEPS[TIME_STEPS.length - 1]!
  );
}

/**
 * Tick instants (Unix seconds) on UTC calendar boundaries inside
 * `[fromTs, toTs]`: whole hours, midnights, or the first day of a month on
 * the step's grid (January, April, July and October for three months).
 */
export function timeTicks(fromTs: number, toTs: number, step: TimeStep): number[] {
  if (!(toTs >= fromTs)) return [];
  const ticks: number[] = [];
  if (step.unit === 'month') {
    const start = new Date(fromTs * 1000);
    // Months since 1970 of the first grid boundary at or after the start.
    let month = start.getUTCFullYear() * 12 + start.getUTCMonth();
    if (Date.UTC(Math.floor(month / 12), month % 12, 1) / 1000 < fromTs) month += 1;
    month = Math.ceil(month / step.size) * step.size;
    for (;;) {
      const ts = Date.UTC(Math.floor(month / 12), month % 12, 1) / 1000;
      if (ts > toTs) break;
      ticks.push(ts);
      month += step.size;
    }
    return ticks;
  }
  const seconds = step.size * UNIT_SECONDS[step.unit];
  for (let ts = Math.ceil(fromTs / seconds) * seconds; ts <= toTs; ts += seconds) ticks.push(ts);
  return ticks;
}

/**
 * The ranges the all-time activity charts query (frequency, spikes, active
 * periods), worked out from the span of the indexed gesture history. The
 * charts' hooks and the page's server read (`readActivity`) both take their
 * query keys from here, so a range the server seeds is the one the chart
 * asks for. Pure: no React, safe on the server.
 */

export const HOUR_SECS = 3_600;
export const DAY_SECS = 86_400;

/** How far back the all-time charts look when the indexed history cannot be read. */
export const FALLBACK_LOOKBACK_SECS = 365 * DAY_SECS;

/** How many participants the active-periods timeline ranks. */
export const ACTIVE_PERIODS_TOP_N = 20;

/** The indexed history's bounds, as the API answers them (Unix seconds, 0 when unknown). */
export interface GestureBoundsAnswer {
  MinTs?: number;
  MaxTs?: number;
}

/** The span of the indexed gesture history, Unix seconds. */
export interface GestureSpan {
  /** The first indexed gesture. */
  firstTs: number;
  /** The latest indexed gesture. */
  lastTs: number;
}

/** A range to query, Unix seconds. */
export interface TimeRange {
  initTs: number;
  finTs: number;
}

/** A range to query in buckets of `intervalSecs`. */
export interface BucketRange extends TimeRange {
  intervalSecs: number;
}

/** A detected spike's first and last hour, Unix seconds. */
export interface SpikeHours {
  StartTs: number;
  EndTs: number;
}

/** Whether the API gave the history's bounds, so the charts' ranges follow from them alone. */
export function hasGestureBounds(answer: GestureBoundsAnswer | null | undefined): boolean {
  return (answer?.MinTs ?? 0) > 0 && (answer?.MaxTs ?? 0) > 0;
}

/**
 * The span the charts query: the indexed bounds, or, when they cannot be
 * read or report nothing, the `FALLBACK_LOOKBACK_SECS` before `now`.
 */
export function gestureSpan(
  answer: GestureBoundsAnswer | null | undefined,
  now: number,
): GestureSpan {
  const lastTs = answer?.MaxTs && answer.MaxTs > 0 ? answer.MaxTs : now;
  const firstTs =
    answer?.MinTs && answer.MinTs > 0 ? answer.MinTs : lastTs - FALLBACK_LOOKBACK_SECS;
  return { firstTs, lastTs };
}

/** How far back each frequency view looks: a year of days, a week of hours. */
const FREQUENCY_LOOKBACK_SECS = { day: 365 * DAY_SECS, hour: 7 * DAY_SECS } as const;

/**
 * The frequency chart's buckets: a year of days or a week of hours up to the
 * latest gesture, never before the first, on whole buckets.
 */
export function frequencyRange(span: GestureSpan, interval: 'day' | 'hour'): BucketRange {
  const intervalSecs = interval === 'hour' ? HOUR_SECS : DAY_SECS;
  const start = Math.max(span.firstTs, span.lastTs - FREQUENCY_LOOKBACK_SECS[interval]);
  return {
    initTs: Math.floor(start / intervalSecs) * intervalSecs,
    finTs: span.lastTs + intervalSecs,
    intervalSecs,
  };
}

/** The hours the spike chart searches: the last year, up to the latest gesture. */
export function spikeSearchRange(span: GestureSpan): BucketRange {
  return {
    initTs: Math.max(span.firstTs, span.lastTs - 365 * DAY_SECS),
    finTs: span.lastTs + HOUR_SECS,
    intervalSecs: HOUR_SECS,
  };
}

/** Hours drawn on each side of a spike. */
const SPIKE_PADDING_SECS = 12 * HOUR_SECS;

/** The start of the hour a moment falls in, Unix seconds. */
export const alignHour = (ts: number): number => Math.floor(ts / HOUR_SECS) * HOUR_SECS;

/** The hours drawn around one spike, with half a day on each side. */
export function spikeViewRange(spike: SpikeHours): TimeRange {
  return {
    initTs: alignHour(spike.StartTs - SPIKE_PADDING_SECS),
    finTs: alignHour(spike.EndTs + SPIKE_PADDING_SECS) + HOUR_SECS,
  };
}

/**
 * The spike a reader lands on: the recent one when the backend flags one,
 * else the latest by start time (the array order is not guaranteed).
 */
export function defaultSpikeIndex(
  spikes: readonly SpikeHours[],
  recentIndex: number,
): number | null {
  if (spikes.length === 0) return null;
  if (recentIndex >= 0 && recentIndex < spikes.length) return recentIndex;
  let latest = 0;
  spikes.forEach((spike, index) => {
    if (spike.StartTs > spikes[latest]!.StartTs) latest = index;
  });
  return latest;
}

/** The active-periods timeline's range: the whole history, to the hour after the latest gesture. */
export function activePeriodsRange(span: GestureSpan): TimeRange {
  return { initTs: span.firstTs, finTs: span.lastTs + HOUR_SECS };
}

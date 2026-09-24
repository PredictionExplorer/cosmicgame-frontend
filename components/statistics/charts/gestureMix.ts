/**
 * The gesture-method mix of one cycle, counted from the cycle's own gesture
 * list: how many gestures of each method (ETH, ETH with a Random Walk NFT,
 * CST) landed in each interval. Counts, not shares, so the chart shows how
 * busy each window was as well as its mix, and an empty window reads as
 * empty instead of as "0% of every method".
 */

/** The API's numeric `GestureType`: 0 ETH, 1 ETH with a Random Walk NFT, 2 CST. */
const METHOD_BY_TYPE = { 0: 'eth', 1: 'ethRandomWalk', 2: 'cst' } as const;

export type GestureMethodKey = (typeof METHOD_BY_TYPE)[keyof typeof METHOD_BY_TYPE];

export const GESTURE_METHODS: readonly GestureMethodKey[] = ['eth', 'ethRandomWalk', 'cst'];

export interface MixCounts {
  eth: number;
  ethRandomWalk: number;
  cst: number;
  total: number;
}

export interface MixBucket extends MixCounts {
  /** The interval's start, Unix seconds. */
  start: number;
}

interface GestureLike {
  TimeStamp?: number;
  GestureType?: number;
}

const methodOf = (gesture: GestureLike): GestureMethodKey | null =>
  typeof gesture.GestureType === 'number'
    ? (METHOD_BY_TYPE[gesture.GestureType as keyof typeof METHOD_BY_TYPE] ?? null)
    : null;

const empty = (): MixCounts => ({ eth: 0, ethRandomWalk: 0, cst: 0, total: 0 });

/** Gestures of each method across the whole list. Unknown methods count toward nothing. */
export function mixTotals(gestures: readonly GestureLike[]): MixCounts {
  const totals = empty();
  for (const gesture of gestures) {
    const method = methodOf(gesture);
    if (!method) continue;
    totals[method] += 1;
    totals.total += 1;
  }
  return totals;
}

/** Sampling intervals the mix chart offers, in seconds. */
export const MIX_INTERVALS = [3_600, 21_600, 43_200, 86_400] as const;
export type MixInterval = (typeof MIX_INTERVALS)[number];

/** The most bars a chart draws; finer intervals are not offered past it. */
export const MAX_MIX_BUCKETS = 240;

/** The intervals that keep a `span`-second cycle within `MAX_MIX_BUCKETS` bars. */
export function mixIntervalsFor(span: number): MixInterval[] {
  const fitting = MIX_INTERVALS.filter((interval) => span / interval <= MAX_MIX_BUCKETS);
  return fitting.length > 0 ? fitting : [MIX_INTERVALS[MIX_INTERVALS.length - 1]!];
}

/** A readable default: hourly for a day or two, six-hourly for two weeks, then daily. */
export function defaultMixInterval(span: number): MixInterval {
  const preferred: MixInterval = span <= 2 * 86_400 ? 3_600 : span <= 14 * 86_400 ? 21_600 : 86_400;
  const fitting = mixIntervalsFor(span);
  return fitting.includes(preferred) ? preferred : fitting[fitting.length - 1]!;
}

/**
 * Counts per method in consecutive `interval`-second windows from `fromTs`
 * (aligned down to the interval) through `toTs`, every window present even
 * when empty. Gestures outside the range are ignored.
 */
export function bucketGestureMix(
  gestures: readonly GestureLike[],
  fromTs: number,
  toTs: number,
  interval: number,
): MixBucket[] {
  if (!(interval > 0) || !(toTs >= fromTs)) return [];
  const first = Math.floor(fromTs / interval) * interval;
  const count = Math.floor((toTs - first) / interval) + 1;
  const buckets: MixBucket[] = Array.from({ length: count }, (_, index) => ({
    start: first + index * interval,
    ...empty(),
  }));
  for (const gesture of gestures) {
    const ts = gesture.TimeStamp;
    const method = methodOf(gesture);
    if (typeof ts !== 'number' || !method || ts < first || ts > toTs) continue;
    const bucket = buckets[Math.floor((ts - first) / interval)];
    if (!bucket) continue;
    bucket[method] += 1;
    bucket.total += 1;
  }
  return buckets;
}

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
 * when empty. Each window is half-open, [start, start + interval), and the
 * last one holds `toTs`, so a gesture at `toTs` (the live cycle's latest)
 * counts. Gestures outside the range are ignored.
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

/** A window this many times the 95th percentile of the others is an outlier. */
export const MIX_OUTLIER_RATIO = 2.5;
/** Below this many non-empty windows the chart draws every window whole. */
const MIN_WINDOWS_FOR_CAP = 12;

/**
 * Where a mix chart's value axis stops, or null to draw every window whole.
 * One window far above the rest (a cycle's opening surge) would otherwise set
 * the axis and flatten every other bar to the floor. When the tallest window
 * passes `MIX_OUTLIER_RATIO` times the 95th percentile of the non-empty
 * windows, the axis stops a fifth above that percentile; taller windows are
 * drawn clipped (`plotMixBuckets`) and labelled with their true count.
 */
export function mixAxisCap(buckets: readonly MixCounts[]): number | null {
  const totals = buckets
    .map((bucket) => bucket.total)
    .filter((total) => total > 0)
    .sort((a, b) => a - b);
  if (totals.length < MIN_WINDOWS_FOR_CAP) return null;
  const p95 = totals[Math.ceil(totals.length * 0.95) - 1]!;
  const max = totals[totals.length - 1]!;
  return max > MIX_OUTLIER_RATIO * p95 ? Math.ceil(p95 * 1.2) : null;
}

export interface MixPlotBucket extends MixBucket {
  /** The heights drawn: the counts, or scaled into the axis for a clipped window. */
  plotted: Record<GestureMethodKey, number>;
  /** The window is taller than the axis: drawn to its top, with its true count. */
  clipped: boolean;
}

/**
 * The windows as the chart draws them against an axis that stops at `limit`:
 * a window above it keeps its method mix, scaled to the axis's full height,
 * and is marked `clipped`; every other window draws its counts as they are.
 */
export function plotMixBuckets(buckets: readonly MixBucket[], limit: number): MixPlotBucket[] {
  return buckets.map((bucket) => {
    const clipped = limit > 0 && bucket.total > limit;
    const scale = clipped ? limit / bucket.total : 1;
    return {
      ...bucket,
      clipped,
      plotted: {
        eth: bucket.eth * scale,
        ethRandomWalk: bucket.ethRandomWalk * scale,
        cst: bucket.cst * scale,
      },
    };
  });
}

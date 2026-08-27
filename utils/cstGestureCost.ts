interface GestureEntry {
  TimeStamp: number;
  GestureType?: number;
  BidType?: number;
  BidderAddr?: string;
  TxHash?: string;
  EvtLogId?: number;
  /** Normalized CST amount paid (CST gestures only). */
  CstCost?: number;
  /** Raw CST price from the API; negative sentinel on ETH gestures. */
  CstPriceEth?: number;
  /** Allocation-clock deadline (unix seconds) in effect AFTER this gesture. */
  PrizeTime?: number;
  [key: string]: unknown;
}

/** One CST gesture: what was paid and how much clock was left when it landed. */
export interface CstGestureCostPoint {
  /** Unix seconds of the gesture. */
  ts: number;
  /** Hours elapsed since the cycle's first gesture (chart X-axis). */
  hoursIntoRound: number;
  /** CST actually paid. */
  cstPaid: number;
  /**
   * Value used on the log axis: `cstPaid` floored at the series' smallest
   * positive price so free/zero-paid gestures remain plottable.
   */
  cstPlotted: number;
  /** True when `cstPlotted` was clamped up from a zero/near-zero payment. */
  isClamped: boolean;
  /**
   * Seconds left on the allocation clock immediately before this gesture
   * (previous gesture's post-gesture deadline minus this timestamp), or null
   * for the cycle's first gesture where no prior deadline is recorded.
   */
  clockRemainingSeconds: number | null;
  bidder: string;
  txHash: string;
}

export interface CstGestureCostSeries {
  points: CstGestureCostPoint[];
  roundStart: number;
  /** Smallest positive CST paid; also the log-axis floor. */
  minPaid: number;
  /** Largest CST paid and when it happened. */
  maxPaid: number;
  maxTs: number;
  /** Total CST consumed by all CST gestures in the cycle. */
  totalPaid: number;
}

const EMPTY: CstGestureCostSeries = {
  points: [],
  roundStart: 0,
  minPaid: 0,
  maxPaid: 0,
  maxTs: 0,
  totalPaid: 0,
};

/** Fallback log floor when every CST gesture in the cycle was free. */
const DEFAULT_FLOOR = 0.01;

function cstPaidOf(entry: GestureEntry): number | null {
  const type = typeof entry.GestureType === 'number' ? entry.GestureType : entry.BidType;
  if (type !== 2) return null;
  const paid =
    typeof entry.CstCost === 'number' && entry.CstCost >= 0
      ? entry.CstCost
      : typeof entry.CstPriceEth === 'number' && entry.CstPriceEth >= 0
        ? entry.CstPriceEth
        : null;
  return paid;
}

/**
 * Builds the per-cycle CST gesture cost series from the cycle's full gesture
 * list. Each CST gesture contributes one point: the CST actually paid, plus
 * how many seconds were left on the allocation clock right before it landed
 * (the previous gesture's `PrizeTime` is the deadline after that gesture, so
 * `prev.PrizeTime - this.TimeStamp` is the remaining clock at gesture time).
 *
 * ETH gestures never appear as points but still advance the clock reference.
 * Prices are floored at the series' smallest positive payment for log-axis
 * plotting; the true `cstPaid` (possibly 0) is preserved for tooltips.
 */
export const getCstGestureCostSeries = (gestureList: GestureEntry[]): CstGestureCostSeries => {
  if (!gestureList || gestureList.length === 0) return EMPTY;

  const sorted = gestureList
    .filter((g) => typeof g.TimeStamp === 'number' && g.TimeStamp > 0)
    .sort((a, b) => a.TimeStamp - b.TimeStamp || (a.EvtLogId ?? 0) - (b.EvtLogId ?? 0));
  if (sorted.length === 0) return EMPTY;

  const roundStart = sorted[0]!.TimeStamp;

  type RawPoint = Omit<CstGestureCostPoint, 'cstPlotted' | 'isClamped'>;
  const raw: RawPoint[] = [];
  let prevDeadline: number | null = null;
  for (const g of sorted) {
    const paid = cstPaidOf(g);
    if (paid !== null) {
      raw.push({
        ts: g.TimeStamp,
        hoursIntoRound: (g.TimeStamp - roundStart) / 3600,
        cstPaid: paid,
        clockRemainingSeconds:
          prevDeadline !== null && prevDeadline > 0
            ? Math.max(0, prevDeadline - g.TimeStamp)
            : null,
        bidder: typeof g.BidderAddr === 'string' ? g.BidderAddr : '',
        txHash: typeof g.TxHash === 'string' ? g.TxHash : '',
      });
    }
    if (typeof g.PrizeTime === 'number' && g.PrizeTime > 0) {
      prevDeadline = g.PrizeTime;
    }
  }
  if (raw.length === 0) return EMPTY;

  const positives = raw.filter((p) => p.cstPaid > 0);
  const floor = positives.length > 0 ? Math.min(...positives.map((p) => p.cstPaid)) : DEFAULT_FLOOR;

  const points: CstGestureCostPoint[] = raw.map((p) => ({
    ...p,
    cstPlotted: Math.max(p.cstPaid, floor),
    isClamped: p.cstPaid < floor,
  }));

  let maxIdx = 0;
  let totalPaid = 0;
  for (let i = 0; i < points.length; i++) {
    totalPaid += points[i]!.cstPaid;
    if (points[i]!.cstPaid > points[maxIdx]!.cstPaid) maxIdx = i;
  }

  return {
    points,
    roundStart,
    minPaid: floor,
    maxPaid: points[maxIdx]!.cstPaid,
    maxTs: points[maxIdx]!.ts,
    totalPaid,
  };
};

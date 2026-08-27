interface GestureEntry {
  TimeStamp: number;
  GestureType?: number;
  BidderAddr?: string;
  /** Window seconds after this gesture's effect (V2 events; -1 on legacy cycles). */
  CstDutchAuctionDurationInt?: number;
  EvtLogId?: number;
  [key: string]: unknown;
}

/** One step of the CST Calibration Window evolution: the window after a gesture landed. */
export interface CstCalibrationPoint {
  /** Unix seconds of the gesture (or of "now"/round end for the synthetic last point). */
  ts: number;
  /** Hours elapsed since the cycle's first recorded gesture (chart X-axis). */
  hoursIntoRound: number;
  /** Calibration Window length in seconds after this gesture's effect. */
  windowSeconds: number;
  /** Backend gesture type: 0 = ETH, 1 = RandomWalk, 2 = CST; -1 for the synthetic end point. */
  gestureType: number;
  /** Address that made the gesture ('' for the synthetic end point). */
  bidder: string;
}

export interface CstCalibrationTimeline {
  points: CstCalibrationPoint[];
  roundStart: number;
  roundEnd: number;
  /** Shortest window reached during the cycle (seconds) and when. */
  minSeconds: number;
  minTs: number;
  /** Longest window reached during the cycle (seconds) and when. */
  maxSeconds: number;
  maxTs: number;
  /** Window in effect at the end of the timeline (live "now" or finalization). */
  currentSeconds: number;
}

const EMPTY: CstCalibrationTimeline = {
  points: [],
  roundStart: 0,
  roundEnd: 0,
  minSeconds: 0,
  minTs: 0,
  maxSeconds: 0,
  maxTs: 0,
  currentSeconds: 0,
};

function windowSecondsOf(entry: GestureEntry): number | null {
  const value = entry.CstDutchAuctionDurationInt;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Builds the CST Calibration Window timeline for one cycle from its gesture
 * list. Each V2 `BidPlaced` event records the window length AFTER that
 * gesture's own effect (verified against production data: consecutive values
 * differ by exactly the current gesture's factor — ETH shortens, CST
 * lengthens), so the series is a step function that changes at each gesture.
 *
 * Gestures without a recorded window (legacy events report -1) are skipped;
 * cycles that predate the V2 event format therefore produce an empty
 * timeline. A synthetic final point extends the last window value to
 * `roundEndTimeStamp` (pass a finalized cycle's claim timestamp; leave 0 for
 * the live cycle, which extends to `nowTimeStamp`).
 */
export const getCstCalibrationTimeline = (
  gestureList: GestureEntry[],
  roundEndTimeStamp: number = 0,
  nowTimeStamp: number = Math.floor(Date.now() / 1000),
): CstCalibrationTimeline => {
  if (!gestureList || gestureList.length === 0) return EMPTY;

  const valid = gestureList
    .filter((g) => windowSecondsOf(g) !== null && typeof g.TimeStamp === 'number')
    .sort((a, b) => a.TimeStamp - b.TimeStamp || (a.EvtLogId ?? 0) - (b.EvtLogId ?? 0));
  if (valid.length === 0) return EMPTY;

  const roundStart = valid[0]!.TimeStamp;
  const requestedEnd = roundEndTimeStamp > 0 ? roundEndTimeStamp : nowTimeStamp;
  // Guard against a stale "now" that predates the last gesture.
  const roundEnd = Math.max(requestedEnd, valid[valid.length - 1]!.TimeStamp);

  const points: CstCalibrationPoint[] = valid.map((g) => ({
    ts: g.TimeStamp,
    hoursIntoRound: (g.TimeStamp - roundStart) / 3600,
    windowSeconds: windowSecondsOf(g)!,
    gestureType: typeof g.GestureType === 'number' ? g.GestureType : 0,
    bidder: typeof g.BidderAddr === 'string' ? g.BidderAddr : '',
  }));

  let minIdx = 0;
  let maxIdx = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i]!.windowSeconds < points[minIdx]!.windowSeconds) minIdx = i;
    if (points[i]!.windowSeconds > points[maxIdx]!.windowSeconds) maxIdx = i;
  }

  const last = points[points.length - 1]!;
  if (roundEnd > last.ts) {
    points.push({
      ts: roundEnd,
      hoursIntoRound: (roundEnd - roundStart) / 3600,
      windowSeconds: last.windowSeconds,
      gestureType: -1,
      bidder: '',
    });
  }

  return {
    points,
    roundStart,
    roundEnd,
    minSeconds: points[minIdx]!.windowSeconds,
    minTs: points[minIdx]!.ts,
    maxSeconds: points[maxIdx]!.windowSeconds,
    maxTs: points[maxIdx]!.ts,
    currentSeconds: last.windowSeconds,
  };
};

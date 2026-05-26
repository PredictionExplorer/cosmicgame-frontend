// lexicon-allow-start: backend analytics wire names and sealed field names
import type {
  BidFrequencyBucket,
  BidSpike,
  BidderActivePeriod,
  BiddingActivityResponse,
  BidTimeBounds,
  TopBidderActivePeriodsResponse,
  TopBidderInfo,
} from '@/services/api/types';

const RECENT_SPIKE_WINDOW_SECS = 30 * 24 * 3600;

/** First hour after cycle start is excluded from bidding analytics (opening burst). */
export const CYCLE_OPEN_EXCLUDE_SECS = 3600;

/** Minimum fields needed for cycle-open filtering and bucket timing. */
export type GestureTimingPoint = {
  TimeStamp: number;
  RoundNum?: number;
};

type GesturePoint = GestureTimingPoint & {
  BidderAddr: string;
};

type UniqueBidderPoint = {
  BidderAid: string | number;
  BidderAddr: string;
  NumBids: number;
};

function alignBucketTs(ts: number, intervalSecs: number): number {
  if (intervalSecs === 3600 || intervalSecs === 86400) {
    return Math.floor(ts / intervalSecs) * intervalSecs;
  }
  return ts;
}

function bucketKey(ts: number, initTs: number, intervalSecs: number): number {
  if (intervalSecs === 3600 || intervalSecs === 86400) {
    return alignBucketTs(ts, intervalSecs);
  }
  if (ts < initTs) return -1;
  return initTs + Math.floor((ts - initTs) / intervalSecs) * intervalSecs;
}

/** Earliest gesture timestamp per cycle (mirrors cg_round_stats.round_start_time). */
export function buildRoundStartTimes(gestures: GestureTimingPoint[]): Map<number, number> {
  const starts = new Map<number, number>();
  for (const gesture of gestures) {
    if (gesture.RoundNum === undefined) continue;
    const existing = starts.get(gesture.RoundNum);
    if (existing === undefined || gesture.TimeStamp < existing) {
      starts.set(gesture.RoundNum, gesture.TimeStamp);
    }
  }
  return starts;
}

/** Drop gestures in the first hour after each cycle start. */
export function excludeCycleOpenHour<T extends GestureTimingPoint>(
  gestures: T[],
  roundStarts: Map<number, number>,
): T[] {
  return gestures.filter((gesture) => {
    if (gesture.RoundNum === undefined) return true;
    const startTs = roundStarts.get(gesture.RoundNum);
    if (startTs === undefined) return true;
    return gesture.TimeStamp - startTs >= CYCLE_OPEN_EXCLUDE_SECS;
  });
}

/** Build time buckets (UTC-aligned for hourly/daily; matches backend). */
export function buildFrequencyBuckets(
  gestures: GesturePoint[],
  initTs: number,
  finTs: number,
  intervalSecs: number,
): BidFrequencyBucket[] {
  if (intervalSecs <= 0 || finTs <= initTs) return [];

  const bucketStart = alignBucketTs(initTs, intervalSecs);
  const bucketEnd =
    intervalSecs === 3600 || intervalSecs === 86400
      ? alignBucketTs(finTs, intervalSecs) + intervalSecs
      : finTs;

  const bucketMap = new Map<number, { numBids: number; bidders: Set<string> }>();
  for (let ts = bucketStart; ts < bucketEnd; ts += intervalSecs) {
    bucketMap.set(ts, { numBids: 0, bidders: new Set() });
  }

  for (const gesture of gestures) {
    const ts = gesture.TimeStamp;
    if (ts < initTs || ts >= finTs) continue;
    const key = bucketKey(ts, initTs, intervalSecs);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    bucket.numBids += 1;
    bucket.bidders.add(gesture.BidderAddr.toLowerCase());
  }

  return Array.from(bucketMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucketTs, value]) => ({
      BucketTs: bucketTs,
      NumBids: value.numBids,
      UniqueBidders: value.bidders.size,
    }));
}

/** Detect merged bid-frequency spikes (mirrors backend DetectBidSpikes). */
export function detectBidSpikes(buckets: BidFrequencyBucket[], intervalSecs: number): BidSpike[] {
  if (buckets.length === 0) return [];

  const counts = buckets.map((b) => b.NumBids);
  const sum = counts.reduce((acc, c) => acc + c, 0);
  const mean = sum / counts.length;
  const variance = counts.reduce((acc, c) => acc + (c - mean) ** 2, 0) / counts.length;
  const stddev = Math.sqrt(variance);

  let threshold = mean + 2 * stddev;
  if (threshold < 5) threshold = 5;
  if (threshold < mean * 2 && mean >= 2) threshold = mean * 2;

  const runs: Array<{ startIdx: number; endIdx: number }> = [];
  let inRun = false;
  let runStart = 0;

  counts.forEach((count, index) => {
    if (count >= threshold && count >= 3) {
      if (!inRun) {
        inRun = true;
        runStart = index;
      }
      return;
    }
    if (inRun) {
      runs.push({ startIdx: runStart, endIdx: index - 1 });
      inRun = false;
    }
  });
  if (inRun) {
    runs.push({ startIdx: runStart, endIdx: counts.length - 1 });
  }

  return runs.map((run, index) => {
    let peakIdx = run.startIdx;
    let peakBids = counts[run.startIdx] ?? 0;
    let totalBids = 0;
    for (let i = run.startIdx; i <= run.endIdx; i += 1) {
      totalBids += counts[i] ?? 0;
      if ((counts[i] ?? 0) >= peakBids) {
        peakBids = counts[i] ?? 0;
        peakIdx = i;
      }
    }
    return {
      Index: index,
      StartTs: buckets[run.startIdx]!.BucketTs,
      EndTs: buckets[run.endIdx]!.BucketTs + intervalSecs,
      PeakTs: buckets[peakIdx]!.BucketTs,
      PeakNumBids: peakBids,
      TotalBids: totalBids,
      BucketCount: run.endIdx - run.startIdx + 1,
    };
  });
}

export function computeTimeBounds(gestures: GesturePoint[]): BidTimeBounds {
  if (gestures.length === 0) return { MinTs: 0, MaxTs: 0 };
  let minTs = gestures[0]!.TimeStamp;
  let maxTs = gestures[0]!.TimeStamp;
  for (const g of gestures) {
    if (g.TimeStamp < minTs) minTs = g.TimeStamp;
    if (g.TimeStamp > maxTs) maxTs = g.TimeStamp;
  }
  return { MinTs: minTs, MaxTs: maxTs };
}

export function toTopBidderInfo(bidders: UniqueBidderPoint[], topN: number): TopBidderInfo[] {
  return [...bidders]
    .sort((a, b) => b.NumBids - a.NumBids)
    .slice(0, topN)
    .map((b) => ({
      BidderAid: Number(b.BidderAid) || 0,
      BidderAddr: b.BidderAddr,
      NumBids: b.NumBids,
    }));
}

export function computeActivePeriods(
  gestures: GesturePoint[],
  topBidders: TopBidderInfo[],
  initTs: number,
  finTs: number,
  gapHours = 6,
  minBids = 2,
): BidderActivePeriod[] {
  const gapSecs = gapHours * 3600;
  const topAddrs = new Set(topBidders.map((b) => b.BidderAddr.toLowerCase()));
  const byBidder = new Map<string, GesturePoint[]>();

  for (const g of gestures) {
    if (g.TimeStamp < initTs || g.TimeStamp >= finTs) continue;
    const key = g.BidderAddr.toLowerCase();
    if (!topAddrs.has(key)) continue;
    const list = byBidder.get(key) ?? [];
    list.push(g);
    byBidder.set(key, list);
  }

  const periods: BidderActivePeriod[] = [];
  for (const bidder of topBidders) {
    const list = (byBidder.get(bidder.BidderAddr.toLowerCase()) ?? []).sort(
      (a, b) => a.TimeStamp - b.TimeStamp,
    );
    if (list.length === 0) continue;

    let sessionStart = list[0]!.TimeStamp;
    let sessionEnd = list[0]!.TimeStamp;
    let sessionCount = 1;

    const flush = () => {
      if (sessionCount >= minBids) {
        periods.push({
          BidderAid: bidder.BidderAid,
          BidderAddr: bidder.BidderAddr,
          PeriodStart: sessionStart,
          PeriodEnd: sessionEnd,
          NumBids: sessionCount,
          DurationSecs: sessionEnd - sessionStart,
        });
      }
    };

    for (let i = 1; i < list.length; i += 1) {
      const ts = list[i]!.TimeStamp;
      if (ts - sessionEnd > gapSecs) {
        flush();
        sessionStart = ts;
        sessionEnd = ts;
        sessionCount = 1;
      } else {
        sessionEnd = ts;
        sessionCount += 1;
      }
    }
    flush();
  }

  return periods.sort((a, b) => a.PeriodStart - b.PeriodStart);
}

export function buildBiddingActivityResponse(
  gestures: GesturePoint[],
  initTs: number,
  finTs: number,
  intervalSecs: number,
): BiddingActivityResponse {
  const frequencyHistory = buildFrequencyBuckets(gestures, initTs, finTs, intervalSecs);
  const spikes = detectBidSpikes(frequencyHistory, intervalSecs);
  const nowTs = Math.floor(Date.now() / 1000);
  let recentSpikeIndex = -1;
  for (const spike of spikes) {
    if (spike.StartTs >= nowTs - RECENT_SPIKE_WINDOW_SECS) {
      recentSpikeIndex = spike.Index;
    }
  }
  return {
    InitTs: initTs,
    FinTs: finTs,
    Interval: intervalSecs,
    FrequencyHistory: frequencyHistory,
    Spikes: spikes,
    RecentSpikeIndex: recentSpikeIndex,
    RecentWindowSecs: RECENT_SPIKE_WINDOW_SECS,
  };
}

export function buildTopBidderActivePeriodsResponse(
  gestures: GesturePoint[],
  bidders: UniqueBidderPoint[],
  topN: number,
  initTs: number,
  finTs: number,
  gapHours = 6,
  minBids = 2,
): TopBidderActivePeriodsResponse {
  const topBidders = toTopBidderInfo(bidders, topN);
  return {
    InitTs: initTs,
    FinTs: finTs,
    TopN: topN,
    GapHours: gapHours,
    MinBids: minBids,
    TopBidders: topBidders,
    ActivePeriods: computeActivePeriods(gestures, topBidders, initTs, finTs, gapHours, minBids),
  };
}
// lexicon-allow-end

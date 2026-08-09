// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import type { BidFrequencyBucket, TopBidderInfo } from '@/services/api/types';

import {
  CYCLE_OPEN_EXCLUDE_SECS,
  buildBiddingActivityResponse,
  buildFrequencyBuckets,
  buildRoundStartTimes,
  buildTopBidderActivePeriodsResponse,
  computeActivePeriods,
  computeTimeBounds,
  detectBidSpikes,
  excludeCycleOpenHour,
  toTopBidderInfo,
} from '../biddingAnalytics';

const HOUR = 3600;
const DAY = 86400;

/** Midnight-UTC anchor, so hourly and daily bucket alignment is exact. */
const BASE = 1_700_000_000 - (1_700_000_000 % DAY);

function gesture(ts: number, addr = '0xaaa') {
  return { TimeStamp: ts, BidderAddr: addr };
}

/**
 * A count series over `n` hourly buckets with a single tall bucket.
 *
 * The detector's threshold is `mean + 2·stddev`, which for one outlier in `n`
 * buckets works out to `(T/n)·(1 + 2·√(n−1))`. At n = 5 that is exactly `T`
 * (a knife edge); at n = 10 it is `0.7·T`, so the outlier clears the bar with
 * room to spare and the fixtures do not depend on float equality.
 */
function seriesWithOutliers(counts: number[]): BidFrequencyBucket[] {
  return counts.map((numBids, i) => ({
    BucketTs: BASE + i * HOUR,
    NumBids: numBids,
    UniqueBidders: 0,
  }));
}

/** `length` zero buckets with `values` written in at the given indices. */
function sparse(length: number, values: Record<number, number>): number[] {
  const counts = new Array<number>(length).fill(0);
  for (const [index, value] of Object.entries(values)) {
    counts[Number(index)] = value;
  }
  return counts;
}

describe('buildRoundStartTimes', () => {
  it('returns an empty map for no gestures', () => {
    expect(buildRoundStartTimes([]).size).toBe(0);
  });

  it('keeps the earliest timestamp per cycle regardless of input order', () => {
    const starts = buildRoundStartTimes([
      { TimeStamp: 500, RoundNum: 1 },
      { TimeStamp: 100, RoundNum: 1 },
      { TimeStamp: 300, RoundNum: 1 },
      { TimeStamp: 900, RoundNum: 2 },
    ]);

    expect(starts.get(1)).toBe(100);
    expect(starts.get(2)).toBe(900);
  });

  it('ignores gestures with no cycle number', () => {
    const starts = buildRoundStartTimes([{ TimeStamp: 100 }, { TimeStamp: 200, RoundNum: 3 }]);

    expect(starts.size).toBe(1);
    expect(starts.get(3)).toBe(200);
  });

  it('treats cycle 0 as a real cycle rather than a falsy key', () => {
    expect(buildRoundStartTimes([{ TimeStamp: 42, RoundNum: 0 }]).get(0)).toBe(42);
  });

  it('treats timestamp 0 as a real start rather than a missing one', () => {
    const starts = buildRoundStartTimes([
      { TimeStamp: 10, RoundNum: 1 },
      { TimeStamp: 0, RoundNum: 1 },
    ]);

    expect(starts.get(1)).toBe(0);
  });
});

describe('excludeCycleOpenHour', () => {
  it('drops gestures inside the opening hour and keeps later ones', () => {
    const input = [
      { TimeStamp: 1_000, RoundNum: 1 },
      { TimeStamp: 1_000 + HOUR - 1, RoundNum: 1 },
      { TimeStamp: 1_000 + HOUR + 1, RoundNum: 1 },
    ];

    const kept = excludeCycleOpenHour(input, buildRoundStartTimes(input));

    expect(kept.map((g) => g.TimeStamp)).toEqual([1_000 + HOUR + 1]);
  });

  it('keeps a gesture landing exactly on the one-hour boundary', () => {
    const input = [
      { TimeStamp: 1_000, RoundNum: 1 },
      { TimeStamp: 1_000 + CYCLE_OPEN_EXCLUDE_SECS, RoundNum: 1 },
    ];

    const kept = excludeCycleOpenHour(input, buildRoundStartTimes(input));

    expect(kept.map((g) => g.TimeStamp)).toEqual([1_000 + CYCLE_OPEN_EXCLUDE_SECS]);
  });

  it('gives every cycle its own opening window', () => {
    const input = [
      { TimeStamp: 1_000, RoundNum: 1 },
      { TimeStamp: 1_000 + 2 * HOUR, RoundNum: 1 },
      { TimeStamp: 50_000, RoundNum: 2 },
      { TimeStamp: 50_000 + 10, RoundNum: 2 },
    ];

    const kept = excludeCycleOpenHour(input, buildRoundStartTimes(input));

    expect(kept.map((g) => g.TimeStamp)).toEqual([1_000 + 2 * HOUR]);
  });

  it('keeps gestures whose cycle has no recorded start', () => {
    expect(excludeCycleOpenHour([{ TimeStamp: 10, RoundNum: 7 }], new Map())).toHaveLength(1);
  });

  it('keeps gestures with no cycle number at all', () => {
    expect(excludeCycleOpenHour([{ TimeStamp: 10 }], new Map([[1, 0]]))).toHaveLength(1);
  });

  it('returns a new list without mutating the input', () => {
    const input = [
      { TimeStamp: 1_000, RoundNum: 1 },
      { TimeStamp: 1_100, RoundNum: 1 },
    ];

    const kept = excludeCycleOpenHour(input, buildRoundStartTimes(input));

    expect(kept).not.toBe(input);
    expect(input).toHaveLength(2);
  });
});

describe('buildFrequencyBuckets', () => {
  it('returns nothing for a zero or negative interval rather than looping forever', () => {
    expect(buildFrequencyBuckets([gesture(BASE)], BASE, BASE + DAY, 0)).toEqual([]);
    expect(buildFrequencyBuckets([gesture(BASE)], BASE, BASE + DAY, -HOUR)).toEqual([]);
  });

  it('returns nothing when the window is empty or inverted', () => {
    expect(buildFrequencyBuckets([gesture(BASE)], BASE, BASE, HOUR)).toEqual([]);
    expect(buildFrequencyBuckets([gesture(BASE)], BASE + DAY, BASE, HOUR)).toEqual([]);
  });

  it('emits one zero-filled bucket per hour across the window', () => {
    const result = buildFrequencyBuckets([], BASE, BASE + 3 * HOUR, HOUR);

    expect(result.map((b) => b.BucketTs)).toEqual([
      BASE,
      BASE + HOUR,
      BASE + 2 * HOUR,
      BASE + 3 * HOUR,
    ]);
    expect(result.every((b) => b.NumBids === 0 && b.UniqueBidders === 0)).toBe(true);
  });

  it('counts gestures into their hour and de-duplicates participants case-insensitively', () => {
    const result = buildFrequencyBuckets(
      [
        gesture(BASE + 5, '0xAAA'),
        gesture(BASE + 10, '0xaaa'),
        gesture(BASE + 20, '0xBBB'),
        gesture(BASE + HOUR + 1, '0xAAA'),
      ],
      BASE,
      BASE + 2 * HOUR,
      HOUR,
    );

    expect(result[0]).toEqual({ BucketTs: BASE, NumBids: 3, UniqueBidders: 2 });
    expect(result[1]).toEqual({ BucketTs: BASE + HOUR, NumBids: 1, UniqueBidders: 1 });
  });

  it('includes a gesture exactly on initTs but excludes one exactly on finTs', () => {
    const result = buildFrequencyBuckets(
      [gesture(BASE), gesture(BASE + 2 * HOUR)],
      BASE,
      BASE + 2 * HOUR,
      HOUR,
    );

    expect(result.reduce((acc, b) => acc + b.NumBids, 0)).toBe(1);
    expect(result[0]!.NumBids).toBe(1);
  });

  it('drops gestures that fall before the window start', () => {
    const result = buildFrequencyBuckets(
      [gesture(BASE - 10), gesture(BASE + 10)],
      BASE,
      BASE + HOUR,
      HOUR,
    );

    expect(result.reduce((acc, b) => acc + b.NumBids, 0)).toBe(1);
  });

  it('aligns hourly buckets to the UTC grid when initTs is mid-hour', () => {
    const initTs = BASE + 30 * 60;

    const result = buildFrequencyBuckets([gesture(initTs + 60)], initTs, initTs + HOUR, HOUR);

    // The first bucket opens on the hour below initTs, not at initTs itself.
    expect(result[0]!.BucketTs).toBe(BASE);
    expect(result[0]!.NumBids).toBe(1);
    expect(result.every((b) => b.BucketTs % HOUR === 0)).toBe(true);
  });

  it('aligns daily buckets to midnight UTC', () => {
    const initTs = BASE + 13 * HOUR;

    const result = buildFrequencyBuckets([gesture(initTs)], initTs, initTs + DAY, DAY);

    expect(result.every((b) => b.BucketTs % DAY === 0)).toBe(true);
    expect(result[0]!.BucketTs).toBe(BASE);
  });

  it('anchors a custom interval to initTs instead of the UTC grid', () => {
    const initTs = BASE + 77;
    const interval = 6 * HOUR;

    const result = buildFrequencyBuckets(
      [gesture(initTs), gesture(initTs + interval + 5)],
      initTs,
      initTs + 2 * interval,
      interval,
    );

    expect(result.map((b) => b.BucketTs)).toEqual([initTs, initTs + interval]);
    expect(result.map((b) => b.NumBids)).toEqual([1, 1]);
  });

  it('returns buckets in ascending time order for out-of-order gestures', () => {
    const result = buildFrequencyBuckets(
      [gesture(BASE + 3 * HOUR), gesture(BASE), gesture(BASE + HOUR)],
      BASE,
      BASE + 4 * HOUR,
      HOUR,
    );
    const timestamps = result.map((b) => b.BucketTs);

    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  it('places a lone gesture in the bucket that opens its window', () => {
    const result = buildFrequencyBuckets([gesture(BASE + 60)], BASE, BASE + HOUR, HOUR);

    expect(result[0]).toEqual({ BucketTs: BASE, NumBids: 1, UniqueBidders: 1 });
  });

  it('emits the bucket containing finTs so a part-hour tail is not lost', () => {
    // finTs mid-hour: gestures between the last whole hour and finTs still
    // need somewhere to land, so the grid runs one interval past finTs.
    // Callers that pass an aligned finTs therefore get one trailing bucket
    // that is empty by construction (nothing at or after finTs is counted).
    const aligned = buildFrequencyBuckets([], BASE, BASE + HOUR, HOUR);
    expect(aligned.map((b) => b.BucketTs)).toEqual([BASE, BASE + HOUR]);

    const partial = buildFrequencyBuckets(
      [gesture(BASE + HOUR + 10)],
      BASE,
      BASE + HOUR + 30 * 60,
      HOUR,
    );
    expect(partial.find((b) => b.BucketTs === BASE + HOUR)!.NumBids).toBe(1);
  });
});

describe('detectBidSpikes', () => {
  it('returns nothing for an empty bucket list, without dividing by zero', () => {
    expect(detectBidSpikes([], HOUR)).toEqual([]);
  });

  it('never reports a lone bucket as a spike, however tall', () => {
    // With one bucket the mean *is* the count, and the mean-doubling rule
    // then puts the bar permanently out of reach.
    expect(detectBidSpikes(seriesWithOutliers([10_000]), HOUR)).toEqual([]);
  });

  it('ignores a flat series where nothing stands out', () => {
    expect(detectBidSpikes(seriesWithOutliers(new Array(10).fill(4)), HOUR)).toEqual([]);
  });

  it('ignores a busy but uniform series via the mean-doubling rule', () => {
    // Every bucket sits on the mean, so 2x the mean is unreachable.
    expect(detectBidSpikes(seriesWithOutliers(new Array(8).fill(6)), HOUR)).toEqual([]);
  });

  it('ignores an outlier below the absolute floor of five gestures', () => {
    // 4 clears mean + 2 stddev (2.8) but not the hard floor.
    expect(detectBidSpikes(seriesWithOutliers(sparse(10, { 5: 4 })), HOUR)).toEqual([]);
  });

  it('detects a single outlier and reports its window, peak and totals', () => {
    const spikes = detectBidSpikes(seriesWithOutliers(sparse(10, { 5: 10 })), HOUR);

    expect(spikes).toEqual([
      {
        Index: 0,
        StartTs: BASE + 5 * HOUR,
        EndTs: BASE + 6 * HOUR,
        PeakTs: BASE + 5 * HOUR,
        PeakNumBids: 10,
        TotalBids: 10,
        BucketCount: 1,
      },
    ]);
  });

  it('merges adjacent hot buckets into one run and sums them', () => {
    const spikes = detectBidSpikes(seriesWithOutliers(sparse(20, { 6: 20, 7: 30 })), HOUR);

    expect(spikes).toHaveLength(1);
    expect(spikes[0]).toMatchObject({
      StartTs: BASE + 6 * HOUR,
      EndTs: BASE + 8 * HOUR,
      PeakTs: BASE + 7 * HOUR,
      PeakNumBids: 30,
      TotalBids: 50,
      BucketCount: 2,
    });
  });

  it('breaks a run at the first quiet bucket', () => {
    const spikes = detectBidSpikes(seriesWithOutliers(sparse(20, { 6: 30, 8: 30 })), HOUR);

    expect(spikes.map((s) => s.BucketCount)).toEqual([1, 1]);
    expect(spikes.map((s) => s.StartTs)).toEqual([BASE + 6 * HOUR, BASE + 8 * HOUR]);
  });

  it('numbers multiple spikes sequentially from zero', () => {
    const spikes = detectBidSpikes(seriesWithOutliers(sparse(20, { 2: 30, 15: 30 })), HOUR);

    expect(spikes.map((s) => s.Index)).toEqual([0, 1]);
    expect(spikes.map((s) => s.PeakTs)).toEqual([BASE + 2 * HOUR, BASE + 15 * HOUR]);
  });

  it('closes an open run that reaches the end of the series', () => {
    const spikes = detectBidSpikes(seriesWithOutliers(sparse(20, { 18: 30, 19: 30 })), HOUR);

    expect(spikes).toHaveLength(1);
    expect(spikes[0]!.BucketCount).toBe(2);
    expect(spikes[0]!.EndTs).toBe(BASE + 20 * HOUR);
  });

  it('resolves a tied peak in favour of the later bucket', () => {
    const spikes = detectBidSpikes(seriesWithOutliers(sparse(20, { 6: 30, 7: 30 })), HOUR);

    expect(spikes[0]!.PeakTs).toBe(BASE + 7 * HOUR);
  });

  it('extends EndTs by the caller-supplied interval, not a fixed hour', () => {
    const daily = sparse(10, { 5: 30 }).map((numBids, i) => ({
      BucketTs: BASE + i * DAY,
      NumBids: numBids,
      UniqueBidders: 0,
    }));

    const spikes = detectBidSpikes(daily, DAY);

    expect(spikes[0]!.StartTs).toBe(BASE + 5 * DAY);
    expect(spikes[0]!.EndTs).toBe(BASE + 6 * DAY);
  });
});

describe('computeTimeBounds', () => {
  it('returns zeroed bounds for no gestures', () => {
    expect(computeTimeBounds([])).toEqual({ MinTs: 0, MaxTs: 0 });
  });

  it('returns the same instant for both bounds of a single gesture', () => {
    expect(computeTimeBounds([gesture(BASE)])).toEqual({ MinTs: BASE, MaxTs: BASE });
  });

  it('finds the extremes of an unsorted list', () => {
    expect(computeTimeBounds([gesture(500), gesture(100), gesture(900), gesture(300)])).toEqual({
      MinTs: 100,
      MaxTs: 900,
    });
  });

  it('treats zero as a real timestamp rather than an unset one', () => {
    expect(computeTimeBounds([gesture(-50), gesture(0)])).toEqual({ MinTs: -50, MaxTs: 0 });
  });
});

describe('toTopBidderInfo', () => {
  const participants = [
    { BidderAid: 1, BidderAddr: '0xa', NumBids: 3 },
    { BidderAid: 2, BidderAddr: '0xb', NumBids: 9 },
    { BidderAid: 3, BidderAddr: '0xc', NumBids: 5 },
  ];

  it('returns an empty ranking for no participants', () => {
    expect(toTopBidderInfo([], 5)).toEqual([]);
  });

  it('ranks by activity descending and truncates to topN', () => {
    expect(toTopBidderInfo(participants, 2).map((b) => b.BidderAddr)).toEqual(['0xb', '0xc']);
  });

  it('returns everyone when topN exceeds the list length', () => {
    expect(toTopBidderInfo(participants, 99)).toHaveLength(3);
  });

  it('returns nothing for a topN of zero', () => {
    expect(toTopBidderInfo(participants, 0)).toEqual([]);
  });

  it('does not reorder the caller list', () => {
    toTopBidderInfo(participants, 3);

    expect(participants.map((b) => b.BidderAddr)).toEqual(['0xa', '0xb', '0xc']);
  });

  it('coerces a numeric-string account id', () => {
    const ranked = toTopBidderInfo([{ BidderAid: '42', BidderAddr: '0xa', NumBids: 1 }], 1);

    expect(ranked[0]!.BidderAid).toBe(42);
  });

  it('falls back to 0 for an unparseable account id', () => {
    const ranked = toTopBidderInfo([{ BidderAid: 'nope', BidderAddr: '0xa', NumBids: 1 }], 1);

    expect(ranked[0]!.BidderAid).toBe(0);
  });
});

describe('computeActivePeriods', () => {
  const alice: TopBidderInfo = { BidderAid: 1, BidderAddr: '0xAlice', NumBids: 4 };
  const bob: TopBidderInfo = { BidderAid: 2, BidderAddr: '0xBob', NumBids: 2 };

  it('returns nothing when there are no ranked participants', () => {
    expect(computeActivePeriods([gesture(BASE)], [], BASE, BASE + DAY)).toEqual([]);
  });

  it('returns nothing when a ranked participant has no gestures in the window', () => {
    expect(computeActivePeriods([], [alice], BASE, BASE + DAY)).toEqual([]);
  });

  it('drops a session that never reaches the minimum gesture count', () => {
    expect(computeActivePeriods([gesture(BASE, '0xAlice')], [alice], BASE, BASE + DAY)).toEqual([]);
  });

  it('groups gestures inside the gap into one period with a duration', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE, '0xAlice'),
        gesture(BASE + HOUR, '0xAlice'),
        gesture(BASE + 2 * HOUR, '0xAlice'),
      ],
      [alice],
      BASE,
      BASE + DAY,
    );

    expect(periods).toEqual([
      {
        BidderAid: 1,
        BidderAddr: '0xAlice',
        PeriodStart: BASE,
        PeriodEnd: BASE + 2 * HOUR,
        NumBids: 3,
        DurationSecs: 2 * HOUR,
      },
    ]);
  });

  it('splits into two periods once the gap is exceeded', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE, '0xAlice'),
        gesture(BASE + 60, '0xAlice'),
        gesture(BASE + 7 * HOUR, '0xAlice'),
        gesture(BASE + 7 * HOUR + 60, '0xAlice'),
      ],
      [alice],
      BASE,
      BASE + DAY,
    );

    expect(periods.map((p) => p.PeriodStart)).toEqual([BASE, BASE + 7 * HOUR]);
  });

  it('keeps a gesture exactly one gap later inside the same period', () => {
    const periods = computeActivePeriods(
      [gesture(BASE, '0xAlice'), gesture(BASE + 6 * HOUR, '0xAlice')],
      [alice],
      BASE,
      BASE + DAY,
      6,
      2,
    );

    expect(periods).toHaveLength(1);
    expect(periods[0]!.NumBids).toBe(2);
  });

  it('starts a new period one second past the gap', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE, '0xAlice'),
        gesture(BASE + 1, '0xAlice'),
        gesture(BASE + 6 * HOUR + 2, '0xAlice'),
        gesture(BASE + 6 * HOUR + 3, '0xAlice'),
      ],
      [alice],
      BASE,
      BASE + DAY,
      6,
      2,
    );

    expect(periods).toHaveLength(2);
  });

  it('honours a custom gap that is shorter than the default', () => {
    const gestures = [gesture(BASE, '0xAlice'), gesture(BASE + 2 * HOUR, '0xAlice')];

    expect(computeActivePeriods(gestures, [alice], BASE, BASE + DAY, 1, 2)).toEqual([]);
    expect(computeActivePeriods(gestures, [alice], BASE, BASE + DAY, 6, 2)).toHaveLength(1);
  });

  it('matches participants case-insensitively but reports the ranked casing', () => {
    const periods = computeActivePeriods(
      [gesture(BASE, '0xALICE'), gesture(BASE + 60, '0xalice')],
      [alice],
      BASE,
      BASE + DAY,
    );

    expect(periods).toHaveLength(1);
    expect(periods[0]!.BidderAddr).toBe('0xAlice');
  });

  it('ignores gestures from participants outside the ranking', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE, '0xAlice'),
        gesture(BASE + 60, '0xAlice'),
        gesture(BASE, '0xCarol'),
        gesture(BASE + 60, '0xCarol'),
      ],
      [alice],
      BASE,
      BASE + DAY,
    );

    expect(periods.map((p) => p.BidderAddr)).toEqual(['0xAlice']);
  });

  it('clips gestures outside the requested window', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE - 10, '0xAlice'),
        gesture(BASE + 10, '0xAlice'),
        gesture(BASE + 20, '0xAlice'),
        gesture(BASE + DAY, '0xAlice'),
      ],
      [alice],
      BASE,
      BASE + DAY,
    );

    expect(periods).toHaveLength(1);
    expect(periods[0]!.PeriodStart).toBe(BASE + 10);
    expect(periods[0]!.PeriodEnd).toBe(BASE + 20);
  });

  it('sorts periods from every participant by start time', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE + 10 * HOUR, '0xAlice'),
        gesture(BASE + 10 * HOUR + 60, '0xAlice'),
        gesture(BASE, '0xBob'),
        gesture(BASE + 60, '0xBob'),
      ],
      [alice, bob],
      BASE,
      BASE + DAY,
    );

    expect(periods.map((p) => p.BidderAddr)).toEqual(['0xBob', '0xAlice']);
  });

  it('sorts each participant own gestures before splitting them into sessions', () => {
    const periods = computeActivePeriods(
      [
        gesture(BASE + 2 * HOUR, '0xAlice'),
        gesture(BASE, '0xAlice'),
        gesture(BASE + HOUR, '0xAlice'),
      ],
      [alice],
      BASE,
      BASE + DAY,
    );

    expect(periods).toHaveLength(1);
    expect(periods[0]!.PeriodStart).toBe(BASE);
    expect(periods[0]!.PeriodEnd).toBe(BASE + 2 * HOUR);
  });

  it('honours a raised minimum gesture count', () => {
    const gestures = [gesture(BASE, '0xAlice'), gesture(BASE + 60, '0xAlice')];

    expect(computeActivePeriods(gestures, [alice], BASE, BASE + DAY, 6, 3)).toEqual([]);
    expect(computeActivePeriods(gestures, [alice], BASE, BASE + DAY, 6, 2)).toHaveLength(1);
  });
});

describe('buildBiddingActivityResponse', () => {
  /** Midnight UTC, so every derived hour boundary below is exact. */
  const NOW = BASE + 100 * DAY;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW * 1000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /** 12 gestures inside one hour — comfortably above the spike threshold. */
  function burstAt(ts: number) {
    return Array.from({ length: 12 }, (_, i) => gesture(ts + i, `0xparticipant${i}`));
  }

  it('echoes the requested window, interval and recent-window length', () => {
    const response = buildBiddingActivityResponse([], BASE, BASE + DAY, HOUR);

    expect(response).toMatchObject({
      InitTs: BASE,
      FinTs: BASE + DAY,
      Interval: HOUR,
      RecentWindowSecs: 30 * DAY,
    });
  });

  it('reports no spike and no recent spike for quiet traffic', () => {
    const response = buildBiddingActivityResponse(
      [gesture(NOW - 9 * HOUR)],
      NOW - 10 * HOUR,
      NOW,
      HOUR,
    );

    expect(response.Spikes).toEqual([]);
    expect(response.RecentSpikeIndex).toBe(-1);
  });

  it('builds the buckets and the spikes from the same gestures', () => {
    const gestures = [...burstAt(NOW - 5 * HOUR), gesture(NOW - 9 * HOUR + 60)];

    const response = buildBiddingActivityResponse(gestures, NOW - 10 * HOUR, NOW, HOUR);

    expect(response.FrequencyHistory.reduce((acc, b) => acc + b.NumBids, 0)).toBe(13);
    expect(response.Spikes).toHaveLength(1);
    expect(response.Spikes[0]!.PeakNumBids).toBe(12);
    expect(response.Spikes[0]!.PeakTs).toBe(NOW - 5 * HOUR);
  });

  it('flags a spike that falls inside the 30-day recent window', () => {
    const response = buildBiddingActivityResponse(
      burstAt(NOW - 5 * HOUR),
      NOW - 10 * HOUR,
      NOW,
      HOUR,
    );

    expect(response.RecentSpikeIndex).toBe(response.Spikes[0]!.Index);
  });

  it('leaves a spike older than the recent window unflagged', () => {
    const initTs = NOW - 200 * DAY;

    const response = buildBiddingActivityResponse(
      burstAt(initTs + 5 * HOUR),
      initTs,
      initTs + 10 * HOUR,
      HOUR,
    );

    expect(response.Spikes).toHaveLength(1);
    expect(response.RecentSpikeIndex).toBe(-1);
  });

  it('flags the most recent spike when several are inside the window', () => {
    const gestures = [...burstAt(NOW - 20 * DAY), ...burstAt(NOW - 2 * DAY)];

    const response = buildBiddingActivityResponse(gestures, NOW - 25 * DAY, NOW, HOUR);

    expect(response.Spikes).toHaveLength(2);
    expect(response.RecentSpikeIndex).toBe(1);
  });
});

describe('buildTopBidderActivePeriodsResponse', () => {
  it('echoes its sessionising parameters', () => {
    const response = buildTopBidderActivePeriodsResponse([], [], 5, BASE, BASE + DAY, 3, 4);

    expect(response).toEqual({
      InitTs: BASE,
      FinTs: BASE + DAY,
      TopN: 5,
      GapHours: 3,
      MinBids: 4,
      TopBidders: [],
      ActivePeriods: [],
    });
  });

  it('ranks participants and derives their periods together', () => {
    const gestures = [
      gesture(BASE, '0xAlice'),
      gesture(BASE + 60, '0xAlice'),
      gesture(BASE + 120, '0xAlice'),
      gesture(BASE + 10 * HOUR, '0xBob'),
      gesture(BASE + 10 * HOUR + 60, '0xBob'),
    ];

    const response = buildTopBidderActivePeriodsResponse(
      gestures,
      [
        { BidderAid: 1, BidderAddr: '0xAlice', NumBids: 3 },
        { BidderAid: 2, BidderAddr: '0xBob', NumBids: 2 },
      ],
      2,
      BASE,
      BASE + DAY,
    );

    expect(response.TopBidders.map((b) => b.BidderAddr)).toEqual(['0xAlice', '0xBob']);
    expect(response.ActivePeriods.map((p) => p.NumBids)).toEqual([3, 2]);
  });

  it('excludes participants ranked outside topN from the periods', () => {
    const gestures = [
      gesture(BASE, '0xAlice'),
      gesture(BASE + 60, '0xAlice'),
      gesture(BASE, '0xBob'),
      gesture(BASE + 60, '0xBob'),
    ];

    const response = buildTopBidderActivePeriodsResponse(
      gestures,
      [
        { BidderAid: 1, BidderAddr: '0xAlice', NumBids: 5 },
        { BidderAid: 2, BidderAddr: '0xBob', NumBids: 2 },
      ],
      1,
      BASE,
      BASE + DAY,
    );

    expect(response.TopBidders).toHaveLength(1);
    expect(response.ActivePeriods.map((p) => p.BidderAddr)).toEqual(['0xAlice']);
  });
});
// lexicon-allow-end

import { dailySeries } from '@/app/[locale]/(app)/statistics/CycleRhythm';

import {
  bucketGestureMix,
  defaultMixInterval,
  mixIntervalsFor,
  mixTotals,
  MAX_MIX_BUCKETS,
} from '../gestureMix';
import { sliceRange, supplyByDate, supplyByGesture } from '../../CstSupplyHistory';
import { outcomeTotals } from '../../ParticipantOutcomesSection';
import { retrievedShare } from '../../ClaimsByRoundSection';
import { parseCycleParam } from '../../useCycleScope';
import { decadeTicks } from '../../CstGestureCostChart';

const DAY = 86_400;
const HOUR = 3_600;
const T0 = Date.UTC(2026, 7, 12) / 1000;

describe('gesture mix', () => {
  const gestures = [
    { TimeStamp: T0 + 10, GestureType: 0 },
    { TimeStamp: T0 + 20, GestureType: 2 },
    { TimeStamp: T0 + HOUR + 5, GestureType: 1 },
    { TimeStamp: T0 + 3 * HOUR, GestureType: 2 },
    { TimeStamp: T0 + 30, GestureType: 9 },
  ];

  it('counts each method and ignores unknown ones', () => {
    expect(mixTotals(gestures)).toEqual({ eth: 1, ethRandomWalk: 1, cst: 2, total: 4 });
  });

  it('keeps empty windows as empty counts, not as 0% of everything', () => {
    const buckets = bucketGestureMix(gestures, T0, T0 + 3 * HOUR, HOUR);
    expect(buckets.map((b) => b.total)).toEqual([2, 1, 0, 1]);
    expect(buckets[2]).toMatchObject({ eth: 0, ethRandomWalk: 0, cst: 0, total: 0 });
  });

  it('offers only intervals that stay under the bar limit, with a readable default', () => {
    const span = 43 * DAY;
    for (const interval of mixIntervalsFor(span)) {
      expect(span / interval).toBeLessThanOrEqual(MAX_MIX_BUCKETS);
    }
    expect(mixIntervalsFor(span)).not.toContain(HOUR);
    expect(defaultMixInterval(span)).toBe(DAY);
    expect(defaultMixInterval(DAY)).toBe(HOUR);
  });
});

describe('cycle rhythm', () => {
  it('fills every day of the window, oldest first, summing buckets per UTC day', () => {
    const series = dailySeries(
      [
        { BucketTs: T0 - DAY, NumBids: 3 },
        { BucketTs: T0 + 5 * HOUR, NumBids: 2 },
        { BucketTs: T0 + 9 * HOUR, NumBids: 4 },
      ],
      T0 + 12 * HOUR,
      3,
    );
    expect(series).toEqual([
      { day: T0 - 2 * DAY, count: 0 },
      { day: T0 - DAY, count: 3 },
      { day: T0, count: 6 },
    ]);
  });
});

describe('CST supply series', () => {
  const byDate = [
    {
      Date: '20260812',
      DateTime: '',
      TimeStamp: T0 + DAY,
      NumBids: 4,
      MintAmountEth: 10,
      BurnAmountEth: 2,
      AmountEth: 8,
      TotalSupplyEth: 108,
    },
    {
      Date: '20260811',
      DateTime: '',
      TimeStamp: T0,
      NumBids: 1,
      MintAmountEth: 100,
      BurnAmountEth: 0,
      AmountEth: 100,
      TotalSupplyEth: 100,
    },
  ];

  it('orders the daily series and keeps the day’s flows', () => {
    const points = supplyByDate(byDate);
    expect(points.map((p) => p.supply)).toEqual([100, 108]);
    expect(points[1]).toMatchObject({ imprinted: 10, burned: 2, net: 8, gestures: 4 });
  });

  it('places a day without a timestamp by its date', () => {
    const [point] = supplyByDate([
      { ...byDate[0]!, Date: '20260101', TimeStamp: undefined as unknown as number },
    ]);
    expect(point?.ts).toBe(Date.UTC(2026, 0, 1) / 1000);
    expect(
      supplyByDate([{ ...byDate[0]!, Date: 'n/a', TimeStamp: undefined as unknown as number }]),
    ).toEqual([]);
  });

  it('numbers gestures from the first and reads the nested transaction', () => {
    const points = supplyByGesture([
      {
        Tx: { TimeStamp: T0 + 60, TxHash: '0xb' },
        TotalSupplyEth: 5,
        MintAmountEth: 1,
        BurnAmountEth: 0,
        AmountEth: 1,
      },
      {
        Tx: { TimeStamp: T0, TxHash: '0xa' },
        TotalSupplyEth: 4,
        MintAmountEth: 4,
        BurnAmountEth: 0,
        AmountEth: 4,
      },
    ] as never);
    expect(points.map((p) => [p.gesture, p.supply, p.txHash])).toEqual([
      [1, 4, '0xa'],
      [2, 5, '0xb'],
    ]);
  });

  it('keeps the range back from the latest point', () => {
    const points = Array.from({ length: 100 }, (_, i) => ({
      ts: T0 + i * DAY,
      supply: i,
      imprinted: 0,
      burned: 0,
      net: 0,
    }));
    expect(sliceRange(points, '30')).toHaveLength(30);
    expect(sliceRange(points, '90')).toHaveLength(90);
    expect(sliceRange(points, 'all')).toHaveLength(100);
    expect(sliceRange([], '30')).toEqual([]);
  });
});

describe('participant outcomes', () => {
  it('totals spending beside what came back, and nothing that compares them', () => {
    const totals = outcomeTotals([
      { TotalEthSpentEth: 2, EthWonEth: 5 },
      { TotalEthSpentEth: 3, EthWonEth: 0 },
      { TotalEthSpentEth: 1, EthWonEth: 1 },
    ] as never);
    expect(totals).toEqual({ spent: 6, received: 6 });
  });

  it('reads a cycle’s retrieved share, and none when nothing was allocated', () => {
    expect(retrievedShare({ TotalAwarded: 4, TotalUnclaimed: 1 })).toBe(0.75);
    expect(retrievedShare({ TotalAwarded: 0, TotalUnclaimed: 0 })).toBeNull();
  });
});

describe('cycle scope', () => {
  it('reads ?cycle= for a finished cycle and follows the live one otherwise', () => {
    expect(parseCycleParam('?cycle=1', 3)).toBe(1);
    expect(parseCycleParam('?cycle=3', 3)).toBeNull();
    expect(parseCycleParam('?cycle=9', 3)).toBeNull();
    expect(parseCycleParam('?cycle=abc', 3)).toBeNull();
    expect(parseCycleParam('', 3)).toBeNull();
  });
});

describe('CST cost axis', () => {
  it('encloses the paid amounts in powers of ten', () => {
    expect(decadeTicks(0.4, 469)).toEqual([0.1, 1, 10, 100, 1000]);
  });
});

import { buildSelectionPool, poolShareOf } from '@/lib/selectionWeights';
import { getWeightedSelectionShare } from '@/lib/selectionStanding';

const A = '0xAaAa000000000000000000000000000000000001';
const B = '0xBbBb000000000000000000000000000000000002';

describe('buildSelectionPool', () => {
  it('derives per-gesture weights from the cumulative figures and sums them per participant', () => {
    // Weights: A 10, B 30, A 5 — cumulative 10, 40, 45.
    const pool = buildSelectionPool(7, [
      { gesturerAddress: A, cumulativeWeight: 10n },
      { gesturerAddress: B, cumulativeWeight: 40n },
      { gesturerAddress: A, cumulativeWeight: 45n },
    ]);
    expect(pool).not.toBeNull();
    expect(pool!.cycle).toBe(7);
    expect(pool!.numGestures).toBe(3);
    expect(pool!.totalWeight).toBe(45n);
    expect(pool!.weightByAddress.get(A.toLowerCase())).toBe(15n);
    expect(pool!.weightByAddress.get(B.toLowerCase())).toBe(30n);
    expect(pool!.countByAddress.get(A.toLowerCase())).toBe(2);
    expect(pool!.countByAddress.get(B.toLowerCase())).toBe(1);
  });

  it('returns null for a cycle whose stored weights read 0 (finished before the V3 upgrade)', () => {
    const pool = buildSelectionPool(2, [
      { gesturerAddress: A, cumulativeWeight: 0n },
      { gesturerAddress: B, cumulativeWeight: 0n },
    ]);
    expect(pool).toBeNull();
  });

  it('returns null without gestures', () => {
    expect(buildSelectionPool(0, [])).toBeNull();
  });
});

describe('poolShareOf', () => {
  const pool = buildSelectionPool(1, [
    { gesturerAddress: A, cumulativeWeight: 25n },
    { gesturerAddress: B, cumulativeWeight: 100n },
  ])!;

  it('is the participant weight over the whole pool, case-insensitive', () => {
    expect(poolShareOf(pool, A.toUpperCase().replace('0X', '0x'))).toBeCloseTo(0.25, 9);
    expect(poolShareOf(pool, B)).toBeCloseTo(0.75, 9);
  });

  it('is 0 for an address without gestures or without an address', () => {
    expect(poolShareOf(pool, '0xCcCc000000000000000000000000000000000003')).toBe(0);
    expect(poolShareOf(pool, null)).toBe(0);
  });

  it('stays exact for wei-scale weights', () => {
    const big = buildSelectionPool(1, [
      { gesturerAddress: A, cumulativeWeight: 10n ** 18n },
      { gesturerAddress: B, cumulativeWeight: 4n * 10n ** 18n },
    ])!;
    expect(poolShareOf(big, A)).toBeCloseTo(0.25, 9);
  });
});

describe('getWeightedSelectionShare', () => {
  it('keeps the gesture counts but takes the percentage from the weights', () => {
    const share = getWeightedSelectionShare({
      totalGestures: 10,
      myGestures: 2,
      totalWeight: 100n,
      myWeight: 60n,
    });
    expect(share).toEqual({ myGestures: 2, totalGestures: 10, share: 0.6, weighted: true });
  });

  it('is null without weight (no gestures on a V3 cycle means no weight)', () => {
    expect(
      getWeightedSelectionShare({
        totalGestures: 10,
        myGestures: 2,
        totalWeight: 100n,
        myWeight: 0n,
      }),
    ).toBeNull();
    expect(
      getWeightedSelectionShare({
        totalGestures: 10,
        myGestures: 0,
        totalWeight: 100n,
        myWeight: 5n,
      }),
    ).toBeNull();
  });
});

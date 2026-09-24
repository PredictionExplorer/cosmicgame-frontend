import { cycleReserveSplit } from '../cycleReserveSplit';

/** Cycle 1 on production: what each track carried when it was finalized. */
const CYCLE_ONE = {
  signature: 11.06158385324283,
  chrono: 3.5397068330377057,
  stellar: 1.7698534165188529,
  anchor: 2.6547801247782794,
  publicGoods: 3.0972434789079926,
};

describe('cycleReserveSplit', () => {
  it('reads each track as a share of the Cycle Reserve, the split /allocation draws', () => {
    const split = cycleReserveSplit(CYCLE_ONE, 25);
    const percents = Object.fromEntries(
      split.shares.map((share) => [share.id, Math.round((share.percent ?? NaN) * 10) / 10]),
    );
    expect(percents).toEqual({
      signature: 25,
      chrono: 8,
      stellar: 4,
      anchor: 6,
      publicGoods: 7,
      nextCycle: 50,
    });
    expect(split.reserve).toBeCloseTo(44.2463, 3);
  });

  it('carries what the tracks did not take into the next cycle, summing to the reserve', () => {
    const split = cycleReserveSplit(CYCLE_ONE, 25);
    const next = split.shares.find((share) => share.id === 'nextCycle');
    expect(next?.amount).toBeCloseTo(44.2463 - 22.1232, 3);
    const total = split.shares.reduce((sum, share) => sum + (share.amount ?? 0), 0);
    expect(total).toBeCloseTo(split.reserve ?? NaN, 9);
  });

  it('knows no reserve, and so no share, without the Signature Allocation', () => {
    const split = cycleReserveSplit({ ...CYCLE_ONE, signature: null }, 25);
    expect(split.reserve).toBeNull();
    expect(split.shares.every((share) => share.percent === null)).toBe(true);
    // The tracks that were read keep their ETH.
    expect(split.shares.find((share) => share.id === 'chrono')?.amount).toBe(CYCLE_ONE.chrono);
  });

  it('leaves the remainder unknown when any track is unknown, never guessing it', () => {
    const split = cycleReserveSplit({ ...CYCLE_ONE, stellar: null }, 25);
    const next = split.shares.find((share) => share.id === 'nextCycle');
    expect(next).toEqual({ id: 'nextCycle', amount: null, percent: null });
    expect(split.distributed).toBeNull();
  });
});

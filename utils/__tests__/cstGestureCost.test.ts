import { getCstGestureCostSeries } from '../cstGestureCost';

const eth = (ts: number, prizeTime: number, addr = '0xEthBidder') => ({
  TimeStamp: ts,
  GestureType: 0,
  BidderAddr: addr,
  CstPriceEth: -1e-18,
  PrizeTime: prizeTime,
  TxHash: `0xeth${ts}`,
});

const cst = (ts: number, paid: number, prizeTime: number, addr = '0xCstBidder') => ({
  TimeStamp: ts,
  GestureType: 2,
  BidderAddr: addr,
  CstCost: paid,
  PrizeTime: prizeTime,
  TxHash: `0xcst${ts}`,
});

describe('getCstGestureCostSeries', () => {
  it('returns an empty series for empty or null input', () => {
    expect(getCstGestureCostSeries([]).points).toEqual([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getCstGestureCostSeries(null as any).points).toEqual([]);
  });

  it('returns an empty series when the cycle has only ETH gestures', () => {
    const series = getCstGestureCostSeries([eth(1000, 5000), eth(2000, 6000)]);
    expect(series.points).toEqual([]);
    expect(series.totalPaid).toBe(0);
  });

  it('emits one point per CST gesture with the clock read from the previous gesture', () => {
    const series = getCstGestureCostSeries([
      eth(1000, 8000),
      cst(4600, 150, 9000),
      cst(8200, 300, 12000),
    ]);

    expect(series.roundStart).toBe(1000);
    expect(series.points).toHaveLength(2);

    // First CST gesture: clock = prior ETH gesture's deadline (8000) - ts (4600).
    expect(series.points[0]).toMatchObject({
      ts: 4600,
      hoursIntoRound: 1,
      cstPaid: 150,
      cstPlotted: 150,
      isClamped: false,
      clockRemainingSeconds: 3400,
      bidder: '0xCstBidder',
      txHash: '0xcst4600',
    });
    // Second: clock = first CST gesture's deadline (9000) - ts (8200).
    expect(series.points[1]!.clockRemainingSeconds).toBe(800);
    expect(series.points[1]!.hoursIntoRound).toBeCloseTo(2);
  });

  it('reports a null clock for a CST gesture that opens the cycle', () => {
    const series = getCstGestureCostSeries([cst(1000, 100, 5000), cst(2000, 220, 6000)]);
    expect(series.points[0]!.clockRemainingSeconds).toBeNull();
    expect(series.points[1]!.clockRemainingSeconds).toBe(3000);
  });

  it('clamps a stale clock to zero instead of going negative', () => {
    const series = getCstGestureCostSeries([eth(1000, 1500), cst(2000, 100, 6000)]);
    expect(series.points[0]!.clockRemainingSeconds).toBe(0);
  });

  it('floors free gestures at the smallest positive payment for log plotting', () => {
    const series = getCstGestureCostSeries([
      cst(1000, 0, 5000),
      cst(2000, 0.5, 6000),
      cst(3000, 2000, 7000),
    ]);

    expect(series.minPaid).toBe(0.5);
    expect(series.points[0]).toMatchObject({ cstPaid: 0, cstPlotted: 0.5, isClamped: true });
    expect(series.points[1]).toMatchObject({ cstPaid: 0.5, cstPlotted: 0.5, isClamped: false });
    expect(series.points[2]).toMatchObject({ cstPaid: 2000, cstPlotted: 2000 });
  });

  it('uses the default floor when every CST gesture was free', () => {
    const series = getCstGestureCostSeries([cst(1000, 0, 5000)]);
    expect(series.minPaid).toBe(0.01);
    expect(series.points[0]!.cstPlotted).toBe(0.01);
  });

  it('tracks max, when it happened, and the total consumed', () => {
    const series = getCstGestureCostSeries([
      cst(1000, 10, 5000),
      cst(2000, 3500, 6000),
      cst(3000, 40, 7000),
    ]);

    expect(series.maxPaid).toBe(3500);
    expect(series.maxTs).toBe(2000);
    expect(series.totalPaid).toBe(3550);
  });

  it('falls back to CstPriceEth when the normalized CstCost is absent', () => {
    const series = getCstGestureCostSeries([
      { TimeStamp: 1000, GestureType: 2, CstPriceEth: 42, PrizeTime: 5000 },
    ]);
    expect(series.points[0]!.cstPaid).toBe(42);
  });

  it('sorts by timestamp with EvtLogId as tie-breaker', () => {
    const series = getCstGestureCostSeries([
      { ...cst(1000, 20, 6000), EvtLogId: 2 },
      { ...cst(1000, 10, 5000), EvtLogId: 1 },
    ]);
    expect(series.points.map((p) => p.cstPaid)).toEqual([10, 20]);
  });
});

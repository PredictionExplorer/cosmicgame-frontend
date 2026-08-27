import { getCstCalibrationTimeline } from '../cstCalibration';

const gesture = (
  ts: number,
  windowSecs: number | undefined,
  type = 0,
  addr = '0xAlice',
  evtLogId?: number,
) => ({
  TimeStamp: ts,
  CstDutchAuctionDurationInt: windowSecs,
  GestureType: type,
  BidderAddr: addr,
  ...(evtLogId !== undefined ? { EvtLogId: evtLogId } : {}),
});

describe('getCstCalibrationTimeline', () => {
  it('returns an empty timeline for an empty gesture list', () => {
    expect(getCstCalibrationTimeline([]).points).toEqual([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getCstCalibrationTimeline(null as any).points).toEqual([]);
  });

  it('returns an empty timeline when no gesture carries a window value (legacy cycle)', () => {
    const result = getCstCalibrationTimeline([
      { TimeStamp: 1000, GestureType: 0, BidderAddr: '0xAlice', CstDutchAuctionDurationInt: -1 },
      { TimeStamp: 2000, GestureType: 2, BidderAddr: '0xBob' },
    ]);
    expect(result.points).toEqual([]);
    expect(result.currentSeconds).toBe(0);
  });

  it('builds one step per gesture and extends the last window to the round end', () => {
    const result = getCstCalibrationTimeline(
      [
        gesture(1000, 10000, 0, '0xAlice'),
        gesture(4600, 9960, 0, '0xBob'),
        gesture(8200, 10000, 2, '0xCarol'),
      ],
      15400,
    );

    expect(result.roundStart).toBe(1000);
    expect(result.roundEnd).toBe(15400);
    expect(result.points).toHaveLength(4);
    expect(result.points[0]).toEqual({
      ts: 1000,
      hoursIntoRound: 0,
      windowSeconds: 10000,
      gestureType: 0,
      bidder: '0xAlice',
    });
    expect(result.points[1]!.hoursIntoRound).toBeCloseTo(1);
    // Synthetic end point carries the last window value.
    expect(result.points[3]).toEqual({
      ts: 15400,
      hoursIntoRound: 4,
      windowSeconds: 10000,
      gestureType: -1,
      bidder: '',
    });
    expect(result.currentSeconds).toBe(10000);
  });

  it('skips legacy -1 entries but keeps valid ones', () => {
    const result = getCstCalibrationTimeline(
      [gesture(1000, -1), gesture(2000, 5000, 2, '0xBob')],
      3000,
    );
    expect(result.points.map((p) => p.windowSeconds)).toEqual([5000, 5000]);
    expect(result.roundStart).toBe(2000);
  });

  it('tracks min and max with their timestamps', () => {
    const result = getCstCalibrationTimeline(
      [gesture(100, 8000), gesture(200, 7000), gesture(300, 9500, 2), gesture(400, 9000)],
      500,
    );
    expect(result.minSeconds).toBe(7000);
    expect(result.minTs).toBe(200);
    expect(result.maxSeconds).toBe(9500);
    expect(result.maxTs).toBe(300);
    expect(result.currentSeconds).toBe(9000);
  });

  it('sorts by timestamp with EvtLogId as tie-breaker', () => {
    const result = getCstCalibrationTimeline(
      [gesture(100, 7000, 0, '0xB', 2), gesture(100, 8000, 0, '0xA', 1)],
      200,
    );
    expect(result.points.map((p) => p.windowSeconds)).toEqual([8000, 7000, 7000]);
  });

  it('uses nowTimeStamp for the live cycle and guards against a stale now', () => {
    const live = getCstCalibrationTimeline([gesture(1000, 6000)], 0, 4600);
    expect(live.roundEnd).toBe(4600);
    expect(live.points).toHaveLength(2);
    expect(live.points[1]!.hoursIntoRound).toBeCloseTo(1);

    const stale = getCstCalibrationTimeline([gesture(1000, 6000)], 0, 500);
    expect(stale.roundEnd).toBe(1000);
    expect(stale.points).toHaveLength(1);
  });
});

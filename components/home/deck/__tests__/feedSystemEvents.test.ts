import type { GestureInfo } from '@/services/api';

import { deriveFeedSystemEvents } from '../feedSystemEvents';

function gesture(
  timestamp: number,
  address: string,
  extra: Partial<GestureInfo> = {},
): GestureInfo {
  return {
    EvtLogId: timestamp,
    TimeStamp: timestamp,
    BidderAddr: address,
    RoundNum: 7,
    GestureType: 0,
    ...extra,
  } as GestureInfo;
}

function derive(gestures: GestureInfo[], nowSeconds?: number) {
  return deriveFeedSystemEvents({ gestures, cycleNumber: 7, nowSeconds });
}

describe('deriveFeedSystemEvents', () => {
  it('shows activation only once reached, and distinguishes it from the first Gesture', () => {
    expect(deriveFeedSystemEvents({ gestures: [], activationTs: 1000, nowSeconds: 999 })).toEqual(
      [],
    );
    expect(
      deriveFeedSystemEvents({
        gestures: [],
        cycleNumber: 7,
        activationTs: 1000,
        nowSeconds: 1001,
      }),
    ).toEqual([expect.objectContaining({ kind: 'cycleOpen', timestamp: 1000, cycleNumber: 7 })]);
    expect(deriveFeedSystemEvents({ gestures: [], cycleNumber: 7, roundStartTs: 1000 })).toEqual([
      expect.objectContaining({ kind: 'cycleStart', timestamp: 1000, cycleNumber: 7 }),
    ]);
  });

  it('includes live Endurance and Chrono growing milestones without another Gesture', () => {
    const events = derive([gesture(1000, 'A')], 1500);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'enduranceGrowing',
          address: 'A',
          timestamp: 1000,
          durationSeconds: 0,
        }),
        expect.objectContaining({
          kind: 'chronoLead',
          address: 'A',
          timestamp: 1000,
          durationSeconds: 0,
        }),
      ]),
    );
    expect(events.some((e) => e.kind === 'enduranceRecord' || e.kind === 'chronoReignEnded')).toBe(
      false,
    );
  });

  it('records the threshold that was known then, never the future length of a completed reign', () => {
    const gestures = [
      gesture(1000, 'A'),
      gesture(1500, 'B'),
      gesture(1800, 'C'),
      gesture(2700, 'D'),
    ];
    const events = derive(gestures);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'enduranceGrowing',
          address: 'C',
          timestamp: 2301,
          durationSeconds: 501,
        }),
        expect.objectContaining({
          kind: 'enduranceRecord',
          address: 'A',
          timestamp: 1500,
          durationSeconds: 500,
        }),
        expect.objectContaining({
          kind: 'enduranceRecord',
          address: 'C',
          timestamp: 2700,
          durationSeconds: 900,
        }),
        expect.objectContaining({
          kind: 'chronoReignEnded',
          address: 'A',
          timestamp: 2301,
          durationSeconds: 1300,
        }),
      ]),
    );
    expect(events.find((e) => e.kind === 'chronoLead')).toMatchObject({
      address: 'A',
      timestamp: 1000,
      durationSeconds: 0,
    });
    expect(events.some((e) => e.kind === 'chronoLead' && e.address === 'C')).toBe(false);
  });

  it('keeps Endurance ties standing until the following second', () => {
    const gestures = [gesture(1000, 'A'), gesture(1100, 'B'), gesture(1200, 'C')];
    expect(
      derive(gestures, 1300).some((e) => e.kind === 'enduranceGrowing' && e.address === 'C'),
    ).toBe(false);
    expect(derive(gestures, 1301)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'enduranceGrowing',
          address: 'C',
          timestamp: 1301,
          durationSeconds: 101,
        }),
        expect.objectContaining({
          kind: 'chronoReignEnded',
          address: 'A',
          timestamp: 1301,
          durationSeconds: 300,
        }),
      ]),
    );
  });

  it('preserves separate same-wallet holds and waits to surpass its earlier Chrono reign', () => {
    const gestures = [gesture(1000, 'A'), gesture(1100, 'A'), gesture(1300, 'B')];
    const events = derive(gestures, 1350);
    expect(
      events.filter((e) => e.kind === 'enduranceRecord').map((e) => e.durationSeconds),
    ).toEqual([100, 200]);
    expect(events.filter((e) => e.kind === 'chronoLead')).toHaveLength(1);
    expect(derive(gestures, 1400).filter((e) => e.kind === 'chronoLead')).toHaveLength(1);
    expect(derive(gestures, 1401)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'chronoLead',
          address: 'A',
          timestamp: 1401,
          durationSeconds: 201,
        }),
      ]),
    );
  });

  it('does not give Chrono to a completed reign that only tied the previous record', () => {
    const events = derive(
      [gesture(1000, 'A'), gesture(1100, 'B'), gesture(1201, 'C'), gesture(1299, 'D')],
      1401,
    );
    expect(events.some((e) => e.kind === 'chronoLead' && e.address === 'B')).toBe(false);
    expect(events.find((e) => e.kind === 'chronoReignEnded' && e.address === 'B')).toMatchObject({
      durationSeconds: 200,
    });
  });

  it('retains the initial zero-length record and orders same-second Gestures by their event order', () => {
    const gestures = [gesture(1000, 'B', { EvtLogId: 2 }), gesture(1000, 'A', { EvtLogId: 1 })];
    expect(
      derive(gestures, 1000)
        .filter((e) => e.kind === 'enduranceGrowing')
        .map((e) => e.address),
    ).toEqual(['A']);
    expect(derive(gestures, 1001)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'enduranceGrowing', address: 'B', timestamp: 1001 }),
        expect.objectContaining({
          kind: 'chronoLead',
          address: 'B',
          timestamp: 1001,
          durationSeconds: 1,
        }),
      ]),
    );
  });

  it('orders same-second entries with mixed position metadata by comparable event IDs', () => {
    const events = derive(
      [
        gesture(1000, 'B', { EvtLogId: 100001, BidPosition: 2 }),
        gesture(1000, 'A', { EvtLogId: 100000 }),
      ],
      1000,
    );
    expect(events.find((e) => e.kind === 'enduranceGrowing')).toMatchObject({ address: 'A' });
  });

  it('keeps calibration event identities unique for same-second zero-length resets', () => {
    const events = derive(
      [
        gesture(1000, 'A', { EvtLogId: 1, GestureType: 2, CstDutchAuctionDurationInt: 0 }),
        gesture(1000, 'B', { EvtLogId: 2, GestureType: 2, CstDutchAuctionDurationInt: 0 }),
      ],
      1001,
    );
    const floorEvents = events.filter((e) => e.kind === 'cstCalibrationReady');
    expect(floorEvents).toHaveLength(2);
    expect(new Set(floorEvents.map((e) => e.id)).size).toBe(2);
  });

  it('keeps completed event identities and descriptions stable as time advances', () => {
    const gestures = [gesture(1000, 'A'), gesture(1100, 'B'), gesture(1201, 'C')];
    const before = derive(gestures, 1350);
    const after = derive(gestures, 1450);
    for (const event of before) expect(after.find((e) => e.id === event.id)).toEqual(event);
    expect(new Set(after.map((e) => e.id)).size).toBe(after.length);
  });

  it('ignores invalid, duplicate and other-cycle Gestures, without changing the input', () => {
    const first = gesture(1000, 'A');
    const input = [
      gesture(1100, 'B'),
      first,
      first,
      gesture(NaN, 'C'),
      gesture(900, 'D', { RoundNum: 6 }),
    ];
    expect(derive(input, 1200)).toEqual(derive([first, gesture(1100, 'B')], 1200));
    expect(input[0]!.BidderAddr).toBe('B');
  });

  it('does not invent records or newcomers from incomplete history', () => {
    const gestures = [gesture(1100, 'B', { BidPosition: 2 })];
    expect(
      deriveFeedSystemEvents({
        gestures,
        cycleNumber: 7,
        expectedGestureCount: 2,
        roundStartTs: 1000,
        nowSeconds: 1200,
      }),
    ).toEqual([expect.objectContaining({ kind: 'cycleStart' })]);
    expect(derive(gestures, 1200)).toEqual([]);
    expect(
      deriveFeedSystemEvents({
        gestures: [gesture(1100, 'B')],
        roundStartTs: 1000,
        nowSeconds: 1200,
      }),
    ).toEqual([expect.objectContaining({ kind: 'cycleStart' })]);
  });

  it('announces each newcomer once and sparse activity milestones', () => {
    const gestures = Array.from({ length: 20 }, (_, i) =>
      gesture(1000 + i, i < 2 ? '0xAbC' : '0xabc', { GestureType: i === 1 || i === 3 ? 2 : 0 }),
    );
    const events = derive(gestures, 1020);
    expect(events.filter((e) => e.kind === 'newParticipant')).toHaveLength(1);
    expect(events.filter((e) => e.kind === 'finalCstLeader')).toEqual([
      expect.objectContaining({ timestamp: 1003, address: '0xabc' }),
    ]);
    expect(events.filter((e) => e.kind === 'gestureMilestone').map((e) => e.count)).toEqual([
      10, 20,
    ]);
  });

  it('keeps only the latest Final CST position across different participants', () => {
    const events = derive(
      [
        gesture(1300, 'D'),
        gesture(1100, 'B', { GestureType: 2 }),
        gesture(1000, 'A', { GestureType: 2 }),
        gesture(1200, 'C', { GestureType: 2 }),
      ],
      1400,
    );
    expect(events.filter((e) => e.kind === 'finalCstLeader')).toEqual([
      {
        id: 'final-cst-7-1200',
        timestamp: 1200,
        kind: 'finalCstLeader',
        address: 'C',
      },
    ]);
    expect(events.filter((e) => e.kind === 'newParticipant')).toHaveLength(4);
  });

  it('refreshes the Final CST timestamp and identity when the same participant repeats', () => {
    const first = gesture(1000, '0xAbC', { EvtLogId: 10, GestureType: 2 });
    const events = derive(
      [first, gesture(1100, 'B'), gesture(1200, '0xabc', { EvtLogId: 30, GestureType: 2 })],
      1300,
    );
    expect(events.filter((e) => e.kind === 'finalCstLeader')).toEqual([
      {
        id: 'final-cst-7-30',
        timestamp: 1200,
        kind: 'finalCstLeader',
        address: '0xabc',
      },
    ]);
    expect(events.some((e) => e.id === 'final-cst-7-10')).toBe(false);
  });

  it.each([
    [{ EvtLogId: 11 }, { EvtLogId: 10 }],
    [
      { EvtLogId: 11, BidPosition: 2 },
      { EvtLogId: 10, BidPosition: 1 },
    ],
    [{ EvtLogId: 11, BidPosition: 2 }, { EvtLogId: 10 }],
  ])('uses indexed order for same-second Final CST positions (%j, %j)', (latest, first) => {
    const events = derive(
      [
        gesture(1000, 'B', { ...latest, GestureType: 2 }),
        gesture(1000, 'A', { ...first, GestureType: 2 }),
      ],
      1000,
    );
    expect(events.filter((e) => e.kind === 'finalCstLeader')).toEqual([
      {
        id: 'final-cst-7-11',
        timestamp: 1000,
        kind: 'finalCstLeader',
        address: 'B',
      },
    ]);
  });

  it('omits the Final CST position when the cycle has no CST Gestures', () => {
    const events = derive([gesture(1000, 'A'), gesture(1100, 'B', { GestureType: 1 })], 1200);
    expect(events.some((e) => e.kind === 'finalCstLeader')).toBe(false);
  });

  it('does not replace the Final CST position with a future or other-cycle Gesture', () => {
    const gestures = [
      gesture(1000, 'A', { GestureType: 2 }),
      gesture(1100, 'B', { GestureType: 2, RoundNum: 6 }),
      gesture(1200, 'C', { GestureType: 2 }),
    ];
    expect(derive(gestures, 1150).filter((e) => e.kind === 'finalCstLeader')).toEqual([
      expect.objectContaining({ id: 'final-cst-7-1000', timestamp: 1000, address: 'A' }),
    ]);
    expect(derive(gestures, 1200).filter((e) => e.kind === 'finalCstLeader')).toEqual([
      expect.objectContaining({ id: 'final-cst-7-1200', timestamp: 1200, address: 'C' }),
    ]);
  });

  it('tracks calibration starts across ETH adjustments and resets after CST', () => {
    const events = derive(
      [
        gesture(1000, 'A', { CstDutchAuctionDurationInt: 500 }),
        gesture(1200, 'B', { CstDutchAuctionDurationInt: 100 }),
        gesture(1300, 'C', { CstDutchAuctionDurationInt: 90 }),
        gesture(1400, 'D', { GestureType: 2, CstDutchAuctionDurationInt: 100 }),
      ],
      1600,
    );
    expect(events.filter((e) => e.kind === 'cstCalibrationReady').map((e) => e.timestamp)).toEqual([
      1200, 1500,
    ]);
  });

  it('does not invent a calibration crossing after missing history and recovers at a known reset', () => {
    const events = derive(
      [
        gesture(1000, 'A', { CstDutchAuctionDurationInt: 500 }),
        gesture(1200, 'B', { CstDutchAuctionDurationInt: -1 }),
        gesture(1600, 'C', { CstDutchAuctionDurationInt: 400 }),
        gesture(1800, 'D', { GestureType: 2, CstDutchAuctionDurationInt: 100 }),
      ],
      2000,
    );
    expect(events.filter((e) => e.kind === 'cstCalibrationReady').map((e) => e.timestamp)).toEqual([
      1900,
    ]);
  });

  it('recovers an exact future calibration threshold after an unknown duration', () => {
    const events = derive(
      [
        gesture(1000, 'A', { CstDutchAuctionDurationInt: -1 }),
        gesture(1100, 'B', { CstDutchAuctionDurationInt: 500 }),
      ],
      1600,
    );
    expect(events.find((e) => e.kind === 'cstCalibrationReady')).toMatchObject({ timestamp: 1500 });
  });

  it('does not assume an unknown Gesture method left the calibration start unchanged', () => {
    const events = derive(
      [
        gesture(1000, 'A', { CstDutchAuctionDurationInt: 500 }),
        gesture(1100, 'B', { GestureType: undefined, CstDutchAuctionDurationInt: 600 }),
        gesture(1200, 'C', { CstDutchAuctionDurationInt: 500 }),
      ],
      2000,
    );
    expect(events.some((e) => e.kind === 'cstCalibrationReady')).toBe(false);
  });

  it('never derives a floor from unavailable legacy calibration durations', () => {
    expect(
      derive([gesture(1000, 'A', { CstDutchAuctionDurationInt: -1 })], 9000).some(
        (e) => e.kind === 'cstCalibrationReady',
      ),
    ).toBe(false);
  });

  it('timestamps final windows and zero crossings against the deadline in effect at that time', () => {
    const events = derive(
      [gesture(1000, 'A', { PrizeTime: 5000 }), gesture(4500, 'B', { PrizeTime: 5500 })],
      6000,
    );
    expect(
      events.filter((e) => e.kind === 'finalWindow').map((e) => [e.timestamp, e.durationSeconds]),
    ).toEqual([
      [1400, 3600],
      [4400, 600],
      [4900, 600],
    ]);
    expect(events.find((e) => e.kind === 'clockExtended')).toMatchObject({
      timestamp: 4500,
      durationSeconds: 500,
    });
    expect(events.filter((e) => e.kind === 'finalizationAvailable')).toEqual([
      expect.objectContaining({ timestamp: 5500, address: 'B' }),
    ]);
  });

  it('keeps a late extension honest when it leaves the deadline in the past', () => {
    const events = derive(
      [gesture(1000, 'A', { PrizeTime: 2000 }), gesture(5000, 'B', { PrizeTime: 3000 })],
      5100,
    );
    expect(events.find((e) => e.kind === 'clockReopened')).toMatchObject({
      timestamp: 5000,
      durationSeconds: 1000,
    });
    expect(
      events.filter((e) => e.kind === 'finalizationAvailable').map((e) => e.timestamp),
    ).toEqual([2000]);
  });

  it('continues record timers after zero but freezes them at actual finalization', () => {
    const gestures = [gesture(1000, 'A', { PrizeTime: 1100 })];
    const events = deriveFeedSystemEvents({
      gestures,
      nowSeconds: 5000,
      finalizedAtTs: 1500,
      cycleNumber: 7,
    });
    expect(events.find((e) => e.kind === 'enduranceRecord')).toMatchObject({
      timestamp: 1500,
      durationSeconds: 500,
    });
    expect(events.find((e) => e.kind === 'chronoReignEnded')).toMatchObject({
      timestamp: 1500,
      durationSeconds: 500,
    });
    expect(events.find((e) => e.kind === 'cycleFinalized')).toMatchObject({
      timestamp: 1500,
      cycleNumber: 7,
    });
    expect(events.every((e) => e.timestamp <= 1500)).toBe(true);
  });
});

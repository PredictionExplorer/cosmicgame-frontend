import type { GestureInfo } from '@/services/api';

import { deriveFeedSystemEvents } from '../feedSystemEvents';

function gesture(overrides: Partial<GestureInfo>): GestureInfo {
  return {
    EvtLogId: 1,
    TimeStamp: 0,
    BidderAddr: '0x0',
    RoundNum: 7,
    ...overrides,
  } as GestureInfo;
}

describe('deriveFeedSystemEvents', () => {
  it('returns nothing for an idle cycle', () => {
    expect(deriveFeedSystemEvents({ gestures: [], cycleNumber: 7, roundStartTs: 0 })).toEqual([]);
  });

  it('emits the cycle-start marker once the round has begun', () => {
    const events = deriveFeedSystemEvents({ gestures: [], cycleNumber: 7, roundStartTs: 1_000 });
    expect(events).toEqual([
      expect.objectContaining({ kind: 'cycleStart', timestamp: 1_000, cycleNumber: 7 }),
    ]);
  });

  it('emits endurance-record and chrono-lead events for completed stints and reigns', () => {
    const gestures = [
      gesture({ EvtLogId: 1, TimeStamp: 1_000, BidderAddr: '0xAAA' }),
      // 0xAAA holds 500s — first record, stamped when the stint completes.
      gesture({ EvtLogId: 2, TimeStamp: 1_500, BidderAddr: '0xBBB' }),
      // 0xBBB holds 300s — shorter than the record, no event.
      gesture({ EvtLogId: 3, TimeStamp: 1_800, BidderAddr: '0xCCC' }),
      // 0xCCC holds 900s — new record.
      gesture({ EvtLogId: 4, TimeStamp: 2_700, BidderAddr: '0xDDD' }),
      // 0xDDD's stint is still growing (no next gesture): never emitted.
    ];

    const events = deriveFeedSystemEvents({ gestures, cycleNumber: 7, roundStartTs: 900 });

    expect(events).toEqual([
      expect.objectContaining({ kind: 'cycleStart', timestamp: 900 }),
      expect.objectContaining({
        kind: 'enduranceRecord',
        address: '0xAAA',
        durationSeconds: 500,
        timestamp: 1_500,
      }),
      expect.objectContaining({
        kind: 'enduranceRecord',
        address: '0xCCC',
        durationSeconds: 900,
        timestamp: 2_700,
      }),
      // 0xAAA's completed reign: from taking the record (1000) until 0xCCC
      // took it (1800 + 500s grace of the old record = 2300) — 1300s.
      expect.objectContaining({
        kind: 'chronoLead',
        address: '0xAAA',
        durationSeconds: 1_300,
        timestamp: 1_000,
      }),
    ]);
  });

  it('never emits a chrono event for the live reign of the current champion', () => {
    const gestures = [
      gesture({ EvtLogId: 1, TimeStamp: 1_000, BidderAddr: '0xAAA' }),
      gesture({ EvtLogId: 2, TimeStamp: 1_500, BidderAddr: '0xBBB' }),
    ];

    const events = deriveFeedSystemEvents({ gestures, roundStartTs: 0 });

    // One endurance record exists (0xAAA), but its reign is still live —
    // there is no next champion, so no chrono event can be stamped yet.
    expect(events.filter((event) => event.kind === 'chronoLead')).toEqual([]);
  });

  it('sorts an unsorted gesture list before deriving stints', () => {
    const gestures = [
      gesture({ EvtLogId: 2, TimeStamp: 1_500, BidderAddr: '0xBBB' }),
      gesture({ EvtLogId: 1, TimeStamp: 1_000, BidderAddr: '0xAAA' }),
    ];

    const events = deriveFeedSystemEvents({ gestures, roundStartTs: 0 });

    expect(events).toEqual([
      expect.objectContaining({ kind: 'enduranceRecord', address: '0xAAA', durationSeconds: 500 }),
    ]);
  });
});

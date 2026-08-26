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

  it('emits an endurance-record event for every completed record stint', () => {
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
    ]);
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

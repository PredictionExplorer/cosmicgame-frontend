import type { GestureInfo } from '@/services/api/types';

import { newestGesture, resolveLatestGesture } from '../latestGesture';

const ALICE = '0x1111111111111111111111111111111111111111';
const BOB = '0x2222222222222222222222222222222222222222';

function gesture(
  address: string,
  timestamp: number,
  eventId: number,
  overrides: Partial<GestureInfo> = {},
): GestureInfo {
  return {
    EvtLogId: eventId,
    BlockNum: eventId,
    TxId: eventId,
    TxHash: `0x${eventId}`,
    TimeStamp: timestamp,
    DateTime: '',
    RoundNum: 7,
    BidderAddr: address,
    GestureType: 0,
    GestureCostEth: 0.01,
    ...overrides,
  };
}

describe('newestGesture', () => {
  it('selects by timestamp without trusting endpoint order', () => {
    const latest = gesture(BOB, 300, 3);
    expect(newestGesture([latest, gesture(ALICE, 100, 1), gesture(ALICE, 200, 2)])).toBe(latest);
  });

  it('uses event ID as a stable timestamp tie-breaker', () => {
    expect(newestGesture([gesture(ALICE, 100, 1), gesture(BOB, 100, 2)])?.BidderAddr).toBe(BOB);
  });
});

describe('resolveLatestGesture', () => {
  it('uses dashboard identity and the newest matching transaction record', () => {
    const newestAlice = gesture(ALICE, 300, 3);
    const result = resolveLatestGesture({
      dashboardLastAddress: ALICE,
      gestures: [gesture(ALICE, 100, 1), gesture(BOB, 400, 4), newestAlice],
    });

    expect(result.address).toBe(ALICE);
    expect(result.gesture).toBe(newestAlice);
    expect(result.evidence).toEqual({ address: ALICE, timestamp: 300 });
    expect(result.isSyncing).toBe(false);
  });

  it('matches addresses case-insensitively', () => {
    const matching = gesture(ALICE.toUpperCase(), 300, 3);
    const result = resolveLatestGesture({
      dashboardLastAddress: ALICE,
      gestures: [matching],
    });
    expect(result.gesture).toBe(matching);
  });

  it('keeps authoritative identity but enters syncing state when its row is absent', () => {
    const previousGesture = gesture(BOB, 300, 3);
    const result = resolveLatestGesture({
      dashboardLastAddress: ALICE,
      gestures: [previousGesture],
    });

    expect(result.address).toBe(ALICE);
    expect(result.gesture).toBeNull();
    expect(result.newestIndexedGesture).toBe(previousGesture);
    expect(result.evidence).toEqual({ address: ALICE, timestamp: null });
    expect(result.isSyncing).toBe(true);
  });

  it('falls back to the newest list record when dashboard identity is unavailable', () => {
    const latest = gesture(BOB, 300, 3);
    const result = resolveLatestGesture({
      dashboardLastAddress: null,
      gestures: [gesture(ALICE, 100, 1), latest],
    });

    expect(result.address).toBe(BOB);
    expect(result.gesture).toBe(latest);
    expect(result.evidence).toEqual({ address: BOB, timestamp: 300 });
  });

  it('treats the zero address as no dashboard participant', () => {
    const latest = gesture(ALICE, 100, 1);
    const result = resolveLatestGesture({
      dashboardLastAddress: '0x0000000000000000000000000000000000000000',
      gestures: [latest],
    });
    expect(result.address).toBe(ALICE);
    expect(result.gesture).toBe(latest);
  });

  it('returns a stable empty state when no source has a participant', () => {
    expect(resolveLatestGesture({ dashboardLastAddress: null, gestures: [] })).toEqual({
      address: null,
      gesture: null,
      newestIndexedGesture: null,
      evidence: undefined,
      isSyncing: false,
    });
  });
});

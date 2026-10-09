import { act, renderHook } from '@testing-library/react';

import type { EndgameChainSample } from '@/lib/rpcRace';
import type { DashboardInfo } from '@/services/api';

import {
  OWN_GESTURE_OVERLAY_MS,
  overlayOwnGesture,
  useOwnGestureOverlay,
  type UseOwnGestureOverlayArgs,
} from '../useOwnGestureOverlay';

const ME = '0x1111111111111111111111111111111111111111';
const PREVIOUS = '0x2222222222222222222222222222222222222222';
const OTHER = '0x3333333333333333333333333333333333333333';

function dashboard(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 7,
    CurNumBids: 10,
    LastBidderAddr: PREVIOUS,
    ...overrides,
  } as Partial<DashboardInfo> as DashboardInfo;
}

function sample(overrides: Partial<EndgameChainSample> = {}): EndgameChainSample {
  return {
    mainPrizeTimeSec: 2_000,
    lastBidderAddress: ME,
    roundNum: 7,
    blockTimestampSec: 1_500,
    sampledAtMs: 0,
    ...overrides,
  };
}

function setup(initial: UseOwnGestureOverlayArgs) {
  return renderHook((props: UseOwnGestureOverlayArgs) => useOwnGestureOverlay(props), {
    initialProps: initial,
  });
}

/** Lets the chain read's promise chain settle inside act(). */
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('overlayOwnGesture', () => {
  it('counts the Gesture only while the index is behind it', () => {
    const own = { address: ME, cycle: 7, count: 11, timestampSec: 1, confirmedAtMs: 0 };
    expect(overlayOwnGesture(dashboard(), own)).toMatchObject({
      CurNumBids: 11,
      LastBidderAddr: ME,
    });
    const indexed = dashboard({ CurNumBids: 11, LastBidderAddr: ME });
    expect(overlayOwnGesture(indexed, own)).toBe(indexed);
    const nextCycle = dashboard({ CurRoundNum: 8, CurNumBids: 0 });
    expect(overlayOwnGesture(nextCycle, own)).toBe(nextCycle);
  });
});

describe('useOwnGestureOverlay', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the confirmed Gesture at once and adopts the block time', async () => {
    const readChain = jest.fn().mockResolvedValue(sample());
    const onChainSample = jest.fn();
    const { result } = setup({ dashboard: dashboard(), readChain, onChainSample });

    act(() => result.current.record(ME, 0));
    expect(result.current.pending).toBe(true);
    expect(result.current.data).toMatchObject({ CurNumBids: 11, LastBidderAddr: ME });

    await flush();
    expect(onChainSample).toHaveBeenCalledWith(sample());
    expect(result.current.own?.timestampSec).toBe(1_500);
  });

  it('drops the overlay once the index counts the Gesture', () => {
    const onIndexed = jest.fn();
    const { result, rerender } = setup({ dashboard: dashboard(), readChain: null, onIndexed });
    act(() => result.current.record(ME, 0));

    rerender({
      dashboard: dashboard({ CurNumBids: 11, LastBidderAddr: ME }),
      readChain: null,
      onIndexed,
    });
    expect(result.current.own).toBeNull();
    expect(result.current.pending).toBe(false);
    expect(onIndexed).toHaveBeenCalledWith(ME);
  });

  it('keeps the overlay past its window while the chain still names the wallet', async () => {
    // Regression: an index lagging past the window reverted the page to the
    // previous holder, which read as "Your place was taken".
    const readChain = jest.fn().mockResolvedValue(sample());
    const { result } = setup({ dashboard: dashboard(), readChain });
    act(() => result.current.record(ME, 0));
    await flush();
    readChain.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(OWN_GESTURE_OVERLAY_MS);
    });
    await flush();
    expect(readChain).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe(true);
    expect(result.current.data?.LastBidderAddr).toBe(ME);

    // Another window later the chain names someone else: the overlay goes.
    readChain.mockResolvedValue(sample({ lastBidderAddress: OTHER }));
    await act(async () => {
      jest.advanceTimersByTime(OWN_GESTURE_OVERLAY_MS);
    });
    await flush();
    expect(readChain).toHaveBeenCalledTimes(2);
    expect(result.current.own).toBeNull();
    expect(result.current.data?.LastBidderAddr).toBe(PREVIOUS);
  });

  it('drops an expired overlay when the cycle moved on', async () => {
    const readChain = jest.fn().mockResolvedValue(sample());
    const { result } = setup({ dashboard: dashboard(), readChain });
    act(() => result.current.record(ME, 0));
    await flush();

    readChain.mockResolvedValue(sample({ roundNum: 8 }));
    await act(async () => {
      jest.advanceTimersByTime(OWN_GESTURE_OVERLAY_MS);
    });
    await flush();
    expect(result.current.own).toBeNull();
  });

  it('drops an expired overlay when the chain cannot be read', async () => {
    const onError = jest.fn();
    const readChain = jest.fn().mockResolvedValue(sample());
    const { result } = setup({ dashboard: dashboard(), readChain, onError });
    act(() => result.current.record(ME, 0));
    await flush();

    readChain.mockRejectedValue(new Error('offline'));
    await act(async () => {
      jest.advanceTimersByTime(OWN_GESTURE_OVERLAY_MS);
    });
    await flush();
    expect(result.current.own).toBeNull();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), 'own gesture overlay check');
  });

  it('drops an expired overlay without a chain to ask', () => {
    const { result } = setup({ dashboard: dashboard(), readChain: null });
    act(() => result.current.record(ME, 0));
    act(() => {
      jest.advanceTimersByTime(OWN_GESTURE_OVERLAY_MS);
    });
    expect(result.current.own).toBeNull();
  });

  it('counts a second Gesture on top of the first while the index lags', () => {
    const { result } = setup({ dashboard: dashboard(), readChain: null });
    act(() => result.current.record(ME, 0));
    act(() => result.current.record(ME, 0));
    expect(result.current.data?.CurNumBids).toBe(12);
  });
});

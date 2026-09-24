import { act, renderHook } from '@testing-library/react';

import {
  LANDED_MOMENT_MS,
  usePositionMoment,
  type UsePositionMomentArgs,
} from '../usePositionMoment';

const ME = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';
const THIRD = '0x3333333333333333333333333333333333333333';

function setup(initial: UsePositionMomentArgs) {
  return renderHook((props: UsePositionMomentArgs) => usePositionMoment(props), {
    initialProps: initial,
  });
}

describe('usePositionMoment', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('reports nothing on load, whatever the wallet holds', () => {
    const { result } = setup({
      account: ME,
      latestAddress: OTHER,
      cycle: 2,
      gestureCount: 10,
      nowMs: 1,
    });
    expect(result.current.isLatest).toBe(false);
    expect(result.current.moment).toBeNull();
  });

  it('does not mistake the first dashboard read for a landed Gesture', () => {
    const { result, rerender } = setup({
      account: ME,
      latestAddress: undefined,
      cycle: 2,
      gestureCount: undefined,
      nowMs: 1,
    });
    rerender({
      account: ME,
      latestAddress: ME.toUpperCase().replace('0X', '0x'),
      cycle: 2,
      gestureCount: 10,
      nowMs: 2,
    });
    expect(result.current.isLatest).toBe(true);
    expect(result.current.moment).toBeNull();
  });

  it('marks the landing of the wallet own Gesture, and lets it fade', () => {
    const { result, rerender } = setup({
      account: ME,
      latestAddress: OTHER,
      cycle: 2,
      gestureCount: 10,
      nowMs: 1,
    });
    rerender({ account: ME, latestAddress: ME, cycle: 2, gestureCount: 11, nowMs: 5 });
    expect(result.current.moment).toEqual({ kind: 'landed', by: null, atMs: 5 });

    act(() => jest.advanceTimersByTime(LANDED_MOMENT_MS));
    expect(result.current.moment).toBeNull();
  });

  it('marks the moment another participant takes the place, until dismissed', () => {
    const { result, rerender } = setup({
      account: ME,
      latestAddress: ME,
      cycle: 2,
      gestureCount: 10,
      nowMs: 1,
    });
    rerender({ account: ME, latestAddress: OTHER, cycle: 2, gestureCount: 11, nowMs: 9 });
    expect(result.current.moment).toEqual({ kind: 'taken', by: OTHER, atMs: 9 });

    // A third participant does not rewrite who took the place.
    rerender({ account: ME, latestAddress: THIRD, cycle: 2, gestureCount: 12, nowMs: 12 });
    expect(result.current.moment?.by).toBe(OTHER);

    act(() => result.current.dismiss());
    expect(result.current.moment).toBeNull();
  });

  it('never reads a holder that falls back without a new Gesture as a taken place', () => {
    // The wallet's own Gesture stands in for a lagging index (count 11)…
    const { result, rerender } = setup({
      account: ME,
      latestAddress: OTHER,
      cycle: 2,
      gestureCount: 10,
      nowMs: 1,
    });
    rerender({ account: ME, latestAddress: ME, cycle: 2, gestureCount: 11, nowMs: 2 });
    expect(result.current.moment?.kind).toBe('landed');
    act(() => jest.advanceTimersByTime(LANDED_MOMENT_MS));

    // …then the overlay gives way to the index, which still names the
    // previous holder at the old count: a correction, not a moment.
    rerender({ account: ME, latestAddress: OTHER, cycle: 2, gestureCount: 10, nowMs: 3 });
    expect(result.current.isLatest).toBe(false);
    expect(result.current.moment).toBeNull();

    // The index catches up with the same Gesture: no second "landed" either.
    rerender({ account: ME, latestAddress: ME, cycle: 2, gestureCount: 11, nowMs: 4 });
    expect(result.current.isLatest).toBe(true);
    expect(result.current.moment).toBeNull();

    // A genuinely new Gesture by someone else still takes the place.
    rerender({ account: ME, latestAddress: THIRD, cycle: 2, gestureCount: 12, nowMs: 5 });
    expect(result.current.moment).toEqual({ kind: 'taken', by: THIRD, atMs: 5 });
  });

  it('needs a known count before calling a change of holder a moment', () => {
    const { result, rerender } = setup({
      account: ME,
      latestAddress: ME,
      cycle: 2,
      gestureCount: null,
      nowMs: 1,
    });
    rerender({ account: ME, latestAddress: OTHER, cycle: 2, gestureCount: null, nowMs: 2 });
    expect(result.current.isLatest).toBe(false);
    expect(result.current.moment).toBeNull();
  });

  it('starts over for a new cycle or another wallet', () => {
    const { result, rerender } = setup({
      account: ME,
      latestAddress: ME,
      cycle: 2,
      gestureCount: 10,
      nowMs: 1,
    });
    rerender({ account: ME, latestAddress: OTHER, cycle: 3, gestureCount: 1, nowMs: 2 });
    expect(result.current.moment).toBeNull();

    rerender({ account: THIRD, latestAddress: THIRD, cycle: 3, gestureCount: 2, nowMs: 3 });
    expect(result.current.moment).toBeNull();
    expect(result.current.isLatest).toBe(true);
  });

  it('reports nothing without a wallet', () => {
    const { result, rerender } = setup({
      account: null,
      latestAddress: OTHER,
      cycle: 2,
      gestureCount: 10,
      nowMs: 1,
    });
    rerender({ account: null, latestAddress: THIRD, cycle: 2, gestureCount: 11, nowMs: 2 });
    expect(result.current.moment).toBeNull();
  });
});

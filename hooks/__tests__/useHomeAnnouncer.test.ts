import { act, renderHook } from '@testing-library/react';

import type { CyclePhase } from '@/lib/cycleState';

import {
  ANNOUNCE_DEBOUNCE_MS,
  useHomeAnnouncer,
  type HomeAnnouncerInput,
} from '../useHomeAnnouncer';

const OTHER = '0x2222222222222222222222222222222222222222';
const ME = '0x1111111111111111111111111111111111111111';

function setup(initial: HomeAnnouncerInput) {
  return renderHook((props: HomeAnnouncerInput) => useHomeAnnouncer(props), {
    initialProps: initial,
  });
}

function settle() {
  act(() => {
    jest.advanceTimersByTime(ANNOUNCE_DEBOUNCE_MS);
  });
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useHomeAnnouncer', () => {
  it('says nothing on load', () => {
    const { result } = setup({
      phase: 'live',
      latestAddress: OTHER,
      gestureCount: 10,
      account: ME,
    });
    settle();
    expect(result.current.text).toBe('');
  });

  it('announces a new Last Gesture by someone else', () => {
    const { result, rerender } = setup({
      phase: 'live',
      latestAddress: ME,
      gestureCount: 10,
      account: ME,
    });
    rerender({ phase: 'live', latestAddress: OTHER, gestureCount: 11, account: ME });
    settle();
    expect(result.current.text).toBe('home.announce.newGesture(address=0x2222…⁠2222)');
  });

  it('announces the clock entering the final minute and reaching zero', () => {
    const { result, rerender } = setup({ phase: 'final-ten', gestureCount: 10 });
    rerender({ phase: 'final-minute', gestureCount: 10 });
    settle();
    expect(result.current.text).toBe('home.chrono.phase.finalMinute.status');

    rerender({ phase: 'ready-to-finalize', gestureCount: 10 });
    settle();
    expect(result.current.text).toBe('home.chrono.phase.readyToFinalize.status');
  });

  it('collapses a burst into the latest sentence and never speaks loading states', () => {
    const { result, rerender } = setup({ phase: 'loading' as CyclePhase, gestureCount: null });
    rerender({ phase: 'live', gestureCount: 10 });
    settle();
    expect(result.current.text).toBe('');

    rerender({ phase: 'final-hour', gestureCount: 10 });
    rerender({ phase: 'final-ten', gestureCount: 10 });
    settle();
    expect(result.current.text).toBe('home.chrono.phase.finalTen.status');
  });

  it('speaks the wallet’s own moment instead of a generic new-Gesture line', () => {
    const { result, rerender } = setup({
      phase: 'live',
      latestAddress: OTHER,
      gestureCount: 10,
      account: ME,
    });
    rerender({
      phase: 'live',
      latestAddress: ME,
      gestureCount: 11,
      account: ME,
      moment: { kind: 'landed', by: null, atMs: 1 },
    });
    settle();
    expect(result.current.text).toBe('home.observatory.standing.landed');
  });

  it('gives a repeated sentence a new id so it is spoken again', () => {
    const { result, rerender } = setup({ phase: 'final-hour', gestureCount: 10 });
    rerender({ phase: 'final-ten', gestureCount: 10 });
    settle();
    const first = result.current.id;
    rerender({ phase: 'final-hour', gestureCount: 11 });
    rerender({ phase: 'final-ten', gestureCount: 11 });
    settle();
    expect(result.current.text).toBe('home.chrono.phase.finalTen.status');
    expect(result.current.id).toBeGreaterThan(first);
  });
});

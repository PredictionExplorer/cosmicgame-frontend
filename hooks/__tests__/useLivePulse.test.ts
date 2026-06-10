import { act, renderHook } from '@testing-library/react';

import { useLivePulse } from '../useLivePulse';

describe('useLivePulse', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not pulse on initial mount, even with a positive pulse key', () => {
    const { result } = renderHook(({ pulseKey }) => useLivePulse(pulseKey), {
      initialProps: { pulseKey: 3 },
    });

    expect(result.current).toBe(false);
  });

  it('pulses when the key increments and clears after ~950ms', () => {
    const { result, rerender } = renderHook(({ pulseKey }) => useLivePulse(pulseKey), {
      initialProps: { pulseKey: 0 },
    });

    expect(result.current).toBe(false);

    rerender({ pulseKey: 1 });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(949);
    });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it('pulses again for each subsequent key change', () => {
    const { result, rerender } = renderHook(({ pulseKey }) => useLivePulse(pulseKey), {
      initialProps: { pulseKey: 0 },
    });

    rerender({ pulseKey: 1 });
    act(() => {
      jest.advanceTimersByTime(950);
    });
    expect(result.current).toBe(false);

    rerender({ pulseKey: 2 });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(950);
    });
    expect(result.current).toBe(false);
  });

  it('does not pulse when the key resets to zero', () => {
    const { result, rerender } = renderHook(({ pulseKey }) => useLivePulse(pulseKey), {
      initialProps: { pulseKey: 2 },
    });

    rerender({ pulseKey: 0 });
    expect(result.current).toBe(false);
  });

  it('cleans up its timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const { rerender, unmount } = renderHook(({ pulseKey }) => useLivePulse(pulseKey), {
      initialProps: { pulseKey: 0 },
    });

    rerender({ pulseKey: 1 });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});

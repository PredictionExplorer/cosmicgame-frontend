import { act, renderHook } from '@testing-library/react';

import { useRotatingIndex } from '../useRotatingIndex';

describe('useRotatingIndex', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns null when there are no items to rotate', () => {
    const { result } = renderHook(() => useRotatingIndex({ count: 0 }));
    expect(result.current).toBeNull();
  });

  it('can start from a randomized valid index', () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.75);
    const { result } = renderHook(() =>
      useRotatingIndex({ count: 4, randomStart: true, enabled: false }),
    );
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current).toBe(3);
  });

  it('rotates at the configured interval and wraps around', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useRotatingIndex({ count: 2, intervalMs: 1_000, enabled: true }),
    );

    expect(result.current).toBe(0);

    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(1);

    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(0);
  });

  it('advances once per change of advanceSignal, without the interval timer', () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ signal }: { signal: number }) =>
        useRotatingIndex({ count: 3, enabled: false, advanceSignal: signal }),
      { initialProps: { signal: 0 } },
    );
    expect(result.current).toBe(0);

    // The initial signal value is not an advance: the first render must
    // keep the server-picked index.
    rerender({ signal: 0 });
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current).toBe(0);

    rerender({ signal: 1 });
    expect(result.current).toBe(1);
    rerender({ signal: 1 });
    expect(result.current).toBe(1);
    rerender({ signal: 2 });
    expect(result.current).toBe(2);
    rerender({ signal: 3 });
    expect(result.current).toBe(0);
  });
});

import { act, renderHook } from '@testing-library/react';

import { useNow } from '@/hooks/useNow';

describe('useNow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the current epoch ms on first render', () => {
    const before = Date.now();
    const { result } = renderHook(() => useNow());
    const value = result.current;
    expect(typeof value).toBe('number');
    // result is sampled during the synchronous mount, so it should be at
    // most a few ms ahead of the timestamp before render.
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(Date.now() + 50);
  });

  it('re-renders when the ticker fires', () => {
    const { result } = renderHook(() => useNow(1000));
    const initial = result.current;
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current).toBeGreaterThan(initial);
  });

  it('uses different ticker per intervalMs', () => {
    const { result: fast } = renderHook(() => useNow(100));
    const { result: slow } = renderHook(() => useNow(5000));
    const fastInitial = fast.current;
    const slowInitial = slow.current;

    act(() => {
      jest.advanceTimersByTime(150);
    });
    // Fast ticker should have ticked; slow ticker should not yet have.
    expect(fast.current).toBeGreaterThan(fastInitial);
    expect(slow.current).toBe(slowInitial);
  });

  it('shares a single ticker across multiple consumers of the same interval', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    setIntervalSpy.mockClear();

    const a = renderHook(() => useNow(2000));
    const b = renderHook(() => useNow(2000));

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    a.unmount();
    b.unmount();
    setIntervalSpy.mockRestore();
  });

  it('restarts from the current time when a ticker is reused after going idle', () => {
    const first = renderHook(() => useNow(7000));
    first.unmount();

    // Minutes pass with no subscriber, so no tick refreshes the stored time.
    jest.setSystemTime(Date.now() + 5 * 60_000);
    const expected = Date.now();

    const { result } = renderHook(() => useNow(7000));
    expect(result.current).toBeGreaterThanOrEqual(expected);
  });

  it('clears the interval when the last subscriber unmounts', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    clearIntervalSpy.mockClear();

    const { unmount } = renderHook(() => useNow(3000));
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

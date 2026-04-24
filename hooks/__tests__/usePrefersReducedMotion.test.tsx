import { act, renderHook } from '@testing-library/react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Listener = (ev: MediaQueryListEvent) => void;

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  _fire: (matches: boolean) => void;
}

function createMatchMedia(initialMatches: boolean) {
  const listeners: Listener[] = [];
  const mql: FakeMediaQueryList = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: jest.fn((_: string, cb: Listener) => listeners.push(cb)),
    removeEventListener: jest.fn((_: string, cb: Listener) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    }),
    _fire: (matches: boolean) => {
      mql.matches = matches;
      for (const l of [...listeners]) l({ matches } as MediaQueryListEvent);
    },
  };
  return {
    mql,
    install() {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: jest.fn().mockReturnValue(mql),
      });
    },
  };
}

describe('usePrefersReducedMotion', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('returns false when prefers-reduced-motion does not match', () => {
    const { install } = createMatchMedia(false);
    install();

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion matches initially', () => {
    const { install } = createMatchMedia(true);
    install();

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const { mql, install } = createMatchMedia(false);
    install();

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => mql._fire(true));
    expect(result.current).toBe(true);

    act(() => mql._fire(false));
    expect(result.current).toBe(false);
  });

  it('unsubscribes on unmount', () => {
    const { mql, install } = createMatchMedia(false);
    install();

    const { unmount } = renderHook(() => usePrefersReducedMotion());
    expect(mql.addEventListener).toHaveBeenCalledTimes(1);
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('degrades gracefully when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});

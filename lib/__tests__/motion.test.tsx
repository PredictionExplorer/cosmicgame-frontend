import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';

import {
  fadeRise,
  fadeRiseStagger,
  motionTokens,
  scaleIn,
  useMotionTransition,
  useMotionVariants,
} from '@/lib/motion';

describe('motion tokens', () => {
  it('exposes a consistent duration ramp', () => {
    const d = motionTokens.duration;
    expect(d.instant).toBeLessThan(d.fast);
    expect(d.fast).toBeLessThan(d.base);
    expect(d.base).toBeLessThan(d.slow);
    expect(d.slow).toBeLessThan(d.page);
  });

  it('exposes easing tuples of length 4', () => {
    for (const [, easing] of Object.entries(motionTokens.ease)) {
      expect(Array.isArray(easing)).toBe(true);
      expect((easing as readonly unknown[]).length).toBe(4);
    }
  });
});

describe('variants', () => {
  it('fadeRise has initial + animate states', () => {
    expect(fadeRise.initial).toEqual({ opacity: 0, y: 8 });
    expect(fadeRise.animate).toEqual(expect.objectContaining({ opacity: 1, y: 0 }));
  });

  it('scaleIn starts at offset.scaleFrom', () => {
    expect(scaleIn.initial).toEqual({
      opacity: 0,
      scale: motionTokens.offset.scaleFrom,
    });
  });
});

describe('useMotionVariants', () => {
  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
  }

  afterEach(() => {
    // restore default (no-reduce) behavior between tests
    mockMatchMedia(false);
  });

  it('returns the original variants when motion is allowed', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMotionVariants(fadeRise));
    expect(result.current).toBe(fadeRise);
  });

  it('returns an opacity-only fallback under prefers-reduced-motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMotionVariants(fadeRise));
    expect(result.current).not.toBe(fadeRise);
    expect(result.current.initial).toEqual({ opacity: 0 });
    expect(result.current.animate).toEqual(
      expect.objectContaining({ opacity: 1, transition: { duration: 0 } }),
    );
  });

  it('collapses stagger variants to 0ms under reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMotionVariants(fadeRiseStagger));
    expect(result.current.animate).toEqual({ transition: { staggerChildren: 0 } });
  });
});

describe('useMotionTransition', () => {
  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
  }

  it('returns the provided transition under normal motion', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMotionTransition({ duration: 0.5, ease: 'easeOut' }));
    expect(result.current).toEqual({ duration: 0.5, ease: 'easeOut' });
  });

  it('returns duration: 0 under prefers-reduced-motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMotionTransition({ duration: 0.5, ease: 'easeOut' }));
    expect(result.current).toEqual({ duration: 0 });
  });
});

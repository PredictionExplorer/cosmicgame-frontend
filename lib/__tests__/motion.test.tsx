import '@testing-library/jest-dom';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { renderHook } from '@testing-library/react';

import { fadeRise, motionTokens, useMotionVariants } from '@/lib/motion';

describe('motion tokens', () => {
  it('exposes a consistent duration ramp', () => {
    const d = motionTokens.duration;
    expect(d.instant).toBeLessThan(d.fast);
    expect(d.fast).toBeLessThan(d.base);
    expect(d.base).toBeLessThan(d.slow);
    expect(d.slow).toBeLessThan(d.page);
  });

  it('exposes easing tuples of length 4, none overshooting (no springs)', () => {
    for (const [, easing] of Object.entries(motionTokens.ease)) {
      const curve = easing as readonly number[];
      expect(curve).toHaveLength(4);
      for (const value of curve) expect(value).toBeGreaterThanOrEqual(0);
      expect(curve[1]!).toBeLessThanOrEqual(1);
    }
  });

  it('matches the CSS motion tokens exactly, so framer and CSS never drift', () => {
    const css = readFileSync(resolve(__dirname, '../../styles/tokens.css'), 'utf8');
    const token = (name: string) => {
      const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
      if (!match) throw new Error(`--${name} is missing from tokens.css`);
      return match[1]!.trim();
    };
    for (const [name, seconds] of Object.entries(motionTokens.duration)) {
      expect(`${name} ${token(`duration-${name}`)}`).toBe(
        `${name} ${Math.round(seconds * 1000)}ms`,
      );
    }
    const cssName: Record<string, string> = {
      outExpo: 'ease-out-expo',
      gallery: 'ease-gallery',
      outSoft: 'ease-out-soft',
      inOutSoft: 'ease-in-out-soft',
    };
    for (const [name, curve] of Object.entries(motionTokens.ease)) {
      expect(`${name} ${token(cssName[name]!)}`).toBe(
        `${name} cubic-bezier(${(curve as readonly number[]).join(', ')})`,
      );
    }
    // The page transition is the ceiling of every entrance.
    expect(motionTokens.duration.page).toBeLessThanOrEqual(0.56);
  });
});

describe('variants', () => {
  it('fadeRise has initial + animate states', () => {
    expect(fadeRise.initial).toEqual({ opacity: 0, y: 8 });
    expect(fadeRise.animate).toEqual(expect.objectContaining({ opacity: 1, y: 0 }));
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

  it('keeps content visible before viewport reveals under prefers-reduced-motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMotionVariants(fadeRise));
    expect(result.current).not.toBe(fadeRise);
    expect(result.current.initial).toEqual({ opacity: 1 });
    expect(result.current.animate).toEqual(
      expect.objectContaining({ opacity: 1, transition: { duration: 0 } }),
    );
  });
});

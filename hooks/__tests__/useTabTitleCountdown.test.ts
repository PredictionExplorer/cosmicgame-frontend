import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useTabTitleCountdown } from '../useTabTitleCountdown';

describe('useTabTitleCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.title = 'Cosmic Signature';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('leaves the title alone while disabled', () => {
    renderHook(() => useTabTitleCountdown({ enabled: false, targetMs: Date.now() + 60_000 }));
    expect(document.title).toBe('Cosmic Signature');
  });

  it('ticks the remaining time into the title and restores it on disable', () => {
    const targetMs = Date.now() + 90_000;
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useTabTitleCountdown({ enabled, targetMs }),
      { initialProps: { enabled: true } },
    );

    expect(document.title).toBe('01:30 \u00b7 Cosmic Signature');

    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(document.title).toBe('01:00 \u00b7 Cosmic Signature');

    rerender({ enabled: false });
    expect(document.title).toBe('Cosmic Signature');
  });

  it('keeps the original base title when the target moves (a gesture extends the clock)', () => {
    const start = Date.now();
    const { rerender } = renderHook(
      ({ targetMs }: { targetMs: number }) => useTabTitleCountdown({ enabled: true, targetMs }),
      { initialProps: { targetMs: start + 60_000 } },
    );

    expect(document.title).toBe('01:00 \u00b7 Cosmic Signature');

    rerender({ targetMs: start + 120_000 });
    expect(document.title).toBe('02:00 \u00b7 Cosmic Signature');
  });

  it('clamps at zero instead of going negative', () => {
    renderHook(() => useTabTitleCountdown({ enabled: true, targetMs: Date.now() - 5_000 }));
    expect(document.title).toBe('00:00 \u00b7 Cosmic Signature');
  });
});

import { act, renderHook } from '@testing-library/react';

import { ART_MOTION_STORAGE_KEY, useArtMotionPreference } from '../useArtMotionPreference';

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('useArtMotionPreference', () => {
  it('moves by default', () => {
    const { result } = renderHook(() => useArtMotionPreference());

    expect(result.current.paused).toBe(false);
  });

  it('remembers a pause in this browser and clears it on play', () => {
    const { result } = renderHook(() => useArtMotionPreference());

    act(() => result.current.setPaused(true));
    expect(result.current.paused).toBe(true);
    expect(window.localStorage.getItem(ART_MOTION_STORAGE_KEY)).toBe('1');

    act(() => result.current.setPaused(false));
    expect(result.current.paused).toBe(false);
    expect(window.localStorage.getItem(ART_MOTION_STORAGE_KEY)).toBeNull();
  });

  it('reads a pause chosen on an earlier visit', () => {
    window.localStorage.setItem(ART_MOTION_STORAGE_KEY, '1');

    const { result } = renderHook(() => useArtMotionPreference());
    expect(result.current.paused).toBe(true);
  });

  it('shares the choice between every reader on the page', () => {
    const first = renderHook(() => useArtMotionPreference());
    const second = renderHook(() => useArtMotionPreference());

    act(() => first.result.current.setPaused(true));
    expect(second.result.current.paused).toBe(true);
  });

  it('still pauses for this page load when the browser blocks storage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useArtMotionPreference());

    act(() => result.current.setPaused(true));
    expect(result.current.paused).toBe(true);
  });
});

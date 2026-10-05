import { act, renderHook } from '@testing-library/react';

import { reportError } from '@/utils/errors';

import {
  resetAttentionPreferencesForTest,
  updateAttentionPreferences,
} from '../useAttentionPreferences';
import {
  GESTURE_CHIME_SRC,
  previewGestureChime,
  resetGestureChimeForTest,
  useGestureChime,
} from '../useGestureChime';

jest.mock('../../utils/errors', () => ({ reportError: jest.fn() }));

const ME = '0x1Ec14a0000000000000000000000000000d7E990';
const OTHER = '0x2222222222222222222222222222222222222222';
const mockPlay = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  resetAttentionPreferencesForTest();
  resetGestureChimeForTest();
  global.Audio = jest.fn(() => ({ play: mockPlay, currentTime: 0 })) as unknown as typeof Audio;
});

function renderChime(initial: { account: string | null; last: string; count: number }) {
  return renderHook(
    ({ account, last, count }) =>
      useGestureChime({ account, lastGestureAddress: last, gestureCount: count }),
    { initialProps: initial },
  );
}

describe('useGestureChime', () => {
  it('never plays for anyone who did not turn sound on', () => {
    const { rerender } = renderChime({ account: ME, last: ME, count: 4 });
    rerender({ account: ME, last: OTHER, count: 5 });
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('never plays for a visitor without a wallet', () => {
    act(() => updateAttentionPreferences({ sound: true }));
    const { rerender } = renderChime({ account: null, last: OTHER, count: 4 });
    rerender({ account: null, last: ME, count: 5 });
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('plays when the viewer was the latest participant and a new Gesture followed', () => {
    act(() => updateAttentionPreferences({ sound: true }));
    // Addresses compare case-insensitively (API checksums vs wallet casing).
    const { rerender } = renderChime({ account: ME, last: ME.toLowerCase(), count: 4 });
    rerender({ account: ME, last: OTHER, count: 5 });

    expect(global.Audio).toHaveBeenCalledWith(GESTURE_CHIME_SRC);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('stays quiet for Gestures between other participants', () => {
    act(() => updateAttentionPreferences({ sound: true }));
    const { rerender } = renderChime({ account: ME, last: OTHER, count: 4 });
    rerender({ account: ME, last: '0x3333333333333333333333333333333333333333', count: 5 });
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('stays quiet when the viewer’s own Gesture lands', () => {
    act(() => updateAttentionPreferences({ sound: true }));
    const { rerender } = renderChime({ account: ME, last: OTHER, count: 4 });
    rerender({ account: ME, last: ME, count: 5 });
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('previews the chime (and unlocks audio) from the enabling click', async () => {
    await previewGestureChime();
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('does not report the browser autoplay refusal', async () => {
    mockPlay.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'));
    await previewGestureChime();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('reports other playback failures', async () => {
    const failure = new Error('decode failed');
    mockPlay.mockRejectedValueOnce(failure);
    await previewGestureChime();
    expect(reportError).toHaveBeenCalledWith(failure, 'gesture-chime-preview');
  });
});

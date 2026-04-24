import { renderHook, act } from '@testing-library/react';

import { reportError } from '@/utils/errors';

import { usePrizeNotification } from '../usePrizeNotification';

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

const mockReportError = reportError as jest.Mock;
const mockPlay = jest.fn().mockResolvedValue(undefined);

global.Audio = jest.fn(() => ({ play: mockPlay })) as unknown as typeof Audio;

function setupNotificationMock(permission: NotificationPermission) {
  const mockNotification = jest.fn();
  Object.defineProperty(window, 'Notification', {
    value: Object.assign(mockNotification, {
      permission,
      requestPermission: jest.fn().mockResolvedValue('granted'),
    }),
    writable: true,
    configurable: true,
  });
  return mockNotification;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPlay.mockResolvedValue(undefined);
  setupNotificationMock('granted');
});

describe('usePrizeNotification', () => {
  describe('playAudio', () => {
    it('creates an Audio element and calls play()', async () => {
      const { result } = renderHook(() => usePrizeNotification({ prizeTime: Date.now() + 60_000 }));

      await act(async () => {
        await result.current.playAudio();
      });

      expect(global.Audio).toHaveBeenCalledWith('/audio/notification.wav');
      expect(mockPlay).toHaveBeenCalled();
    });

    it('calls reportError when play() rejects', async () => {
      const playError = new Error('play failed');
      mockPlay.mockRejectedValueOnce(playError);

      const { result } = renderHook(() => usePrizeNotification({ prizeTime: Date.now() + 60_000 }));

      await act(async () => {
        await result.current.playAudio();
      });

      expect(mockReportError).toHaveBeenCalledWith(playError, 'notification audio error');
    });
  });

  describe('requestNotificationPermission', () => {
    it('calls Notification.requestPermission when not granted', () => {
      setupNotificationMock('default');

      const { result } = renderHook(() => usePrizeNotification({ prizeTime: Date.now() + 60_000 }));

      act(() => {
        result.current.requestNotificationPermission();
      });

      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('does nothing when already granted', () => {
      setupNotificationMock('granted');

      const { result } = renderHook(() => usePrizeNotification({ prizeTime: Date.now() + 60_000 }));

      act(() => {
        result.current.requestNotificationPermission();
      });

      expect(Notification.requestPermission).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('creates a Notification when permission is granted', () => {
      const mockNotification = setupNotificationMock('granted');

      const { result } = renderHook(() => usePrizeNotification({ prizeTime: Date.now() + 60_000 }));

      act(() => {
        result.current.sendNotification('Test', { body: 'Hello' });
      });

      expect(mockNotification).toHaveBeenCalledWith('Test', { body: 'Hello' });
    });

    it('does nothing when permission is not granted', () => {
      const mockNotification = setupNotificationMock('denied');

      const { result } = renderHook(() => usePrizeNotification({ prizeTime: Date.now() + 60_000 }));

      act(() => {
        result.current.sendNotification('Test', { body: 'Hello' });
      });

      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe('5-minute warning effect', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('fires notification when within 5-minute window', () => {
      const mockNotification = setupNotificationMock('granted');
      const prizeTime = Date.now() + 3 * 60 * 1000;

      renderHook(() => usePrizeNotification({ prizeTime }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockNotification).toHaveBeenCalledWith('Gesture now or the cycle closes', {
        body: 'The Performance Cycle closes in 5 minutes. Make a gesture now to take part in the final allocations.',
      });
    });

    it('does not fire notification when outside the 5-minute window', () => {
      const mockNotification = setupNotificationMock('granted');
      const prizeTime = Date.now() + 10 * 60 * 1000;

      renderHook(() => usePrizeNotification({ prizeTime }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('clears interval after notification fires', () => {
      setupNotificationMock('granted');
      const prizeTime = Date.now() + 3 * 60 * 1000;

      renderHook(() => usePrizeNotification({ prizeTime }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const callCount = (window.Notification as unknown as jest.Mock).mock.calls.length;

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect((window.Notification as unknown as jest.Mock).mock.calls).toHaveLength(callCount);
    });

    it('clears interval when prizeTime has passed', () => {
      const mockNotification = setupNotificationMock('granted');
      const prizeTime = Date.now() - 1000;

      renderHook(() => usePrizeNotification({ prizeTime }));

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockNotification).not.toHaveBeenCalled();
    });
  });
});

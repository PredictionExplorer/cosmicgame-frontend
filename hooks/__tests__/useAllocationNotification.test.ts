import { renderHook, act } from '@testing-library/react';

import {
  ATTENTION_STORAGE_KEY,
  resetAttentionPreferencesForTest,
  updateAttentionPreferences,
} from '../useAttentionPreferences';
import { useAllocationNotification } from '../useAllocationNotification';

const WARNING_TITLE = 'Localized finalization warning';

function setupNotificationMock(permission: NotificationPermission) {
  const instances: { onclick: (() => void) | null; close: jest.Mock }[] = [];
  const mockNotification = jest.fn(function (this: unknown) {
    const instance = { onclick: null, close: jest.fn() };
    instances.push(instance);
    return instance;
  });
  Object.defineProperty(window, 'Notification', {
    value: Object.assign(mockNotification, {
      permission,
      requestPermission: jest.fn().mockResolvedValue('granted'),
    }),
    writable: true,
    configurable: true,
  });
  return { mockNotification, instances };
}

function enableAlert(alertMinutes: 5 | 30 | 60 = 5) {
  act(() => {
    updateAttentionPreferences({ finalizationAlert: true, alertMinutes });
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  window.localStorage.clear();
  resetAttentionPreferencesForTest();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useAllocationNotification', () => {
  it('stays silent until the viewer turns the alert on (off by default)', () => {
    const { mockNotification } = setupNotificationMock('granted');
    renderHook(() =>
      useAllocationNotification({
        allocationTime: Date.now() + 3 * 60_000,
        notificationTitle: WARNING_TITLE,
        notificationBody: 'body',
      }),
    );

    act(() => {
      jest.advanceTimersByTime(2_000);
    });
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('fires once inside the chosen window, reporting the minutes actually left', () => {
    const { mockNotification } = setupNotificationMock('granted');
    const { result } = renderHook(() =>
      useAllocationNotification({
        allocationTime: Date.now() + 3 * 60_000,
        cycleNumber: 12,
        notificationTitle: WARNING_TITLE,
        notificationBody: (minutes) => `${minutes} minutes left`,
      }),
    );
    enableAlert(5);

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(result.current.alertEnabled).toBe(true);
    expect(mockNotification).toHaveBeenCalledTimes(1);
    expect(mockNotification).toHaveBeenCalledWith(WARNING_TITLE, {
      body: '3 minutes left',
      tag: 'cosmic-cycle-12-finalize',
    });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });
    expect(mockNotification).toHaveBeenCalledTimes(1);
  });

  it('honours the chosen threshold', () => {
    const { mockNotification } = setupNotificationMock('granted');
    renderHook(() =>
      useAllocationNotification({
        allocationTime: Date.now() + 45 * 60_000,
        notificationTitle: WARNING_TITLE,
        notificationBody: 'body',
      }),
    );

    enableAlert(30);
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(mockNotification).not.toHaveBeenCalled();

    enableAlert(60);
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(mockNotification).toHaveBeenCalledTimes(1);
  });

  it('re-arms when a gesture pushes the deadline back out of the window', () => {
    const { mockNotification } = setupNotificationMock('granted');
    const { rerender } = renderHook(
      ({ allocationTime }) =>
        useAllocationNotification({
          allocationTime,
          notificationTitle: WARNING_TITLE,
          notificationBody: 'body',
        }),
      { initialProps: { allocationTime: Date.now() + 2 * 60_000 } },
    );
    enableAlert(5);
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(mockNotification).toHaveBeenCalledTimes(1);

    rerender({ allocationTime: Date.now() + 20 * 60_000 });
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    rerender({ allocationTime: Date.now() + 4 * 60_000 });
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(mockNotification).toHaveBeenCalledTimes(2);
  });

  it('never fires after the deadline has passed', () => {
    const { mockNotification } = setupNotificationMock('granted');
    renderHook(() =>
      useAllocationNotification({
        allocationTime: Date.now() - 1_000,
        notificationTitle: WARNING_TITLE,
        notificationBody: 'body',
      }),
    );
    enableAlert(5);
    act(() => {
      jest.advanceTimersByTime(3_000);
    });
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('focuses the tab when the notification is clicked', () => {
    const { instances } = setupNotificationMock('granted');
    const focus = jest.spyOn(window, 'focus').mockImplementation(() => undefined);
    const { result } = renderHook(() =>
      useAllocationNotification({ allocationTime: Date.now() + 60_000 }),
    );

    act(() => {
      result.current.sendNotification('Test', { body: 'Hello' });
    });
    instances[0]!.onclick?.();

    expect(focus).toHaveBeenCalled();
    expect(instances[0]!.close).toHaveBeenCalled();
    focus.mockRestore();
  });

  it('does not create a notification without permission', () => {
    const { mockNotification } = setupNotificationMock('denied');
    const { result } = renderHook(() =>
      useAllocationNotification({ allocationTime: Date.now() + 60_000 }),
    );

    act(() => {
      result.current.sendNotification('Test', { body: 'Hello' });
    });

    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('reads the preference persisted by another page view', () => {
    const { mockNotification } = setupNotificationMock('granted');
    window.localStorage.setItem(
      ATTENTION_STORAGE_KEY,
      JSON.stringify({ finalizationAlert: true, alertMinutes: 5 }),
    );
    renderHook(() =>
      useAllocationNotification({
        allocationTime: Date.now() + 2 * 60_000,
        notificationTitle: WARNING_TITLE,
        notificationBody: 'body',
      }),
    );
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(mockNotification).toHaveBeenCalledTimes(1);
  });
});

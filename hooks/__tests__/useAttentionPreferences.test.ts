import { act, renderHook } from '@testing-library/react';

import {
  ATTENTION_STORAGE_KEY,
  DEFAULT_ATTENTION_PREFERENCES,
  getNotificationPermission,
  readAttentionPreferences,
  resetAttentionPreferencesForTest,
  useAttentionPreferences,
} from '../useAttentionPreferences';

function setNotificationPermission(
  permission: NotificationPermission,
  requestResult: NotificationPermission = permission,
) {
  const requestPermission = jest.fn().mockResolvedValue(requestResult);
  Object.defineProperty(window, 'Notification', {
    value: { permission, requestPermission },
    writable: true,
    configurable: true,
  });
  return requestPermission;
}

beforeEach(() => {
  window.localStorage.clear();
  resetAttentionPreferencesForTest();
  setNotificationPermission('default');
});

describe('useAttentionPreferences', () => {
  it('starts with sound, alert and tab-title countdown all off', () => {
    const { result } = renderHook(() => useAttentionPreferences());
    expect(result.current.preferences).toEqual(DEFAULT_ATTENTION_PREFERENCES);
    expect(DEFAULT_ATTENTION_PREFERENCES).toMatchObject({
      sound: false,
      finalizationAlert: false,
      tabTitle: false,
    });
  });

  it('persists a change and shares it with every consumer', () => {
    const first = renderHook(() => useAttentionPreferences());
    const second = renderHook(() => useAttentionPreferences());

    act(() => {
      first.result.current.setSound(true);
      first.result.current.setTabTitle(true);
    });

    expect(second.result.current.preferences.sound).toBe(true);
    expect(second.result.current.preferences.tabTitle).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(ATTENTION_STORAGE_KEY)!)).toMatchObject({
      sound: true,
      tabTitle: true,
    });
  });

  it('turns the alert on only when the browser grants notifications', async () => {
    const requestPermission = setNotificationPermission('default', 'granted');
    const { result } = renderHook(() => useAttentionPreferences());

    let permission: string | undefined;
    await act(async () => {
      permission = await result.current.setFinalizationAlert(30);
    });

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(permission).toBe('granted');
    expect(result.current.preferences).toMatchObject({ finalizationAlert: true, alertMinutes: 30 });
  });

  it('keeps the alert off when notifications are blocked', async () => {
    const requestPermission = setNotificationPermission('denied');
    const { result } = renderHook(() => useAttentionPreferences());

    let permission: string | undefined;
    await act(async () => {
      permission = await result.current.setFinalizationAlert(5);
    });

    expect(requestPermission).not.toHaveBeenCalled();
    expect(permission).toBe('denied');
    expect(result.current.preferences.finalizationAlert).toBe(false);
  });

  it('turns the alert off with null', async () => {
    setNotificationPermission('granted');
    const { result } = renderHook(() => useAttentionPreferences());
    await act(async () => {
      await result.current.setFinalizationAlert(5);
    });
    await act(async () => {
      await result.current.setFinalizationAlert(null);
    });
    expect(result.current.preferences.finalizationAlert).toBe(false);
  });

  it('migrates the old threshold, keeping the alert only where notifications were granted', () => {
    setNotificationPermission('granted');
    window.localStorage.setItem('cosmic-notify-threshold-min', '30');

    expect(readAttentionPreferences()).toMatchObject({
      finalizationAlert: true,
      alertMinutes: 30,
      sound: false,
    });
    expect(window.localStorage.getItem('cosmic-notify-threshold-min')).toBeNull();
  });

  it('migrates the old threshold as off when notifications were never granted', () => {
    setNotificationPermission('default');
    window.localStorage.setItem('cosmic-notify-threshold-min', '45');

    expect(readAttentionPreferences()).toMatchObject({
      finalizationAlert: false,
      alertMinutes: 30,
    });
  });

  it('ignores corrupt storage', () => {
    window.localStorage.setItem(ATTENTION_STORAGE_KEY, '{not json');
    expect(readAttentionPreferences()).toEqual(DEFAULT_ATTENTION_PREFERENCES);
  });

  it('follows changes made in another tab', () => {
    const { result } = renderHook(() => useAttentionPreferences());
    window.localStorage.setItem(ATTENTION_STORAGE_KEY, JSON.stringify({ sound: true }));

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: ATTENTION_STORAGE_KEY }));
    });

    expect(result.current.preferences.sound).toBe(true);
  });

  it('reports an unsupported browser', () => {
    Object.defineProperty(window, 'Notification', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(getNotificationPermission()).toBe('unsupported');
  });
});

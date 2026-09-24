import { act, renderHook } from '@testing-library/react';

import { resetAttentionPreferencesForTest } from '../useAttentionPreferences';
import { useFinalizationAlertChoice } from '../useFinalizationAlertChoice';

const mockNotify = jest.fn();
jest.mock('../useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: jest.fn() }),
}));

function setNotificationPermission(
  permission: NotificationPermission | 'unsupported',
  requestResult: NotificationPermission = permission === 'unsupported' ? 'denied' : permission,
) {
  const requestPermission = jest.fn().mockResolvedValue(requestResult);
  Object.defineProperty(window, 'Notification', {
    value: permission === 'unsupported' ? undefined : { permission, requestPermission },
    writable: true,
    configurable: true,
  });
  return requestPermission;
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  resetAttentionPreferencesForTest();
});

async function pick(
  result: { current: ReturnType<typeof useFinalizationAlertChoice> },
  minutes: number,
) {
  await act(async () => {
    result.current.onThresholdChange(minutes);
    await Promise.resolve();
  });
}

describe('useFinalizationAlertChoice', () => {
  it('turns the alert on at the picked threshold once notifications are allowed', async () => {
    const requestPermission = setNotificationPermission('default', 'granted');
    const { result } = renderHook(() => useFinalizationAlertChoice());
    expect(result.current.thresholdMinutes).toBeUndefined();

    await pick(result, 30);

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(result.current.thresholdMinutes).toBe(30);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('turns the alert off when the active threshold is picked again', async () => {
    setNotificationPermission('granted');
    const { result } = renderHook(() => useFinalizationAlertChoice());
    await pick(result, 5);
    expect(result.current.thresholdMinutes).toBe(5);

    await pick(result, 5);
    expect(result.current.thresholdMinutes).toBeUndefined();
  });

  it('says why nothing happened when notifications are blocked', async () => {
    setNotificationPermission('denied');
    const { result } = renderHook(() => useFinalizationAlertChoice());

    await pick(result, 60);

    expect(result.current.thresholdMinutes).toBeUndefined();
    expect(mockNotify).toHaveBeenCalledWith('info', 'common.attention.alert.blocked');
  });

  it('says the browser has no notifications instead of doing nothing', async () => {
    setNotificationPermission('unsupported');
    const { result } = renderHook(() => useFinalizationAlertChoice());

    await pick(result, 5);

    expect(result.current.thresholdMinutes).toBeUndefined();
    expect(mockNotify).toHaveBeenCalledWith('info', 'common.attention.alert.unsupported');
  });

  it('ignores a threshold the alert does not offer', async () => {
    const requestPermission = setNotificationPermission('default', 'granted');
    const { result } = renderHook(() => useFinalizationAlertChoice());

    await pick(result, 7);

    expect(requestPermission).not.toHaveBeenCalled();
    expect(result.current.thresholdMinutes).toBeUndefined();
  });
});

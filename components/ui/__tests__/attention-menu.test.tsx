import userEvent from '@testing-library/user-event';

import {
  ATTENTION_STORAGE_KEY,
  resetAttentionPreferencesForTest,
} from '@/hooks/useAttentionPreferences';

import { checkA11y, render, screen, waitFor } from '@/test-utils';

import { AttentionMenu } from '../attention-menu';

const mockPreview = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../hooks/useGestureChime', () => ({
  previewGestureChime: () => mockPreview(),
}));

function setNotificationPermission(permission: NotificationPermission, result = permission) {
  const requestPermission = jest.fn().mockResolvedValue(result);
  Object.defineProperty(window, 'Notification', {
    value: { permission, requestPermission },
    writable: true,
    configurable: true,
  });
  return requestPermission;
}

function stored() {
  return JSON.parse(window.localStorage.getItem(ATTENTION_STORAGE_KEY) ?? '{}');
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  resetAttentionPreferencesForTest();
  setNotificationPermission('default', 'granted');
});

async function openMenu() {
  const user = userEvent.setup();
  render(<AttentionMenu />);
  await user.click(screen.getByRole('button', { name: 'common.attention.menuLabel' }));
  await screen.findByTestId('attention-menu');
  return user;
}

describe('AttentionMenu', () => {
  it('starts with every switch off', async () => {
    await openMenu();
    for (const name of [
      'common.attention.sound.label',
      'common.attention.alert.label',
      'common.attention.tabTitle.label',
    ]) {
      expect(screen.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('previews the chime when sound is turned on and saves the choice', async () => {
    const user = await openMenu();
    await user.click(screen.getByRole('switch', { name: 'common.attention.sound.label' }));

    expect(mockPreview).toHaveBeenCalledTimes(1);
    expect(stored()).toMatchObject({ sound: true });
    expect(screen.getByRole('button', { name: 'common.attention.menuLabel' })).toBeInTheDocument();
  });

  it('asks for notification permission from the alert switch, then offers thresholds', async () => {
    const requestPermission = setNotificationPermission('default', 'granted');
    const user = await openMenu();

    await user.click(screen.getByRole('switch', { name: 'common.attention.alert.label' }));
    expect(requestPermission).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(stored()).toMatchObject({ finalizationAlert: true, alertMinutes: 5 }),
    );

    // The threshold picker appears once the alert is on.
    await user.click(
      await screen.findByRole('button', { name: 'common.attention.alert.minutes(minutes=30)' }),
    );
    await waitFor(() => expect(stored()).toMatchObject({ alertMinutes: 30 }));
    expect(
      screen.getByRole('button', { name: 'common.attention.alert.minutes(minutes=30)' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('explains blocked notifications instead of turning the alert on', async () => {
    setNotificationPermission('denied');
    const user = await openMenu();

    expect(screen.getByText('common.attention.alert.blocked')).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'common.attention.alert.label' }));
    expect(stored().finalizationAlert).toBeFalsy();
  });

  it('toggles the tab-title countdown', async () => {
    const user = await openMenu();
    await user.click(screen.getByRole('switch', { name: 'common.attention.tabTitle.label' }));
    expect(stored()).toMatchObject({ tabTitle: true });
  });

  it('has no accessibility violations when open', async () => {
    await openMenu();
    await checkA11y(document.body);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '@/lib/theme/config';

import { ThemeSwitcher } from '../ThemeSwitcher';

describe('color scheme menu', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${THEME_COOKIE_NAME}=; Max-Age=0; Path=/`;
    document.documentElement.dataset.theme = 'midnight';
  });

  it('offers a named radio choice with the current palette marked', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = 'aurora';
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole('button', { name: 'common.themeSwitcher.label' }));

    const selected = await screen.findByRole('menuitemradio', {
      name: /themeSwitcher.themes.aurora.name/,
    });
    expect(selected).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: /themeSwitcher.themes.classic-blue.name/ }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('lets keyboard users choose the original blue and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'common.themeSwitcher.label' });

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    const midnight = await screen.findByRole('menuitemradio', {
      name: /themeSwitcher.themes.midnight.name/,
    });
    await waitFor(() => expect(midnight).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');

    expect(document.documentElement).toHaveAttribute('data-theme', 'classic-blue');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('classic-blue');
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=classic-blue`);
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

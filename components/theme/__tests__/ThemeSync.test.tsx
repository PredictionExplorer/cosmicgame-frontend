import { act, render } from '@testing-library/react';

import { currentSiteTheme } from '@/lib/theme/client';
import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '@/lib/theme/config';

import { ThemeSync } from '../ThemeSync';

describe('sitewide theme lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${THEME_COOKIE_NAME}=; Max-Age=0; Path=/`;
    document.documentElement.dataset.theme = 'midnight';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['focus', 'pageshow'])('picks up a choice made on the other host on %s', (event) => {
    localStorage.setItem(THEME_STORAGE_KEY, 'classic-blue');
    render(<ThemeSync />);
    expect(currentSiteTheme()).toBe('classic-blue');

    document.cookie = `${THEME_COOKIE_NAME}=aurora; Path=/`;
    act(() => window.dispatchEvent(new Event(event)));

    expect(currentSiteTheme()).toBe('aurora');
  });

  it('restores the preference on client navigation if the document attribute was reset', () => {
    const pathname = jest.spyOn(jest.requireMock('next/navigation'), 'usePathname');
    pathname.mockReturnValue('/');
    localStorage.setItem(THEME_STORAGE_KEY, 'nebula');
    const { rerender } = render(<ThemeSync />);
    document.documentElement.dataset.theme = 'midnight';

    pathname.mockReturnValue('/gallery');
    rerender(<ThemeSync />);

    expect(currentSiteTheme()).toBe('nebula');
  });

  it('ignores unrelated storage changes but synchronizes a theme change from another tab', () => {
    render(<ThemeSync />);
    localStorage.setItem(THEME_STORAGE_KEY, 'ember');

    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated-setting' })));
    expect(currentSiteTheme()).toBe('midnight');

    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY })));
    expect(currentSiteTheme()).toBe('ember');
  });

  it('refreshes a visible page after a theme change on another host', () => {
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    render(<ThemeSync />);
    document.cookie = `${THEME_COOKIE_NAME}=nebula; Path=/`;

    visibility.mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(currentSiteTheme()).toBe('midnight');

    visibility.mockReturnValue('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(currentSiteTheme()).toBe('nebula');
  });

  it('removes lifecycle listeners when unmounted', () => {
    const { unmount } = render(<ThemeSync />);
    unmount();
    document.cookie = `${THEME_COOKIE_NAME}=aurora; Path=/`;

    act(() => {
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('pageshow'));
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(currentSiteTheme()).toBe('midnight');
  });
});

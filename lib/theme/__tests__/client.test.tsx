import { act, renderHook } from '@testing-library/react';

import {
  currentSiteTheme,
  readThemePreference,
  restoreSiteTheme,
  setSiteTheme,
  useSiteTheme,
} from '../client';
import {
  DEFAULT_SITE_THEME,
  THEME_CHANGE_EVENT,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
} from '../config';

describe('browser theme preferences', () => {
  beforeEach(() => {
    setSiteTheme(DEFAULT_SITE_THEME);
    localStorage.clear();
    document.cookie = `${THEME_COOKIE_NAME}=; Max-Age=0; Path=/`;
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.documentElement.style.removeProperty('--background');
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  it('restores the shared choice after the DOM is reset during hydration', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'classic-blue');
    document.cookie = `${THEME_COOKIE_NAME}=aurora; Path=/`;
    document.documentElement.dataset.theme = DEFAULT_SITE_THEME;

    restoreSiteTheme();

    expect(readThemePreference()).toBe('aurora');
    expect(currentSiteTheme()).toBe('aurora');
  });

  it('falls back to storage when a cookie contains an unsupported value', () => {
    document.cookie = `${THEME_COOKIE_NAME}=unknown; Path=/`;
    localStorage.setItem(THEME_STORAGE_KEY, 'nebula');
    expect(readThemePreference()).toBe('nebula');
  });

  it('updates every subscribed control and persists a selection', () => {
    const first = renderHook(useSiteTheme);
    const second = renderHook(useSiteTheme);
    expect(first.result.current).toBe(DEFAULT_SITE_THEME);

    act(() => setSiteTheme('classic-blue'));

    expect(first.result.current).toBe('classic-blue');
    expect(second.result.current).toBe('classic-blue');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('classic-blue');
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=classic-blue`);

    first.unmount();
    act(() => setSiteTheme('ember'));
    expect(second.result.current).toBe('ember');
  });

  it('keeps mobile browser chrome aligned with the applied palette', () => {
    document.documentElement.style.setProperty('--background', '218 35% 8%');
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#000000';
    document.head.appendChild(meta);

    setSiteTheme('classic-blue');

    expect(meta.content).toBe('hsl(218 35% 8%)');
  });

  it('ignores unsupported selections without changing the page or persistence', () => {
    setSiteTheme('aurora');
    const listener = jest.fn();
    window.addEventListener(THEME_CHANGE_EVENT, listener);

    setSiteTheme('linear-gradient(red, blue)');

    expect(currentSiteTheme()).toBe('aurora');
    expect(readThemePreference()).toBe('aurora');
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
  });

  it('keeps changing palettes when cookies and local storage are blocked', () => {
    jest.spyOn(Document.prototype, 'cookie', 'get').mockImplementation(() => {
      throw new Error('Cookie access denied');
    });
    jest.spyOn(Document.prototype, 'cookie', 'set').mockImplementation(() => {
      throw new Error('Cookie access denied');
    });
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage access denied');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage access denied');
    });
    const { result } = renderHook(useSiteTheme);

    act(() => setSiteTheme('nebula'));
    act(restoreSiteTheme);

    expect(result.current).toBe('nebula');
    expect(currentSiteTheme()).toBe('nebula');
  });

  it('ignores invalid values in both the DOM and saved preferences', () => {
    document.documentElement.dataset.theme = 'unknown';
    document.cookie = `${THEME_COOKIE_NAME}=unknown; Path=/`;
    localStorage.setItem(THEME_STORAGE_KEY, 'unknown');

    restoreSiteTheme();

    expect(readThemePreference()).toBeUndefined();
    expect(currentSiteTheme()).toBe(DEFAULT_SITE_THEME);
  });

  it.each(['silently ignored', 'rejected'])(
    'retains a new choice when cookie writes are %s',
    (mode) => {
      localStorage.setItem(THEME_STORAGE_KEY, 'classic-blue');
      jest
        .spyOn(Document.prototype, 'cookie', 'get')
        .mockReturnValue(`${THEME_COOKIE_NAME}=classic-blue`);
      jest.spyOn(Document.prototype, 'cookie', 'set').mockImplementation(() => {
        if (mode === 'rejected') throw new Error('Cookie writes denied');
      });

      setSiteTheme('ember');
      // A readable, stale cookie still takes precedence over writable local storage.
      expect(readThemePreference()).toBe('classic-blue');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('ember');
      document.documentElement.dataset.theme = DEFAULT_SITE_THEME;
      restoreSiteTheme();

      expect(currentSiteTheme()).toBe('ember');
    },
  );

  it('accepts a later cross-host change after an earlier selection could not be saved', () => {
    const cookie = jest
      .spyOn(Document.prototype, 'cookie', 'get')
      .mockReturnValue(`${THEME_COOKIE_NAME}=classic-blue`);
    jest.spyOn(Document.prototype, 'cookie', 'set').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage writes denied');
    });
    setSiteTheme('ember');
    restoreSiteTheme();
    expect(currentSiteTheme()).toBe('ember');

    cookie.mockReturnValue(`${THEME_COOKIE_NAME}=aurora`);
    restoreSiteTheme();

    expect(currentSiteTheme()).toBe('aurora');
  });
});

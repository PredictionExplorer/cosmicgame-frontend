import { runInNewContext } from 'node:vm';

import {
  DEFAULT_SITE_THEME,
  isSiteTheme,
  THEME_COOKIE_NAME,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  themeCookieString,
  themeFromCookie,
} from '../config';

describe('theme preference validation', () => {
  it.each([undefined, null, '', 'toString', '__proto__', 'blue', 'MIDNIGHT', {}])(
    'rejects unsupported preference %p',
    (value) => {
      expect(isSiteTheme(value)).toBe(false);
    },
  );

  it('finds the exact preference among unrelated and similarly named cookies', () => {
    expect(
      themeFromCookie(`old_${THEME_COOKIE_NAME}=ember; session=abc; ${THEME_COOKIE_NAME}=aurora`),
    ).toBe('aurora');
    expect(themeFromCookie(`old_${THEME_COOKIE_NAME}=ember; session=abc`)).toBeUndefined();
  });

  it.each(['', 'other=nebula', `${THEME_COOKIE_NAME}=unknown`, `${THEME_COOKIE_NAME}=<script>`])(
    'ignores missing or invalid cookie values: %s',
    (cookie) => {
      expect(themeFromCookie(cookie)).toBeUndefined();
    },
  );
});

describe('theme cookie scope', () => {
  it.each([
    ['cosmicsignature.com', 'cosmicsignature.com'],
    ['app.cosmicsignature.com', 'cosmicsignature.com'],
    ['www.cosmicsignature.com', 'cosmicsignature.com'],
    ['cosmicsignature.local', 'cosmicsignature.local'],
    ['app.cosmicsignature.local', 'cosmicsignature.local'],
  ])('shares a selection from %s with both site hosts', (hostname, domain) => {
    const cookie = themeCookieString('classic-blue', hostname, true);
    expect(cookie.split('; ')).toEqual(
      expect.arrayContaining([
        `${THEME_COOKIE_NAME}=classic-blue`,
        'Path=/',
        `Domain=${domain}`,
        'SameSite=Lax',
        'Secure',
      ]),
    );
    expect(cookie).toMatch(/Max-Age=[1-9]\d*/);
  });

  it.each([
    'localhost',
    '127.0.0.1',
    'cosmic-preview.vercel.app',
    'notcosmicsignature.com',
    'cosmicsignature.com.example.org',
  ])('keeps preview and unrelated host %s isolated', (hostname) => {
    expect(themeCookieString('ember', hostname, false)).not.toContain('Domain=');
    expect(themeCookieString('ember', hostname, false)).not.toContain('Secure');
  });
});

describe('theme bootstrap before hydration', () => {
  function runBootstrap(cookie: string, stored: string | null) {
    const document = { cookie, documentElement: { dataset: { theme: DEFAULT_SITE_THEME } } };
    const localStorage = { getItem: jest.fn().mockReturnValue(stored) };
    runInNewContext(THEME_INIT_SCRIPT, { document, localStorage });
    return { theme: document.documentElement.dataset.theme, localStorage };
  }

  it('uses the shared cookie over an older preference stored on this host', () => {
    const { theme, localStorage } = runBootstrap(`${THEME_COOKIE_NAME}=aurora`, 'classic-blue');
    expect(theme).toBe('aurora');
    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('uses local storage when the shared cookie is absent or invalid', () => {
    for (const cookie of ['', `${THEME_COOKIE_NAME}=unrecognized`]) {
      const { theme, localStorage } = runBootstrap(cookie, 'classic-blue');
      expect(theme).toBe('classic-blue');
      expect(localStorage.getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    }
  });

  it.each([null, '', 'unknown', '__proto__', '</script><script>alert(1)</script>'])(
    'keeps the default palette when persisted data is invalid: %p',
    (stored) => {
      expect(runBootstrap(`${THEME_COOKIE_NAME}=unrecognized`, stored).theme).toBe(
        DEFAULT_SITE_THEME,
      );
    },
  );

  it('still applies a saved palette when cookies are blocked', () => {
    const document = { documentElement: { dataset: { theme: DEFAULT_SITE_THEME } } };
    Object.defineProperty(document, 'cookie', {
      get() {
        throw new Error('Cookie access denied');
      },
    });
    runInNewContext(THEME_INIT_SCRIPT, {
      document,
      localStorage: { getItem: () => 'nebula' },
    });
    expect(document.documentElement.dataset.theme).toBe('nebula');
  });

  it('leaves the page usable when all preference storage is blocked', () => {
    const document = { documentElement: { dataset: { theme: 'unexpected' } } };
    Object.defineProperty(document, 'cookie', {
      get() {
        throw new Error('Cookie access denied');
      },
    });
    expect(() =>
      runInNewContext(THEME_INIT_SCRIPT, {
        document,
        localStorage: {
          getItem() {
            throw new Error('Storage access denied');
          },
        },
      }),
    ).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe(DEFAULT_SITE_THEME);
  });
});

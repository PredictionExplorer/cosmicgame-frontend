import { LOCALE_COOKIE_NAME, localeCookieString, rememberLocale } from '@/i18n/localeCookie';
import { routing } from '@/i18n/routing';

describe('locale cookie', () => {
  afterEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it('uses the cookie next-intl reads, with the attributes routing declares', () => {
    const maxAge = (routing.localeCookie as { maxAge: number }).maxAge;
    expect(maxAge).toBeGreaterThan(0);
    expect(localeCookieString('vi')).toBe(
      `NEXT_LOCALE=vi; path=/; SameSite=Lax; max-age=${maxAge}`,
    );
  });

  it('writes the choice so the middleware sees it on the next request', () => {
    rememberLocale('ja');
    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=ja`);
    rememberLocale('en');
    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en`);
    expect(document.cookie).not.toContain(`${LOCALE_COOKIE_NAME}=ja`);
  });
});

import { routing, type AppLocale } from './routing';

/**
 * next-intl's cookie name for the remembered language. `routing.localeCookie`
 * only carries the attributes (max-age); the name is the library default that
 * the middleware reads and the e2e suites assert on.
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * The `Set-Cookie`-style string next-intl's client router writes when the
 * user switches language: same name, same attributes (`SameSite=Lax`, the
 * max-age from `routing.localeCookie`, the root path), so a cookie written
 * here is indistinguishable from one written by `useRouter().replace(...,
 * { locale })`.
 */
export function localeCookieString(locale: AppLocale): string {
  const attributes = typeof routing.localeCookie === 'object' ? routing.localeCookie : {};
  const parts = [`${LOCALE_COOKIE_NAME}=${locale}`, 'path=/', 'SameSite=Lax'];
  if (typeof attributes.maxAge === 'number') parts.push(`max-age=${attributes.maxAge}`);
  return parts.join('; ');
}

/**
 * Remembers `locale` as the visitor's language without navigating.
 *
 * The middleware never writes this cookie (see `withoutLocaleCookieWrites` in
 * proxy.ts) and redirects unprefixed URLs to the remembered language, so a
 * link to an English page opened in a new tab would bounce back to the old
 * language unless the choice is recorded before the browser follows it. The
 * language directory calls this for modified and middle clicks; plain clicks
 * go through next-intl's router, which writes the same cookie itself.
 */
export function rememberLocale(locale: AppLocale): void {
  if (typeof document === 'undefined') return;
  document.cookie = localeCookieString(locale);
}

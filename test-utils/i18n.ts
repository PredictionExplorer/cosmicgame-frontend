import { LOCALE_ALIASES, routing } from '@/i18n/routing';
import { localeHref } from '@/lib/hostRouting';

/**
 * The hreflang map `createMetadata` / the sitemaps emit for `path` on `origin`
 * (lib/hreflang.ts): one entry per routing locale, one per alias pointing at
 * its locale's URL, and `x-default` pointing at the default locale. Tests
 * build expectations through this helper instead of literal
 * `{ en, zh, 'x-default' }` objects, so adding a locale never rewrites them.
 * Deliberately re-derived here rather than imported from the implementation.
 */
export function expectedLanguageAlternates(origin: string, path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.flatMap((locale) => {
        const href = localeHref(origin, path, locale);
        return [locale, ...LOCALE_ALIASES[locale]].map((tag) => [tag, href]);
      }),
    ),
    'x-default': localeHref(origin, path, routing.defaultLocale),
  };
}

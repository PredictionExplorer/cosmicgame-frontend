import { routing } from '@/i18n/routing';
import { localeHref } from '@/lib/hostRouting';

/**
 * The hreflang map `createMetadata` / the sitemap emit for `path` on `origin`:
 * one entry per routing locale plus `x-default` pointing at the default
 * locale. Tests build expectations through this helper instead of literal
 * `{ en, zh, 'x-default' }` objects, so adding a locale never rewrites them.
 */
export function expectedLanguageAlternates(origin: string, path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localeHref(origin, path, locale)]),
    ),
    'x-default': localeHref(origin, path, routing.defaultLocale),
  };
}

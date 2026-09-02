import { LOCALE_ALIASES, routing } from '@/i18n/routing';
import { localeHref } from '@/lib/hostRouting';

/**
 * The hreflang alternates for `path` on `origin`, in emission order:
 *
 *   - one entry per routing locale (`en` → unprefixed, `zh-TW` → `/zh-TW/…`),
 *   - one entry per alias in `LOCALE_ALIASES`, pointing at its locale's URL
 *     (`zh-Hant` → `/zh-TW/…`, `zh-MO` → `/zh-HK/…`), so readers whose browser
 *     tag is more specific or differently spelled than our codes still land
 *     on the right variant,
 *   - `x-default` → the default locale.
 *
 * Single source for `createMetadata` (`alternates.languages`), both sitemaps,
 * and the test expectations in test-utils/i18n.ts.
 */
export function languageAlternates(origin: string, path: string): Record<string, string> {
  const normalizedPath = path || '/';
  const entries: Array<[string, string]> = [];
  for (const locale of routing.locales) {
    const href = localeHref(origin, normalizedPath, locale);
    entries.push([locale, href]);
    for (const alias of LOCALE_ALIASES[locale]) entries.push([alias, href]);
  }
  entries.push(['x-default', localeHref(origin, normalizedPath, routing.defaultLocale)]);
  return Object.fromEntries(entries);
}

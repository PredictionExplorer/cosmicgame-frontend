import type { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing } from '@/i18n/routing';
import { BRAND_ICON_COLORS, BRAND_ICON_PATHS } from '@/lib/og/brandIcons';
import { SITE_NAME, SITE_SHORT_NAME } from '@/utils/seo';

/**
 * The web app manifest of the app host, one per locale.
 *
 * Only the dApp installs: the app layout links its locale's manifest and the
 * marketing host links none, so installing from cosmicsignature.com never
 * turns the landing page into a chromeless "app". Every locale shares the
 * `id`, so switching language never installs a second copy.
 */

/** URL the app layout links for `locale`; the physical `[locale]` path, as og:image uses. */
export function webManifestPath(locale: string): string {
  return `/${locale}/manifest.webmanifest`;
}

/** Where the installed app opens: the locale's app home. */
function startUrl(locale: string): string {
  return locale === routing.defaultLocale ? '/' : `/${locale}`;
}

export async function buildWebManifest(locale: string): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const config = getLocaleConfig(locale);
  return {
    id: '/',
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: t('shared.defaultDescription'),
    lang: config.jsonLdInLanguage,
    dir: config.textDirection,
    start_url: startUrl(locale),
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: BRAND_ICON_COLORS.plate,
    theme_color: BRAND_ICON_COLORS.plate,
    icons: [
      { src: BRAND_ICON_PATHS.icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: BRAND_ICON_PATHS.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: BRAND_ICON_PATHS.maskable512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: BRAND_ICON_PATHS.faviconSvg, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    categories: ['art'],
  };
}

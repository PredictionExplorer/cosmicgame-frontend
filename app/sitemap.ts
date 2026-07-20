import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import {
  APP_ORIGIN,
  LANDING_ORIGIN,
  isAppHost,
  localeHref,
  normalizeHost,
} from '@/lib/hostRouting';
import {
  appSitemapRoutes,
  landingSitemapRoutes,
  routeLanguageAlternates,
  type SeoRoute,
} from '@/lib/seoRoutes';

const LANDING_URL = LANDING_ORIGIN;
const APP_URL = APP_ORIGIN;

function renderSitemap(baseUrl: string, routes: SeoRoute[]): MetadataRoute.Sitemap {
  return routes.flatMap(({ path, priority, changeFrequency, lastModified }) =>
    routing.locales.map((locale) => ({
      url: localeHref(baseUrl, path || '/', locale),
      lastModified: new Date(lastModified),
      alternates: {
        languages: routeLanguageAlternates(baseUrl, path),
      },
      ...(changeFrequency ? { changeFrequency } : {}),
      ...(priority !== undefined ? { priority } : {}),
    })),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = normalizeHost(h.get('x-forwarded-host') ?? h.get('host'));

  if (isAppHost(host)) {
    return renderSitemap(APP_URL, appSitemapRoutes);
  }
  return renderSitemap(LANDING_URL, landingSitemapRoutes);
}

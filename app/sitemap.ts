import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

import { APP_ORIGIN, LANDING_ORIGIN, isAppHost, normalizeHost } from '@/lib/hostRouting';
import { appSitemapRoutes, landingSitemapRoutes, routeUrl, type SeoRoute } from '@/lib/seoRoutes';

const LANDING_URL = LANDING_ORIGIN;
const APP_URL = APP_ORIGIN;

function renderSitemap(baseUrl: string, routes: SeoRoute[]): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, changeFrequency, lastModified }) => ({
    url: routeUrl(baseUrl, path),
    lastModified: new Date(lastModified),
    ...(changeFrequency ? { changeFrequency } : {}),
    ...(priority !== undefined ? { priority } : {}),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = normalizeHost(h.get('x-forwarded-host') ?? h.get('host'));

  if (isAppHost(host)) {
    return renderSitemap(APP_URL, appSitemapRoutes);
  }
  return renderSitemap(LANDING_URL, landingSitemapRoutes);
}

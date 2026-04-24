import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

import { isAppHost, normalizeHost } from '@/lib/hostRouting';

const LANDING_URL = 'https://www.cosmicsignature.com';
const APP_URL = 'https://app.cosmicsignature.com';

type Freq = MetadataRoute.Sitemap[number]['changeFrequency'];

interface SitemapEntry {
  path: string;
  priority: number;
  changeFrequency: Freq;
}

/**
 * Landing sitemap: only the root and legal pages. Deep dApp routes live
 * on app.cosmicsignature.com and are listed in that host's sitemap.
 */
const landingPages: SitemapEntry[] = [{ path: '', priority: 1.0, changeFrequency: 'weekly' }];

/**
 * App sitemap: every dApp route. Includes both legacy paths and their
 * new lexicon-safe aliases so search engines can index either form.
 */
const appPages: SitemapEntry[] = [
  { path: '', priority: 1.0, changeFrequency: 'hourly' },
  { path: '/current-round', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/current-cycle', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/gallery', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/statistics', priority: 0.8, changeFrequency: 'hourly' },
  { path: '/how-to-play', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/staking', priority: 0.8, changeFrequency: 'daily' },
  { path: '/anchoring', priority: 0.8, changeFrequency: 'daily' },
  { path: '/prize', priority: 0.8, changeFrequency: 'daily' },
  { path: '/allocation', priority: 0.8, changeFrequency: 'daily' },
  { path: '/marketing', priority: 0.7, changeFrequency: 'daily' },
  { path: '/mint', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/mint-artblocks', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contracts', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/code', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/eth-donation', priority: 0.6, changeFrequency: 'daily' },
  { path: '/nft-donations', priority: 0.6, changeFrequency: 'daily' },
  { path: '/winning-history', priority: 0.7, changeFrequency: 'daily' },
  { path: '/recipient-history', priority: 0.7, changeFrequency: 'daily' },
  { path: '/prize-claimed', priority: 0.6, changeFrequency: 'daily' },
  { path: '/allocation-finalized', priority: 0.6, changeFrequency: 'daily' },
  { path: '/named-nfts', priority: 0.6, changeFrequency: 'daily' },
  { path: '/used-rwlk-nfts', priority: 0.5, changeFrequency: 'daily' },
  { path: '/changed-parameters', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/coordination-changes', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/charity-deposits-cg', priority: 0.5, changeFrequency: 'daily' },
  { path: '/charity-deposits-voluntary', priority: 0.5, changeFrequency: 'daily' },
  { path: '/charity-withdrawals', priority: 0.5, changeFrequency: 'daily' },
  { path: '/public-goods-contributions-cg', priority: 0.5, changeFrequency: 'daily' },
  { path: '/public-goods-contributions-voluntary', priority: 0.5, changeFrequency: 'daily' },
  { path: '/public-goods-retrievals', priority: 0.5, changeFrequency: 'daily' },
  { path: '/detail/sample', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/site-map', priority: 0.4, changeFrequency: 'monthly' },
];

function renderSitemap(baseUrl: string, pages: SitemapEntry[]): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = normalizeHost(h.get('x-forwarded-host') ?? h.get('host'));

  if (isAppHost(host)) {
    return renderSitemap(APP_URL, appPages);
  }
  return renderSitemap(LANDING_URL, landingPages);
}

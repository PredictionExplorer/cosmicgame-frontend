import type { MetadataRoute } from 'next';

import { learnArticles } from '@/content/learn';

export type SeoHost = 'app' | 'landing';
export type SeoRouteKind = 'content' | 'data' | 'tool' | 'personal' | 'admin' | 'dynamic';

type SitemapFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

export interface SeoRoute {
  path: string;
  host: SeoHost;
  kind: SeoRouteKind;
  index: boolean;
  includeInSitemap: boolean;
  hasServerVisibleContent: boolean;
  lastModified: string;
  changeFrequency?: SitemapFrequency;
  priority?: number;
}

const CONTENT_LAST_MODIFIED = '2026-05-31';
const DYNAMIC_LAST_MODIFIED = '2026-05-31';

const landingStaticRoutes: SeoRoute[] = [
  {
    path: '',
    host: 'landing',
    kind: 'content',
    index: true,
    includeInSitemap: true,
    hasServerVisibleContent: true,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/about',
    host: 'landing',
    kind: 'content',
    index: true,
    includeInSitemap: true,
    hasServerVisibleContent: true,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/learn',
    host: 'landing',
    kind: 'content',
    index: true,
    includeInSitemap: true,
    hasServerVisibleContent: true,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.8,
  },
];

const learnRoutes: SeoRoute[] = learnArticles.map((article) => ({
  path: `/learn/${article.slug}`,
  host: 'landing',
  kind: 'content',
  index: true,
  includeInSitemap: true,
  hasServerVisibleContent: true,
  lastModified: article.updated,
  changeFrequency: 'monthly',
  priority: 0.7,
}));

const appIndexableRoutes: SeoRoute[] = [
  ['', 'data', 'hourly', 1],
  ['/current-cycle', 'data', 'hourly', 0.9],
  ['/gallery', 'data', 'hourly', 0.9],
  ['/statistics', 'data', 'hourly', 0.8],
  ['/how-it-works', 'content', 'weekly', 0.9],
  ['/faq', 'content', 'weekly', 0.9],
  ['/anchoring', 'data', 'daily', 0.8],
  ['/allocation', 'data', 'daily', 0.8],
  ['/marketing', 'data', 'daily', 0.7],
  ['/imprint', 'tool', 'monthly', 0.5],
  ['/contracts', 'content', 'monthly', 0.7],
  ['/code', 'content', 'monthly', 0.5],
  ['/security', 'content', 'monthly', 0.6],
  ['/audits', 'content', 'monthly', 0.6],
  ['/risk-disclosures', 'content', 'monthly', 0.6],
  ['/terms', 'content', 'monthly', 0.5],
  ['/privacy', 'content', 'monthly', 0.5],
  ['/eth-contribution', 'data', 'daily', 0.6],
  ['/attached-nfts', 'data', 'daily', 0.6],
  ['/allocation-finalized', 'data', 'daily', 0.6],
  ['/named-nfts', 'data', 'daily', 0.6],
  ['/used-rwlk-nfts', 'data', 'daily', 0.5],
  ['/coordination-changes', 'data', 'monthly', 0.4],
  ['/public-goods-contributions-cg', 'data', 'daily', 0.5],
  ['/public-goods-contributions-voluntary', 'data', 'daily', 0.5],
  ['/public-goods-retrievals', 'data', 'daily', 0.5],
  ['/site-map', 'content', 'monthly', 0.4],
].map(
  ([path, kind, changeFrequency, priority]): SeoRoute => ({
    path: String(path),
    host: 'app',
    kind: kind as SeoRouteKind,
    index: true,
    includeInSitemap: true,
    hasServerVisibleContent: true,
    lastModified: kind === 'data' ? DYNAMIC_LAST_MODIFIED : CONTENT_LAST_MODIFIED,
    changeFrequency: changeFrequency as SitemapFrequency,
    priority: Number(priority),
  }),
);

export const noindexAppRoutes: SeoRoute[] = [
  '/admin',
  '/admin/admin',
  '/my-tokens',
  '/my-anchors',
  '/my-allocations',
  '/my-statistics',
  '/recipient-history',
  '/detail/sample',
].map((path) => ({
  path,
  host: 'app',
  kind: path.startsWith('/admin') ? 'admin' : 'personal',
  index: false,
  includeInSitemap: false,
  hasServerVisibleContent: true,
  lastModified: CONTENT_LAST_MODIFIED,
}));

export const dynamicNoindexRoutePrefixes = [
  '/anchor-action/',
  '/cosmic-signature-transfer/',
  '/cosmic-token-transfer/',
  '/distributions-by-token/',
  '/eth-contribution/detail/',
  '/eth-contribution/round/',
  '/gesture/',
  '/marketing/',
  '/system-event/',
  '/user/',
] as const;

export const landingSeoRoutes: SeoRoute[] = [...landingStaticRoutes, ...learnRoutes];
export const appSeoRoutes: SeoRoute[] = [...appIndexableRoutes, ...noindexAppRoutes];
export const seoRoutes: SeoRoute[] = [...landingSeoRoutes, ...appSeoRoutes];

export const landingSitemapRoutes = landingSeoRoutes.filter(
  (route) => route.index && route.includeInSitemap,
);
export const appSitemapRoutes = appSeoRoutes.filter(
  (route) => route.index && route.includeInSitemap,
);

export function routeUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`;
}

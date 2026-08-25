import { routing } from '@/i18n/routing';

const IS_DEV = process.env.NODE_ENV === 'development';

const BASE_LANDING_HOSTS = ['cosmicsignature.com', 'www.cosmicsignature.com'];
const BASE_APP_HOSTS = ['app.cosmicsignature.com'];
const LEGACY_WWW_LANDING_HOST = 'www.cosmicsignature.com';

/**
 * Dev-only hosts for local browser testing via /etc/hosts entries.
 *
 * IMPORTANT: `localhost` and `127.0.0.1` are NOT in either set. This
 * preserves the existing behavior of `next dev` on localhost serving the
 * dApp by default, which every existing E2E test assumes. To test the
 * landing locally, either:
 *   - Add `127.0.0.1 cosmicsignature.local app.cosmicsignature.local` to
 *     /etc/hosts and visit http://cosmicsignature.local:3000
 *   - Or force the Host header:
 *     `curl -H "Host: cosmicsignature.com" http://localhost:3000/`
 */
const DEV_LANDING_HOSTS = ['cosmicsignature.local'];
const DEV_APP_HOSTS = ['app.cosmicsignature.local'];

const LANDING_HOSTS = new Set<string>(
  IS_DEV ? [...BASE_LANDING_HOSTS, ...DEV_LANDING_HOSTS] : BASE_LANDING_HOSTS,
);

const APP_HOSTS = new Set<string>(IS_DEV ? [...BASE_APP_HOSTS, ...DEV_APP_HOSTS] : BASE_APP_HOSTS);

export const APP_ORIGIN = IS_DEV
  ? 'http://app.cosmicsignature.local:3000'
  : 'https://app.cosmicsignature.com';

export const LANDING_ORIGIN = IS_DEV
  ? 'http://cosmicsignature.local:3000'
  : 'https://cosmicsignature.com';

export function normalizeHost(host: string | null | undefined): string {
  if (!host) {
    return '';
  }

  return (host.split(':')[0] ?? host).trim().toLowerCase();
}

export function isLandingHost(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);
  return LANDING_HOSTS.has(normalized);
}

export function isLegacyWwwLandingHost(host: string | null | undefined): boolean {
  return normalizeHost(host) === LEGACY_WWW_LANDING_HOST;
}

export function isAppHost(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);
  return APP_HOSTS.has(normalized);
}

/**
 * Paths that should live exclusively on the app subdomain. Requests to these
 * paths on the landing host are redirected (308) to app.cosmicsignature.com.
 *
 * Cosmic-lexicon-only: there are no legacy aliases. See
 * marketing/cosmic-lexicon.md for the vocabulary spec.
 */
export const APP_ONLY_PATH_PREFIXES: readonly string[] = [
  '/admin',
  '/allocation',
  '/allocation-finalized',
  '/anchor-action',
  '/anchoring',
  '/api',
  '/code',
  '/contracts',
  '/coordination-changes',
  '/current-cycle',
  '/detail',
  '/distributions-by-token',
  '/eth-contribution',
  '/faq',
  '/gallery',
  '/gesture',
  '/how-it-works',
  '/marketing',
  '/imprint',
  '/internal',
  '/attached-nfts',
  '/my-allocations',
  '/my-anchors',
  '/my-statistics',
  '/my-tokens',
  '/named-nfts',
  '/public-goods-contributions-cg',
  '/public-goods-contributions-voluntary',
  '/public-goods-retrievals',
  '/recipient-history',
  '/privacy',
  '/risk-disclosures',
  '/audits',
  '/security',
  '/site-map',
  '/source-code',
  '/statistics',
  '/system-event',
  '/terms',
  '/transfer-cst',
  '/used-rwlk-nfts',
  '/user',
];

export const LANDING_ONLY_PATH_PREFIXES: readonly string[] = ['/about', '/learn', '/white-paper'];

export function isAppOnlyPath(pathname: string): boolean {
  if (!pathname || pathname === '/') return false;
  return APP_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isLandingOnlyPath(pathname: string): boolean {
  if (!pathname || pathname === '/') return false;
  return LANDING_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Splits a configured locale prefix off a public pathname.
 * `/zh/gallery` -> `{ locale: 'zh', publicPath: '/gallery' }`;
 * `/gallery` -> `{ locale: undefined, publicPath: '/gallery' }`.
 * Host-routing checks must always run against `publicPath`.
 */
export function splitLocalePrefix(pathname: string): {
  locale?: (typeof routing.locales)[number];
  publicPath: string;
} {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return { locale, publicPath: '/' };
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, publicPath: pathname.slice(locale.length + 1) };
    }
  }
  return { publicPath: pathname || '/' };
}

/**
 * Builds a cross-host absolute URL that carries the locale prefix, e.g.
 * `localeHref(APP_ORIGIN, '/anchoring', 'zh')` -> `https://app…/zh/anchoring`.
 * Locale-aware in-host navigation should use `Link` from `@/i18n/navigation`
 * instead; this helper exists for absolute URLs that cross hosts.
 */
export function localeHref(origin: string, path: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const suffix = normalizedPath === '/' ? '' : normalizedPath;
  return `${origin}${prefix}${suffix}` || origin;
}

/**
 * Adds the active locale to absolute links between Cosmic Signature's two
 * hosts. Third-party and relative URLs pass through unchanged.
 */
export function localizeCrossHostHref(href: string, locale: string): string {
  const origin = [APP_ORIGIN, LANDING_ORIGIN].find(
    (candidate) => href === candidate || href.startsWith(`${candidate}/`),
  );
  if (!origin) return href;

  const url = new URL(href);
  const { publicPath } = splitLocalePrefix(url.pathname);
  return `${localeHref(origin, publicPath, locale)}${url.search}${url.hash}`;
}

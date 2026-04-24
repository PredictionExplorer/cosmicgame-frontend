const IS_DEV = process.env.NODE_ENV === 'development';

const BASE_LANDING_HOSTS = ['cosmicsignature.com', 'www.cosmicsignature.com'];
const BASE_APP_HOSTS = ['app.cosmicsignature.com'];

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
  : 'https://www.cosmicsignature.com';

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

export function isAppHost(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);
  return APP_HOSTS.has(normalized);
}

/**
 * Paths that should live exclusively on the app subdomain. Requests to these
 * paths on the landing host are redirected (308) to app.cosmicsignature.com.
 * Covers all existing dApp route groups plus a few legacy aliases.
 */
export const APP_ONLY_PATH_PREFIXES: readonly string[] = [
  '/admin',
  '/api',
  '/bid',
  '/gesture',
  '/gallery',
  '/detail',
  '/user',
  '/my-tokens',
  '/my-winnings',
  '/my-allocations',
  '/my-statistics',
  '/my-staking',
  '/my-anchors',
  '/staking',
  '/staking-action',
  '/anchoring',
  '/anchor-action',
  '/prize',
  '/prize-claimed',
  '/allocation',
  '/allocation-finalized',
  '/rewards-by-token',
  '/winning-history',
  '/recipient-history',
  '/charity-deposits-cg',
  '/charity-deposits-voluntary',
  '/charity-withdrawals',
  '/public-goods-contributions-cg',
  '/public-goods-contributions-voluntary',
  '/public-goods-retrievals',
  '/current-round',
  '/current-cycle',
  '/changed-parameters',
  '/coordination-changes',
  '/system-event',
  '/statistics',
  '/named-nfts',
  '/nft-donations',
  '/used-rwlk-nfts',
  '/marketing',
  '/how-to-play',
  '/faq',
  '/contracts',
  '/site-map',
  '/code',
];

export function isAppOnlyPath(pathname: string): boolean {
  if (!pathname || pathname === '/') return false;
  return APP_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

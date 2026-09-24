import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { routing } from '@/i18n/routing';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { appSitemapRoutes, landingSitemapRoutes } from '@/lib/seoRoutes';

import {
  ACCOUNT_ROUTE_IDS,
  APP_HEADER_NAV,
  FOOTER_SECTIONS,
  LEGAL_ROUTE_IDS,
  NOT_FOUND_ROUTE_IDS,
  OUTBOUND_LINKS,
  SITE_ROUTES,
  SITE_ROUTE_GROUPS,
  SITE_SECTION_IDS,
  STATISTICS_SECTION_ROUTE_IDS,
  appHeaderRouteIds,
  classifyHref,
  footerRoutes,
  getSiteRoute,
  headerItemForSection,
  locateSitePath,
  resolveRouteHref,
  routesInSection,
  siteHostLabel,
} from '../siteNav';
import {
  OUTBOUND_ICONS,
  SITE_ROUTE_GROUP_ICONS,
  SITE_ROUTE_ICONS,
  SITE_SECTION_ICONS,
} from '../siteNavIcons';

const ROOT = join(__dirname, '..', '..');

type Catalog = Record<string, unknown>;

function navCatalog(locale: string): Catalog {
  return JSON.parse(readFileSync(join(ROOT, 'messages', locale, 'nav.json'), 'utf8')) as Catalog;
}

function lookup(catalog: Catalog, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) => (value && typeof value === 'object' ? (value as Catalog)[key] : undefined),
      catalog,
    );
}

function pageFile(host: 'app' | 'landing', path: string): string {
  const group = host === 'app' ? '(app)' : '(landing)';
  const segment = host === 'landing' && path === '/' ? '/landing-site' : path;
  return join(ROOT, 'app', '[locale]', group, segment, 'page.tsx');
}

describe('site navigation taxonomy', () => {
  it('gives every destination a unique path per host and a page that exists', () => {
    const seen = new Set<string>();
    for (const route of SITE_ROUTES) {
      const key = `${route.host}:${route.path}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      expect(existsSync(pageFile(route.host, route.path))).toBe(true);
    }
  });

  it('lists every public sitemap route of both hosts', () => {
    const appPaths = new Set(SITE_ROUTES.filter((r) => r.host === 'app').map((r) => r.path));
    for (const { path } of appSitemapRoutes) {
      expect(appPaths).toContain(path === '' ? '/' : path);
    }
    const landingPaths = new Set(
      SITE_ROUTES.filter((r) => r.host === 'landing').map((r) => r.path),
    );
    for (const { path } of landingSitemapRoutes) {
      const normalized = path === '' ? '/' : path;
      // Articles and quiz tiers live under their hub.
      const hub = normalized.split('/').slice(0, 2).join('/') || '/';
      expect(landingPaths.has(normalized) || landingPaths.has(hub)).toBe(true);
    }
  });

  it('names every destination, group and outbound link in every locale', () => {
    for (const locale of routing.locales) {
      const catalog = navCatalog(locale);
      for (const route of SITE_ROUTES) {
        expect(lookup(catalog, `routes.${route.id}.label`)).toEqual(expect.any(String));
        expect(lookup(catalog, `routes.${route.id}.description`)).toEqual(expect.any(String));
      }
      // Compact names: the statistics tabs and the route-group switchers.
      for (const id of [
        ...STATISTICS_SECTION_ROUTE_IDS,
        ...Object.values(SITE_ROUTE_GROUPS).flat(),
      ]) {
        expect(lookup(catalog, `routes.${id}.short`)).toEqual(expect.any(String));
      }
      for (const id of Object.keys(SITE_ROUTE_GROUPS)) {
        expect(lookup(catalog, `groups.${id}.label`)).toEqual(expect.any(String));
      }
      for (const link of OUTBOUND_LINKS) {
        expect(lookup(catalog, `outbound.${link.id}.label`)).toEqual(expect.any(String));
      }
      for (const section of [...SITE_SECTION_IDS, 'ecosystem', 'community']) {
        expect(lookup(catalog, `sections.${section}`)).toEqual(expect.any(String));
      }
    }
  });

  it('draws an icon for every destination, group, section and outbound link', () => {
    for (const route of SITE_ROUTES) expect(SITE_ROUTE_ICONS[route.id]).toBeDefined();
    for (const id of Object.keys(SITE_ROUTE_GROUPS) as (keyof typeof SITE_ROUTE_GROUPS)[]) {
      expect(SITE_ROUTE_GROUP_ICONS[id]).toBeDefined();
    }
    for (const section of SITE_SECTION_IDS) expect(SITE_SECTION_ICONS[section]).toBeDefined();
    for (const link of OUTBOUND_LINKS) expect(OUTBOUND_ICONS[link.id]).toBeDefined();
  });

  it('keeps parents inside their own section', () => {
    for (const route of SITE_ROUTES) {
      if (route.parent) expect(getSiteRoute(route.parent).section).toBe(route.section);
    }
    expect(getSiteRoute('currentCycle').parent).toBe('observatory');
  });

  it('only sends outbound links to third-party https hosts', () => {
    for (const link of OUTBOUND_LINKS) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(classifyHref(link.href, 'app')).toBe('external');
    }
  });
});

describe('locateSitePath', () => {
  it.each([
    ['/', 'observatory', true, 'participate'],
    ['/current-cycle', 'currentCycle', true, 'participate'],
    ['/gallery', 'gallery', true, 'collection'],
    ['/detail/25', 'gallery', false, 'collection'],
    ['/statistics/tokens', 'statisticsTokens', true, 'explore'],
    ['/allocation', 'allocationRecipients', true, 'records'],
    ['/allocation/3', 'allocationRecipients', false, 'records'],
    ['/allocation-finalized', 'retrievedAllocations', true, 'records'],
    ['/anchor-action/1/2', 'anchorDistributions', false, 'records'],
    ['/marketing/0xabc', 'outreachAllocations', false, 'records'],
    ['/source-code', 'sourceCode', false, 'trust'],
    ['/my-tokens', 'myNfts', true, 'account'],
    ['/gallery/', 'gallery', true, 'collection'],
  ])('%s is %s (exact %s) in %s', (path, id, exact, section) => {
    const location = locateSitePath(path);
    expect(location.route?.id).toBe(id);
    expect(location.exact).toBe(exact);
    expect(location.section).toBe(section);
  });

  it('places participant, gesture and transfer pages in Explore without a route', () => {
    for (const path of ['/user/0x1', '/gesture/1135', '/cosmic-token-transfer/0x1']) {
      expect(locateSitePath(path)).toEqual({ route: null, exact: false, section: 'explore' });
    }
  });

  it('knows nothing of unknown paths', () => {
    expect(locateSitePath('/nope')).toEqual({ route: null, exact: false, section: null });
  });

  it('matches landing paths against the landing host only', () => {
    expect(locateSitePath('/learn/what-is-cosmic-signature', 'landing').route?.id).toBe('learnHub');
    expect(locateSitePath('/', 'landing').route?.id).toBe('projectSite');
    expect(locateSitePath('/about', 'app').route).toBeNull();
  });
});

describe('link resolution', () => {
  it('keeps same-host links locale-free for the router', () => {
    expect(resolveRouteHref(getSiteRoute('faq'), 'app', 'zh')).toEqual({
      href: '/faq',
      kind: 'internal',
    });
  });

  it('localizes cross-host links and names the host', () => {
    expect(resolveRouteHref(getSiteRoute('whitePaper'), 'app', 'ja')).toEqual({
      href: localeHref(LANDING_ORIGIN, '/white-paper', 'ja'),
      kind: 'crossHost',
      hostLabel: siteHostLabel('landing'),
    });
    expect(resolveRouteHref(getSiteRoute('faq'), 'landing', 'en').href).toBe(
      localeHref(APP_ORIGIN, '/faq', 'en'),
    );
  });

  it('classifies hrefs by host', () => {
    expect(classifyHref('/gallery', 'app')).toBe('internal');
    expect(classifyHref('#faq', 'landing')).toBe('internal');
    expect(classifyHref(`${APP_ORIGIN}/faq`, 'landing')).toBe('crossHost');
    expect(classifyHref(`${APP_ORIGIN}/faq`, 'app')).toBe('internal');
    expect(classifyHref(LANDING_ORIGIN, 'app')).toBe('crossHost');
    expect(classifyHref('https://example.com', 'app')).toBe('external');
  });
});

describe('surfaces', () => {
  it('gives every section but the account exactly one header item', () => {
    for (const section of SITE_SECTION_IDS) {
      const items = APP_HEADER_NAV.filter((item) => item.sections.includes(section));
      expect(items).toHaveLength(section === 'account' ? 0 : 1);
    }
    expect(headerItemForSection('records')).toMatchObject({ kind: 'panel', id: 'explore' });
    expect(headerItemForSection(null)).toBeNull();
  });

  it('opens the header with the Observatory', () => {
    expect(APP_HEADER_NAV[0]).toMatchObject({ kind: 'link', route: 'observatory' });
  });

  it('links Security, Risk Disclosures and Public Goods from the header', () => {
    expect(appHeaderRouteIds()).toEqual(
      expect.arrayContaining([
        'security',
        'riskDisclosures',
        'publicGoodsProtocol',
        'publicGoodsVoluntary',
        'publicGoodsRetrievals',
      ]),
    );
  });

  it('builds footer columns from the taxonomy, with the legal links underneath', () => {
    for (const section of FOOTER_SECTIONS) {
      expect(footerRoutes(section).length).toBeGreaterThan(0);
      expect(footerRoutes(section).every((route) => route.section === section)).toBe(true);
    }
    expect(FOOTER_SECTIONS).not.toContain('account');
    expect(LEGAL_ROUTE_IDS).toEqual(['terms', 'privacy', 'riskDisclosures']);
  });

  it('lists the account pages in taxonomy order', () => {
    expect(ACCOUNT_ROUTE_IDS).toEqual(routesInSection('account').map((route) => route.id));
    expect(ACCOUNT_ROUTE_IDS).toContain('transferCst');
  });

  it('suggests real destinations on the 404 page', () => {
    for (const id of NOT_FOUND_ROUTE_IDS) expect(getSiteRoute(id)).toBeDefined();
  });
});

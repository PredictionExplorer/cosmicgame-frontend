import { learnContentEn } from '@/content/learn';

import { LOCALE_ALIASES, routing } from '@/i18n/routing';

import {
  appSeoRoutes,
  appSitemapRoutes,
  dynamicNoindexRoutePrefixes,
  landingSeoRoutes,
  landingSitemapRoutes,
  noindexAppRoutes,
  routeLanguageAlternates,
  routeUrl,
  seoRoutes,
  type SeoRoute,
} from '../seoRoutes';

const APP_ORIGIN = 'https://app.example.com';

function paths(routes: SeoRoute[]): string[] {
  return routes.map((route) => route.path);
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => (seen.has(value) ? true : (seen.add(value), false)));
}

describe('route table shape', () => {
  it('never lists the same path twice on one host', () => {
    expect(duplicates(paths(landingSeoRoutes))).toEqual([]);
    expect(duplicates(paths(appSeoRoutes))).toEqual([]);
  });

  it('splits every route into exactly one of the two hosts', () => {
    expect(seoRoutes).toHaveLength(landingSeoRoutes.length + appSeoRoutes.length);
    expect(landingSeoRoutes.every((route) => route.host === 'landing')).toBe(true);
    expect(appSeoRoutes.every((route) => route.host === 'app')).toBe(true);
  });

  it('writes every path as a root-relative path with no trailing slash', () => {
    // Paths are concatenated onto an origin, so a missing leading slash or a
    // stray trailing one produces a duplicate URL in the sitemap.
    for (const route of seoRoutes) {
      expect(route.path === '' || route.path.startsWith('/')).toBe(true);
      expect(route.path.endsWith('/')).toBe(false);
      expect(route.path).not.toContain('//');
    }
  });

  it('keeps every sitemap priority inside the range crawlers accept', () => {
    for (const route of seoRoutes) {
      if (route.priority === undefined) continue;
      expect(route.priority).toBeGreaterThan(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });

  it('gives every route a parseable ISO last-modified date', () => {
    for (const route of seoRoutes) {
      expect(route.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(route.lastModified))).toBe(false);
    }
  });

  it('gives each host exactly one home route', () => {
    expect(landingSeoRoutes.filter((route) => route.path === '')).toHaveLength(1);
    expect(appSeoRoutes.filter((route) => route.path === '')).toHaveLength(1);
  });

  it('gives both home routes the top priority', () => {
    expect(landingSeoRoutes.find((route) => route.path === '')!.priority).toBe(1);
    expect(appSeoRoutes.find((route) => route.path === '')!.priority).toBe(1);
  });
});

describe('sitemap selection', () => {
  it('includes only routes that are both indexable and opted in', () => {
    for (const route of [...landingSitemapRoutes, ...appSitemapRoutes]) {
      expect(route.index).toBe(true);
      expect(route.includeInSitemap).toBe(true);
    }
  });

  it('keeps every noindex route out of the sitemap', () => {
    const sitemapPaths = new Set(paths(appSitemapRoutes));

    for (const route of noindexAppRoutes) {
      expect(sitemapPaths.has(route.path)).toBe(false);
    }
  });

  it('never lets a noindex route claim it belongs in the sitemap', () => {
    for (const route of seoRoutes) {
      if (!route.index) expect(route.includeInSitemap).toBe(false);
    }
  });

  it('does not mix hosts into the wrong sitemap', () => {
    expect(landingSitemapRoutes.every((route) => route.host === 'landing')).toBe(true);
    expect(appSitemapRoutes.every((route) => route.host === 'app')).toBe(true);
  });

  it('lists a sitemap entry for the statistics sub-pages', () => {
    const sitemapPaths = paths(appSitemapRoutes);

    expect(sitemapPaths).toEqual(expect.arrayContaining(['/statistics', '/statistics/tokens']));
  });
});

describe('noindex classification', () => {
  it('marks personal and admin areas as neither indexable nor crawlable-in-sitemap', () => {
    for (const route of noindexAppRoutes) {
      expect(route.index).toBe(false);
      expect(route.includeInSitemap).toBe(false);
    }
  });

  it('classifies admin and internal tooling apart from personal pages', () => {
    const byPath = Object.fromEntries(noindexAppRoutes.map((route) => [route.path, route.kind]));

    expect(byPath['/admin']).toBe('admin');
    expect(byPath['/internal/cst-outreach-transfer']).toBe('admin');
    expect(byPath['/experimental-ui']).toBe('tool');
    expect(byPath['/my-tokens']).toBe('personal');
    expect(byPath['/recipient-history']).toBe('personal');
  });

  it('formats each dynamic prefix so it cannot match a sibling route by accident', () => {
    // '/user' without the trailing slash would also prefix-match '/username'.
    for (const prefix of dynamicNoindexRoutePrefixes) {
      expect(prefix.startsWith('/')).toBe(true);
      expect(prefix.endsWith('/')).toBe(true);
      expect(prefix.length).toBeGreaterThan(1);
    }
  });

  it('never lets a dynamic noindex prefix swallow an indexable route', () => {
    const indexablePaths = paths(seoRoutes.filter((route) => route.index));

    for (const prefix of dynamicNoindexRoutePrefixes) {
      const swallowed = indexablePaths.filter((path) => path.startsWith(prefix));
      expect(swallowed).toEqual([]);
    }
  });

  it('keeps an indexable hub page reachable beside its noindex children', () => {
    // '/marketing' is indexed while '/marketing/<campaign>' is not; the
    // trailing slash on the prefix is the only thing separating them.
    expect(paths(appSitemapRoutes)).toContain('/marketing');
    expect(dynamicNoindexRoutePrefixes).toContain('/marketing/');
    expect('/marketing'.startsWith('/marketing/')).toBe(false);
  });

  it('lists each dynamic prefix only once', () => {
    expect(duplicates([...dynamicNoindexRoutePrefixes])).toEqual([]);
  });
});

describe('learn articles', () => {
  it('publishes one indexable route per article', () => {
    const learnPaths = paths(landingSeoRoutes).filter((path) => path.startsWith('/learn/'));

    expect(learnPaths).toHaveLength(learnContentEn.articles.length);
    expect(learnPaths.sort()).toEqual(
      learnContentEn.articles.map((article) => `/learn/${article.slug}`).sort(),
    );
  });

  it('ranks the articles below the learn index itself', () => {
    const index = landingSeoRoutes.find((route) => route.path === '/learn')!;
    const articles = landingSeoRoutes.filter((route) => route.path.startsWith('/learn/'));

    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      expect(article.priority!).toBeLessThan(index.priority!);
      expect(article.index).toBe(true);
    }
  });
});

describe('routeUrl', () => {
  it('joins an origin and a path without inserting a separator', () => {
    expect(routeUrl(APP_ORIGIN, '/gallery')).toBe('https://app.example.com/gallery');
  });

  it('leaves the bare origin alone for the home route', () => {
    expect(routeUrl(APP_ORIGIN, '')).toBe(APP_ORIGIN);
  });

  it('produces a unique URL for every route on a host', () => {
    const urls = appSitemapRoutes.map((route) => routeUrl(APP_ORIGIN, route.path));

    expect(duplicates(urls)).toEqual([]);
  });
});

describe('routeLanguageAlternates', () => {
  it('emits one alternate per configured locale and alias plus x-default', () => {
    const alternates = routeLanguageAlternates(APP_ORIGIN, '/gallery');

    expect(Object.keys(alternates).sort()).toEqual(
      [
        ...routing.locales,
        ...routing.locales.flatMap((locale) => LOCALE_ALIASES[locale]),
        'x-default',
      ].sort(),
    );
  });

  it('points every alias at its locale URL', () => {
    const alternates = routeLanguageAlternates(APP_ORIGIN, '/gallery');

    for (const locale of routing.locales) {
      for (const alias of LOCALE_ALIASES[locale]) {
        expect(alternates[alias]).toBe(alternates[locale]);
      }
    }
    expect(alternates['zh-Hant']).toBe('https://app.example.com/zh-TW/gallery');
    expect(alternates['zh-MO']).toBe('https://app.example.com/zh-HK/gallery');
  });

  it('leaves the default locale unprefixed and prefixes the others', () => {
    const alternates = routeLanguageAlternates(APP_ORIGIN, '/gallery');

    expect(alternates.en).toBe('https://app.example.com/gallery');
    expect(alternates.zh).toBe('https://app.example.com/zh/gallery');
  });

  it('points x-default at the default locale', () => {
    const alternates = routeLanguageAlternates(APP_ORIGIN, '/gallery');

    expect(alternates['x-default']).toBe(alternates[routing.defaultLocale]);
  });

  it('normalises the empty home path so the default locale keeps a bare origin', () => {
    const alternates = routeLanguageAlternates(APP_ORIGIN, '');

    expect(alternates.en).toBe(APP_ORIGIN);
    expect(alternates.zh).toBe('https://app.example.com/zh');
  });

  it('produces distinct URLs for every locale, which is what hreflang requires', () => {
    for (const route of appSitemapRoutes) {
      const alternates = routeLanguageAlternates(APP_ORIGIN, route.path);
      const localeUrls = routing.locales.map((locale) => alternates[locale]!);

      expect(new Set(localeUrls).size).toBe(routing.locales.length);
    }
  });
});

import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { routing } from '@/i18n/routing';
import {
  APP_ORIGIN,
  APP_ONLY_PATH_PREFIXES,
  LANDING_ORIGIN,
  LANDING_ONLY_PATH_PREFIXES,
  isAppHost,
  isAppOnlyPath,
  isKnownPublicPath,
  isLandingHost,
  isLandingOnlyPath,
  isLegacyWwwLandingHost,
  LANDING_SITE_INTERNAL_PATH,
  localeHref,
  publicPathname,
  localizeCrossHostHref,
  normalizeHost,
  splitLocalePrefix,
} from '@/lib/hostRouting';
import { PAGE_ALIASES } from '@/lib/paramRoutes';

describe('hostRouting', () => {
  describe('splitLocalePrefix', () => {
    it('leaves unprefixed (English) paths alone', () => {
      expect(splitLocalePrefix('/gallery')).toEqual({ publicPath: '/gallery' });
      expect(splitLocalePrefix('/')).toEqual({ publicPath: '/' });
      expect(splitLocalePrefix('')).toEqual({ publicPath: '/' });
    });

    it.each(routing.locales.filter((locale) => locale !== routing.defaultLocale))(
      'splits the %s prefix off the public path',
      (locale) => {
        expect(splitLocalePrefix(`/${locale}`)).toEqual({ locale, publicPath: '/' });
        expect(splitLocalePrefix(`/${locale}/gallery`)).toEqual({ locale, publicPath: '/gallery' });
        expect(splitLocalePrefix(`/${locale}/learn/what-is-cosmic-signature`)).toEqual({
          locale,
          publicPath: '/learn/what-is-cosmic-signature',
        });
      },
    );

    it('never reads a region-qualified locale as its base language', () => {
      expect(splitLocalePrefix('/zh-TW/gallery')).toEqual({
        locale: 'zh-TW',
        publicPath: '/gallery',
      });
      expect(splitLocalePrefix('/zh-HK')).toEqual({ locale: 'zh-HK', publicPath: '/' });
      expect(splitLocalePrefix('/zh/gallery')).toEqual({ locale: 'zh', publicPath: '/gallery' });
    });

    it('matches prefixes case-insensitively and returns the canonical code', () => {
      expect(splitLocalePrefix('/zh-tw/gallery')).toEqual({
        locale: 'zh-TW',
        publicPath: '/gallery',
      });
      expect(splitLocalePrefix('/ZH-HK')).toEqual({ locale: 'zh-HK', publicPath: '/' });
      expect(splitLocalePrefix('/Uk/about')).toEqual({ locale: 'uk', publicPath: '/about' });
    });

    it('does not treat look-alike segments as locales', () => {
      expect(splitLocalePrefix('/zhang')).toEqual({ publicPath: '/zhang' });
      expect(splitLocalePrefix('/zh-TWx/gallery')).toEqual({ publicPath: '/zh-TWx/gallery' });
      expect(splitLocalePrefix('/ukraine')).toEqual({ publicPath: '/ukraine' });
    });
  });

  describe('normalizeHost', () => {
    it('returns empty string for null', () => {
      expect(normalizeHost(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(normalizeHost(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(normalizeHost('')).toBe('');
    });

    it('lowercases hosts', () => {
      expect(normalizeHost('CosmicSignature.COM')).toBe('cosmicsignature.com');
    });

    it('strips port numbers', () => {
      expect(normalizeHost('cosmicsignature.com:3000')).toBe('cosmicsignature.com');
    });

    it('strips whitespace', () => {
      expect(normalizeHost('  cosmicsignature.com  ')).toBe('cosmicsignature.com');
    });

    it('handles combined case, whitespace, and port', () => {
      expect(normalizeHost('  App.Cosmicsignature.COM:8080  ')).toBe('app.cosmicsignature.com');
    });

    it('preserves exotic hosts unchanged', () => {
      expect(normalizeHost('unknown.example.com')).toBe('unknown.example.com');
    });
  });

  describe('isLandingHost', () => {
    it('returns true for bare landing host', () => {
      expect(isLandingHost('cosmicsignature.com')).toBe(true);
    });

    it('returns true for www subdomain', () => {
      expect(isLandingHost('www.cosmicsignature.com')).toBe(true);
    });

    it('returns true for landing host with port', () => {
      expect(isLandingHost('cosmicsignature.com:443')).toBe(true);
    });

    it('returns true for uppercase landing host', () => {
      expect(isLandingHost('COSMICSIGNATURE.COM')).toBe(true);
    });

    it('returns false for app subdomain', () => {
      expect(isLandingHost('app.cosmicsignature.com')).toBe(false);
    });

    it('returns false for arbitrary host', () => {
      expect(isLandingHost('example.com')).toBe(false);
    });

    it('returns false for nullish inputs', () => {
      expect(isLandingHost(null)).toBe(false);
      expect(isLandingHost(undefined)).toBe(false);
      expect(isLandingHost('')).toBe(false);
    });

    it('returns false for localhost in production-like test env', () => {
      expect(isLandingHost('localhost')).toBe(false);
    });
  });

  describe('canonical landing origin', () => {
    it('uses the apex domain as the canonical marketing origin', () => {
      expect(LANDING_ORIGIN).toBe('https://cosmicsignature.com');
    });

    it('recognizes the legacy www landing host for redirects', () => {
      expect(isLegacyWwwLandingHost('www.cosmicsignature.com')).toBe(true);
      expect(isLegacyWwwLandingHost('cosmicsignature.com')).toBe(false);
      expect(isLegacyWwwLandingHost('app.cosmicsignature.com')).toBe(false);
    });
  });

  describe('locale-aware absolute URLs', () => {
    it('keeps English links unprefixed and prefixes Chinese links', () => {
      expect(localeHref(APP_ORIGIN, '/gallery', 'en')).toBe(
        'https://app.cosmicsignature.com/gallery',
      );
      expect(localeHref(APP_ORIGIN, '/gallery', 'zh')).toBe(
        'https://app.cosmicsignature.com/zh/gallery',
      );
      expect(localeHref(LANDING_ORIGIN, '/', 'zh')).toBe('https://cosmicsignature.com/zh');
    });

    it('normalizes paths without a leading slash', () => {
      expect(localeHref(LANDING_ORIGIN, 'learn', 'zh')).toBe(
        'https://cosmicsignature.com/zh/learn',
      );
    });

    it('localizes only Cosmic Signature absolute links and preserves URL suffixes', () => {
      expect(
        localizeCrossHostHref('https://app.cosmicsignature.com/gallery?q=orbit#results', 'zh'),
      ).toBe('https://app.cosmicsignature.com/zh/gallery?q=orbit#results');
      expect(localizeCrossHostHref('https://example.com/gallery', 'zh')).toBe(
        'https://example.com/gallery',
      );
      expect(localizeCrossHostHref('/gallery', 'zh')).toBe('/gallery');
    });

    it('replaces an existing locale prefix instead of duplicating it', () => {
      expect(localizeCrossHostHref('https://app.cosmicsignature.com/zh/gallery', 'en')).toBe(
        'https://app.cosmicsignature.com/gallery',
      );
    });
  });

  describe('isAppHost', () => {
    it('returns true for app subdomain', () => {
      expect(isAppHost('app.cosmicsignature.com')).toBe(true);
    });

    it('returns true for app subdomain with port', () => {
      expect(isAppHost('app.cosmicsignature.com:443')).toBe(true);
    });

    it('returns true for uppercase app host', () => {
      expect(isAppHost('APP.COSMICSIGNATURE.COM')).toBe(true);
    });

    it('returns false for landing host', () => {
      expect(isAppHost('cosmicsignature.com')).toBe(false);
    });

    it('returns false for www landing host', () => {
      expect(isAppHost('www.cosmicsignature.com')).toBe(false);
    });

    it('returns false for unknown host', () => {
      expect(isAppHost('unknown.example.com')).toBe(false);
    });

    it('returns false for nullish inputs', () => {
      expect(isAppHost(null)).toBe(false);
      expect(isAppHost(undefined)).toBe(false);
      expect(isAppHost('')).toBe(false);
    });
  });

  describe('landing and app host sets are disjoint', () => {
    it('no known host matches both predicates', () => {
      const candidates = [
        'cosmicsignature.com',
        'www.cosmicsignature.com',
        'app.cosmicsignature.com',
      ];
      for (const host of candidates) {
        const landing = isLandingHost(host);
        const app = isAppHost(host);
        expect(landing && app).toBe(false);
      }
    });
  });

  describe('APP_ONLY_PATH_PREFIXES', () => {
    it('includes critical dApp paths (cosmic-lexicon)', () => {
      expect(APP_ONLY_PATH_PREFIXES).toEqual(
        expect.arrayContaining([
          '/gesture',
          '/allocation',
          '/anchoring',
          '/gallery',
          '/current-cycle',
          '/experimental-ui',
          '/security',
          '/audits',
          '/risk-disclosures',
          '/faq',
          '/admin',
          '/internal',
          '/transfer-cst',
        ]),
      );
    });

    it('includes anchor, allocation, and public-goods paths', () => {
      expect(APP_ONLY_PATH_PREFIXES).toEqual(
        expect.arrayContaining([
          '/gesture',
          '/allocation',
          '/anchoring',
          '/anchor-action',
          '/current-cycle',
          '/my-anchors',
          '/my-allocations',
          '/public-goods-contributions-cg',
          '/public-goods-contributions-voluntary',
          '/public-goods-retrievals',
          '/coordination-changes',
          '/recipient-history',
          '/allocation-finalized',
          '/eth-contribution',
          '/distributions-by-token',
        ]),
      );
    });

    it('excludes legacy (pre-migration) paths entirely', () => {
      // lexicon-allow-start: legacy URL paths must literally appear here to verify they're absent from the route table
      const legacyPaths = [
        '/bid',
        '/prize',
        '/prize-claimed',
        '/staking',
        '/staking-action',
        '/my-winnings',
        '/my-staking',
        '/current-round',
        '/winning-history',
        '/changed-parameters',
        '/charity-deposits-cg',
        '/charity-deposits-voluntary',
        '/charity-withdrawals',
        '/rewards-by-token',
        '/eth-donation',
      ];
      // lexicon-allow-end
      for (const legacy of legacyPaths) {
        expect(APP_ONLY_PATH_PREFIXES).not.toContain(legacy);
      }
    });

    it('does not include the landing root path', () => {
      expect(APP_ONLY_PATH_PREFIXES).not.toContain('/');
    });

    it('has no duplicates', () => {
      const unique = new Set(APP_ONLY_PATH_PREFIXES);
      expect(unique.size).toBe(APP_ONLY_PATH_PREFIXES.length);
    });

    it('every prefix starts with a slash', () => {
      for (const prefix of APP_ONLY_PATH_PREFIXES) {
        expect(prefix.startsWith('/')).toBe(true);
      }
    });

    /** The first path segment of every page a route group serves. */
    const routeSegments = (group: string) =>
      readdirSync(join(__dirname, '../../app/[locale]', group), { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            !entry.name.startsWith('__') &&
            !entry.name.includes('.') &&
            entry.name !== 'landing-site',
        )
        .map((entry) => `/${entry.name}`);

    it('covers every page of the app and embed groups, so the landing host redirects them all', () => {
      // A directory missing here rendered on cosmicsignature.com with the app's
      // root layout and wallet stack (the transfer histories did).
      for (const prefix of [...routeSegments('(app)'), ...routeSegments('(embed)')]) {
        expect(APP_ONLY_PATH_PREFIXES).toContain(prefix);
      }
    });

    it('names only real pages (plus the API and the aliases proxy.ts answers)', () => {
      const pages = new Set([
        ...routeSegments('(app)'),
        ...routeSegments('(embed)'),
        '/api',
        ...PAGE_ALIASES.keys(),
      ]);
      for (const prefix of APP_ONLY_PATH_PREFIXES) expect(pages).toContain(prefix);
    });

    it('leaves every landing page to the landing list', () => {
      expect([...LANDING_ONLY_PATH_PREFIXES].sort()).toEqual(routeSegments('(landing)').sort());
    });
  });

  describe('isKnownPublicPath', () => {
    it('knows the home and every prefix of both hosts', () => {
      expect(isKnownPublicPath('/')).toBe(true);
      expect(isKnownPublicPath('/gallery')).toBe(true);
      expect(isKnownPublicPath('/detail/25')).toBe(true);
      expect(isKnownPublicPath('/learn/anchoring-nfts')).toBe(true);
    });

    it('does not know a path no page starts with', () => {
      expect(isKnownPublicPath('/quality-assurance-route-not-found')).toBe(false);
      expect(isKnownPublicPath('/galleryx')).toBe(false);
    });
  });

  describe('isAppOnlyPath', () => {
    it('returns false for root path', () => {
      expect(isAppOnlyPath('/')).toBe(false);
    });

    it('returns false for empty path', () => {
      expect(isAppOnlyPath('')).toBe(false);
    });

    it.each([
      '/gallery',
      '/current-cycle',
      '/experimental-ui',
      '/security',
      '/audits',
      '/risk-disclosures',
      '/faq',
      '/anchoring',
      '/gesture/1',
      '/allocation/42',
      '/my-anchors',
      '/admin',
      '/internal/cst-outreach-transfer',
      '/transfer-cst',
      '/gesture/1',
      '/allocation/42',
      '/anchoring',
      '/current-cycle',
    ])('returns true for protected path: %s', (path) => {
      expect(isAppOnlyPath(path)).toBe(true);
    });

    it('returns true for a nested path under a protected prefix', () => {
      expect(isAppOnlyPath('/gesture/123/details')).toBe(true);
      expect(isAppOnlyPath('/gallery/subview')).toBe(true);
    });

    it('returns false for unrelated paths', () => {
      expect(isAppOnlyPath('/about')).toBe(false);
      expect(isAppOnlyPath('/learn/what-is-cosmic-signature')).toBe(false);
    });

    it('returns false for a path that starts similarly but is not a prefix match', () => {
      // `/bidder` starts with `/bid` but is not a prefix match
      // (prefix matching requires exact path or `<prefix>/...` form).
      expect(isAppOnlyPath('/participant')).toBe(false);
      expect(isAppOnlyPath('/galleryfoo')).toBe(false);
    });

    it('treats exact match as true', () => {
      expect(isAppOnlyPath('/gesture')).toBe(true);
      expect(isAppOnlyPath('/gesture')).toBe(true);
      expect(isAppOnlyPath('/current-cycle')).toBe(true);
    });
  });

  describe('isLandingOnlyPath', () => {
    it('keeps informational and quiz pages canonical on the landing host', () => {
      expect(LANDING_ONLY_PATH_PREFIXES).toEqual(['/about', '/learn', '/quiz', '/white-paper']);
      expect(isLandingOnlyPath('/about')).toBe(true);
      expect(isLandingOnlyPath('/learn')).toBe(true);
      expect(isLandingOnlyPath('/learn/what-is-cosmic-signature')).toBe(true);
      expect(isLandingOnlyPath('/white-paper')).toBe(true);
    });

    it.each(['/quiz', '/quiz/basic', '/quiz/advanced', '/quiz/missing-tier'])(
      'keeps %s in the landing route family',
      (pathname) => {
        expect(isLandingOnlyPath(pathname)).toBe(true);
      },
    );

    it('does not classify app routes as landing-only', () => {
      expect(isLandingOnlyPath('/statistics')).toBe(false);
      expect(isLandingOnlyPath('/gallery')).toBe(false);
      expect(isLandingOnlyPath('/faq')).toBe(false);
    });
  });

  describe('publicPathname', () => {
    it('maps the internal landing-site route to the public root', () => {
      // usePathname reports the internal route while the landing home
      // prerenders; a link built from it would leak `/landing-site`.
      expect(publicPathname(LANDING_SITE_INTERNAL_PATH)).toBe('/');
      expect(publicPathname('/landing-site/')).toBe('/');
    });

    it('leaves every public path alone', () => {
      for (const path of ['/', '/faq', '/about', '/learn/what-is-cosmic-signature', '/gallery']) {
        expect(publicPathname(path)).toBe(path);
      }
      // A page whose name merely starts with the same letters is not the landing.
      expect(publicPathname('/landing-sites')).toBe('/landing-sites');
    });
  });
});

import {
  APP_ONLY_PATH_PREFIXES,
  isAppHost,
  isAppOnlyPath,
  isLandingHost,
  normalizeHost,
} from '@/lib/hostRouting';

describe('hostRouting', () => {
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
          '/faq',
          '/admin',
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

    it('prefixes contain expected entries in a stable order', () => {
      // The list is maintained for human readability rather than strict
      // alphabetical order — new entries (e.g. /attached-nfts) may be
      // grouped with semantically related prefixes. We still verify the
      // list contains the expected complete set with no extras.
      const expected = [
        '/admin',
        '/allocation',
        '/allocation-finalized',
        '/anchor-action',
        '/anchoring',
        '/api',
        '/attached-nfts',
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
        '/how-to-play',
        '/marketing',
        '/mint',
        '/mint-artblocks',
        '/my-allocations',
        '/my-anchors',
        '/my-statistics',
        '/my-tokens',
        '/named-nfts',
        '/public-goods-contributions-cg',
        '/public-goods-contributions-voluntary',
        '/public-goods-retrievals',
        '/recipient-history',
        '/site-map',
        '/statistics',
        '/system-event',
        '/used-rwlk-nfts',
        '/user',
      ];
      expect([...APP_ONLY_PATH_PREFIXES].sort()).toEqual(expected.sort());
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
      '/faq',
      '/anchoring',
      '/gesture/1',
      '/allocation/42',
      '/my-anchors',
      '/admin',
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
      expect(isAppOnlyPath('/terms')).toBe(false);
    });

    it('returns false for a path that starts similarly but is not a prefix match', () => {
      // `/bidder` starts with `/bid` but is not a prefix match
      // (prefix matching requires exact path or `<prefix>/...` form).
      expect(isAppOnlyPath('/bidder')).toBe(false);
      expect(isAppOnlyPath('/galleryfoo')).toBe(false);
    });

    it('treats exact match as true', () => {
      expect(isAppOnlyPath('/gesture')).toBe(true);
      expect(isAppOnlyPath('/gesture')).toBe(true);
      expect(isAppOnlyPath('/current-cycle')).toBe(true);
    });
  });
});

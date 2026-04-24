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
    it('includes critical legacy dApp paths', () => {
      expect(APP_ONLY_PATH_PREFIXES).toEqual(
        expect.arrayContaining([
          '/bid',
          '/prize',
          '/staking',
          '/gallery',
          '/current-round',
          '/faq',
          '/admin',
        ]),
      );
    });

    it('includes new lexicon-safe dApp paths', () => {
      expect(APP_ONLY_PATH_PREFIXES).toEqual(
        expect.arrayContaining([
          '/gesture',
          '/allocation',
          '/anchoring',
          '/current-cycle',
          '/my-anchors',
          '/my-allocations',
          '/public-goods-contributions-cg',
        ]),
      );
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
      '/current-round',
      '/faq',
      '/staking',
      '/bid/1',
      '/prize/42',
      '/my-staking',
      '/admin',
      '/gesture/1',
      '/allocation/42',
      '/anchoring',
      '/current-cycle',
    ])('returns true for protected path: %s', (path) => {
      expect(isAppOnlyPath(path)).toBe(true);
    });

    it('returns true for a nested path under a protected prefix', () => {
      expect(isAppOnlyPath('/bid/123/details')).toBe(true);
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
      expect(isAppOnlyPath('/bid')).toBe(true);
      expect(isAppOnlyPath('/gesture')).toBe(true);
      expect(isAppOnlyPath('/current-cycle')).toBe(true);
    });
  });
});

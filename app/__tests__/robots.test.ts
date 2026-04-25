import robots from '@/app/robots';

let mockHost = 'www.cosmicsignature.com';

jest.mock('next/headers', () => ({
  headers: async () => ({
    get: (name: string) => {
      if (name === 'x-forwarded-host' || name === 'host') return mockHost;
      return null;
    },
  }),
}));

describe('robots (host-aware)', () => {
  describe('on landing host', () => {
    beforeEach(() => {
      mockHost = 'www.cosmicsignature.com';
    });

    it('returns rules array', async () => {
      const result = await robots();
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThanOrEqual(2);
    });

    it('has a wildcard rule allowing root', async () => {
      const result = await robots();
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const wildcardRule = rules.find((r) => r.userAgent === '*');
      expect(wildcardRule).toBeDefined();
      expect(wildcardRule!.allow).toContain('/');
    });

    it('disallows the deep dApp paths on the landing host', async () => {
      const result = await robots();
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const wildcardRule = rules.find((r) => r.userAgent === '*')!;
      const disallow = Array.isArray(wildcardRule.disallow)
        ? wildcardRule.disallow
        : [wildcardRule.disallow];
      expect(disallow).toEqual(expect.arrayContaining(['/admin/', '/api/', '/gallery/']));
    });

    it('includes AI crawler bot rules', async () => {
      const result = await robots();
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const aiRule = rules.find(
        (r) => Array.isArray(r.userAgent) && r.userAgent.includes('GPTBot'),
      );
      expect(aiRule).toBeDefined();
      expect(aiRule!.allow).toContain('/');
    });

    it('includes common AI bot user agents', async () => {
      const result = await robots();
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const aiRule = rules.find((r) => Array.isArray(r.userAgent));
      expect(aiRule).toBeDefined();
      const agents = aiRule!.userAgent as string[];
      expect(agents).toContain('GPTBot');
      expect(agents).toContain('ChatGPT-User');
      expect(agents).toContain('Claude-Web');
      expect(agents).toContain('PerplexityBot');
      expect(agents).toContain('Google-Extended');
    });

    it('references the landing sitemap', async () => {
      const result = await robots();
      expect(result.sitemap).toBe('https://www.cosmicsignature.com/sitemap.xml');
    });

    it('specifies the landing host', async () => {
      const result = await robots();
      expect(result.host).toBe('https://www.cosmicsignature.com');
    });
  });

  describe('on app host', () => {
    beforeEach(() => {
      mockHost = 'app.cosmicsignature.com';
    });

    it('references the app sitemap', async () => {
      const result = await robots();
      expect(result.sitemap).toBe('https://app.cosmicsignature.com/sitemap.xml');
    });

    it('specifies the app host', async () => {
      const result = await robots();
      expect(result.host).toBe('https://app.cosmicsignature.com');
    });

    it('has minimal disallow (no gallery/anchoring exclusions)', async () => {
      const result = await robots();
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const wildcardRule = rules.find((r) => r.userAgent === '*')!;
      const disallow = Array.isArray(wildcardRule.disallow)
        ? wildcardRule.disallow
        : [wildcardRule.disallow];
      // `/landing-site` is the internal Next route for the marketing host;
      // we still tell crawlers not to index it from the app host either.
      expect(disallow).toEqual(['/admin/', '/api/', '/landing-site']);
    });
  });
});

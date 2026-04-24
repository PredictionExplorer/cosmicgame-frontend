import sitemap from '@/app/sitemap';

let mockHost = 'app.cosmicsignature.com';

jest.mock('next/headers', () => ({
  headers: async () => ({
    get: (name: string) => {
      if (name === 'x-forwarded-host' || name === 'host') return mockHost;
      return null;
    },
  }),
}));

describe('sitemap (host-aware)', () => {
  describe('on landing host', () => {
    beforeEach(() => {
      mockHost = 'www.cosmicsignature.com';
    });

    it('returns a minimal sitemap with just the root', async () => {
      const entries = await sitemap();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBe(1);
      expect(entries[0]!.url).toBe('https://www.cosmicsignature.com');
    });

    it('root uses landing base URL', async () => {
      const entries = await sitemap();
      expect(entries[0]!.url).toBe('https://www.cosmicsignature.com');
    });
  });

  describe('on app host', () => {
    beforeEach(() => {
      mockHost = 'app.cosmicsignature.com';
    });

    it('returns a full dApp sitemap', async () => {
      const entries = await sitemap();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(20);
    });

    it('each entry has url, lastModified, changeFrequency, and priority', async () => {
      const entries = await sitemap();
      for (const entry of entries) {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');
      }
    });

    it('all URLs start with the app base URL', async () => {
      const entries = await sitemap();
      const baseUrl = 'https://app.cosmicsignature.com';
      for (const entry of entries) {
        expect(entry.url).toMatch(new RegExp(`^${baseUrl}`));
      }
    });

    it('contains the home page', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);
      expect(urls).toContain('https://app.cosmicsignature.com');
    });

    it('contains both legacy and new lexicon-safe paths', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);
      // Legacy
      expect(urls).toContain('https://app.cosmicsignature.com/current-round');
      expect(urls).toContain('https://app.cosmicsignature.com/staking');
      expect(urls).toContain('https://app.cosmicsignature.com/prize');
      // Lexicon-safe aliases
      expect(urls).toContain('https://app.cosmicsignature.com/current-cycle');
      expect(urls).toContain('https://app.cosmicsignature.com/anchoring');
      expect(urls).toContain('https://app.cosmicsignature.com/allocation');
    });

    it('contains expected static pages', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);
      expect(urls).toContain('https://app.cosmicsignature.com/gallery');
      expect(urls).toContain('https://app.cosmicsignature.com/faq');
      expect(urls).toContain('https://app.cosmicsignature.com/statistics');
      expect(urls).toContain('https://app.cosmicsignature.com/contracts');
    });

    it('home page has highest priority', async () => {
      const entries = await sitemap();
      const home = entries.find((e) => e.url === 'https://app.cosmicsignature.com');
      expect(home?.priority).toBe(1.0);
    });

    it('key content pages have high priority', async () => {
      const entries = await sitemap();
      const gallery = entries.find((e) => e.url === 'https://app.cosmicsignature.com/gallery');
      const faq = entries.find((e) => e.url === 'https://app.cosmicsignature.com/faq');
      const howToPlay = entries.find(
        (e) => e.url === 'https://app.cosmicsignature.com/how-to-play',
      );

      expect(gallery?.priority).toBeGreaterThanOrEqual(0.8);
      expect(faq?.priority).toBeGreaterThanOrEqual(0.8);
      expect(howToPlay?.priority).toBeGreaterThanOrEqual(0.8);
    });

    it('uses variable change frequencies', async () => {
      const entries = await sitemap();
      const frequencies = new Set(entries.map((e) => e.changeFrequency));
      expect(frequencies.size).toBeGreaterThan(1);
    });

    it('live data pages use hourly frequency', async () => {
      const entries = await sitemap();
      const home = entries.find((e) => e.url === 'https://app.cosmicsignature.com');
      const gallery = entries.find((e) => e.url === 'https://app.cosmicsignature.com/gallery');
      expect(home?.changeFrequency).toBe('hourly');
      expect(gallery?.changeFrequency).toBe('hourly');
    });

    it('all entries have a Date for lastModified', async () => {
      const entries = await sitemap();
      for (const entry of entries) {
        expect(entry.lastModified).toBeInstanceOf(Date);
      }
    });

    it('priorities are between 0 and 1', async () => {
      const entries = await sitemap();
      for (const entry of entries) {
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
    });
  });
});

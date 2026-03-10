import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  const entries = sitemap();

  it('returns an array of sitemap entries', () => {
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('each entry has url, lastModified, changeFrequency, and priority', () => {
    for (const entry of entries) {
      expect(entry).toHaveProperty('url');
      expect(entry).toHaveProperty('lastModified');
      expect(entry).toHaveProperty('changeFrequency');
      expect(entry).toHaveProperty('priority');
    }
  });

  it('all URLs start with the base URL', () => {
    const baseUrl = 'https://www.cosmicsignature.com';
    for (const entry of entries) {
      expect(entry.url).toMatch(new RegExp(`^${baseUrl}`));
    }
  });

  it('contains the home page', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://www.cosmicsignature.com');
  });

  it('contains expected static pages', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://www.cosmicsignature.com/gallery');
    expect(urls).toContain('https://www.cosmicsignature.com/faq');
    expect(urls).toContain('https://www.cosmicsignature.com/staking');
    expect(urls).toContain('https://www.cosmicsignature.com/statistics');
    expect(urls).toContain('https://www.cosmicsignature.com/contracts');
    expect(urls).toContain('https://www.cosmicsignature.com/winning-history');
  });

  it('all entries use "daily" changeFrequency', () => {
    for (const entry of entries) {
      expect(entry.changeFrequency).toBe('daily');
    }
  });

  it('all entries have priority 0.7', () => {
    for (const entry of entries) {
      expect(entry.priority).toBe(0.7);
    }
  });

  it('all entries have a Date for lastModified', () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });
});

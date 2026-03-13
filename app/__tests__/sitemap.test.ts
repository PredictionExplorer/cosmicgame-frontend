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

  it('contains the current-round page', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://www.cosmicsignature.com/current-round');
  });

  it('home page has highest priority', () => {
    const home = entries.find((e) => e.url === 'https://www.cosmicsignature.com');
    expect(home?.priority).toBe(1.0);
  });

  it('key content pages have high priority', () => {
    const gallery = entries.find((e) => e.url === 'https://www.cosmicsignature.com/gallery');
    const faq = entries.find((e) => e.url === 'https://www.cosmicsignature.com/faq');
    const howToPlay = entries.find((e) => e.url === 'https://www.cosmicsignature.com/how-to-play');

    expect(gallery?.priority).toBeGreaterThanOrEqual(0.8);
    expect(faq?.priority).toBeGreaterThanOrEqual(0.8);
    expect(howToPlay?.priority).toBeGreaterThanOrEqual(0.8);
  });

  it('admin pages have low priority', () => {
    const admin = entries.find((e) => e.url === 'https://www.cosmicsignature.com/admin');
    expect(admin?.priority).toBeLessThanOrEqual(0.3);
  });

  it('uses variable change frequencies', () => {
    const frequencies = new Set(entries.map((e) => e.changeFrequency));
    expect(frequencies.size).toBeGreaterThan(1);
  });

  it('live data pages use hourly frequency', () => {
    const home = entries.find((e) => e.url === 'https://www.cosmicsignature.com');
    const gallery = entries.find((e) => e.url === 'https://www.cosmicsignature.com/gallery');
    expect(home?.changeFrequency).toBe('hourly');
    expect(gallery?.changeFrequency).toBe('hourly');
  });

  it('static content pages use weekly or monthly frequency', () => {
    const contracts = entries.find((e) => e.url === 'https://www.cosmicsignature.com/contracts');
    expect(['weekly', 'monthly']).toContain(contracts?.changeFrequency);
  });

  it('all entries have a Date for lastModified', () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it('priorities are between 0 and 1', () => {
    for (const entry of entries) {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });
});

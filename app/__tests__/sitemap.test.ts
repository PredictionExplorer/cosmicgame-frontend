import sitemap from '@/app/sitemap';

const APP_URL = 'https://app.cosmicsignature.com';
const MARKETING_URL = 'https://www.cosmicsignature.com';

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

  it('all URLs start with either the app or marketing base URL', () => {
    for (const entry of entries) {
      const matchesApp = entry.url.startsWith(APP_URL);
      const matchesMkt = entry.url.startsWith(MARKETING_URL);
      expect(matchesApp || matchesMkt).toBe(true);
    }
  });

  it('contains the marketing home page', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(MARKETING_URL);
  });

  it('contains the app home page', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(APP_URL);
  });

  it('contains expected app pages', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${APP_URL}/gallery`);
    expect(urls).toContain(`${APP_URL}/faq`);
    expect(urls).toContain(`${APP_URL}/staking`);
    expect(urls).toContain(`${APP_URL}/statistics`);
    expect(urls).toContain(`${APP_URL}/contracts`);
    expect(urls).toContain(`${APP_URL}/winning-history`);
  });

  it('contains the current-round page', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${APP_URL}/current-round`);
  });

  it('marketing home page has highest priority', () => {
    const home = entries.find((e) => e.url === MARKETING_URL);
    expect(home?.priority).toBe(1.0);
  });

  it('key content pages have high priority', () => {
    const gallery = entries.find((e) => e.url === `${APP_URL}/gallery`);
    const faq = entries.find((e) => e.url === `${APP_URL}/faq`);
    const howToPlay = entries.find((e) => e.url === `${APP_URL}/how-to-play`);

    expect(gallery?.priority).toBeGreaterThanOrEqual(0.8);
    expect(faq?.priority).toBeGreaterThanOrEqual(0.8);
    expect(howToPlay?.priority).toBeGreaterThanOrEqual(0.8);
  });

  it('admin pages have low priority', () => {
    const admin = entries.find((e) => e.url === `${APP_URL}/admin`);
    expect(admin?.priority).toBeLessThanOrEqual(0.3);
  });

  it('uses variable change frequencies', () => {
    const frequencies = new Set(entries.map((e) => e.changeFrequency));
    expect(frequencies.size).toBeGreaterThan(1);
  });

  it('live data pages use hourly frequency', () => {
    const appHome = entries.find((e) => e.url === APP_URL);
    const gallery = entries.find((e) => e.url === `${APP_URL}/gallery`);
    expect(appHome?.changeFrequency).toBe('hourly');
    expect(gallery?.changeFrequency).toBe('hourly');
  });

  it('static content pages use weekly or monthly frequency', () => {
    const contracts = entries.find((e) => e.url === `${APP_URL}/contracts`);
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

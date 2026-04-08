import { isLandingHost, normalizeHost } from '@/lib/hostRouting';

describe('hostRouting', () => {
  describe('normalizeHost', () => {
    it('strips port and lowercases', () => {
      expect(normalizeHost('WWW.CosmicSignature.COM:443')).toBe('www.cosmicsignature.com');
    });

    it('returns empty for nullish', () => {
      expect(normalizeHost(null)).toBe('');
      expect(normalizeHost(undefined)).toBe('');
    });
  });

  describe('isLandingHost', () => {
    it('matches marketing hosts', () => {
      expect(isLandingHost('cosmicsignature.com')).toBe(true);
      expect(isLandingHost('www.cosmicsignature.com')).toBe(true);
    });

    it('rejects app and localhost', () => {
      expect(isLandingHost('app.cosmicsignature.com')).toBe(false);
      expect(isLandingHost('localhost')).toBe(false);
    });
  });
});

import {
  getHqVideoUrl,
  getMetadataUrl,
  getSeedPackageUrl,
  getSpectralSweepUrl,
  getWebImageUrl,
} from '../urls';

// Media follows the rotated API origin (jest.setup.ts NEXT_PUBLIC_API_URL).
const origin = 'http://test-api.example';
const seed = '36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce';

describe('getMetadataUrl', () => {
  it('addresses the token metadata document by numeric id on the media origin', () => {
    expect(getMetadataUrl(1)).toBe(`${origin}/metadata/1`);
    expect(getMetadataUrl('47')).toBe(`${origin}/metadata/47`);
  });
});

describe('per-seed package URLs', () => {
  it('builds paths inside the 0x<seed> package directory', () => {
    expect(getSeedPackageUrl(seed, 'images/web/full.webp')).toBe(
      `${origin}/images/new/cosmicsignature/0x${seed}/images/web/full.webp`,
    );
  });

  it('normalizes a 0x-prefixed or upper-case seed and a leading slash', () => {
    expect(getSeedPackageUrl(`0x${seed.toUpperCase()}`, '/videos/hq/main.mp4')).toBe(
      `${origin}/images/new/cosmicsignature/0x${seed}/videos/hq/main.mp4`,
    );
  });

  it('exposes the web image, spectral sweep, and HQ video derivatives', () => {
    expect(getWebImageUrl(seed)).toMatch(/\/0x[0-9a-f]+\/images\/web\/full\.webp$/);
    expect(getSpectralSweepUrl(seed)).toMatch(/\/videos\/web\/spectral_sweep\.mp4$/);
    expect(getHqVideoUrl(seed)).toMatch(/\/videos\/hq\/main\.mp4$/);
  });
});

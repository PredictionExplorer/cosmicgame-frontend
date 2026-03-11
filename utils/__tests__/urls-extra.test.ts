import { getProxiedUrl, getOriginUrl, getAssetsUrl, getRWLKImageUrl, logoImgUrl } from '../urls';

describe('getProxiedUrl', () => {
  it('prepends the proxy path and encodes the URL', () => {
    const result = getProxiedUrl('https://example.com/path?q=1');
    expect(result).toContain('/api/proxy?url=');
    expect(result).toContain(encodeURIComponent('https://example.com/path?q=1'));
  });

  it('handles empty string', () => {
    const result = getProxiedUrl('');
    expect(result).toContain('/api/proxy?url=');
  });
});

describe('getOriginUrl', () => {
  it('strips the proxy prefix and decodes the URL', () => {
    const encoded = `/api/proxy?url=${encodeURIComponent('https://example.com')}`;
    expect(getOriginUrl(encoded)).toBe('https://example.com');
  });

  it('handles URL without the proxy prefix', () => {
    const result = getOriginUrl('https://direct.com');
    expect(result).toBe('https://direct.com');
  });
});

describe('getAssetsUrl', () => {
  it('constructs proxied URL with the NFT image server base', () => {
    const result = getAssetsUrl('cosmicsignature/logo.png');
    expect(result).toContain(
      encodeURIComponent('https://nfts.cosmicsignature.com/images/new/cosmicsignature/logo.png'),
    );
  });
});

describe('getRWLKImageUrl', () => {
  it('constructs proxied URL with default variant', () => {
    const result = getRWLKImageUrl('12345');
    expect(result).toContain(
      encodeURIComponent(
        'https://nfts.cosmicsignature.com/images/randomwalk/12345_black_thumb.jpg',
      ),
    );
  });

  it('uses custom variant when provided', () => {
    const result = getRWLKImageUrl('12345', 'color.png');
    expect(result).toContain(
      encodeURIComponent('https://nfts.cosmicsignature.com/images/randomwalk/12345_color.png'),
    );
  });
});

describe('logoImgUrl', () => {
  it('is a non-empty string', () => {
    expect(typeof logoImgUrl).toBe('string');
    expect(logoImgUrl.length).toBeGreaterThan(0);
  });
});

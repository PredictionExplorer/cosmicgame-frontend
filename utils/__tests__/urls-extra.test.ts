import {
  getExplorerUrl,
  getProxiedUrl,
  getOriginUrl,
  getAssetsUrl,
  getRWLKImageUrl,
  logoImgUrl,
} from '../urls';

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

describe('getProxiedUrl edge cases', () => {
  it('encodes URLs with spaces', () => {
    const result = getProxiedUrl('https://example.com/path with spaces');
    expect(result).toContain(encodeURIComponent('https://example.com/path with spaces'));
  });

  it('encodes URLs with ampersands and query params', () => {
    const result = getProxiedUrl('https://api.example.com?a=1&b=2&c=3');
    expect(decodeURIComponent(result.replace('/api/proxy?url=', ''))).toBe(
      'https://api.example.com?a=1&b=2&c=3',
    );
  });
});

describe('getOriginUrl edge cases', () => {
  it('returns the same URL if no proxy prefix present', () => {
    expect(getOriginUrl('https://direct.com/page')).toBe('https://direct.com/page');
  });

  it('decodes a double-encoded URL correctly', () => {
    const inner = encodeURIComponent('https://example.com');
    const proxied = `/api/proxy?url=${inner}`;
    expect(getOriginUrl(proxied)).toBe('https://example.com');
  });
});

describe('getExplorerUrl edge cases', () => {
  it('does not have a trailing slash before the type', () => {
    const result = getExplorerUrl('tx', '0xhash');
    expect(result).not.toMatch(/\/\/tx\//);
  });

  it('produces different URLs for different types', () => {
    const tx = getExplorerUrl('tx', '0x1');
    const addr = getExplorerUrl('address', '0x1');
    const token = getExplorerUrl('token', '0x1');
    expect(new Set([tx, addr, token]).size).toBe(3);
  });
});

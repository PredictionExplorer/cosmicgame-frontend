import { getAssetsUrl } from '@/utils';

import NFTImage from '@/components/nft/NFTImage';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

/**
 * Next/Image rewrites the src attribute to `/_next/image?url=...&w=...&q=...`
 * when the optimizer is active. For test purposes we decode that URL and
 * extract the original `url` param, then assert substring containment there.
 */
function extractOptimizedUrl(srcAttr: string | null): string {
  if (!srcAttr) return '';
  try {
    const u = new URL(srcAttr, 'http://localhost');
    return u.searchParams.get('url') ?? srcAttr;
  } catch {
    return srcAttr;
  }
}

describe('NFTImage', () => {
  test('with src', () => {
    const mockData = getAssetsUrl('cosmicsignature/000000.png');
    render(<NFTImage src={mockData} />);
    const src = screen.getByAltText('NFT').getAttribute('src');
    expect(extractOptimizedUrl(src)).toContain(mockData);
  });

  test('with no src falls back to the lightweight placeholder', () => {
    const mockData = '';
    render(<NFTImage src={mockData} />);
    const src = screen.getByAltText('NFT').getAttribute('src');
    expect(extractOptimizedUrl(src)).toContain('/images/qmark-preview.png');
  });

  test('shows fallback on image error', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} />);
    const img = screen.getByAltText('NFT');
    expect(extractOptimizedUrl(img.getAttribute('src'))).toContain(brokenSrc);

    fireEvent.error(img);
    expect(extractOptimizedUrl(img.getAttribute('src'))).toContain('/images/qmark-preview.png');
  });

  test('falls back from thumbnail to full image, then to the placeholder', () => {
    const thumb =
      'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0xabc/thumb_card.webp';
    const full = 'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0xabc.png';
    render(<NFTImage src={thumb} fallbackSrc={full} />);
    const img = screen.getByAltText('NFT');

    // 1) thumbnail first
    expect(img.getAttribute('src')).toBe(thumb);

    // 2) thumbnail missing → full image
    fireEvent.error(img);
    expect(img.getAttribute('src')).toBe(full);

    // 3) full image also fails → lightweight placeholder
    fireEvent.error(img);
    expect(extractOptimizedUrl(img.getAttribute('src'))).toContain('/images/qmark-preview.png');
  });

  test('never references the full-resolution qmark asset as fallback', () => {
    render(<NFTImage src="" />);
    const src = screen.getByAltText('NFT').getAttribute('src');
    expect(extractOptimizedUrl(src)).not.toBe('/images/qmark.png');
  });

  test('can render a neutral unavailable state instead of a terminal image fallback', () => {
    const brokenSrc = 'https://example.com/real-token-that-failed.png';
    render(<NFTImage src={brokenSrc} terminalFallbackSrc={null} alt="Real NFT" />);
    const img = screen.getByAltText('Real NFT');

    fireEvent.error(img);

    expect(screen.getByRole('img', { name: 'Real NFT' })).toHaveTextContent(
      'detail.image.artworkUnavailable',
    );
  });

  test('landing surfaces can override the unavailable label (detail namespace not loaded there)', () => {
    const brokenSrc = 'https://example.com/real-token-that-failed.png';
    render(
      <NFTImage
        src={brokenSrc}
        terminalFallbackSrc={null}
        alt="Real NFT"
        unavailableLabel="Signal forming"
      />,
    );

    fireEvent.error(screen.getByAltText('Real NFT'));

    const state = screen.getByRole('img', { name: 'Real NFT' });
    expect(state).toHaveTextContent('Signal forming');
    expect(state).not.toHaveTextContent('detail.image.artworkUnavailable');
  });

  test('defaults to lazy loading for below-the-fold use', () => {
    const mockData = getAssetsUrl('cosmicsignature/000000.png');
    render(<NFTImage src={mockData} />);
    expect(screen.getByAltText('NFT').getAttribute('loading')).toBe('lazy');
  });

  test('switches to eager loading when priority is set', () => {
    const mockData = getAssetsUrl('cosmicsignature/000000.png');
    render(<NFTImage src={mockData} priority />);
    expect(screen.getByAltText('NFT').getAttribute('loading')).toBe('eager');
  });

  test('accepts custom sizes for responsive srcset', () => {
    const mockData = getAssetsUrl('cosmicsignature/000000.png');
    render(<NFTImage src={mockData} sizes="100vw" />);
    // The image tag carries a srcset in jsdom when sizes is set; just ensure
    // the attribute made it through without breaking.
    expect(screen.getByAltText('NFT')).toBeInTheDocument();
  });

  test('passes optimization-bypass for arbitrary marketplace hosts', () => {
    // Arbitrary NFT marketplace hostnames (Art Blocks media-proxy, IPFS
    // gateways, etc.) aren't in next.config.ts → images.remotePatterns,
    // so NFTImage marks them `unoptimized` to keep the page alive instead
    // of throwing on render. The serialized src then preserves the raw
    // URL rather than going through /_next/image.
    const externalSrc =
      'https://media-proxy.artblocks.io/1/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13000002.png';
    render(<NFTImage src={externalSrc} />);
    const img = screen.getByAltText('NFT');
    expect(img.getAttribute('src')).toBe(externalSrc);
  });

  test('bypasses optimization for Cosmic Signature NFT CDN hosts', () => {
    const localSrc = 'https://nfts.cosmicsignature.com/some-token.png';
    render(<NFTImage src={localSrc} />);
    const img = screen.getByAltText('NFT');
    expect(img.getAttribute('src')).toBe(localSrc);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTImage src="" />);
    await checkA11y(container);
  });
});

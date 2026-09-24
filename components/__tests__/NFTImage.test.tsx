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

  test('with no src renders the unavailable state, never stock artwork', () => {
    render(<NFTImage src="" />);
    const state = screen.getByRole('img', { name: 'NFT' });
    expect(state).toHaveAccessibleDescription('detail.image.artworkUnavailable');
    expect(state.tagName).toBe('DIV');
    expect(document.querySelector('img')).toBeNull();
  });

  test('shows the unavailable state when the only image fails', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} />);
    const img = screen.getByAltText('NFT');
    expect(extractOptimizedUrl(img.getAttribute('src'))).toContain(brokenSrc);

    fireEvent.error(img);
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'NFT' })).toHaveTextContent(
      'detail.image.artworkUnavailable',
    );
  });

  test('falls back from thumbnail to full image, then to the unavailable state', () => {
    const thumb =
      'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0xabc/thumb_card.webp';
    const full = 'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0xabc.png';
    render(<NFTImage src={thumb} fallbackSrc={full} />);

    // 1) thumbnail first
    expect(screen.getByAltText('NFT').getAttribute('src')).toBe(thumb);

    // 2) thumbnail missing → full image
    fireEvent.error(screen.getByAltText('NFT'));
    expect(screen.getByAltText('NFT').getAttribute('src')).toBe(full);

    // 3) full image also fails → the designed unavailable state
    fireEvent.error(screen.getByAltText('NFT'));
    expect(screen.getByRole('img', { name: 'NFT' })).toHaveTextContent(
      'detail.image.artworkUnavailable',
    );
  });

  test('never falls back to the retired qmark placeholder artwork', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} />);
    fireEvent.error(screen.getByAltText('NFT'));
    expect(document.body.innerHTML).not.toContain('qmark');
  });

  test('still honours an explicit terminal fallback image', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} terminalFallbackSrc="/images/logo.svg" />);
    fireEvent.error(screen.getByAltText('NFT'));
    expect(extractOptimizedUrl(screen.getByAltText('NFT').getAttribute('src'))).toContain(
      '/images/logo.svg',
    );
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

  test('keeps the 16:9 media box by default for RandomWalk and third-party NFTs', () => {
    render(<NFTImage src="https://example.com/rwlk.png" />);
    expect(screen.getByAltText('NFT')).toHaveClass('aspect-video', 'object-contain');
  });

  test('puts a Signature on its black plate at the native ratio with frame="signature"', () => {
    render(<NFTImage src="https://example.com/sig.png" frame="signature" alt="Sig" />);
    const img = screen.getByAltText('Sig');
    expect(img).toHaveClass('aspect-art', 'bg-art-ground', 'object-contain');
    expect(img).not.toHaveClass('aspect-video');
    expect(img).toHaveAttribute('width', '3456');
    expect(img).toHaveAttribute('height', '2234');
  });

  test('draws a Signature’s unavailable state as the orbit plate with its token number', () => {
    render(
      <NFTImage
        src="https://example.com/sig.png"
        frame="signature"
        alt="Sig"
        unavailableDetail="#000042"
      />,
    );
    fireEvent.error(screen.getByAltText('Sig'));
    const plate = screen.getByRole('img', { name: 'Sig' });
    expect(plate).toHaveClass('aspect-art');
    expect(plate).toHaveTextContent('#000042');
    expect(screen.getByTestId('orbit-mark')).toBeInTheDocument();
  });

  test('offers published renditions as a srcset', () => {
    const thumb = 'https://example.com/0xabc/thumb_card.webp';
    const full = 'https://example.com/0xabc/images/web/full.webp';
    render(
      <NFTImage
        frame="signature"
        alt="Sig"
        renditions={[
          { src: thumb, width: 640 },
          { src: full, width: 3456 },
        ]}
      />,
    );
    expect(screen.getByAltText('Sig').getAttribute('srcset')).toContain(`${thumb} 640w`);
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
    expect(screen.getByAltText('NFT').getAttribute('fetchpriority')).toBe('high');
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

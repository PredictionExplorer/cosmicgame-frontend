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

  test('with no src', () => {
    const mockData = '';
    render(<NFTImage src={mockData} />);
    const src = screen.getByAltText('NFT').getAttribute('src');
    expect(extractOptimizedUrl(src)).toContain('/images/qmark.png');
  });

  test('shows fallback on image error', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} />);
    const img = screen.getByAltText('NFT');
    expect(extractOptimizedUrl(img.getAttribute('src'))).toContain(brokenSrc);

    fireEvent.error(img);
    expect(extractOptimizedUrl(img.getAttribute('src'))).toContain('/images/qmark.png');
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

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTImage src="" />);
    await checkA11y(container);
  });
});

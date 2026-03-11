import { getAssetsUrl } from '@/utils';

import NFTImage from '@/components/nft/NFTImage';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('NFTImage', () => {
  test('with src', () => {
    const mockData = getAssetsUrl('cosmicsignature/000000.png');
    render(<NFTImage src={mockData} />);
    expect(screen.getByAltText('NFT').getAttribute('src')).toContain(mockData);
  });

  test('with no src', () => {
    const mockData = '';
    render(<NFTImage src={mockData} />);
    expect(screen.getByAltText('NFT').getAttribute('src')).toContain('/images/qmark.png');
  });

  test('shows fallback on image error', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} />);
    const img = screen.getByAltText('NFT');
    expect(img.getAttribute('src')).toContain(brokenSrc);

    fireEvent.error(img);
    expect(img.getAttribute('src')).toContain('/images/qmark.png');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTImage src="" />);
    await checkA11y(container);
  });
});

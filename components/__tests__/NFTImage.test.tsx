import { render, screen, fireEvent } from '@/test-utils';
import NFTImage from '@/components/nft/NFTImage';
import { getAssetsUrl } from '@/utils';
import '@testing-library/jest-dom';

describe('NFTImage', () => {
  test('with src', () => {
    const mockData = getAssetsUrl('cosmicsignature/000000.png');
    render(<NFTImage src={mockData} />);
    expect(screen.getByAltText('nft image').getAttribute('src')).toEqual(mockData);
  });

  test('with no src', () => {
    const mockData = '';
    render(<NFTImage src={mockData} />);
    expect(screen.getByAltText('nft image').getAttribute('src')).toEqual('/images/qmark.png');
  });

  test('shows fallback on image error', () => {
    const brokenSrc = 'https://example.com/broken-image.png';
    render(<NFTImage src={brokenSrc} />);
    const img = screen.getByAltText('nft image');
    expect(img.getAttribute('src')).toEqual(brokenSrc);

    fireEvent.error(img);
    expect(img.getAttribute('src')).toEqual('/images/qmark.png');
  });
});

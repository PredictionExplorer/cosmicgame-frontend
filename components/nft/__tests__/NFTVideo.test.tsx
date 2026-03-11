import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock(
  'next/image',
  () =>
    function MockImage(props: Record<string, unknown>) {
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
    },
);

jest.mock(
  '../NFTImage',
  () =>
    function MockNFTImage({ src, style }: { src: string; style?: React.CSSProperties }) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img data-testid="nft-image" src={src} style={style} alt="nft" />;
    },
);

import NFTVideo from '../NFTVideo';

describe('NFTVideo', () => {
  const defaultProps = {
    image_thumb: 'https://example.com/thumb.png',
    onClick: jest.fn(),
  };

  it('renders the NFT image', () => {
    render(<NFTVideo {...defaultProps} />);
    const img = screen.getByTestId('nft-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/thumb.png');
  });

  it('renders play button image', () => {
    render(<NFTVideo {...defaultProps} />);
    const playImg = screen.getByAltText('play');
    expect(playImg).toBeInTheDocument();
    expect(playImg).toHaveAttribute('src', '/images/play.svg');
  });

  it('calls onClick when play button is clicked', () => {
    render(<NFTVideo {...defaultProps} />);
    fireEvent.click(screen.getByAltText('play'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('renders image with reduced opacity', () => {
    render(<NFTVideo {...defaultProps} />);
    const img = screen.getByTestId('nft-image');
    expect(img).toHaveStyle({ opacity: 0.55 });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTVideo {...defaultProps} />);
    await checkA11y(container);
  });
});

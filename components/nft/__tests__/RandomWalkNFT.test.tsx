import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

jest.mock('../../../hooks/useRWLKNFT', () => ({
  useRWLKNFT: (tokenId: number | string) => ({
    id: tokenId,
    black_image_thumb: `https://example.com/${tokenId}.png`,
  }),
}));

jest.mock(
  '../NFTImage',
  () =>
    function MockNFTImage({ src }: { src: string }) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img data-testid="nft-image" src={src} alt="nft" />;
    },
);

 
import RandomWalkNFT from '../RandomWalkNFT';

describe('RandomWalkNFT', () => {
  it('renders the NFT image', () => {
    render(<RandomWalkNFT tokenId={42} />);
    const img = screen.getByTestId('nft-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/42.png');
  });

  it('displays formatted token id', () => {
    render(<RandomWalkNFT tokenId={42} />);
    expect(screen.getByText('#000042')).toBeInTheDocument();
  });

  it('renders link to detail page when not selectable', () => {
    render(<RandomWalkNFT tokenId={99} selectable={false} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.randomwalknft.com/detail/99');
  });

  it('renders as div (no link) when selectable', () => {
    render(<RandomWalkNFT tokenId={99} selectable={true} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies selected border style when selected', () => {
    const { container } = render(<RandomWalkNFT tokenId={1} selected={true} />);
    expect(container.firstChild).toHaveClass('border-white');
  });

  it('applies default border style when not selected', () => {
    const { container } = render(<RandomWalkNFT tokenId={1} selected={false} />);
    expect(container.firstChild).toHaveClass('border-[#181F64]');
  });
});

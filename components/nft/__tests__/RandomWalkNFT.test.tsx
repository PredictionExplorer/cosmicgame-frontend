import '@testing-library/jest-dom';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('../../../hooks/useRWLKNFT', () => ({
  useRWLKNFT: (tokenId: number | string) => ({
    id: tokenId,
    black_image_thumb: `https://example.com/${tokenId}.png`,
  }),
}));

jest.mock(
  '../NFTImage',
  () =>
    function MockNFTImage({ src, alt = 'nft' }: { src: string; alt?: string }) {
      return <img data-testid="nft-image" src={src} alt={alt} />;
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

  it('marks the selected card with the primary border and a check, not colour alone', () => {
    const { container } = render(<RandomWalkNFT tokenId={1} selected={true} />);
    expect(container.firstChild).toHaveClass('border-primary');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides its image and number from assistive tech when decorative', () => {
    render(<RandomWalkNFT tokenId={7} decorative />);
    expect(screen.getByTestId('nft-image')).toHaveAttribute('alt', '');
    expect(screen.getByText('#000007')).toHaveAttribute('aria-hidden', 'true');
  });

  it('names its link by the image and the token number', () => {
    render(<RandomWalkNFT tokenId={99} selectable={false} />);
    expect(screen.getByRole('link')).toHaveAccessibleName('nft #000099');
  });

  it('uses the palette border when not selected', () => {
    const { container } = render(<RandomWalkNFT tokenId={1} selected={false} />);
    expect(container.firstChild).toHaveClass('border-border');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RandomWalkNFT tokenId={42} />);
    await checkA11y(container);
  });
});

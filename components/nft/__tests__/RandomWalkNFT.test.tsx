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

  it('is plain content for the picker button around it, never a link', () => {
    render(<RandomWalkNFT tokenId={99} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  // Nothing is drawn over the art: the number and the check sit in the label row.
  it('marks the chosen card in its label and on the plate edge, not over the art', () => {
    const { container } = render(<RandomWalkNFT tokenId={1} selected={true} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('data-selected', 'true');
    const plate = card.firstChild as HTMLElement;
    expect(plate.className).toContain('after:shadow-[inset_0_0_0_2px_var(--color-primary)]');
    expect(plate.querySelector('svg')).toBeNull();
    expect(screen.getByText('#000001').parentElement?.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('draws no check and no accent edge when not chosen', () => {
    const { container } = render(<RandomWalkNFT tokenId={1} selected={false} />);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveAttribute('data-selected');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('hides its image and number from assistive tech when decorative', () => {
    render(<RandomWalkNFT tokenId={7} decorative />);
    expect(screen.getByTestId('nft-image')).toHaveAttribute('alt', '');
    expect(screen.getByText('#000007').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RandomWalkNFT tokenId={42} />);
    await checkA11y(container);
  });
});

import type { AttachedNFT } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import { AttachedNftPlate } from '../components/AttachedNftPlate';

const mockMetadata = jest.fn();
jest.mock('../../../../../components/attachments/useAttachedNftMetadata', () => ({
  useAttachedNftMetadata: () => mockMetadata(),
}));

jest.mock('../../../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

const nft = {
  RecordId: 1,
  RoundNum: 0,
  DonorAddr: '0xe7eD7F31cd76CeD85861ec5bD37879cBA053e887',
  TokenAddr: '0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f',
  NFTTokenId: 3114,
  NFTTokenURI: 'ipfs://cid/3114',
} as unknown as AttachedNFT;

describe('AttachedNftPlate', () => {
  it('names the NFT from its metadata and links the plate to it', async () => {
    mockMetadata.mockReturnValue({
      isLoading: false,
      data: {
        name: 'Rexy #3114',
        image: 'https://example.org/3114.png',
        external_url: 'https://example.org/rexy/3114',
      },
    });
    const { container } = render(<AttachedNftPlate nft={nft} />);

    expect(screen.getByText('Rexy #3114', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByTestId('nft-image')).toHaveAttribute('src', 'https://example.org/3114.png');
    expect(screen.getByRole('link', { name: 'Attached NFT Rexy #3114' })).toHaveAttribute(
      'href',
      'https://example.org/rexy/3114',
    );
    expect(container).toHaveTextContent('currentCycle.showcase.facts.attachedBy');
    await checkA11y(container);
  });

  it('falls back to the token number and holds a busy plate while metadata loads', () => {
    mockMetadata.mockReturnValue({ isLoading: true, data: undefined });
    render(<AttachedNftPlate nft={nft} />);

    expect(
      screen.getByText('currentCycle.showcase.nftCard.fallbackTitle(id=3114)'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('nft-image')).not.toBeInTheDocument();
  });
});

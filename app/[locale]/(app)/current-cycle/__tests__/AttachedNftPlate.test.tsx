import { networkConfig } from '@/config/networks';
import type { AttachedNFT } from '@/services/api/types';
import { buildOpenSeaAssetUrl } from '@/components/attachments/attachedNftLinks';

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
    // One named link out of the app: where it goes, and that it opens a new tab.
    const external = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('target') === '_blank');
    expect(external).toHaveLength(1);
    // OpenSea, from the recorded contract and token: never the metadata's own site.
    const openSea = buildOpenSeaAssetUrl(nft.TokenAddr, nft.NFTTokenId, networkConfig.chainId);
    expect(external[0]).toHaveAccessibleName('View on OpenSea nav.link.newTab');
    expect(external[0]).toHaveAttribute('href', openSea);
    // The plate goes to the same page for pointers, out of the tab order.
    const plate = container.querySelector('a[aria-hidden="true"]');
    expect(plate).toHaveAttribute('href', openSea);
    expect(plate).toHaveAttribute('tabindex', '-1');
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

  it('names an OpenSea link by its destination when the metadata has no project page', () => {
    mockMetadata.mockReturnValue({
      isLoading: false,
      data: { name: 'Rexy #3114', image: 'https://example.org/3114.png' },
    });
    render(<AttachedNftPlate nft={nft} />);

    const link = screen.getByRole('link', { name: /View on OpenSea/ });
    expect(link).toHaveAccessibleName('View on OpenSea nav.link.newTab');
    expect(link.getAttribute('href')).toMatch(/^https:\/\/(testnets\.)?opensea\.io\/assets\//);
  });
});

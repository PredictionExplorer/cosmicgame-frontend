import '@testing-library/jest-dom';

import type { AttachedNFT } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import { DonatedNFTPrizeShowcase } from '../DonatedNFTPrizeShowcase';

jest.mock('../../nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="nft-image" src={src || '/images/qmark.png'} alt={alt || 'NFT'} />
  ),
}));

const mockUseAttachedNftMetadata = jest.fn();
jest.mock('../useAttachedNftMetadata', () => ({
  useAttachedNftMetadata: (...args: unknown[]) => mockUseAttachedNftMetadata(...args),
}));

const mockUseNFTCollectionEstimate = jest.fn();
jest.mock('../useNFTCollectionEstimate', () => ({
  useNFTCollectionEstimate: (...args: unknown[]) => mockUseNFTCollectionEstimate(...args),
}));

const CONTRACT = '0x1234567890abcdef1234567890abcdef12345678';
const DONOR = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

function createNft(overrides: Partial<AttachedNFT> = {}): AttachedNFT {
  return {
    EvtLogId: 1,
    BlockNum: 1,
    TxId: 1,
    TxHash: '0xhash',
    TimeStamp: 1700000000,
    DateTime: '2023-11-14T00:00:00Z',
    RecordId: 1,
    RoundNum: 42,
    DonorAddr: DONOR,
    TokenAddr: CONTRACT,
    NFTTokenId: 123,
    NFTTokenURI: 'https://metadata.example/123',
    Index: 0,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAttachedNftMetadata.mockReturnValue({
    data: {
      name: 'Chromie Squiggle #123',
      image: 'https://cdn.example/nft.png',
      external_url: 'https://project.example/nft/123',
      collection_name: 'Chromie Squiggle',
      artist: 'Snowfro',
      platform: 'Art Blocks',
      description: 'A long-form generative artwork.',
    },
    isError: false,
  });
  mockUseNFTCollectionEstimate.mockReturnValue({ data: null });
});

describe('DonatedNFTPrizeShowcase', () => {
  it('renders nothing when there are no NFTs', () => {
    const { container } = render(<DonatedNFTPrizeShowcase nfts={[]} cycleNumber={42} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders single NFT winner copy prominently', () => {
    render(<DonatedNFTPrizeShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByText('Bonus NFT attached to this cycle')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The Final Gesture winner receives this attached NFT when Cycle #42 finalizes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Included in Signature Allocation')).toBeInTheDocument();
  });

  it('renders multiple NFT winner copy and count', () => {
    render(
      <DonatedNFTPrizeShowcase
        nfts={[createNft(), createNft({ RecordId: 2, NFTTokenId: 456 })]}
        cycleNumber={42}
      />,
    );

    expect(screen.getByText('Bonus NFTs attached to this cycle')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The Final Gesture winner receives all 2 attached NFTs when Cycle #42 finalizes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('2 ERC-721 tokens')).toBeInTheDocument();
  });

  it('displays metadata image, title, collection, token id, donor, and actions', () => {
    render(<DonatedNFTPrizeShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByAltText('Attached NFT Chromie Squiggle #123')).toHaveAttribute(
      'src',
      'https://cdn.example/nft.png',
    );
    expect(screen.getByText('Chromie Squiggle #123')).toBeInTheDocument();
    expect(screen.getByText('Chromie Squiggle')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: /View NFT/i })
        .some((link) => link.getAttribute('href') === 'https://project.example/nft/123'),
    ).toBe(true);
    expect(screen.getByRole('link', { name: /OpenSea/i })).toHaveAttribute(
      'href',
      expect.stringContaining('testnets.opensea.io/assets/arbitrum-sepolia'),
    );
    expect(screen.getByRole('link', { name: /Explorer/i })).toHaveAttribute(
      'href',
      expect.stringContaining(CONTRACT),
    );
    expect(screen.getByRole('link', { name: /0xabcd/i })).toHaveAttribute('href', `/user/${DONOR}`);
  });

  it('falls back to OpenSea as the primary action when project link is unavailable', () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: {
        name: 'No Project URL',
        image: 'https://cdn.example/nft.png',
      },
      isError: false,
    });

    render(<DonatedNFTPrizeShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(
      screen
        .getAllByRole('link', { name: /View on OpenSea/i })
        .some((link) =>
          link.getAttribute('href')?.includes('testnets.opensea.io/assets/arbitrum-sepolia'),
        ),
    ).toBe(true);
  });

  it('keeps the prize visible when metadata fails', () => {
    mockUseAttachedNftMetadata.mockReturnValue({ data: null, isError: true });

    render(<DonatedNFTPrizeShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByAltText('Attached NFT prize')).toHaveAttribute('src', '/images/qmark.png');
    expect(screen.getByText('NFT #123')).toBeInTheDocument();
    expect(
      screen.getByText('Metadata unavailable. The attached NFT is still part of the cycle prize.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /View on OpenSea/i }).length).toBeGreaterThan(0);
  });

  it('handles missing token id without hiding the card', () => {
    render(
      <DonatedNFTPrizeShowcase
        nfts={[createNft({ NFTTokenId: undefined, TokenId: undefined })]}
        cycleNumber={42}
      />,
    );

    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /OpenSea/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorer/i })).toBeInTheDocument();
  });

  it('shows floor estimate only when available and labels it as approximate', () => {
    mockUseNFTCollectionEstimate.mockReturnValue({
      data: {
        floorPriceEth: 0.42,
        currency: 'ETH',
        source: 'Reservoir',
        updatedAt: '2026-05-25T00:00:00.000Z',
        confidence: 'collection-floor',
      },
    });

    render(<DonatedNFTPrizeShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByText(/Floor ~0.420 ETH/)).toBeInTheDocument();
  });

  it('limits the preview to four NFTs and links users to full details copy', () => {
    const nfts = Array.from({ length: 6 }, (_, index) =>
      createNft({ RecordId: index + 1, NFTTokenId: index + 1 }),
    );

    render(<DonatedNFTPrizeShowcase nfts={nfts} cycleNumber={42} />);

    expect(screen.getAllByTestId('nft-image')).toHaveLength(4);
    expect(
      screen.getByText('Plus 2 more attached NFTs in the full cycle details.'),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedNFTPrizeShowcase nfts={[createNft()]} cycleNumber={42} />);
    await checkA11y(container);
  });
});

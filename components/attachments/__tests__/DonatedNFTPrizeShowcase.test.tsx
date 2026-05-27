import '@testing-library/jest-dom';

import type { AttachedNFT, DonatedERC20Token } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import { AttachedNFTAllocationShowcase } from '../DonatedNFTPrizeShowcase';

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

const mockUseAttachedErc20Metadata = jest.fn();
jest.mock('../useAttachedErc20Metadata', () => ({
  useAttachedErc20Metadata: (...args: unknown[]) => mockUseAttachedErc20Metadata(...args),
}));

const CONTRACT = '0x1234567890abcdef1234567890abcdef12345678';
const CONTRIBUTOR = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const ERC20_CONTRACT = '0x2222222222222222222222222222222222222222';

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
    DonorAddr: CONTRIBUTOR,
    TokenAddr: CONTRACT,
    NFTTokenId: 123,
    NFTTokenURI: 'https://metadata.example/123',
    Index: 0,
    ...overrides,
  };
}

function createErc20(overrides: Partial<DonatedERC20Token> = {}): DonatedERC20Token {
  return {
    EvtLogId: 101,
    BlockNum: 1,
    TxId: 1,
    TxHash: '0xerc20hash',
    TimeStamp: 1700000000,
    DateTime: '2023-11-14T00:00:00Z',
    RoundNum: 42,
    TokenAddr: ERC20_CONTRACT,
    AmountDonatedEth: 1250.5,
    AmountClaimedEth: 0,
    WinnerAddr: '',
    DonorAddr: CONTRIBUTOR,
    Claimed: false,
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
  mockUseAttachedErc20Metadata.mockReturnValue({
    data: {
      name: 'Galaxy Credits',
      symbol: 'GLXY',
      decimals: 18,
    },
  });
  mockUseNFTCollectionEstimate.mockReturnValue({ data: null });
});

describe('AttachedNFTAllocationShowcase', () => {
  it('renders nothing when there are no attached assets', () => {
    const { container } = render(<AttachedNFTAllocationShowcase nfts={[]} cycleNumber={42} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders single NFT allocation copy prominently', () => {
    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByText('Bonus assets attached to this cycle')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The Final Gesture participant receives the attached NFT when Cycle #42 finalizes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Included in Signature Allocation')).toBeInTheDocument();
  });

  it('renders multiple NFT allocation copy and count', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft(), createNft({ RecordId: 2, NFTTokenId: 456 })]}
        cycleNumber={42}
      />,
    );

    expect(screen.getByText('Bonus assets attached to this cycle')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The Final Gesture participant receives all 2 attached NFTs when Cycle #42 finalizes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('2 ERC-721 tokens')).toBeInTheDocument();
  });

  it('renders ERC20-only allocation copy, amount, metadata, and explorer action', () => {
    render(
      <AttachedNFTAllocationShowcase nfts={[]} erc20Tokens={[createErc20()]} cycleNumber={42} />,
    );

    expect(screen.getByText('Bonus assets attached to this cycle')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The Final Gesture participant receives the attached ERC20 token deposit when Cycle #42 finalizes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('1 ERC-20 deposit')).toBeInTheDocument();
    expect(screen.getByText('1250.5 GLXY')).toBeInTheDocument();
    expect(screen.getByText('Galaxy Credits')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View GLXY token/i })).toHaveAttribute(
      'href',
      expect.stringContaining(ERC20_CONTRACT),
    );
  });

  it('renders mixed NFT and ERC20 allocation copy with combined counts', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft(), createNft({ RecordId: 2, NFTTokenId: 456 })]}
        erc20Tokens={[createErc20(), createErc20({ EvtLogId: 102, AmountDonatedEth: 5 })]}
        cycleNumber={42}
      />,
    );

    expect(
      screen.getByText(
        'The Final Gesture participant receives all 2 attached NFTs and all 2 attached ERC20 token deposits when Cycle #42 finalizes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('2 ERC-721 tokens + 2 ERC-20 deposits')).toBeInTheDocument();
    expect(screen.getByText('1250.5 GLXY')).toBeInTheDocument();
    expect(screen.getByText('5 GLXY')).toBeInTheDocument();
  });

  it('displays metadata image, title, collection, token id, contributor, and actions', () => {
    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

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
    expect(screen.getByRole('link', { name: /0xabcd/i })).toHaveAttribute(
      'href',
      `/user/${CONTRIBUTOR}`,
    );
  });

  it('falls back to OpenSea as the primary action when project link is unavailable', () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: {
        name: 'No Project URL',
        image: 'https://cdn.example/nft.png',
      },
      isError: false,
    });

    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(
      screen
        .getAllByRole('link', { name: /View on OpenSea/i })
        .some((link) =>
          link.getAttribute('href')?.includes('testnets.opensea.io/assets/arbitrum-sepolia'),
        ),
    ).toBe(true);
  });

  it('keeps the allocation visible when metadata fails', () => {
    mockUseAttachedNftMetadata.mockReturnValue({ data: null, isError: true });

    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByAltText('Attached NFT allocation')).toHaveAttribute(
      'src',
      '/images/qmark.png',
    );
    expect(screen.getByText('NFT #123')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Metadata unavailable. The attached NFT is still part of this cycle allocation.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /View on OpenSea/i }).length).toBeGreaterThan(0);
  });

  it('handles missing token id without hiding the card', () => {
    render(
      <AttachedNFTAllocationShowcase
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

    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByText(/Floor ~0.420 ETH/)).toBeInTheDocument();
  });

  it('limits the preview to four NFTs and links users to full details copy', () => {
    const nfts = Array.from({ length: 6 }, (_, index) =>
      createNft({ RecordId: index + 1, NFTTokenId: index + 1 }),
    );

    render(<AttachedNFTAllocationShowcase nfts={nfts} cycleNumber={42} />);

    expect(screen.getAllByTestId('nft-image')).toHaveLength(4);
    expect(
      screen.getByText('Plus 2 more attached NFTs in the full cycle details.'),
    ).toBeInTheDocument();
  });

  it('limits the ERC20 preview and links users to full details copy', () => {
    const tokens = Array.from({ length: 6 }, (_, index) =>
      createErc20({ EvtLogId: index + 1, AmountDonatedEth: index + 1 }),
    );

    render(<AttachedNFTAllocationShowcase nfts={[]} erc20Tokens={tokens} cycleNumber={42} />);

    expect(screen.getAllByText('ERC20')).toHaveLength(4);
    expect(
      screen.getByText('Plus 2 more attached ERC20 token deposits in the full cycle details.'),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft()]}
        erc20Tokens={[createErc20()]}
        cycleNumber={42}
      />,
    );
    await checkA11y(container);
  });
});

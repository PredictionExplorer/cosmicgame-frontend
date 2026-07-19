import '@testing-library/jest-dom';

import { networkConfig } from '@/config/networks';
import type { AttachedNFT, DonatedERC20Token } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { buildOpenSeaAssetUrl } from '../attachedNftLinks';
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

function expectSingleRecipientRuleSummary() {
  expect(screen.getAllByText('currentCycle.showcase.summary.recipientRule')).toHaveLength(1);
  expect(screen.getAllByText('currentCycle.showcase.summary.recipientRuleValue')).toHaveLength(1);

  const recipientRuleChip = screen
    .getByText('currentCycle.showcase.summary.recipientRule')
    .closest('div');
  expect(recipientRuleChip).not.toBeNull();
  expect(
    within(recipientRuleChip as HTMLElement).getByText(
      'currentCycle.showcase.summary.recipientRuleValue',
    ),
  ).toBeInTheDocument();
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
      logoURI: 'https://cdn.example/glxy.png',
      logoSource: 'Token List',
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

    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByText('currentCycle.showcase.heading')).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.description.nftOnly(nftCount=1,cycle=42)'),
    ).toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.badge')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.bonusReceipt.label')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.summary.previewAll')).toBeInTheDocument();
    expectSingleRecipientRuleSummary();
  });

  it('supports a compact rail variant for the large-screen chat companion stack', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft(), createNft({ RecordId: 2, NFTTokenId: 456 })]}
        erc20Tokens={[createErc20()]}
        cycleNumber={42}
        variant="rail"
        className="rail-assets"
      />,
    );

    const showcase = screen.getByTestId('attached-nft-showcase');
    expect(showcase).toHaveAttribute('data-variant', 'rail');
    expect(showcase).toHaveClass('my-0', 'rail-assets');
    expect(showcase).not.toHaveClass('my-8');
    expect(
      screen.getByText('currentCycle.showcase.bonusReceipt.mixed(nftCount=2,erc20Count=1)'),
    ).toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.heading')).toBeInTheDocument();
    expect(screen.getAllByTestId('nft-allocation-media')).toHaveLength(2);
    expect(screen.getByTestId('erc20-attached-amount')).toHaveTextContent('1250.5 GLXY');
    expectSingleRecipientRuleSummary();
  });

  it('renders multiple NFT allocation copy and count', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft(), createNft({ RecordId: 2, NFTTokenId: 456 })]}
        cycleNumber={42}
      />,
    );

    expect(screen.getByText('currentCycle.showcase.heading')).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.description.nftOnly(nftCount=2,cycle=42)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.bonusReceipt.nftOnly(nftCount=2)'),
    ).toBeInTheDocument();
    expectSingleRecipientRuleSummary();
  });

  it('renders ERC20-only allocation copy, amount, metadata, and explorer action', () => {
    render(
      <AttachedNFTAllocationShowcase nfts={[]} erc20Tokens={[createErc20()]} cycleNumber={42} />,
    );

    expect(screen.getByText('currentCycle.showcase.heading')).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.description.erc20Only(erc20Count=1,cycle=42)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.bonusReceipt.erc20Only(erc20Count=1)'),
    ).toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.erc20Card.badge')).toBeInTheDocument();
    const amount = screen.getByTestId('erc20-attached-amount');
    expect(amount).toHaveTextContent('1250.5 GLXY');
    expect(amount.className).toContain('shadow-[0_0_70px_-34px');
    expect(amount.querySelector('span')?.className).toContain('text-transparent');
    expect(screen.getByText('Galaxy Credits')).toBeInTheDocument();
    expect(screen.queryByText('Pending finalization')).not.toBeInTheDocument();
    expect(screen.queryByText('Retrieved')).not.toBeInTheDocument();
    expect(
      screen.getByAltText('currentCycle.showcase.erc20Card.logoAlt(token=GLXY)'),
    ).toHaveAttribute('src', 'https://cdn.example/glxy.png');
    expect(
      screen.getByRole('link', { name: 'currentCycle.showcase.erc20Card.viewToken(symbol=GLXY)' }),
    ).toHaveAttribute('href', expect.stringContaining(ERC20_CONTRACT));
    expectSingleRecipientRuleSummary();
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
      screen.getByText('currentCycle.showcase.description.mixed(nftCount=2,erc20Count=2,cycle=42)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.bonusReceipt.mixed(nftCount=2,erc20Count=2)'),
    ).toBeInTheDocument();
    const amounts = screen.getAllByTestId('erc20-attached-amount');
    expect(amounts).toHaveLength(2);
    expect(amounts[0]).toHaveTextContent('1250.5 GLXY');
    expect(amounts[1]).toHaveTextContent('5 GLXY');
    expectSingleRecipientRuleSummary();
  });

  it('does not show ERC20 lifecycle status copy even when the token has been retrieved', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[]}
        erc20Tokens={[createErc20({ Claimed: true, WinnerAddr: CONTRIBUTOR })]}
        cycleNumber={42}
      />,
    );

    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Pending finalization')).not.toBeInTheDocument();
    expect(screen.queryByText('Retrieved')).not.toBeInTheDocument();
    expect(screen.queryByText('Recipient')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /0xabcd/i })).toHaveLength(1);
    expect(screen.getByTestId('erc20-attached-amount')).toHaveTextContent('1250.5 GLXY');
  });

  it('keeps recipient copy at the section level instead of repeating it per asset card', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft()]}
        erc20Tokens={[createErc20()]}
        cycleNumber={42}
      />,
    );

    expect(
      screen.getByText('currentCycle.showcase.description.mixed(nftCount=1,erc20Count=1,cycle=42)'),
    ).toBeInTheDocument();
    expectSingleRecipientRuleSummary();
    expect(screen.queryByTestId('recipient-receives-badge')).not.toBeInTheDocument();
    expect(screen.queryByText('Recipient receives')).not.toBeInTheDocument();
    expect(screen.queryByText('Recipient')).not.toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.facts.tokenId')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.showcase.facts.token')).toBeInTheDocument();
    expect(screen.getAllByText('currentCycle.showcase.facts.attachedBy')).toHaveLength(2);
  });

  it('displays metadata image, title, collection, token id, contributor, and actions', () => {
    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(
      screen.getByAltText('currentCycle.showcase.nftCard.imageAlt(name=Chromie Squiggle #123)'),
    ).toHaveAttribute('src', 'https://cdn.example/nft.png');
    expect(screen.getByText('Chromie Squiggle #123')).toBeInTheDocument();
    expect(screen.getByText('Chromie Squiggle')).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.facts.tokenIdValue(id=123)'),
    ).toBeInTheDocument();
    expectSingleRecipientRuleSummary();
    expect(
      screen
        .getAllByRole('link', { name: /showcase\.nftCard\.links\.project/ })
        .some((link) => link.getAttribute('href') === 'https://project.example/nft/123'),
    ).toBe(true);
    expect(
      screen.getByRole('link', { name: 'currentCycle.showcase.nftCard.openSea' }),
    ).toHaveAttribute('href', buildOpenSeaAssetUrl(CONTRACT, 123, networkConfig.chainId));
    expect(
      screen.getByRole('link', { name: 'currentCycle.showcase.nftCard.explorer' }),
    ).toHaveAttribute('href', expect.stringContaining(CONTRACT));
    expect(screen.getByRole('link', { name: /0xabcd/i })).toHaveAttribute(
      'href',
      `/user/${CONTRIBUTOR}`,
    );
  });

  it('uses the same bounded NFT media layout for featured and regular NFT cards', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[
          createNft({ RecordId: 1, NFTTokenId: 123 }),
          createNft({ RecordId: 2, NFTTokenId: 456 }),
        ]}
        cycleNumber={42}
      />,
    );

    const media = screen.getAllByTestId('nft-allocation-media');
    expect(media).toHaveLength(2);
    expect(new Set(media.map((element) => element.className)).size).toBe(1);
    media.forEach((element) => {
      expect(element.className).toContain('aspect-[4/3]');
      expect(element.className).toContain('max-h-[420px]');
      expect(element.className).toContain('max-w-3xl');
    });
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
        .getAllByRole('link', { name: /showcase\.nftCard\.links\.opensea/ })
        .some(
          (link) =>
            link.getAttribute('href') ===
            buildOpenSeaAssetUrl(CONTRACT, 123, networkConfig.chainId),
        ),
    ).toBe(true);
  });

  it('keeps the allocation visible when metadata fails', () => {
    mockUseAttachedNftMetadata.mockReturnValue({ data: null, isError: true });

    render(<AttachedNFTAllocationShowcase nfts={[createNft()]} cycleNumber={42} />);

    expect(screen.getByAltText('currentCycle.showcase.nftCard.imageAltFallback')).toHaveAttribute(
      'src',
      '/images/qmark.png',
    );
    expect(
      screen.getByText('currentCycle.showcase.nftCard.fallbackTitle(id=123)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.nftCard.metadataUnavailable'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /showcase\.nftCard\.links\.opensea/ }).length,
    ).toBeGreaterThan(0);
  });

  it('handles missing token id without hiding the card', () => {
    render(
      <AttachedNFTAllocationShowcase
        nfts={[createNft({ NFTTokenId: undefined, TokenId: undefined })]}
        cycleNumber={42}
      />,
    );

    expect(screen.getByText('currentCycle.showcase.facts.unknown')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'currentCycle.showcase.nftCard.openSea' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'currentCycle.showcase.nftCard.explorer' }),
    ).toBeInTheDocument();
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

    expect(
      screen.getByText('currentCycle.showcase.nftCard.floorEstimate(price=0.420,currency=ETH)'),
    ).toBeInTheDocument();
  });

  it('limits the preview to four NFTs and links users to full details copy', () => {
    const nfts = Array.from({ length: 6 }, (_, index) =>
      createNft({ RecordId: index + 1, NFTTokenId: index + 1 }),
    );

    render(<AttachedNFTAllocationShowcase nfts={nfts} cycleNumber={42} />);

    expect(screen.getAllByTestId('nft-image')).toHaveLength(4);
    expect(
      screen.getByText('currentCycle.showcase.remainder.nftOnly(nftCount=2)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.summary.previewCount(visible=4,total=6)'),
    ).toBeInTheDocument();
    expectSingleRecipientRuleSummary();
  });

  it('limits the ERC20 preview and links users to full details copy', () => {
    const tokens = Array.from({ length: 6 }, (_, index) =>
      createErc20({ EvtLogId: index + 1, AmountDonatedEth: index + 1 }),
    );

    render(<AttachedNFTAllocationShowcase nfts={[]} erc20Tokens={tokens} cycleNumber={42} />);

    expect(
      screen.getAllByAltText('currentCycle.showcase.erc20Card.logoAlt(token=GLXY)'),
    ).toHaveLength(4);
    expect(
      screen.getByText('currentCycle.showcase.remainder.erc20Only(erc20Count=2)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('currentCycle.showcase.summary.previewCount(visible=4,total=6)'),
    ).toBeInTheDocument();
    expectSingleRecipientRuleSummary();
  });

  it('falls back to a generated ERC20 badge when logo metadata is unavailable', () => {
    mockUseAttachedErc20Metadata.mockReturnValue({
      data: {
        name: 'Galaxy Credits',
        symbol: 'GLXY',
        decimals: 18,
      },
    });

    render(
      <AttachedNFTAllocationShowcase nfts={[]} erc20Tokens={[createErc20()]} cycleNumber={42} />,
    );

    expect(
      screen.queryByAltText('currentCycle.showcase.erc20Card.logoAlt(token=GLXY)'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('GLXY').length).toBeGreaterThan(0);
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

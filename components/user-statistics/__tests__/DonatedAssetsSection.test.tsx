import { fireEvent, render, screen, checkA11y } from '@/test-utils';

import { DonatedAssetsSection, type DonatedAssetsSectionProps } from '../DonatedAssetsSection';

// The one retrieval ledger per asset kind, shared with My Allocations.
jest.mock('../../winnings/AttachedRetrievalTables', () => ({
  AttachedNftRetrievalTable: ({
    rows,
    onRetrieve,
  }: {
    rows: { Index: number; Claimed?: boolean }[];
    onRetrieve?: (index: number) => void;
  }) => (
    <div data-testid="attached-nft-table" data-can-retrieve={Boolean(onRetrieve)}>
      nfts: {rows.length}, retrieved: {rows.filter((row) => row.Claimed).length}
    </div>
  ),
  AttachedTokenRetrievalTable: ({
    rows,
    onRetrieve,
  }: {
    rows: unknown[];
    onRetrieve?: (row: unknown) => void;
  }) => (
    <div data-testid="attached-erc20-table">
      tokens: {rows.length}
      {onRetrieve ? (
        <button type="button" onClick={() => onRetrieve(rows[0])}>
          retrieve first token
        </button>
      ) : null}
    </div>
  ),
}));

let mockWalletChainId: number | undefined;
jest.mock('wagmi', () => ({
  ...jest.requireActual('../../../__mocks__/wagmi'),
  useConnection: () => ({
    address: mockWalletChainId ? '0xUser' : undefined,
    isConnected: mockWalletChainId !== undefined,
    chainId: mockWalletChainId,
    status: mockWalletChainId ? 'connected' : 'disconnected',
  }),
}));

beforeEach(() => {
  mockWalletChainId = undefined;
});

const noop = () => {};

const defaultProps: DonatedAssetsSectionProps = {
  unclaimedNFTs: [],
  claimedNFTs: [],
  donatedERC20: [],
  loadingNFTs: false,
  loadingERC20: false,
  canClaim: true,
  isClaiming: false,
  claimingDonatedNFTs: [],
  onClaimNFT: noop,
  onClaimAllNFTs: noop,
  onClaimERC20: noop,
  onClaimAllERC20: noop,
};

describe('DonatedAssetsSection', () => {
  it('renders both section headings', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(screen.getByText('myPages.statistics.donatedAssets.nfts.title')).toBeInTheDocument();
    expect(screen.getByText('myPages.statistics.donatedAssets.erc20.title')).toBeInTheDocument();
  });

  it('shows skeleton loading for NFTs', () => {
    render(<DonatedAssetsSection {...defaultProps} loadingNFTs={true} />);
    expect(
      screen.getAllByRole('status', { name: 'tables.skeleton.loadingRows' }).length,
    ).toBeGreaterThan(0);
  });

  it('shows skeleton loading for ERC20', () => {
    render(<DonatedAssetsSection {...defaultProps} loadingERC20={true} />);
    expect(
      screen.getAllByRole('status', { name: 'tables.skeleton.loadingRows' }).length,
    ).toBeGreaterThan(0);
  });

  it('shows empty state when no attached NFTs', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(
      screen.getByText('myPages.statistics.donatedAssets.nfts.emptyTitle'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no attached ERC20 tokens', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(
      screen.getByText('myPages.statistics.donatedAssets.erc20.emptyTitle'),
    ).toBeInTheDocument();
  });

  it('renders Claim All NFTs button when unclaimed NFTs exist', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} />);
    expect(screen.getByText('myPages.statistics.donatedAssets.nfts.claimAll')).toBeInTheDocument();
  });

  it('renders unclaimed badge for NFTs', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} />);
    expect(
      screen.getByText('myPages.statistics.donatedAssets.nfts.unclaimed(count=1)'),
    ).toBeInTheDocument();
  });

  it('renders Claim All Tokens button when unclaimed ERC20 exist', () => {
    const token = {
      RoundNum: 1,
      TokenAddr: '0x123',
      AmountDonatedEth: '1.0',
      Claimed: false,
    } as unknown as DonatedAssetsSectionProps['donatedERC20'][0];
    render(<DonatedAssetsSection {...defaultProps} donatedERC20={[token]} />);
    expect(screen.getByText('myPages.statistics.donatedAssets.erc20.claimAll')).toBeInTheDocument();
  });

  it('offers the network switch instead of Retrieve all on another chain', () => {
    mockWalletChainId = 8453;
    const nft = { RecordId: 1, Index: 0, TokenId: 1, TokenAddr: '0xabc', RoundNum: 1 };
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft] as never[]} />);
    expect(
      screen.queryByText('myPages.statistics.donatedAssets.nfts.claimAll'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wallet\.network\.switchTo/ })).toBeInTheDocument();
  });

  it('hides claim buttons when canClaim is false', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} canClaim={false} />);
    expect(
      screen.queryByText('myPages.statistics.donatedAssets.nfts.claimAll'),
    ).not.toBeInTheDocument();
  });

  it('lists retrieved and waiting NFTs in the one retrieval ledger', () => {
    const nft = (Index: number) =>
      ({
        Index,
        RecordId: String(Index),
      }) as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(
      <DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft(0)]} claimedNFTs={[nft(1)]} />,
    );
    expect(screen.getByTestId('attached-nft-table')).toHaveTextContent('nfts: 2, retrieved: 1');
    expect(screen.getByTestId('attached-nft-table')).toHaveAttribute('data-can-retrieve', 'true');
  });

  it('retrieves a token with its raw amount, and only on the owner’s profile', () => {
    const onClaimERC20 = jest.fn();
    const token = {
      RoundNum: 7,
      TokenAddr: '0xabc',
      DonateClaimDiff: '1999999999999999994000',
      DonateClaimDiffEth: '2000',
      Claimed: false,
    } as unknown as DonatedAssetsSectionProps['donatedERC20'][0];
    const { rerender } = render(
      <DonatedAssetsSection {...defaultProps} donatedERC20={[token]} onClaimERC20={onClaimERC20} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'retrieve first token' }));
    expect(onClaimERC20).toHaveBeenCalledWith(7, '0xabc', '1999999999999999994000');

    rerender(
      <DonatedAssetsSection
        {...defaultProps}
        donatedERC20={[token]}
        onClaimERC20={onClaimERC20}
        canClaim={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'retrieve first token' })).not.toBeInTheDocument();
  });

  it('says a failed NFT read failed, with a retry, and hides Retrieve all', () => {
    const onRetryNFTs = jest.fn();
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(
      <DonatedAssetsSection
        {...defaultProps}
        unclaimedNFTs={[nft]}
        nftsError
        onRetryNFTs={onRetryNFTs}
      />,
    );
    expect(
      screen.queryByText('myPages.statistics.donatedAssets.nfts.emptyTitle'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('myPages.statistics.donatedAssets.nfts.claimAll'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('myPages.statistics.page.sectionLoadErrorTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(onRetryNFTs).toHaveBeenCalledTimes(1);
  });

  it('says a failed ERC-20 read failed instead of "no tokens"', () => {
    render(<DonatedAssetsSection {...defaultProps} erc20Error onRetryERC20={noop} />);
    expect(
      screen.queryByText('myPages.statistics.donatedAssets.erc20.emptyTitle'),
    ).not.toBeInTheDocument();
    // The NFT list answered, so it keeps its own (empty) state.
    expect(
      screen.getByText('myPages.statistics.donatedAssets.nfts.emptyTitle'),
    ).toBeInTheDocument();
    expect(screen.getByText('myPages.statistics.page.sectionLoadErrorTitle')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedAssetsSection {...defaultProps} />);
    await checkA11y(container);
  });
});

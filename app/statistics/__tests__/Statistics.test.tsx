import { checkA11y, render, screen } from '@/test-utils';

import Statistics from '../Statistics';

/* ── useApiQuery hooks ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest
  .fn()
  .mockReturnValue({ data: undefined, isLoading: false, isError: false });
const mockUseBidListByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueBidders = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueWinners = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueCSTStakers = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueRWLKStakers = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueDonors = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsNFTList = jest.fn().mockReturnValue({ data: undefined });
const mockUseCSTDistribution = jest.fn().mockReturnValue({ data: undefined });
const mockUseCTBalancesDistribution = jest.fn().mockReturnValue({ data: undefined });
const mockUseStakingCSTActions = jest.fn().mockReturnValue({ data: undefined });
const mockUseStakingRWLKActions = jest.fn().mockReturnValue({ data: undefined });
const mockUseStakedCSTTokensGlobal = jest.fn().mockReturnValue({ data: undefined });
const mockUseStakedRWLKTokensGlobal = jest.fn().mockReturnValue({ data: undefined });
const mockUseSystemModelist = jest.fn().mockReturnValue({ data: undefined });
const mockUseCTPrice = jest.fn().mockReturnValue({ data: undefined });

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useBidListByRound: (...args: unknown[]) => mockUseBidListByRound(...args),
  useUniqueBidders: (...args: unknown[]) => mockUseUniqueBidders(...args),
  useUniqueWinners: (...args: unknown[]) => mockUseUniqueWinners(...args),
  useUniqueCSTStakers: (...args: unknown[]) => mockUseUniqueCSTStakers(...args),
  useUniqueRWLKStakers: (...args: unknown[]) => mockUseUniqueRWLKStakers(...args),
  useUniqueDonors: (...args: unknown[]) => mockUseUniqueDonors(...args),
  useDonationsNFTList: (...args: unknown[]) => mockUseDonationsNFTList(...args),
  useCSTDistribution: (...args: unknown[]) => mockUseCSTDistribution(...args),
  useCTBalancesDistribution: (...args: unknown[]) => mockUseCTBalancesDistribution(...args),
  useStakingCSTActions: (...args: unknown[]) => mockUseStakingCSTActions(...args),
  useStakingRWLKActions: (...args: unknown[]) => mockUseStakingRWLKActions(...args),
  useStakedCSTTokensGlobal: (...args: unknown[]) => mockUseStakedCSTTokensGlobal(...args),
  useStakedRWLKTokensGlobal: (...args: unknown[]) => mockUseStakedRWLKTokensGlobal(...args),
  useSystemModelist: (...args: unknown[]) => mockUseSystemModelist(...args),
  useCTPrice: (...args: unknown[]) => mockUseCTPrice(...args),
}));

/* ── next/link ──────────────────────────────────────────────────── */

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

/* ── child components (stub heavy tables/charts) ────────────────── */

jest.mock('../../../components/tables/BiddingHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="bidding-history-table" />,
}));
jest.mock('../../../components/tables/UniqueBiddersTable', () => ({
  UniqueBiddersTable: () => <div data-testid="unique-bidders-table" />,
  Bidder: undefined,
}));
jest.mock('../../../components/tables/UniqueWinnersTable', () => ({
  UniqueWinnersTable: () => <div data-testid="unique-winners-table" />,
  Recipient: undefined,
}));
jest.mock('../../../components/tables/UniqueEthDonorsTable', () => ({
  UniqueEthDonorsTable: () => <div data-testid="unique-eth-donors-table" />,
  UniqueEthDonor: undefined,
}));
jest.mock('../../../components/tables/UniqueStakersCSTTable', () => ({
  UniqueStakersCSTTable: () => <div data-testid="unique-stakers-cst-table" />,
  UniqueStakerCST: undefined,
}));
jest.mock('../../../components/tables/UniqueStakersRWLKTable', () => ({
  UniqueStakersRWLKTable: () => <div data-testid="unique-stakers-rwlk-table" />,
  UniqueStakerRWLK: undefined,
}));
jest.mock('../../../components/tables/SystemModesTable', () => ({
  SystemModesTable: () => <div data-testid="system-modes-table" />,
  EventRow: undefined,
}));
jest.mock('../../../components/donations/DonatedNFT', () => ({
  __esModule: true,
  default: () => <div data-testid="donated-nft" />,
}));
jest.mock('../../../components/donations/DonatedNFTDistributionTable', () => ({
  __esModule: true,
  default: () => <div data-testid="donated-nft-distribution-table" />,
}));
jest.mock('../../../components/tokens/CSTokenDistributionTable', () => ({
  CSTokenDistributionTable: () => <div data-testid="cs-token-distribution-table" />,
}));
jest.mock('../../../components/tokens/CTBalanceDistributionTable', () => ({
  CTBalanceDistributionTable: () => <div data-testid="ct-balance-distribution-table" />,
}));
jest.mock('../../../components/tokens/CTBalanceDistributionChart', () => ({
  CTBalanceDistributionChart: () => <div data-testid="ct-balance-distribution-chart" />,
}));
jest.mock('../../../components/statistics/StatisticsItem', () => ({
  StatisticsItem: ({
    title,
    value,
    tooltip,
  }: {
    title: string;
    value: React.ReactNode;
    tooltip?: string;
  }) => (
    <div data-testid="statistics-item">
      <span>{title}</span>
      <span>{value}</span>
      {tooltip && <span data-testid="stat-tooltip">{tooltip}</span>}
    </div>
  ),
  CountdownRenderer: () => <span data-testid="countdown-renderer" />,
}));
jest.mock('../../../components/statistics/StakingSection', () => ({
  StakingSection: () => (
    <div data-testid="staking-section">
      <span>CosmicSignature Token</span>
      <span>RandomWalk Token</span>
      <span>Number of Active Stakers</span>
    </div>
  ),
}));
jest.mock('../../../components/statistics/DonatedNFTsGrid', () => ({
  DonatedNFTsGrid: ({ nftDonations }: { nftDonations: unknown[] }) => (
    <div data-testid="donated-nfts-grid">
      {nftDonations.length === 0 && <p>No NFTs have been donated yet.</p>}
    </div>
  ),
}));
jest.mock('../../../components/statistics/StatisticsGroup', () => ({
  StatisticsGroup: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="statistics-group">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
jest.mock('../../../components/statistics/CollapsibleSection', () => ({
  CollapsibleSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-section">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
jest.mock('../../../config/misc', () => ({
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
}));

jest.mock('react-countdown', () => ({
  __esModule: true,
  default: () => <span data-testid="countdown" />,
}));

jest.mock('viem', () => ({
  formatEther: (v: bigint) => (Number(v) / 1e18).toString(),
}));

beforeEach(() => jest.clearAllMocks());

/* ── helpers ────────────────────────────────────────────────────── */

const makeDashboardData = (overrides = {}) => ({
  CurRoundNum: 5,
  CurNumBids: 42,
  LastBidderAddr: '0xBidder',
  BidPriceEth: 0.01,
  PrizeAmountEth: 1.5,
  PrizeClaimTs: 0,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  TotalPrizes: 12,
  TotalPrizeAwards: 370,
  CgPrizeRowCount: 381,
  TotalPrizesPaidAmountEth: '2.5',
  NumRwalkTokensUsed: 3,
  CharityBalanceEth: '0.5',
  NumDonatedNFTs: 7,
  CosmicGameBalanceEth: 5.0,
  SumVoluntaryDonationsEth: '0',
  NumVoluntaryDonations: 0,
  MainStats: {
    NumCSTokenMints: 100,
    TotalRaffleEthDeposits: 1.0,
    TotalCSTConsumedEth: 50.0,
    TotalMktRewardsEth: 10.0,
    NumMktRewards: 5,
    TotalRaffleEthWithdrawn: 0.5,
    NumBidsCST: 20,
    NumUniqueBidders: 15,
    NumUniqueRecipients: 8,
    NumUniqueDonors: 6,
    TotalNamedTokens: 12,
    NumUniqueStakersCST: 4,
    NumUniqueStakersRWalk: 3,
    DonatedTokenDistribution: [],
    NumRecipientsWithPendingRaffleWithdrawal: 0,
    NumCosmicGameDonations: 0,
    SumCosmicGameDonationsEth: 0,
    NumWithdrawals: 0,
    SumWithdrawals: 0,
    TotalEthDonatedAmountEth: 0.1,
    StakeStatisticsCST: {
      NumActiveStakers: 2,
      NumDeposits: 5,
      TotalRewardEth: 0.1,
      TotalTokensMinted: 50,
      TotalTokensStaked: 20,
      UnclaimedRewardEth: 0.05,
    },
    StakeStatisticsRWalk: {
      NumActiveStakers: 1,
      TotalTokensMinted: 30,
      TotalTokensStaked: 10,
    },
  },
  CurRoundStats: { TotalDonatedNFTs: 3, TotalDonatedAmountEth: 0.5 },
  ...overrides,
});

/* ── Tests ──────────────────────────────────────────────────────── */

describe('Statistics', () => {
  it('shows loading state when dashboard is loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<Statistics />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state when query fails', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<Statistics />);
    expect(screen.getByText(/Failed to load statistics/)).toBeInTheDocument();
  });

  it('shows error state when data is null after loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false, isError: false });
    render(<Statistics />);
    expect(screen.getByText(/Failed to load statistics/)).toBeInTheDocument();
  });

  it('renders page header and key stat cards', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByRole('heading', { name: 'Statistics', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Total Cycles')).toBeInTheDocument();
    const roundValues = screen.getAllByText('5');
    expect(roundValues.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Allocations Distributed')).toBeInTheDocument();
    expect(screen.getAllByText('381').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Financial Overview section with grouped stats', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    expect(screen.getByText('Allocation Economy')).toBeInTheDocument();
    expect(screen.getByText('Token Economy')).toBeInTheDocument();
    expect(screen.getByText('Public Goods & Contributions')).toBeInTheDocument();
  });

  it('renders link to current round page', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Looking for current cycle data?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /current cycle data/ })).toHaveAttribute(
      'href',
      '/current-round',
    );
  });

  it('renders Community & Participation section with summary cards', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Community & Participation')).toBeInTheDocument();
    expect(screen.getAllByText('Unique Participants').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Unique Recipients').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Unique ETH Contributors').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Unique Anchor-holders')).toBeInTheDocument();
  });

  it('renders participant tables inside collapsible sections', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByTestId('unique-bidders-table')).toBeInTheDocument();
    expect(screen.getByTestId('unique-winners-table')).toBeInTheDocument();
    expect(screen.getByTestId('unique-eth-donors-table')).toBeInTheDocument();
  });

  it('renders staking section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('CosmicSignature Token')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk Token')).toBeInTheDocument();
  });

  it('renders CST staking statistics', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    const activeStakersLabels = screen.getAllByText('Number of Active Stakers');
    expect(activeStakersLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "no donated NFTs" message when list is empty', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    mockUseDonationsNFTList.mockReturnValue({ data: [] });
    render(<Statistics />);
    expect(screen.getByText('No NFTs have been donated yet.')).toBeInTheDocument();
  });

  it('renders contract balance stat card', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Contract Balance')).toBeInTheDocument();
  });

  it('renders tooltips on stat items', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    const tooltips = screen.getAllByTestId('stat-tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('renders token distribution section with stat cards', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Token Distribution')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature NFT Holders')).toBeInTheDocument();
    expect(screen.getByText('CST (ERC-20) Holders')).toBeInTheDocument();
    expect(screen.getByText('Attached Token Distribution')).toBeInTheDocument();
  });

  it('renders staking section with stat cards', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Active CST Anchor-holders')).toBeInTheDocument();
    expect(screen.getByText('Active RWLK Anchor-holders')).toBeInTheDocument();
    expect(screen.getByText('Total Anchor Distributions')).toBeInTheDocument();
  });

  it('renders system events section divider', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('System Events')).toBeInTheDocument();
  });

  it('renders round activations collapsible section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Round Activations')).toBeInTheDocument();
  });

  it('renders statistics groups', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    const groups = screen.getAllByTestId('statistics-group');
    expect(groups.length).toBe(3);
  });

  it('renders collapsible sections', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    const sections = screen.getAllByTestId('collapsible-section');
    expect(sections.length).toBeGreaterThanOrEqual(4);
  });

  it('renders conditional cosmic game donations when present', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({
        MainStats: {
          ...makeDashboardData().MainStats,
          NumCosmicGameDonations: 5,
          SumCosmicGameDonationsEth: 1.2,
        },
      }),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Protocol Contributions')).toBeInTheDocument();
    expect(screen.getByText('Protocol Contributions Sum')).toBeInTheDocument();
  });

  it('renders voluntary donations when present', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({
        SumVoluntaryDonationsEth: '2.5',
        NumVoluntaryDonations: 3,
      }),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Voluntary Contributions')).toBeInTheDocument();
  });

  it('renders charity withdrawals when present', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({
        MainStats: {
          ...makeDashboardData().MainStats,
          NumWithdrawals: 2,
        },
      }),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Public Goods Retrievals')).toBeInTheDocument();
  });

  it('renders pending raffle withdrawal message when applicable', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({
        MainStats: {
          ...makeDashboardData().MainStats,
          NumWinnersWithPendingRaffleWithdrawal: 3,
        },
      }),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText(/3 recipients have yet to retrieve/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    const { container } = render(<Statistics />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});

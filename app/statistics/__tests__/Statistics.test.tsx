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
  Winner: undefined,
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
  StatisticsItem: ({ title, value }: { title: string; value: React.ReactNode }) => (
    <div data-testid="statistics-item">
      <span>{title}</span>
      <span>{value}</span>
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
      {nftDonations.length === 0 && <p>No ERC721 tokens were donated on this round.</p>}
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
  TotalPrizes: 10,
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
    NumUniqueWinners: 8,
    NumUniqueDonors: 6,
    TotalNamedTokens: 12,
    NumUniqueStakersCST: 4,
    NumUniqueStakersRWalk: 3,
    DonatedTokenDistribution: [],
    NumWinnersWithPendingRaffleWithdrawal: 0,
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

  it('renders current round statistics section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Current Round Statistics')).toBeInTheDocument();
    expect(screen.getByText('Current Round')).toBeInTheDocument();
    const roundValues = screen.getAllByText('5');
    expect(roundValues.length).toBeGreaterThanOrEqual(1);
  });

  it('renders overall statistics section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Overall Statistics')).toBeInTheDocument();
    expect(screen.getByText('CosmicGame contract balance')).toBeInTheDocument();
    expect(screen.getByText('Num Prizes Given')).toBeInTheDocument();
  });

  it('renders bid history table', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('BID HISTORY FOR CURRENT ROUND')).toBeInTheDocument();
    expect(screen.getByTestId('bidding-history-table')).toBeInTheDocument();
  });

  it('renders unique bidders and winners tables', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Unique Bidders')).toBeInTheDocument();
    expect(screen.getByTestId('unique-bidders-table')).toBeInTheDocument();
    expect(screen.getByText('Unique Winners')).toBeInTheDocument();
    expect(screen.getByTestId('unique-winners-table')).toBeInTheDocument();
  });

  it('renders staking tabs', () => {
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
    expect(screen.getByText('No ERC721 tokens were donated on this round.')).toBeInTheDocument();
  });

  it('renders current bid price stat', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Current Bid Price')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Statistics />);
    await checkA11y(container);
  });
});

import { checkA11y, render, screen } from '@/test-utils';

import Statistics from '../Statistics';

/* ── useApiQuery hooks ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest
  .fn()
  .mockReturnValue({ data: undefined, isLoading: false, isError: false });
const mockUseGestureListByCycle = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueParticipants = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueRecipients = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueCSTAnchorHolders = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueRWLKAnchorHolders = jest.fn().mockReturnValue({ data: undefined });
const mockUseUniqueDonors = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsNFTList = jest.fn().mockReturnValue({ data: undefined });
const mockUseCSTDistribution = jest.fn().mockReturnValue({ data: undefined });
const mockUseCTBalancesDistribution = jest.fn().mockReturnValue({ data: undefined });
const mockUseCSTAnchorActions = jest.fn().mockReturnValue({ data: undefined });
const mockUseRWLKAnchorActions = jest.fn().mockReturnValue({ data: undefined });
const mockUseGlobalAnchoredCSTokens = jest.fn().mockReturnValue({ data: undefined });
const mockUseGlobalAnchoredRWLKTokens = jest.fn().mockReturnValue({ data: undefined });
const mockUseSystemModelist = jest.fn().mockReturnValue({ data: undefined });
const mockUseCTPrice = jest.fn().mockReturnValue({ data: undefined });

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useUniqueParticipants: (...args: unknown[]) => mockUseUniqueParticipants(...args),
  useUniqueRecipients: (...args: unknown[]) => mockUseUniqueRecipients(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
  useUniqueRWLKAnchorHolders: (...args: unknown[]) => mockUseUniqueRWLKAnchorHolders(...args),
  useUniqueDonors: (...args: unknown[]) => mockUseUniqueDonors(...args),
  useDonationsNFTList: (...args: unknown[]) => mockUseDonationsNFTList(...args),
  useCSTDistribution: (...args: unknown[]) => mockUseCSTDistribution(...args),
  useCTBalancesDistribution: (...args: unknown[]) => mockUseCTBalancesDistribution(...args),
  useCSTAnchorActions: (...args: unknown[]) => mockUseCSTAnchorActions(...args),
  useRWLKAnchorActions: (...args: unknown[]) => mockUseRWLKAnchorActions(...args),
  useGlobalAnchoredCSTokens: (...args: unknown[]) => mockUseGlobalAnchoredCSTokens(...args),
  useGlobalAnchoredRWLKTokens: (...args: unknown[]) => mockUseGlobalAnchoredRWLKTokens(...args),
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

jest.mock('../../../components/tables/GestureHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="gesture-history-table" />,
}));
jest.mock('../../../components/tables/UniqueParticipantsTable', () => ({
  UniqueParticipantsTable: () => <div data-testid="unique-participants-table" />,
  Participant: undefined,
}));
jest.mock('../../../components/tables/UniqueRecipientsTable', () => ({
  UniqueRecipientsTable: () => <div data-testid="unique-recipients-table" />,
  Recipient: undefined,
}));
jest.mock('../../../components/tables/UniqueEthDonorsTable', () => ({
  UniqueEthDonorsTable: () => <div data-testid="unique-eth-contributors-table" />,
  UniqueEthDonor: undefined,
}));
jest.mock('../../../components/tables/UniqueAnchorHoldersCSTTable', () => ({
  UniqueAnchorHoldersCSTTable: () => <div data-testid="unique-anchorHolders-cst-table" />,
  UniqueAnchorHolderCST: undefined,
}));
jest.mock('../../../components/tables/UniqueAnchorHoldersRWLKTable', () => ({
  UniqueAnchorHoldersRWLKTable: () => <div data-testid="unique-anchorHolders-rwlk-table" />,
  UniqueAnchorHolderRWLK: undefined,
}));
jest.mock('../../../components/tables/SystemModesTable', () => ({
  SystemModesTable: () => <div data-testid="system-modes-table" />,
  EventRow: undefined,
}));
jest.mock('../../../components/attachments/AttachedNFT', () => ({
  __esModule: true,
  default: () => <div data-testid="donated-nft" />,
}));
jest.mock('../../../components/attachments/AttachedNFTDistributionTable', () => ({
  __esModule: true,
  default: () => <div data-testid="attached-nft-distribution-table" />,
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
jest.mock('../../../components/statistics/AnchoringSection', () => ({
  AnchoringSection: () => (
    <div data-testid="anchoring-section">
      <span>CosmicSignature Token</span>
      <span>RandomWalk Token</span>
      <span>Number of Active Anchor-Holders</span>
    </div>
  ),
}));
jest.mock('../../../components/statistics/DonatedNFTsGrid', () => ({
  DonatedNFTsGrid: ({ nftDonations }: { nftDonations: unknown[] }) => (
    <div data-testid="attached-nfts-grid">
      {nftDonations.length === 0 && <p>No NFTs have been attached yet.</p>}
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
  GestureCostEth: 0.01,
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
      '/current-cycle',
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
    expect(screen.getByTestId('unique-participants-table')).toBeInTheDocument();
    expect(screen.getByTestId('unique-recipients-table')).toBeInTheDocument();
    expect(screen.getByTestId('unique-eth-contributors-table')).toBeInTheDocument();
  });

  it('renders anchoring section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('CosmicSignature Token')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk Token')).toBeInTheDocument();
  });

  it('renders CST anchoring statistics', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    const activeAnchorHoldersLabels = screen.getAllByText('Number of Active Anchor-Holders');
    expect(activeAnchorHoldersLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "no attached NFTs" message when list is empty', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    mockUseDonationsNFTList.mockReturnValue({ data: [] });
    render(<Statistics />);
    expect(screen.getByText('No NFTs have been attached yet.')).toBeInTheDocument();
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

  it('renders anchoring section with stat cards', () => {
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

  it('renders cycle activations collapsible section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
      isError: false,
    });
    render(<Statistics />);
    expect(screen.getByText('Cycle Activations')).toBeInTheDocument();
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

  it('renders conditional cosmic protocol contributions when present', () => {
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

  it('renders voluntary contributions when present', () => {
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

  it('renders public-goods retrievals when present', () => {
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

  it('renders pending stellar-selection retrieval message when applicable', () => {
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

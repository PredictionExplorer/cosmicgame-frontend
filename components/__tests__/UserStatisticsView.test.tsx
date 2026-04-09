import { checkA11y, render, screen } from '@/test-utils';
import '@testing-library/jest-dom';

import UserStatisticsView from '../UserStatisticsView';

/* ── mock function declarations ─────────────────────────────────── */

const mockUseDashboardInfo = jest.fn();
const mockUseClaimHistoryByUser = jest.fn();
const mockUseUserInfo = jest.fn();
const mockUseUserBalance = jest.fn();
const mockUseStakingCSTActionsByUser = jest.fn();
const mockUseStakingRWLKActionsByUser = jest.fn();
const mockUseMarketingRewardsByUser = jest.fn();
const mockUseCSTTokensByUser = jest.fn();
const mockUseStakingRewardsByUser = jest.fn();
const mockUseStakingCSTRewardsCollectedByUser = jest.fn();
const mockUseStakingCSTByUserByDepositRewards = jest.fn();
const mockUseStakingRWLKMintsByUser = jest.fn();
const mockUseClaimedDonatedNFTByUser = jest.fn();
const mockUseUnclaimedDonatedNFTByUser = jest.fn();
const mockUseDonationsERC20ByUser = jest.fn();
const mockUseBidListByRound = jest.fn();

/* ── useApiQuery hooks ──────────────────────────────────────────── */

jest.mock('../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useClaimHistoryByUser: (...args: unknown[]) => mockUseClaimHistoryByUser(...args),
  useUserInfo: (...args: unknown[]) => mockUseUserInfo(...args),
  useUserBalance: (...args: unknown[]) => mockUseUserBalance(...args),
  useStakingCSTActionsByUser: (...args: unknown[]) => mockUseStakingCSTActionsByUser(...args),
  useStakingRWLKActionsByUser: (...args: unknown[]) => mockUseStakingRWLKActionsByUser(...args),
  useMarketingRewardsByUser: (...args: unknown[]) => mockUseMarketingRewardsByUser(...args),
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
  useStakingRewardsByUser: (...args: unknown[]) => mockUseStakingRewardsByUser(...args),
  useStakingCSTRewardsCollectedByUser: (...args: unknown[]) =>
    mockUseStakingCSTRewardsCollectedByUser(...args),
  useStakingCSTByUserByDepositRewards: (...args: unknown[]) =>
    mockUseStakingCSTByUserByDepositRewards(...args),
  useStakingRWLKMintsByUser: (...args: unknown[]) => mockUseStakingRWLKMintsByUser(...args),
  useClaimedDonatedNFTByUser: (...args: unknown[]) => mockUseClaimedDonatedNFTByUser(...args),
  useUnclaimedDonatedNFTByUser: (...args: unknown[]) => mockUseUnclaimedDonatedNFTByUser(...args),
  useDonationsERC20ByUser: (...args: unknown[]) => mockUseDonationsERC20ByUser(...args),
  useBidListByRound: (...args: unknown[]) => mockUseBidListByRound(...args),
}));

/* ── web3 / contract / context mocks ────────────────────────────── */

jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('../../hooks/useRaffleWalletContract', () => ({
  __esModule: true,
  default: () => ({
    write: {
      claimDonatedNft: jest.fn(),
      claimManyDonatedNfts: jest.fn(),
      claimDonatedToken: jest.fn(),
      claimManyDonatedTokens: jest.fn(),
    },
  }),
}));

jest.mock('../../contexts/StakedTokenContext', () => ({
  useStakedToken: () => ({ fetchData: jest.fn() }),
}));
jest.mock('../../contexts/ApiDataContext', () => ({
  useApiData: () => ({ fetchData: jest.fn() }),
}));
jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));

jest.mock('viem', () => ({
  formatEther: (v: bigint) => (Number(v) / 1e18).toString(),
}));

/* ── framer-motion / next.js ────────────────────────────────────── */

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div data-testid={props['data-testid'] as string | undefined}>{children}</div>
    ),
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <section data-testid={props['data-testid'] as string | undefined}>{children}</section>
    ),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

/* ── child component stubs ──────────────────────────────────────── */

jest.mock('../ui/address-chip', () => ({
  AddressChip: ({ address }: { address: string }) => (
    <div data-testid="address-chip">{address}</div>
  ),
}));

jest.mock('../user-statistics/UserStatsSection', () => ({
  UserStatsSection: ({
    userInfo,
    balanceETH,
    balanceCST,
    isOwnProfile,
    totalStakeRewardEth,
    raffleETHProbability,
    raffleNFTProbability,
  }: {
    userInfo: { NumBids: number };
    balanceETH: number;
    balanceCST: number;
    isOwnProfile: boolean;
    totalStakeRewardEth: number;
    raffleETHProbability: number;
    raffleNFTProbability: number;
  }) => (
    <div data-testid="user-stats-section">
      <span data-testid="stats-bids">bids: {userInfo?.NumBids}</span>
      <span data-testid="balance-eth">{balanceETH}</span>
      <span data-testid="balance-cst">{balanceCST}</span>
      <span data-testid="is-own">{String(isOwnProfile)}</span>
      <span data-testid="total-stake-reward">{totalStakeRewardEth}</span>
      <span data-testid="raffle-eth-prob">{raffleETHProbability}</span>
      <span data-testid="raffle-nft-prob">{raffleNFTProbability}</span>
    </div>
  ),
}));

jest.mock('../user-statistics/UserStakingSection', () => ({
  UserStakingSection: ({
    address,
    stakingCSTActions,
    stakingRWLKActions,
    rwlkMints,
  }: {
    address: string;
    stakingCSTActions: unknown[];
    stakingRWLKActions: unknown[];
    rwlkMints: unknown[];
  }) => (
    <div data-testid="user-staking-section">
      <span data-testid="staking-address">{address}</span>
      <span data-testid="cst-actions-count">{stakingCSTActions.length}</span>
      <span data-testid="rwlk-actions-count">{stakingRWLKActions.length}</span>
      <span data-testid="rwlk-mints-count">{rwlkMints.length}</span>
    </div>
  ),
}));

jest.mock('../user-statistics/DonatedAssetsSection', () => ({
  DonatedAssetsSection: ({
    canClaim,
    unclaimedNFTs,
    claimedNFTs,
    donatedERC20,
    loadingNFTs,
    loadingERC20,
  }: {
    canClaim: boolean;
    unclaimedNFTs: unknown[];
    claimedNFTs: unknown[];
    donatedERC20: unknown[];
    loadingNFTs: boolean;
    loadingERC20: boolean;
  }) => (
    <div data-testid="donated-assets-section">
      <span data-testid="can-claim">{String(canClaim)}</span>
      <span data-testid="unclaimed-count">{unclaimedNFTs.length}</span>
      <span data-testid="claimed-count">{claimedNFTs.length}</span>
      <span data-testid="erc20-count">{donatedERC20.length}</span>
      <span data-testid="loading-nfts">{String(loadingNFTs)}</span>
      <span data-testid="loading-erc20">{String(loadingERC20)}</span>
    </div>
  ),
}));

jest.mock('../tables/BiddingHistoryTable', () => ({
  __esModule: true,
  default: ({ biddingHistory }: { biddingHistory: unknown[] }) => (
    <div data-testid="bidding-history-table">rows: {biddingHistory.length}</div>
  ),
}));
jest.mock('../tables/WinningHistoryTable', () => ({
  __esModule: true,
  default: ({
    winningHistory,
    showClaimedStatus,
    showWinnerAddr,
  }: {
    winningHistory: unknown[];
    showClaimedStatus: boolean;
    showWinnerAddr: boolean;
  }) => (
    <div data-testid="winning-history-table">
      <span data-testid="winning-count">wins: {winningHistory.length}</span>
      <span data-testid="show-claimed">{String(showClaimedStatus)}</span>
      <span data-testid="show-winner">{String(showWinnerAddr)}</span>
    </div>
  ),
}));
jest.mock('../tables/MarketingRewardsTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="marketing-rewards-table">rewards: {list.length}</div>
  ),
}));
jest.mock('../tokens/CSTTable', () => ({
  CSTTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cst-table">tokens: {list.length}</div>
  ),
}));

function resetDefaults() {
  const noData = { data: undefined, isLoading: false };
  const emptyArray = { data: [], isLoading: false };
  mockUseDashboardInfo.mockReturnValue(noData);
  mockUseClaimHistoryByUser.mockReturnValue(noData);
  mockUseUserInfo.mockReturnValue(noData);
  mockUseUserBalance.mockReturnValue(noData);
  mockUseStakingCSTActionsByUser.mockReturnValue(emptyArray);
  mockUseStakingRWLKActionsByUser.mockReturnValue(emptyArray);
  mockUseMarketingRewardsByUser.mockReturnValue(emptyArray);
  mockUseCSTTokensByUser.mockReturnValue(emptyArray);
  mockUseStakingRewardsByUser.mockReturnValue(emptyArray);
  mockUseStakingCSTRewardsCollectedByUser.mockReturnValue(emptyArray);
  mockUseStakingCSTByUserByDepositRewards.mockReturnValue(emptyArray);
  mockUseStakingRWLKMintsByUser.mockReturnValue(emptyArray);
  mockUseClaimedDonatedNFTByUser.mockReturnValue(emptyArray);
  mockUseUnclaimedDonatedNFTByUser.mockReturnValue(emptyArray);
  mockUseDonationsERC20ByUser.mockReturnValue(emptyArray);
  mockUseBidListByRound.mockReturnValue(emptyArray);
}

beforeEach(() => {
  jest.clearAllMocks();
  resetDefaults();
});

/* ── test data helpers ──────────────────────────────────────────── */

const baseUserInfo = {
  UserInfo: {
    NumBids: 5,
    NumPrizes: 2,
    MaxBidAmount: 1.5,
    MaxWinAmount: 3.0,
    CosmicSignatureNumTransfers: 10,
    TotalCSTokensWon: 7,
    Address: '0xUser',
    SumRaffleEthWinnings: 0.5,
    SumRaffleEthWithdrawal: 0.2,
    UnclaimedNFTs: 1,
    NumRaffleEthWinnings: 3,
    RaffleNFTsCount: 2,
    RewardNFTsCount: 4,
    StakingStatisticsRWalk: {
      TotalNumStakeActions: 1,
      TotalNumUnstakeActions: 0,
      TotalTokensStaked: 2,
      TotalTokensMinted: 1,
    },
  },
  Bids: [
    { BidderAddr: '0xUser', BidPriceEth: 0.01, RoundNum: 1 },
    { BidderAddr: '0xUser', BidPriceEth: 0.02, RoundNum: 2 },
  ],
};

const baseDashboard = {
  CurRoundNum: 5,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  StakingAmountEth: 1.0,
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 2,
};

const baseBalance = {
  CosmicTokenBalance: '1000000000000000000',
  ETH_Balance: '2000000000000000000',
};

function setupFullData(overrides: Record<string, unknown> = {}) {
  mockUseDashboardInfo.mockReturnValue({
    data: { ...baseDashboard, ...overrides },
    isLoading: false,
  });
  mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
  mockUseUserBalance.mockReturnValue({ data: baseBalance, isLoading: false });
}

function setupNoUserInfo() {
  mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
  mockUseUserInfo.mockReturnValue({ data: null, isLoading: false });
}

/* ── Tests ──────────────────────────────────────────────────────── */

describe('UserStatisticsView', () => {
  /* ── Invalid Address ──────────────────────────────────────────── */

  describe('Invalid Address', () => {
    it('renders "Invalid Address" text', () => {
      render(<UserStatisticsView address="Invalid Address" isOwnProfile={false} />);
      expect(screen.getByText('Invalid Address')).toBeInTheDocument();
    });

    it('does not render skeleton or data sections', () => {
      render(<UserStatisticsView address="Invalid Address" isOwnProfile={false} />);
      expect(screen.queryByTestId('statistics-loading-skeleton')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-stats-section')).not.toBeInTheDocument();
      expect(screen.queryByText('No activity yet')).not.toBeInTheDocument();
    });

    it('does not call data hooks with Invalid Address meaningfully', () => {
      render(<UserStatisticsView address="Invalid Address" isOwnProfile={false} />);
      expect(screen.queryByTestId('bidding-history-table')).not.toBeInTheDocument();
    });
  });

  /* ── Loading State ────────────────────────────────────────────── */

  describe('Loading State', () => {
    it('shows skeleton when dashboard is loading', () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when user info is loading', () => {
      mockUseUserInfo.mockReturnValue({ data: undefined, isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when balance is loading', () => {
      mockUseUserBalance.mockReturnValue({ data: undefined, isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when claim history is loading', () => {
      mockUseClaimHistoryByUser.mockReturnValue({ data: undefined, isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when CST actions are loading', () => {
      mockUseStakingCSTActionsByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when RWLK actions are loading', () => {
      mockUseStakingRWLKActionsByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when marketing rewards are loading', () => {
      mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when CST tokens are loading', () => {
      mockUseCSTTokensByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when staking rewards are loading', () => {
      mockUseStakingRewardsByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when collected staking rewards are loading', () => {
      mockUseStakingCSTRewardsCollectedByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when by-deposit rewards are loading', () => {
      mockUseStakingCSTByUserByDepositRewards.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when RWLK mints are loading', () => {
      mockUseStakingRWLKMintsByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
    });

    it('does not show data sections or empty state while loading', () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.queryByTestId('user-stats-section')).not.toBeInTheDocument();
      expect(screen.queryByText('No activity yet')).not.toBeInTheDocument();
    });
  });

  /* ── Empty State (no user info) ───────────────────────────────── */

  describe('Empty State', () => {
    it('shows "No activity yet" when userInfo is null', () => {
      setupNoUserInfo();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByText('No activity yet')).toBeInTheDocument();
    });

    it('shows guidance text about placing a bid', () => {
      setupNoUserInfo();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByText(/participated in any rounds yet/)).toBeInTheDocument();
    });

    it('shows empty state when useUserInfo returns object with no UserInfo', () => {
      mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
      mockUseUserInfo.mockReturnValue({ data: {}, isLoading: false });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByText('No activity yet')).toBeInTheDocument();
    });

    it('does not render data tables in empty state', () => {
      setupNoUserInfo();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.queryByTestId('user-stats-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bidding-history-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('winning-history-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cst-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-staking-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('donated-assets-section')).not.toBeInTheDocument();
    });

    it('still renders the page header in empty state', () => {
      setupNoUserInfo();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });
  });

  /* ── Page Header & Profile Type ───────────────────────────────── */

  describe('Page Header & Profile Type', () => {
    it('shows "My Statistics" title for own profile', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      expect(screen.getByText('My Statistics')).toBeInTheDocument();
    });

    it('shows "User Profile" title for another user', () => {
      setupFullData();
      render(<UserStatisticsView address="0xOther" isOwnProfile={false} />);
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });

    it('shows own profile subtitle', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      expect(
        screen.getByText('Your complete performance dashboard and activity history'),
      ).toBeInTheDocument();
    });

    it('shows other profile subtitle', () => {
      setupFullData();
      render(<UserStatisticsView address="0xOther" isOwnProfile={false} />);
      expect(screen.getByText(/Viewing another player/)).toBeInTheDocument();
    });

    it('sets "My Statistics" aria-label for own profile', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      expect(screen.getByRole('main', { name: 'My Statistics' })).toBeInTheDocument();
    });

    it('sets "User Statistics" aria-label for other profile', () => {
      setupFullData();
      render(<UserStatisticsView address="0xOther" isOwnProfile={false} />);
      expect(screen.getByRole('main', { name: 'User Statistics' })).toBeInTheDocument();
    });

    it('renders AddressChip for non-own profile with address', () => {
      setupFullData();
      render(<UserStatisticsView address="0xOther" isOwnProfile={false} />);
      expect(screen.getByTestId('address-chip')).toHaveTextContent('0xOther');
    });

    it('does not render AddressChip for own profile', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      expect(screen.queryByTestId('address-chip')).not.toBeInTheDocument();
    });

    it('does not render AddressChip when address is null', () => {
      mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
      mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
      render(<UserStatisticsView address={null} isOwnProfile={false} />);
      expect(screen.queryByTestId('address-chip')).not.toBeInTheDocument();
    });
  });

  /* ── Full Data Rendering ──────────────────────────────────────── */

  describe('Full Data Rendering', () => {
    it('renders all main sections', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);

      expect(screen.getByTestId('user-stats-section')).toBeInTheDocument();
      expect(screen.getByTestId('bidding-history-table')).toBeInTheDocument();
      expect(screen.getByTestId('winning-history-table')).toBeInTheDocument();
      expect(screen.getByTestId('user-staking-section')).toBeInTheDocument();
      expect(screen.getByTestId('cst-table')).toBeInTheDocument();
      expect(screen.getByTestId('donated-assets-section')).toBeInTheDocument();
    });

    it('renders all section dividers', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);

      expect(screen.getByText('Bidding History')).toBeInTheDocument();
      expect(screen.getByText('Winning History')).toBeInTheDocument();
      expect(screen.getByText('Staking')).toBeInTheDocument();
      expect(screen.getByText('Token Holdings')).toBeInTheDocument();
      expect(screen.getByText('Claimable Assets')).toBeInTheDocument();
    });

    it('passes bids from userInfo to BiddingHistoryTable', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('bidding-history-table')).toHaveTextContent('rows: 2');
    });

    it('passes empty bids when userInfo has no Bids field', () => {
      mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
      mockUseUserInfo.mockReturnValue({
        data: { UserInfo: baseUserInfo.UserInfo },
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('bidding-history-table')).toHaveTextContent('rows: 0');
    });

    it('passes claim history to WinningHistoryTable', () => {
      setupFullData();
      mockUseClaimHistoryByUser.mockReturnValue({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('winning-count')).toHaveTextContent('wins: 3');
    });

    it('passes showClaimedStatus=true and showWinnerAddr=false to WinningHistoryTable', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('show-claimed')).toHaveTextContent('true');
      expect(screen.getByTestId('show-winner')).toHaveTextContent('false');
    });

    it('uses empty array when claim history is null', () => {
      setupFullData();
      mockUseClaimHistoryByUser.mockReturnValue({ data: null, isLoading: false });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('winning-count')).toHaveTextContent('wins: 0');
    });

    it('passes user info NumBids to UserStatsSection', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('stats-bids')).toHaveTextContent('bids: 5');
    });

    it('passes isOwnProfile to UserStatsSection', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      expect(screen.getByTestId('is-own')).toHaveTextContent('true');
    });

    it('passes CST tokens to CSTTable', () => {
      setupFullData();
      mockUseCSTTokensByUser.mockReturnValue({
        data: [{ id: 1 }, { id: 2 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('cst-table')).toHaveTextContent('tokens: 2');
    });
  });

  /* ── Balance Calculation ──────────────────────────────────────── */

  describe('Balance Calculation', () => {
    it('computes balance from raw wei values', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('balance-eth')).toHaveTextContent('2');
      expect(screen.getByTestId('balance-cst')).toHaveTextContent('1');
    });

    it('defaults balance to 0 when balanceData is null', () => {
      mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
      mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
      mockUseUserBalance.mockReturnValue({ data: null, isLoading: false });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('balance-eth')).toHaveTextContent('0');
      expect(screen.getByTestId('balance-cst')).toHaveTextContent('0');
    });

    it('handles zero balance strings', () => {
      mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
      mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
      mockUseUserBalance.mockReturnValue({
        data: { CosmicTokenBalance: '0', ETH_Balance: '0' },
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('balance-eth')).toHaveTextContent('0');
      expect(screen.getByTestId('balance-cst')).toHaveTextContent('0');
    });
  });

  /* ── Staking Section ──────────────────────────────────────────── */

  describe('Staking Section', () => {
    it('passes address to UserStakingSection', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('staking-address')).toHaveTextContent('0xUser');
    });

    it('passes staking CST actions to UserStakingSection', () => {
      setupFullData();
      mockUseStakingCSTActionsByUser.mockReturnValue({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('cst-actions-count')).toHaveTextContent('3');
    });

    it('passes staking RWLK actions to UserStakingSection', () => {
      setupFullData();
      mockUseStakingRWLKActionsByUser.mockReturnValue({
        data: [{ id: 1 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('rwlk-actions-count')).toHaveTextContent('1');
    });

    it('passes RWLK mints to UserStakingSection', () => {
      setupFullData();
      mockUseStakingRWLKMintsByUser.mockReturnValue({
        data: [{ id: 1 }, { id: 2 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('rwlk-mints-count')).toHaveTextContent('2');
    });

    it('computes totalStakeRewardEth from staking rewards', () => {
      setupFullData();
      mockUseStakingRewardsByUser.mockReturnValue({
        data: [
          { TokenId: 1, RewardCollectedEth: 0.5, RewardToCollectEth: 0.3 },
          { TokenId: 2, RewardCollectedEth: 0.2, RewardToCollectEth: 0.1 },
        ],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('total-stake-reward')).toHaveTextContent('1.1');
    });

    it('defaults totalStakeRewardEth to 0 with no rewards', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('total-stake-reward')).toHaveTextContent('0');
    });

    it('handles missing RewardCollectedEth and RewardToCollectEth', () => {
      setupFullData();
      mockUseStakingRewardsByUser.mockReturnValue({
        data: [{ TokenId: 1 }, { TokenId: 2 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('total-stake-reward')).toHaveTextContent('0');
    });
  });

  /* ── Marketing Rewards (conditional) ──────────────────────────── */

  describe('Marketing Rewards', () => {
    it('shows marketing rewards section when rewards exist', () => {
      setupFullData();
      mockUseMarketingRewardsByUser.mockReturnValue({
        data: [{ id: 1, Amount: '0.1' }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByText('Marketing Rewards')).toBeInTheDocument();
      expect(screen.getByTestId('marketing-rewards-table')).toHaveTextContent('rewards: 1');
    });

    it('hides marketing rewards section when list is empty', () => {
      setupFullData();
      mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.queryByText('Marketing Rewards')).not.toBeInTheDocument();
      expect(screen.queryByTestId('marketing-rewards-table')).not.toBeInTheDocument();
    });

    it('hides marketing rewards section when data is null', () => {
      setupFullData();
      mockUseMarketingRewardsByUser.mockReturnValue({ data: null, isLoading: false });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.queryByText('Marketing Rewards')).not.toBeInTheDocument();
    });
  });

  /* ── Donated Assets & canClaim logic ──────────────────────────── */

  describe('Donated Assets Section', () => {
    it('passes canClaim=true for own profile', () => {
      setupFullData();
      render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      expect(screen.getByTestId('can-claim')).toHaveTextContent('true');
    });

    it('passes canClaim=true when account matches address (case-insensitive)', () => {
      setupFullData();
      render(<UserStatisticsView address="0xuser" isOwnProfile={false} />);
      expect(screen.getByTestId('can-claim')).toHaveTextContent('true');
    });

    it('passes canClaim=false when account does not match address', () => {
      setupFullData();
      render(<UserStatisticsView address="0xOther" isOwnProfile={false} />);
      expect(screen.getByTestId('can-claim')).toHaveTextContent('false');
    });

    it('passes unclaimed NFTs count', () => {
      setupFullData();
      mockUseUnclaimedDonatedNFTByUser.mockReturnValue({
        data: [{ Index: 0 }, { Index: 1 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('unclaimed-count')).toHaveTextContent('2');
    });

    it('passes claimed NFTs count', () => {
      setupFullData();
      mockUseClaimedDonatedNFTByUser.mockReturnValue({
        data: [{ Index: 0 }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('claimed-count')).toHaveTextContent('1');
    });

    it('passes donated ERC20 count', () => {
      setupFullData();
      mockUseDonationsERC20ByUser.mockReturnValue({
        data: [{ RoundNum: 1, TokenAddr: '0xToken', Claimed: false }],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('erc20-count')).toHaveTextContent('1');
    });

    it('treats non-array claimedNFTs as empty', () => {
      setupFullData();
      mockUseClaimedDonatedNFTByUser.mockReturnValue({
        data: 'not-an-array',
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('claimed-count')).toHaveTextContent('0');
    });

    it('treats non-array unclaimedNFTs as empty', () => {
      setupFullData();
      mockUseUnclaimedDonatedNFTByUser.mockReturnValue({
        data: 'not-an-array',
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('unclaimed-count')).toHaveTextContent('0');
    });

    it('passes NFT loading state to DonatedAssetsSection', () => {
      setupFullData();
      mockUseUnclaimedDonatedNFTByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('loading-nfts')).toHaveTextContent('true');
    });

    it('passes ERC20 loading state to DonatedAssetsSection', () => {
      setupFullData();
      mockUseDonationsERC20ByUser.mockReturnValue({ data: [], isLoading: true });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('loading-erc20')).toHaveTextContent('true');
    });
  });

  /* ── Raffle Probability ───────────────────────────────────────── */

  describe('Raffle Probability', () => {
    it('returns -1 probabilities when no bid list', () => {
      setupFullData();
      mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      expect(screen.getByTestId('raffle-eth-prob')).toHaveTextContent('-1');
      expect(screen.getByTestId('raffle-nft-prob')).toHaveTextContent('-1');
    });

    it('computes probabilities when bid list has entries', () => {
      setupFullData();
      mockUseBidListByRound.mockReturnValue({
        data: [
          { BidderAddr: '0xUser' },
          { BidderAddr: '0xUser' },
          { BidderAddr: '0xAnother' },
          { BidderAddr: '0xAnother' },
        ],
        isLoading: false,
      });
      render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      const ethProb = Number(screen.getByTestId('raffle-eth-prob').textContent);
      const nftProb = Number(screen.getByTestId('raffle-nft-prob').textContent);
      expect(ethProb).toBeGreaterThan(0);
      expect(ethProb).toBeLessThanOrEqual(1);
      expect(nftProb).toBeGreaterThan(0);
      expect(nftProb).toBeLessThanOrEqual(1);
    });

    it('returns -1 probabilities when address is null', () => {
      mockUseDashboardInfo.mockReturnValue({ data: baseDashboard, isLoading: false });
      mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
      mockUseUserBalance.mockReturnValue({ data: baseBalance, isLoading: false });
      mockUseBidListByRound.mockReturnValue({
        data: [{ BidderAddr: '0xUser' }],
        isLoading: false,
      });
      render(<UserStatisticsView address={null} isOwnProfile={false} />);
      expect(screen.getByTestId('raffle-eth-prob')).toHaveTextContent('-1');
    });
  });

  /* ── Address edge cases ───────────────────────────────────────── */

  describe('Address Edge Cases', () => {
    it('renders with null address without crashing', () => {
      setupNoUserInfo();
      render(<UserStatisticsView address={null} isOwnProfile={false} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders with undefined address without crashing', () => {
      setupNoUserInfo();
      render(<UserStatisticsView address={undefined} isOwnProfile={false} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  /* ── Accessibility ────────────────────────────────────────────── */

  describe('Accessibility', () => {
    it('has no violations in empty state', async () => {
      setupNoUserInfo();
      const { container } = render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
    });

    it('has no violations with full data', async () => {
      setupFullData();
      const { container } = render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
    });

    it('has no violations for own profile', async () => {
      setupFullData();
      const { container } = render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
      await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
    });

    it('has no violations in loading state', async () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
      await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
    });
  });
});

import { render, screen, checkA11y } from '@/test-utils';

import UserStatisticsView from '../UserStatisticsView';

const defaultHookReturn = { data: undefined, isLoading: false };

const mockUseDashboardInfo = jest.fn().mockReturnValue(defaultHookReturn);
const mockUseClaimHistoryByUser = jest.fn().mockReturnValue(defaultHookReturn);
const mockUseUserInfo = jest.fn().mockReturnValue(defaultHookReturn);
const mockUseUserBalance = jest.fn().mockReturnValue(defaultHookReturn);
const mockUseStakingCSTActionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingRWLKActionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseMarketingRewardsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseCSTTokensByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingRewardsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingCSTRewardsCollectedByUser = jest
  .fn()
  .mockReturnValue({ data: [], isLoading: false });
const mockUseStakingCSTByUserByDepositRewards = jest
  .fn()
  .mockReturnValue({ data: [], isLoading: false });
const mockUseStakingRWLKMintsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseClaimedDonatedNFTByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseUnclaimedDonatedNFTByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseDonationsERC20ByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseBidListByRound = jest.fn().mockReturnValue({ data: [], isLoading: false });

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

jest.mock('../user-statistics/UserStatsSection', () => ({
  UserStatsSection: ({ userInfo }: { userInfo: { NumBids: number } }) => (
    <div data-testid="user-stats-section">bids: {userInfo?.NumBids}</div>
  ),
}));
jest.mock('../user-statistics/UserStakingSection', () => ({
  UserStakingSection: () => (
    <div data-testid="user-staking-section">
      <div data-testid="staking-actions-table" />
      <div data-testid="staking-rewards-table" />
    </div>
  ),
}));
jest.mock('../user-statistics/DonatedAssetsSection', () => ({
  DonatedAssetsSection: () => (
    <div data-testid="donated-assets-section">
      <div data-testid="donated-nft-table" />
      <div data-testid="donated-erc20-table" />
    </div>
  ),
}));

jest.mock('../tables/BiddingHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="bidding-history-table" />,
}));
jest.mock('../tables/WinningHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="winning-history-table" />,
}));
jest.mock('../tables/MarketingRewardsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="marketing-rewards-table" />,
}));
jest.mock('../tokens/CSTTable', () => ({
  CSTTable: () => <div data-testid="cst-table" />,
}));

beforeEach(() => jest.clearAllMocks());

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
  Bids: [],
};

describe('UserStatisticsView', () => {
  it('shows invalid address empty state', () => {
    render(<UserStatisticsView address="Invalid Address" isOwnProfile={false} />);
    expect(screen.getByText('Invalid Address')).toBeInTheDocument();
  });

  it('shows skeleton loading state', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
    expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no user info', () => {
    mockUseDashboardInfo.mockReturnValue({ data: {}, isLoading: false });
    mockUseUserInfo.mockReturnValue({ data: null, isLoading: false });
    render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('renders user stats and tables with full data', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { CurRoundNum: 5, TsRoundStart: 1, StakingAmountEth: 1.0 },
      isLoading: false,
    });
    mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
    mockUseUserBalance.mockReturnValue({
      data: { CosmicTokenBalance: '1000000000000000000', ETH_Balance: '2000000000000000000' },
      isLoading: false,
    });
    render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);

    expect(screen.getByTestId('user-stats-section')).toHaveTextContent('bids: 5');
    expect(screen.getByTestId('bidding-history-table')).toBeInTheDocument();
    expect(screen.getByTestId('cst-table')).toBeInTheDocument();
    expect(screen.getByTestId('winning-history-table')).toBeInTheDocument();
    expect(screen.getByTestId('donated-assets-section')).toBeInTheDocument();
  });

  it('shows "My Statistics" heading for own profile', () => {
    mockUseDashboardInfo.mockReturnValue({ data: {}, isLoading: false });
    mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
    render(<UserStatisticsView address="0xUser" isOwnProfile={true} />);
    expect(screen.getByText('My Statistics')).toBeInTheDocument();
  });

  it('shows "User Profile" heading for other profile', () => {
    mockUseDashboardInfo.mockReturnValue({ data: {}, isLoading: false });
    mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
    render(<UserStatisticsView address="0xOther" isOwnProfile={false} />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  it('renders section dividers', () => {
    mockUseDashboardInfo.mockReturnValue({ data: {}, isLoading: false });
    mockUseUserInfo.mockReturnValue({ data: baseUserInfo, isLoading: false });
    render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
    expect(screen.getByText('Gesture History')).toBeInTheDocument();
    expect(screen.getByText('Winning History')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
    expect(screen.getByText('Token Holdings')).toBeInTheDocument();
    expect(screen.getByText('Claimable Assets')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: {}, isLoading: false });
    mockUseUserInfo.mockReturnValue({ data: null, isLoading: false });
    const { container } = render(<UserStatisticsView address="0xUser" isOwnProfile={false} />);
    await checkA11y(container);
  });
});

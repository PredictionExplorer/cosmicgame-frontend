import { render, screen, checkA11y } from '@/test-utils';

import {
  UserStatsSection,
  type UserStatsSectionProps,
  type UserProfileInfo,
} from '../UserStatsSection';

jest.mock('../HeroStats', () => ({
  HeroStats: (props: { userInfo: UserProfileInfo }) => (
    <div data-testid="hero-stats">bids: {props.userInfo?.NumBids}</div>
  ),
}));
jest.mock('../ActivitySummary', () => ({
  ActivitySummary: () => <div data-testid="activity-summary" />,
}));
jest.mock('../QuickActions', () => ({
  QuickActions: ({ address }: { address: string }) => (
    <div data-testid="quick-actions">{address}</div>
  ),
}));
jest.mock('../RafflePerformance', () => ({
  RafflePerformance: () => <div data-testid="raffle-performance" />,
}));

const userInfo: UserProfileInfo = {
  NumBids: 10,
  NumPrizes: 3,
  MaxBidAmount: 0.05,
  MaxWinAmount: 1.5,
  CosmicSignatureNumTransfers: 2,
  TotalCSTokensWon: 5,
  Address: '0xUser',
  SumRaffleEthWinnings: 0.1,
  SumRaffleEthWithdrawal: 0.05,
  UnclaimedNFTs: 1,
  NumRaffleEthWinnings: 4,
  RaffleNFTsCount: 2,
  RewardNFTsCount: 7,
};

const defaultProps: UserStatsSectionProps = {
  userInfo,
  balanceETH: 1.5,
  balanceCST: 100,
  raffleETHProbability: 0.25,
  raffleNFTProbability: 0.1,
  data: null,
  isOwnProfile: false,
  totalStakeRewardEth: 0,
};

describe('UserStatsSection', () => {
  it('renders HeroStats with user info', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByTestId('hero-stats')).toHaveTextContent('bids: 10');
  });

  it('renders ActivitySummary', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
  });

  it('renders RafflePerformance', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByTestId('raffle-performance')).toBeInTheDocument();
  });

  it('renders QuickActions for own profile', () => {
    render(<UserStatsSection {...defaultProps} isOwnProfile={true} />);
    expect(screen.getByTestId('quick-actions')).toHaveTextContent('0xUser');
  });

  it('hides QuickActions for other profiles', () => {
    render(<UserStatsSection {...defaultProps} isOwnProfile={false} />);
    expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument();
  });

  it('renders the user-stats-section container', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByTestId('user-stats-section')).toBeInTheDocument();
  });

  it('returns null when userInfo is falsy', () => {
    const { container } = render(
      <UserStatsSection {...defaultProps} userInfo={null as unknown as UserProfileInfo} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserStatsSection {...defaultProps} />);
    await checkA11y(container);
  });
});

import { render, screen, checkA11y } from '@/test-utils';

import { UserStakingSection, type UserStakingSectionProps } from '../UserStakingSection';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('../../staking/StakingActionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="staking-actions-table" />,
}));
jest.mock('../../staking/StakingRewardsTable', () => ({
  StakingRewardsTable: () => <div data-testid="staking-rewards-table" />,
}));
jest.mock('../../staking/CSTStakingRewardsByDepositTable', () => ({
  CSTStakingRewardsByDepositTable: () => <div data-testid="cst-deposit-rewards" />,
}));
jest.mock('../../staking/CollectedCSTStakingRewardsTable', () => ({
  CollectedCSTStakingRewardsTable: () => <div data-testid="collected-rewards" />,
}));
jest.mock('../../staking/UncollectedCSTStakingRewardsTable', () => ({
  UncollectedCSTStakingRewardsTable: () => <div data-testid="uncollected-rewards" />,
}));
jest.mock('../../staking/RwalkStakingRewardMintsTable', () => ({
  RwalkStakingRewardMintsTable: () => <div data-testid="rwlk-mints" />,
}));

jest.mock('../../../utils', () => ({
  formatEthValue: (v: number) => `${v.toFixed(4)} ETH`,
}));

const defaultProps: UserStakingSectionProps = {
  address: '0xUser',
  userInfo: {
    NumBids: 0,
    NumPrizes: 0,
    StakingStatisticsRWalk: {
      TotalNumStakeActions: 3,
      TotalNumUnstakeActions: 1,
      TotalTokensStaked: 10,
      TotalTokensMinted: 5,
    },
  },
  stakingCSTActions: [
    { ActionType: 0 } as import('@/services/api').StakingAction,
    { ActionType: 1 } as import('@/services/api').StakingAction,
  ],
  stakingRWLKActions: [],
  cstStakingRewards: [],
  cstStakingRewardsByDeposit: [],
  collectedCstStakingRewards: [],
  rwlkMints: [],
};

describe('UserStakingSection', () => {
  it('renders the staking section container', () => {
    render(<UserStakingSection {...defaultProps} />);
    expect(screen.getByTestId('user-staking-section')).toBeInTheDocument();
  });

  it('renders tab triggers', () => {
    render(<UserStakingSection {...defaultProps} />);
    expect(screen.getByText('Cosmic Signature Staking')).toBeInTheDocument();
    expect(screen.getByText('Random Walk Staking')).toBeInTheDocument();
  });

  it('renders CST stat cards with correct values', () => {
    render(<UserStakingSection {...defaultProps} />);
    expect(screen.getByText('Stake Actions')).toBeInTheDocument();
    expect(screen.getByText('Unstake Actions')).toBeInTheDocument();
    expect(screen.getByText('Total Rewards')).toBeInTheDocument();
    expect(screen.getByText('Unclaimed Rewards')).toBeInTheDocument();
  });

  it('renders staking tables', () => {
    render(<UserStakingSection {...defaultProps} />);
    expect(screen.getByTestId('staking-actions-table')).toBeInTheDocument();
    expect(screen.getByTestId('staking-rewards-table')).toBeInTheDocument();
  });

  it('shows empty state when no CST staking activity', () => {
    render(<UserStakingSection {...defaultProps} stakingCSTActions={[]} cstStakingRewards={[]} />);
    expect(screen.getByText('No staking activity yet')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserStakingSection {...defaultProps} />);
    await checkA11y(container);
  });
});

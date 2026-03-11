import { render, screen, checkA11y } from '@/test-utils';

import { CSTStakingPanel, type CSTStakingPanelProps } from '../CSTStakingPanel';

jest.mock('../StakingActionsTable', () => ({
  __esModule: true,
  default: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="staking-actions-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../StakingRewardsTable', () => ({
  StakingRewardsTable: ({ address }: { address: string }) => (
    <div data-testid="staking-rewards-table">address={address}</div>
  ),
}));
jest.mock('../StakedTokensTable', () => ({
  StakedTokensTable: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="staked-tokens-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../../tokens/CSTokensTable', () => ({
  CSTokensTable: () => <div data-testid="cs-tokens-table" />,
}));

const noop = async () => {};

const defaultProps: CSTStakingPanelProps = {
  account: '0xUser',
  stakingActions: [],
  userTokens: [],
  stakedTokens: [],
  stakingRewards: [],
  handleStake: noop,
  handleStakeMany: noop,
  handleUnstake: noop,
  handleUnstakeMany: noop,
};

describe('CSTStakingPanel', () => {
  it('renders all four sections', () => {
    render(<CSTStakingPanel {...defaultProps} />);
    expect(screen.getByText('Staking Rewards by Token')).toBeInTheDocument();
    expect(screen.getByText('Stake / Unstake Actions')).toBeInTheDocument();
    expect(screen.getByText('Tokens Available for Staking')).toBeInTheDocument();
    expect(screen.getByText('Staked Tokens')).toBeInTheDocument();
  });

  it('passes account to StakingRewardsTable', () => {
    render(<CSTStakingPanel {...defaultProps} account="0xABC" />);
    expect(screen.getByTestId('staking-rewards-table')).toHaveTextContent('address=0xABC');
  });

  it('sets IsRwalk=false on child tables', () => {
    render(<CSTStakingPanel {...defaultProps} />);
    expect(screen.getByTestId('staking-actions-table')).toHaveTextContent('IsRwalk=false');
    expect(screen.getByTestId('staked-tokens-table')).toHaveTextContent('IsRwalk=false');
  });

  it('renders CSTokensTable', () => {
    render(<CSTStakingPanel {...defaultProps} />);
    expect(screen.getByTestId('cs-tokens-table')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTStakingPanel {...defaultProps} />);
    await checkA11y(container);
  });
});

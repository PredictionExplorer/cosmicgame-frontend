import { render, screen, checkA11y } from '@/test-utils';

import { RWLKStakingPanel, type RWLKStakingPanelProps } from '../RWLKStakingPanel';

jest.mock('../StakingActionsTable', () => ({
  __esModule: true,
  default: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="staking-actions-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../RwalkStakingRewardMintsTable', () => ({
  RwalkStakingRewardMintsTable: () => <div data-testid="rwlk-mints-table" />,
}));
jest.mock('../StakedTokensTable', () => ({
  StakedTokensTable: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="staked-tokens-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../../tokens/RWLKNFTTable', () => ({
  RWLKNFTTable: ({ ownerAddress }: { ownerAddress: string }) => (
    <div data-testid="rwlk-nft-table">owner={ownerAddress}</div>
  ),
}));

const noop = async () => {};

const defaultProps: RWLKStakingPanelProps = {
  account: '0xUser',
  stakingActions: [],
  rwlkMints: [],
  userTokens: [],
  stakedTokens: [],
  handleStake: noop,
  handleStakeMany: noop,
  handleUnstake: noop,
  handleUnstakeMany: noop,
};

describe('RWLKStakingPanel', () => {
  it('renders all four section headers', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    expect(screen.getByText('Staked Tokens')).toBeInTheDocument();
    expect(screen.getByText('Available for Staking')).toBeInTheDocument();
    expect(screen.getByText('Staking Reward Tokens')).toBeInTheDocument();
    expect(screen.getByText('Stake / Unstake History')).toBeInTheDocument();
  });

  it('renders Staked Tokens section first', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Staked Tokens');
  });

  it('renders Available for Staking section second', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[1]).toHaveTextContent('Available for Staking');
  });

  it('renders Staking Reward Tokens section third', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[2]).toHaveTextContent('Staking Reward Tokens');
  });

  it('renders Stake / Unstake History section last', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[3]).toHaveTextContent('Stake / Unstake History');
  });

  it('passes account to RWLKNFTTable as ownerAddress', () => {
    render(<RWLKStakingPanel {...defaultProps} account="0xDEF" />);
    expect(screen.getByTestId('rwlk-nft-table')).toHaveTextContent('owner=0xDEF');
  });

  it('sets IsRwalk=true on child tables', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    expect(screen.getByTestId('staking-actions-table')).toHaveTextContent('IsRwalk=true');
    expect(screen.getByTestId('staked-tokens-table')).toHaveTextContent('IsRwalk=true');
  });

  it('renders RwalkStakingRewardMintsTable', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    expect(screen.getByTestId('rwlk-mints-table')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RWLKStakingPanel {...defaultProps} />);
    await checkA11y(container);
  });
});

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
    expect(screen.getByText('Anchored Tokens')).toBeInTheDocument();
    expect(screen.getByText('Available for Anchoring')).toBeInTheDocument();
    expect(screen.getByText('Anchor Allocation Tokens')).toBeInTheDocument();
    expect(screen.getByText('Anchor / Release History')).toBeInTheDocument();
  });

  it('renders Anchored Tokens section first', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Anchored Tokens');
  });

  it('renders Available for Anchoring section second', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[1]).toHaveTextContent('Available for Anchoring');
  });

  it('renders Anchor Allocation Tokens section third', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[2]).toHaveTextContent('Anchor Allocation Tokens');
  });

  it('renders Anchor / Release History section last', () => {
    render(<RWLKStakingPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[3]).toHaveTextContent('Anchor / Release History');
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

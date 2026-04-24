import { render, screen, checkA11y } from '@/test-utils';

import { StakingSection, type StakingSectionProps } from '../StakingSection';

jest.mock('../../staking/GlobalStakingActionsTable', () => ({
  GlobalStakingActionsTable: ({ IsRWLK }: { IsRWLK: boolean }) => (
    <div data-testid="global-staking-actions">IsRWLK={String(IsRWLK)}</div>
  ),
}));
jest.mock('../../staking/GlobalStakedTokensTable', () => ({
  GlobalStakedTokensTable: ({ IsRWLK }: { IsRWLK: boolean }) => (
    <div data-testid="global-staked-tokens">IsRWLK={String(IsRWLK)}</div>
  ),
}));
jest.mock('../../tables/UniqueStakersCSTTable', () => ({
  UniqueStakersCSTTable: () => <div data-testid="unique-cst-stakers" />,
}));
jest.mock('../../tables/UniqueStakersRWLKTable', () => ({
  UniqueStakersRWLKTable: () => <div data-testid="unique-rwlk-stakers" />,
}));
jest.mock('../StatisticsItem', () => ({
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
      <span>{typeof value === 'number' ? String(value) : value}</span>
      {tooltip && <span data-testid="staking-tooltip">{tooltip}</span>}
    </div>
  ),
}));
jest.mock('../StatisticsGroup', () => ({
  StatisticsGroup: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="statistics-group">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
jest.mock('../CollapsibleSection', () => ({
  CollapsibleSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-section">
      <span>{title}</span>
      {children}
    </div>
  ),
}));

const defaultProps: StakingSectionProps = {
  cstStats: {
    NumActiveStakers: 10,
    NumDeposits: 5,
    TotalRewardEth: 1.5,
    TotalTokensMinted: 100,
    TotalTokensStaked: 50,
    UnclaimedRewardEth: 0.3,
  },
  rwlkStats: {
    NumActiveStakers: 3,
    TotalTokensMinted: 20,
    TotalTokensStaked: 8,
  },
  stakingCSTActions: [],
  stakingRWLKActions: [],
  stakedCSTokens: [],
  stakedRWLKTokens: [],
  uniqueCSTStakers: [],
  uniqueRWLKStakers: [],
};

describe('StakingSection', () => {
  it('renders CST anchoring stats', () => {
    render(<StakingSection {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('wraps CST stats in a StatisticsGroup', () => {
    render(<StakingSection {...defaultProps} />);
    expect(screen.getByText('CST Anchoring Overview')).toBeInTheDocument();
  });

  it('wraps tables in CollapsibleSections', () => {
    render(<StakingSection {...defaultProps} />);
    const collapsible = screen.getAllByTestId('collapsible-section');
    expect(collapsible.length).toBeGreaterThanOrEqual(3);
  });

  it('renders anchor-action table for CST', () => {
    render(<StakingSection {...defaultProps} />);
    const tables = screen.getAllByTestId('global-staking-actions');
    expect(tables[0]).toHaveTextContent('IsRWLK=false');
  });

  it('shows loading when stakingCSTActions is null', () => {
    render(<StakingSection {...defaultProps} stakingCSTActions={null} />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('renders tab triggers', () => {
    render(<StakingSection {...defaultProps} />);
    expect(screen.getByText('CosmicSignature Token')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk Token')).toBeInTheDocument();
  });

  it('renders tooltips on anchoring metrics', () => {
    render(<StakingSection {...defaultProps} />);
    const tooltips = screen.getAllByTestId('staking-tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StakingSection {...defaultProps} />);
    await checkA11y(container);
  });
});

import { render, screen, checkA11y } from '@/test-utils';

import { AnchoringSection, type AnchoringSectionProps } from '../AnchoringSection';

jest.mock('../../anchoring/GlobalAnchorActionsTable', () => ({
  GlobalAnchorActionsTable: ({ IsRWLK }: { IsRWLK: boolean }) => (
    <div data-testid="global-anchor-actions">IsRWLK={String(IsRWLK)}</div>
  ),
}));
jest.mock('../../anchoring/GlobalAnchoredTokensTable', () => ({
  GlobalAnchoredTokensTable: ({ IsRWLK }: { IsRWLK: boolean }) => (
    <div data-testid="global-staked-tokens">IsRWLK={String(IsRWLK)}</div>
  ),
}));
jest.mock('../../tables/UniqueAnchorHoldersCSTTable', () => ({
  UniqueAnchorHoldersCSTTable: () => <div data-testid="unique-cst-anchorHolders" />,
}));
jest.mock('../../tables/UniqueAnchorHoldersRWLKTable', () => ({
  UniqueAnchorHoldersRWLKTable: () => <div data-testid="unique-rwlk-anchorHolders" />,
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
      {tooltip && <span data-testid="anchoring-tooltip">{tooltip}</span>}
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

const defaultProps: AnchoringSectionProps = {
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
  cstAnchorActions: [],
  rwlkAnchorActions: [],
  anchoredCSTokens: [],
  anchoredRWLKTokens: [],
  uniqueCSTAnchorHolders: [],
  uniqueRWLKAnchorHolders: [],
};

describe('AnchoringSection', () => {
  it('renders CST anchoring stats', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('wraps CST stats in a StatisticsGroup', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getByText('Cosmic Signature NFT Anchoring Overview')).toBeInTheDocument();
  });

  it('wraps tables in CollapsibleSections', () => {
    render(<AnchoringSection {...defaultProps} />);
    const collapsible = screen.getAllByTestId('collapsible-section');
    expect(collapsible.length).toBeGreaterThanOrEqual(3);
  });

  it('renders anchor-action table for CST', () => {
    render(<AnchoringSection {...defaultProps} />);
    const tables = screen.getAllByTestId('global-anchor-actions');
    expect(tables[0]).toHaveTextContent('IsRWLK=false');
  });

  it('shows loading when cstAnchorActions is null', () => {
    render(<AnchoringSection {...defaultProps} cstAnchorActions={null} />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('renders tab triggers', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getByText('Cosmic Signature NFT')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk NFT')).toBeInTheDocument();
  });

  it('renders tooltips on anchoring metrics', () => {
    render(<AnchoringSection {...defaultProps} />);
    const tooltips = screen.getAllByTestId('anchoring-tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringSection {...defaultProps} />);
    await checkA11y(container);
  });
});

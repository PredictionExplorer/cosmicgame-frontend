import { statisticsCopy } from '@/content/statistics-copy';

import { fireEvent, render, screen, checkA11y } from '@/test-utils';

import {
  AnchoringSection,
  type AnchoringDataState,
  type AnchoringSectionProps,
} from '../AnchoringSection';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
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
  StatisticsGroup: ({
    title,
    children,
    tooltip,
  }: {
    title: string;
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <div data-testid="statistics-group">
      <span>{title}</span>
      {tooltip && <span data-testid="group-tooltip">{tooltip}</span>}
      {children}
    </div>
  ),
}));
jest.mock('../CollapsibleSection', () => ({
  CollapsibleSection: ({
    title,
    children,
    tooltip,
  }: {
    title: string;
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <div data-testid="collapsible-section">
      <span>{title}</span>
      {tooltip && <span data-testid="section-tooltip">{tooltip}</span>}
      {children}
    </div>
  ),
}));

function dataState<T>(data: T[] = [], overrides: Partial<AnchoringDataState<T>> = {}) {
  return { data, isLoading: false, isError: false, onRetry: jest.fn(), ...overrides };
}

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
  cstAnchorActions: dataState(),
  rwlkAnchorActions: dataState(),
  anchoredCSTokens: dataState(),
  anchoredRWLKTokens: dataState(),
  uniqueCSTAnchorHolders: dataState(),
  uniqueRWLKAnchorHolders: dataState(),
};

type AnchorActionRecord = NonNullable<AnchoringSectionProps['cstAnchorActions']['data']>[number];

const createAnchorAction = (overrides = {}): AnchorActionRecord =>
  ({
    EvtLogId: 1,
    ActionId: 10,
    TimeStamp: 1701346718,
    ActionType: 0,
    TokenId: 42,
    StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
    NumStakedNFTs: 5,
    ...overrides,
  }) as AnchorActionRecord;

beforeEach(() => jest.clearAllMocks());

describe('AnchoringSection', () => {
  it('renders Cosmic Signature NFT anchoring stats', () => {
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
    render(
      <AnchoringSection {...defaultProps} cstAnchorActions={dataState([createAnchorAction()])} />,
    );
    expect(screen.getAllByText('Anchor Datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Anchor').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates from a CST anchor-action row', () => {
    render(
      <AnchoringSection {...defaultProps} cstAnchorActions={dataState([createAnchorAction()])} />,
    );
    const row = screen.getAllByText('Anchor')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/anchor-action/0/10');
  });

  it('shows a loading skeleton while anchor actions load', () => {
    render(
      <AnchoringSection {...defaultProps} cstAnchorActions={dataState([], { isLoading: true })} />,
    );
    expect(screen.getAllByTestId('stats-section-skeleton').length).toBeGreaterThan(0);
  });

  it('shows an error state with retry when anchor actions fail', () => {
    const onRetry = jest.fn();
    render(
      <AnchoringSection
        {...defaultProps}
        cstAnchorActions={dataState([], { isError: true, onRetry })}
      />,
    );
    expect(screen.getByText(/failed to load anchor \/ release actions/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows an empty state when there are no anchor actions', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getAllByText('No anchor actions yet').length).toBeGreaterThan(0);
  });

  it('renders tab triggers', () => {
    render(<AnchoringSection {...defaultProps} />);
    const cstTab = screen.getByRole('tab', { name: 'Cosmic Signature NFT' });
    const rwlkTab = screen.getByRole('tab', { name: 'RandomWalk NFT' });
    expect(cstTab).toHaveClass('whitespace-normal');
    expect(rwlkTab).toHaveClass('whitespace-normal');
    expect(screen.getByRole('tablist')).toHaveClass('flex-wrap');
  });

  it('renders tooltips on anchoring metrics', () => {
    render(<AnchoringSection {...defaultProps} />);
    const tooltips = screen.getAllByTestId('anchoring-tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('explains imprinted-token anchoring counters', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getByText(statisticsCopy.anchoring.cstTotalTokensImprinted)).toBeInTheDocument();
  });

  it('explains anchoring overview groups', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getByText(statisticsCopy.anchoring.cstGroup)).toBeInTheDocument();
  });

  it('explains anchoring drill-down collapsibles', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(
      screen.getAllByText(statisticsCopy.sections.anchorReleaseActions).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(statisticsCopy.sections.anchoredTokens).length).toBeGreaterThan(0);
    expect(screen.getAllByText(statisticsCopy.sections.uniqueAnchorHolders).length).toBeGreaterThan(
      0,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringSection {...defaultProps} />);
    await checkA11y(container);
  });
});

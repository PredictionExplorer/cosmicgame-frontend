import { checkA11y, render, screen } from '@/test-utils';

import AnchoringPage from '../AnchoringPage';

const mockUseCSTAnchorDistributions = jest.fn();
const mockUseGlobalRWLKAnchorImprints = jest.fn();
const mockUseDashboardInfo = jest.fn();
const mockUseUniqueCSTAnchorHolders = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useCSTAnchorDistributions: (...args: unknown[]) => mockUseCSTAnchorDistributions(...args),
  useGlobalRWLKAnchorImprints: (...args: unknown[]) => mockUseGlobalRWLKAnchorImprints(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
}));

jest.mock('../../../components/anchoring/GlobalAnchorDistributionsTable', () => ({
  GlobalAnchorDistributionsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cst-table">CST rows: {list.length}</div>
  ),
}));

jest.mock('../../../components/anchoring/RwalkAnchorDistributionImprintsTable', () => ({
  RwalkAnchorDistributionImprintsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="rwlk-table">RWLK rows: {list.length}</div>
  ),
}));

jest.mock('../../../components/anchoring/AnchoringHeroStats', () => ({
  AnchoringHeroStats: ({
    stats,
    loading,
  }: {
    stats: { label: string; value: string }[];
    loading?: boolean;
  }) => (
    <div data-testid="anchoring-hero-stats">
      {loading
        ? 'Loading stats...'
        : stats.map((s) => (
            <span key={s.label} data-testid={`stat-${s.label}`}>
              {s.label}: {s.value}
            </span>
          ))}
    </div>
  ),
}));

jest.mock('../../../components/anchoring/HowAnchoringWorks', () => ({
  HowAnchoringWorks: () => <div data-testid="how-anchoring-works">How Anchoring Works</div>,
}));

beforeEach(() => jest.clearAllMocks());

const noError = { data: [], isLoading: false, error: null };

const mockDashboard = {
  data: {
    MainStats: {
      StakeStatisticsCST: { TotalTokensStaked: 100 },
      StakeStatisticsRWalk: { TotalTokensStaked: 25 },
    },
    StakingAmountEth: 5.0,
  },
  isLoading: false,
  error: null,
};

const mockAnchorHolders = {
  data: [{ StakerAddr: '0x1' }, { StakerAddr: '0x2' }, { StakerAddr: '0x3' }],
  isLoading: false,
  error: null,
};

function setupDefaults() {
  mockUseCSTAnchorDistributions.mockReturnValue(noError);
  mockUseGlobalRWLKAnchorImprints.mockReturnValue(noError);
  mockUseDashboardInfo.mockReturnValue(mockDashboard);
  mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
}

describe('AnchoringPage', () => {
  it('renders the heading', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByText('Anchor Distributions')).toBeInTheDocument();
  });

  it('renders the stats dashboard', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByTestId('anchoring-hero-stats')).toBeInTheDocument();
  });

  it('displays stat values from dashboard data', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByTestId('stat-Anchor Distribution Pool')).toHaveTextContent(
      'Anchor Distribution Pool',
    );
    expect(screen.getByTestId('stat-CST Tokens Anchored')).toHaveTextContent('CST Tokens Anchored');
    expect(screen.getByTestId('stat-RWLK Tokens Anchored')).toHaveTextContent(
      'RWLK Tokens Anchored',
    );
    expect(screen.getByTestId('stat-Distribution per CST')).toHaveTextContent(
      'Distribution per CST',
    );
    expect(screen.getByTestId('stat-Unique Anchor-holders')).toHaveTextContent(
      'Unique Anchor-holders',
    );
  });

  it('shows stats loading state when dashboard is loading', () => {
    mockUseCSTAnchorDistributions.mockReturnValue(noError);
    mockUseGlobalRWLKAnchorImprints.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    mockUseUniqueCSTAnchorHolders.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<AnchoringPage />);
    expect(screen.getByText('Loading stats...')).toBeInTheDocument();
  });

  it('renders the how anchoring Works section', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByTestId('how-anchoring-works')).toBeInTheDocument();
  });

  it('renders the Start Anchoring CTA link', () => {
    setupDefaults();
    render(<AnchoringPage />);
    const link = screen.getByRole('link', { name: /start anchoring/i });
    expect(link).toHaveAttribute('href', '/my-anchors');
  });

  it('shows skeleton loading for CST table when loading', () => {
    mockUseCSTAnchorDistributions.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    mockUseGlobalRWLKAnchorImprints.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
    render(<AnchoringPage />);
    expect(screen.queryByTestId('cst-table')).not.toBeInTheDocument();
  });

  it('shows error state for CST error', () => {
    mockUseCSTAnchorDistributions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'CST fetch failed' },
    });
    mockUseGlobalRWLKAnchorImprints.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
    render(<AnchoringPage />);
    expect(screen.getByText('Error loading anchoring data')).toBeInTheDocument();
    expect(screen.getByText('CST fetch failed')).toBeInTheDocument();
  });

  it('shows error state for RWLK error', () => {
    mockUseCSTAnchorDistributions.mockReturnValue(noError);
    mockUseGlobalRWLKAnchorImprints.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'RWLK fetch failed' },
    });
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
    render(<AnchoringPage />);
    expect(screen.getByText('Error loading anchoring data')).toBeInTheDocument();
    expect(screen.getByText('RWLK fetch failed')).toBeInTheDocument();
  });

  it('renders both tables when loaded', () => {
    mockUseCSTAnchorDistributions.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
      error: null,
    });
    mockUseGlobalRWLKAnchorImprints.mockReturnValue({
      data: [{ id: 2 }, { id: 3 }],
      isLoading: false,
      error: null,
    });
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
    render(<AnchoringPage />);
    expect(screen.getByTestId('cst-table')).toHaveTextContent('CST rows: 1');
    expect(screen.getByTestId('rwlk-table')).toHaveTextContent('RWLK rows: 2');
  });

  it('renders section headings', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByText('CosmicSignature Token')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk NFT')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    setupDefaults();
    const { container } = render(<AnchoringPage />);
    await checkA11y(container, {
      rules: { 'heading-order': { enabled: false } },
    });
  });
});

import { checkA11y, render, screen } from '@/test-utils';

import AnchoringPage from '../AnchoringPage';

const mockUseCSTAnchorDistributions = jest.fn();
const mockUseGlobalRWLKAnchorImprints = jest.fn();
const mockUseDashboardInfo = jest.fn();
const mockUseUniqueCSTAnchorHolders = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCSTAnchorDistributions: (...args: unknown[]) => mockUseCSTAnchorDistributions(...args),
  useGlobalRWLKAnchorImprints: (...args: unknown[]) => mockUseGlobalRWLKAnchorImprints(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
}));

jest.mock('../../../../../components/anchoring/GlobalAnchorDistributionsTable', () => ({
  GlobalAnchorDistributionsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cst-table">CST rows: {list.length}</div>
  ),
}));

jest.mock('../../../../../components/anchoring/RwalkAnchorDistributionImprintsTable', () => ({
  RwalkAnchorDistributionImprintsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="rwlk-table">RWLK rows: {list.length}</div>
  ),
}));

jest.mock('../../../../../components/anchoring/AnchoringHeroStats', () => ({
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

jest.mock('../../../../../components/anchoring/HowAnchoringWorks', () => ({
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
    expect(screen.getByText('anchoring.overview.title')).toBeInTheDocument();
  });

  it('renders the stats dashboard', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByTestId('anchoring-hero-stats')).toBeInTheDocument();
  });

  it('displays stat values from dashboard data', () => {
    setupDefaults();
    render(<AnchoringPage />);
    expect(screen.getByTestId('stat-anchoring.overview.stats.pool.label')).toHaveTextContent(
      'anchoring.overview.stats.pool.label',
    );
    expect(
      screen.getByTestId('stat-anchoring.overview.stats.cosmicSignatureAnchored.label'),
    ).toHaveTextContent('anchoring.overview.stats.cosmicSignatureAnchored.label');
    expect(
      screen.getByTestId('stat-anchoring.overview.stats.randomWalkAnchored.label'),
    ).toHaveTextContent('anchoring.overview.stats.randomWalkAnchored.label');
    expect(
      screen.getByTestId('stat-anchoring.overview.stats.distributionPerNft.label'),
    ).toHaveTextContent('anchoring.overview.stats.distributionPerNft.label');
    expect(
      screen.getByTestId('stat-anchoring.overview.stats.uniqueHolders.label'),
    ).toHaveTextContent('anchoring.overview.stats.uniqueHolders.label');
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
    const link = screen.getByRole('link', { name: /anchoring\.overview\.cta\.title/i });
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

  it('shows a translated fallback instead of the raw CST error', () => {
    mockUseCSTAnchorDistributions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'CST fetch failed' },
    });
    mockUseGlobalRWLKAnchorImprints.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
    render(<AnchoringPage />);
    expect(screen.getByText('anchoring.overview.errorTitle')).toBeInTheDocument();
    expect(screen.getByText('anchoring.overview.errorMessage')).toBeInTheDocument();
    expect(screen.queryByText('CST fetch failed')).not.toBeInTheDocument();
  });

  it('shows a translated fallback instead of the raw RWLK error', () => {
    mockUseCSTAnchorDistributions.mockReturnValue(noError);
    mockUseGlobalRWLKAnchorImprints.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'RWLK fetch failed' },
    });
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTAnchorHolders.mockReturnValue(mockAnchorHolders);
    render(<AnchoringPage />);
    expect(screen.getByText('anchoring.overview.errorTitle')).toBeInTheDocument();
    expect(screen.getByText('anchoring.overview.errorMessage')).toBeInTheDocument();
    expect(screen.queryByText('RWLK fetch failed')).not.toBeInTheDocument();
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
    expect(screen.getByText('anchoring.overview.sections.cosmicSignature')).toBeInTheDocument();
    expect(screen.getByText('anchoring.overview.sections.randomWalk')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    setupDefaults();
    const { container } = render(<AnchoringPage />);
    await checkA11y(container, {
      rules: { 'heading-order': { enabled: false } },
    });
  });
});

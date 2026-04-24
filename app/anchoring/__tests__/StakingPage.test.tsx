import { checkA11y, render, screen } from '@/test-utils';

import StakingPage from '../StakingPage';

const mockUseStakingCSTRewards = jest.fn();
const mockUseStakingRWLKMintsGlobal = jest.fn();
const mockUseDashboardInfo = jest.fn();
const mockUseUniqueCSTStakers = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useStakingCSTRewards: (...args: unknown[]) => mockUseStakingCSTRewards(...args),
  useStakingRWLKMintsGlobal: (...args: unknown[]) => mockUseStakingRWLKMintsGlobal(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useUniqueCSTStakers: (...args: unknown[]) => mockUseUniqueCSTStakers(...args),
}));

jest.mock('../../../components/staking/GlobalStakingRewardsTable', () => ({
  GlobalStakingRewardsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cst-table">CST rows: {list.length}</div>
  ),
}));

jest.mock('../../../components/staking/RwalkStakingRewardMintsTable', () => ({
  RwalkStakingRewardMintsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="rwlk-table">RWLK rows: {list.length}</div>
  ),
}));

jest.mock('../../../components/staking/StakingHeroStats', () => ({
  StakingHeroStats: ({
    stats,
    loading,
  }: {
    stats: { label: string; value: string }[];
    loading?: boolean;
  }) => (
    <div data-testid="staking-hero-stats">
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

jest.mock('../../../components/staking/HowStakingWorks', () => ({
  HowStakingWorks: () => <div data-testid="how-staking-works">How Staking Works</div>,
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

const mockStakers = {
  data: [{ StakerAddr: '0x1' }, { StakerAddr: '0x2' }, { StakerAddr: '0x3' }],
  isLoading: false,
  error: null,
};

function setupDefaults() {
  mockUseStakingCSTRewards.mockReturnValue(noError);
  mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
  mockUseDashboardInfo.mockReturnValue(mockDashboard);
  mockUseUniqueCSTStakers.mockReturnValue(mockStakers);
}

describe('StakingPage', () => {
  it('renders the heading', () => {
    setupDefaults();
    render(<StakingPage />);
    expect(screen.getByText('Anchor Distributions')).toBeInTheDocument();
  });

  it('renders the stats dashboard', () => {
    setupDefaults();
    render(<StakingPage />);
    expect(screen.getByTestId('staking-hero-stats')).toBeInTheDocument();
  });

  it('displays stat values from dashboard data', () => {
    setupDefaults();
    render(<StakingPage />);
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
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    mockUseUniqueCSTStakers.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<StakingPage />);
    expect(screen.getByText('Loading stats...')).toBeInTheDocument();
  });

  it('renders the How Staking Works section', () => {
    setupDefaults();
    render(<StakingPage />);
    expect(screen.getByTestId('how-staking-works')).toBeInTheDocument();
  });

  it('renders the Start Staking CTA link', () => {
    setupDefaults();
    render(<StakingPage />);
    const link = screen.getByRole('link', { name: /start anchoring/i });
    expect(link).toHaveAttribute('href', '/my-anchors');
  });

  it('shows skeleton loading for CST table when loading', () => {
    mockUseStakingCSTRewards.mockReturnValue({ data: undefined, isLoading: true, error: null });
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTStakers.mockReturnValue(mockStakers);
    render(<StakingPage />);
    expect(screen.queryByTestId('cst-table')).not.toBeInTheDocument();
  });

  it('shows error state for CST error', () => {
    mockUseStakingCSTRewards.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'CST fetch failed' },
    });
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTStakers.mockReturnValue(mockStakers);
    render(<StakingPage />);
    expect(screen.getByText('Error loading anchoring data')).toBeInTheDocument();
    expect(screen.getByText('CST fetch failed')).toBeInTheDocument();
  });

  it('shows error state for RWLK error', () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'RWLK fetch failed' },
    });
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTStakers.mockReturnValue(mockStakers);
    render(<StakingPage />);
    expect(screen.getByText('Error loading anchoring data')).toBeInTheDocument();
    expect(screen.getByText('RWLK fetch failed')).toBeInTheDocument();
  });

  it('renders both tables when loaded', () => {
    mockUseStakingCSTRewards.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
      error: null,
    });
    mockUseStakingRWLKMintsGlobal.mockReturnValue({
      data: [{ id: 2 }, { id: 3 }],
      isLoading: false,
      error: null,
    });
    mockUseDashboardInfo.mockReturnValue(mockDashboard);
    mockUseUniqueCSTStakers.mockReturnValue(mockStakers);
    render(<StakingPage />);
    expect(screen.getByTestId('cst-table')).toHaveTextContent('CST rows: 1');
    expect(screen.getByTestId('rwlk-table')).toHaveTextContent('RWLK rows: 2');
  });

  it('renders section headings', () => {
    setupDefaults();
    render(<StakingPage />);
    expect(screen.getByText('CosmicSignature Token')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk NFT')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    setupDefaults();
    const { container } = render(<StakingPage />);
    await checkA11y(container, {
      rules: { 'heading-order': { enabled: false } },
    });
  });
});

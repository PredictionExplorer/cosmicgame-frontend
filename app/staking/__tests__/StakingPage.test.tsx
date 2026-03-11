import { checkA11y, render, screen } from '@/test-utils';

import StakingPage from '../StakingPage';

const mockUseStakingCSTRewards = jest.fn();
const mockUseStakingRWLKMintsGlobal = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useStakingCSTRewards: (...args: unknown[]) => mockUseStakingCSTRewards(...args),
  useStakingRWLKMintsGlobal: (...args: unknown[]) => mockUseStakingRWLKMintsGlobal(...args),
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

beforeEach(() => jest.clearAllMocks());

const noError = { data: [], isLoading: false, error: null };

describe('StakingPage', () => {
  it('renders the heading', () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    render(<StakingPage />);
    expect(screen.getByText('Staking Rewards')).toBeInTheDocument();
  });

  it('shows loading when CST is loading', () => {
    mockUseStakingCSTRewards.mockReturnValue({ data: undefined, isLoading: true, error: null });
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    render(<StakingPage />);
    const loadingEls = screen.getAllByText('Loading...');
    expect(loadingEls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading when RWLK is loading', () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<StakingPage />);
    const loadingEls = screen.getAllByText('Loading...');
    expect(loadingEls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error state for CST error', () => {
    mockUseStakingCSTRewards.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'CST fetch failed' },
    });
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    render(<StakingPage />);
    expect(screen.getByText('Error loading staking data')).toBeInTheDocument();
    expect(screen.getByText('CST fetch failed')).toBeInTheDocument();
  });

  it('shows error state for RWLK error', () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'RWLK fetch failed' },
    });
    render(<StakingPage />);
    expect(screen.getByText('Error loading staking data')).toBeInTheDocument();
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
    render(<StakingPage />);
    expect(screen.getByTestId('cst-table')).toHaveTextContent('CST rows: 1');
    expect(screen.getByTestId('rwlk-table')).toHaveTextContent('RWLK rows: 2');
  });

  it('renders section headings', () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    render(<StakingPage />);
    expect(screen.getByText('CosmicSignature Token')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk NFT')).toBeInTheDocument();
  });

  it('renders MY STAKING link', () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    render(<StakingPage />);
    const link = screen.getByRole('link', { name: '"MY STAKING"' });
    expect(link).toHaveAttribute('href', '/my-staking');
  });

  it('has no accessibility violations', async () => {
    mockUseStakingCSTRewards.mockReturnValue(noError);
    mockUseStakingRWLKMintsGlobal.mockReturnValue(noError);
    const { container } = render(<StakingPage />);
    await checkA11y(container, {
      rules: { 'heading-order': { enabled: false } },
    });
  });
});

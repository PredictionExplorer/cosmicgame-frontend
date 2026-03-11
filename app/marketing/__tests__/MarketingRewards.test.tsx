import { render, screen, checkA11y } from '@/test-utils';

import MarketingRewards from '../MarketingRewards';

const mockUseMarketingRewards = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useMarketingRewards: (...args: unknown[]) => mockUseMarketingRewards(...args),
}));

jest.mock('../../../components/tables/GlobalMarketingRewardsTable', () => ({
  GlobalMarketingRewardsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="rewards-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('MarketingRewards', () => {
  it('renders the heading', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewards />);
    expect(screen.getByText('Marketing Rewards')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: true });
    render(<MarketingRewards />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the table when loaded', () => {
    mockUseMarketingRewards.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    });
    render(<MarketingRewards />);
    expect(screen.getByTestId('rewards-table')).toHaveTextContent('rows: 1');
  });

  it('renders the contact text when loaded', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewards />);
    expect(screen.getByText(/please contact our marketing team/)).toBeInTheDocument();
  });

  it('does not show contact text while loading', () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: true });
    render(<MarketingRewards />);
    expect(screen.queryByText(/please contact our marketing team/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseMarketingRewards.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<MarketingRewards />);
    await checkA11y(container);
  });
});

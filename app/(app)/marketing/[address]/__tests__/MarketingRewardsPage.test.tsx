import { render, screen, checkA11y } from '@/test-utils';

import MarketingRewardsPage from '../MarketingRewardsPage';

const mockUseMarketingRewardsByUser = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useMarketingRewardsByUser: (...args: unknown[]) => mockUseMarketingRewardsByUser(...args),
}));

jest.mock('../../../../../components/tables/MarketingRewardsTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="rewards-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

describe('MarketingRewardsPage', () => {
  it('renders heading with valid address', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.getByText('Marketing Rewards for User')).toBeInTheDocument();
  });

  it('shows invalid address message for bad input', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewardsPage address="not-an-address" />);
    expect(screen.getByText('Invalid Ethereum Address')).toBeInTheDocument();
  });

  it('does not fetch data for invalid address', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewardsPage address="bad" />);
    expect(mockUseMarketingRewardsByUser).toHaveBeenCalledWith(undefined);
  });

  it('shows loading state', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: true });
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table when loaded', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    });
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.getByTestId('rewards-table')).toHaveTextContent('rows: 1');
  });

  it('checksums the address and passes it to the hook', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    const arg = mockUseMarketingRewardsByUser.mock.calls[0][0];
    expect(arg).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('renders a link to the user page', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('/user/'));
  });

  it('has no accessibility violations', async () => {
    mockUseMarketingRewardsByUser.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    await checkA11y(container);
  });
});

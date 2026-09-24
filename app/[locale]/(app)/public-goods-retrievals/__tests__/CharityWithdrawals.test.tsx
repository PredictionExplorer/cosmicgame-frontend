import { render, screen, checkA11y } from '@/test-utils';

import CharityWithdrawals from '../CharityWithdrawals';

const mockUseCharityWithdrawals = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCharityWithdrawals: (...args: unknown[]) => mockUseCharityWithdrawals(...args),
}));

jest.mock('../../../../../components/tables/CharityWithdrawalTable', () => ({
  __esModule: true,
  default: ({ list, loading }: { list: unknown[]; loading?: boolean }) => (
    <div data-testid="withdrawal-table" data-loading={loading ? 'true' : undefined}>
      rows: {list.length}
    </div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('CharityWithdrawals', () => {
  it('renders the heading', () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: false });
    render(<CharityWithdrawals />);
    expect(screen.getByText('Public Goods Retrievals')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: true });
    render(<CharityWithdrawals />);
    expect(screen.getByTestId('withdrawal-table')).toHaveAttribute('data-loading', 'true');
  });

  it('renders the table when loaded', () => {
    mockUseCharityWithdrawals.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
    });
    render(<CharityWithdrawals />);
    expect(screen.getByTestId('withdrawal-table')).toHaveTextContent('rows: 3');
  });

  it('does not show loading when data is ready', () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: false });
    render(<CharityWithdrawals />);
    expect(screen.getByTestId('withdrawal-table')).not.toHaveAttribute('data-loading');
  });

  it('has no accessibility violations', async () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CharityWithdrawals />);
    await checkA11y(container);
  });
});

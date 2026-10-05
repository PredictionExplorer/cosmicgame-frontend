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

const HEADER = <h1>Public Goods retrievals</h1>;

beforeEach(() => jest.clearAllMocks());

describe('CharityWithdrawals', () => {
  it('renders the server header it is given', () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: false });
    render(<CharityWithdrawals header={HEADER} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Public Goods retrievals');
  });

  it('shows loading state', () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: true });
    render(<CharityWithdrawals header={HEADER} />);
    expect(screen.getByTestId('withdrawal-table')).toHaveAttribute('data-loading', 'true');
  });

  it('renders the table when loaded', () => {
    mockUseCharityWithdrawals.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
    });
    render(<CharityWithdrawals header={HEADER} />);
    expect(screen.getByTestId('withdrawal-table')).toHaveTextContent('rows: 3');
  });

  it('does not show loading when data is ready', () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: false });
    render(<CharityWithdrawals header={HEADER} />);
    expect(screen.getByTestId('withdrawal-table')).not.toHaveAttribute('data-loading');
  });

  it('has no accessibility violations', async () => {
    mockUseCharityWithdrawals.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CharityWithdrawals header={HEADER} />);
    await checkA11y(container);
  });
});

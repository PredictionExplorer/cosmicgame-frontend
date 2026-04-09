import { render, screen, checkA11y } from '@/test-utils';

import CharityCGDeposits from '../CharityCGDeposits';

const mockUseCharityCGDeposits = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useCharityCGDeposits: (...args: unknown[]) => mockUseCharityCGDeposits(...args),
}));

jest.mock('../../../../components/tables/CharityDepositTable', () => ({
  CharityDepositTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="deposit-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('CharityCGDeposits', () => {
  it('renders the heading', () => {
    mockUseCharityCGDeposits.mockReturnValue({ data: [], isLoading: false });
    render(<CharityCGDeposits />);
    expect(screen.getByText('Charity Deposits')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseCharityCGDeposits.mockReturnValue({ data: [], isLoading: true });
    render(<CharityCGDeposits />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the table when loaded', () => {
    mockUseCharityCGDeposits.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
    });
    render(<CharityCGDeposits />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 2');
  });

  it('renders empty table when no data', () => {
    mockUseCharityCGDeposits.mockReturnValue({ data: [], isLoading: false });
    render(<CharityCGDeposits />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 0');
  });

  it('has no accessibility violations', async () => {
    mockUseCharityCGDeposits.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CharityCGDeposits />);
    await checkA11y(container);
  });
});

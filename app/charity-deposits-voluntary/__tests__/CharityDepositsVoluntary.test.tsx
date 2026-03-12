import { render, screen, checkA11y } from '@/test-utils';

import CharityDepositsVoluntary from '../CharityDepositsVoluntary';

const mockUseCharityVoluntary = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useCharityVoluntary: (...args: unknown[]) => mockUseCharityVoluntary(...args),
}));

jest.mock('../../../components/tables/CharityDepositTable', () => ({
  CharityDepositTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="deposit-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('CharityDepositsVoluntary', () => {
  it('renders the heading', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary />);
    expect(screen.getByText('Voluntary Donations')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: true });
    render(<CharityDepositsVoluntary />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the table when loaded', () => {
    mockUseCharityVoluntary.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    });
    render(<CharityDepositsVoluntary />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 1');
  });

  it('renders empty table when no data', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 0');
  });

  it('has no accessibility violations', async () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CharityDepositsVoluntary />);
    await checkA11y(container);
  });
});

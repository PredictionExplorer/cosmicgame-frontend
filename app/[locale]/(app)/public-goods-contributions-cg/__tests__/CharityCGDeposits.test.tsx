import { render, screen, checkA11y } from '@/test-utils';

import CharityCGDeposits from '../CharityCGDeposits';

const mockUseCharityCGDeposits = jest.fn();
const mockUseDashboardInfo = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCharityCGDeposits: (...args: unknown[]) => mockUseCharityCGDeposits(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

jest.mock('../../../../../components/tables/CharityDepositTable', () => ({
  CharityDepositTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="deposit-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue({ data: undefined });
});

describe('CharityCGDeposits', () => {
  it('renders the heading', () => {
    mockUseCharityCGDeposits.mockReturnValue({ data: [], isLoading: false });
    render(<CharityCGDeposits />);
    expect(screen.getByText('Protocol Public-Goods Contributions')).toBeInTheDocument();
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

  it('moves the compact Public Goods summary above the protocol-forward table', () => {
    mockUseCharityCGDeposits.mockReturnValue({ data: [], isLoading: false });
    mockUseDashboardInfo.mockReturnValue({
      data: {
        CharityPercentage: 7,
        CosmicGameBalanceEth: 10,
        CharityBalanceEth: 0.5,
        SumVoluntaryDonationsEth: 0.8,
        MainStats: { SumCosmicGameDonationsEth: 1.2, SumWithdrawals: 0.4 },
      },
    });

    render(<CharityCGDeposits />);

    const summary = screen.getByTestId('public-goods-impact-card');
    const table = screen.getByTestId('deposit-table');
    expect(summary).toHaveAttribute('data-variant', 'compact');
    expect(summary.compareDocumentPosition(table)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(summary).toHaveTextContent('0.7000 ETH');
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

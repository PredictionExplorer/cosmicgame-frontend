import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import CharityCGDeposits from '../CharityCGDeposits';

const mockUseCharityCGDeposits = jest.fn();
const mockUseDashboardInfo = jest.fn();
const mockRefetch = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useCharityCGDeposits: (...args: unknown[]) => mockUseCharityCGDeposits(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

jest.mock('@/components/tables/CharityDepositTable', () => ({
  CharityDepositTable: ({
    list,
    loading,
    error,
    onRetry,
  }: {
    list: unknown[];
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
  }) => (
    <div data-testid="deposit-table" data-loading={loading ? 'true' : undefined}>
      rows: {list.length}
      {error ? (
        <button type="button" onClick={onRetry}>
          {error}
        </button>
      ) : null}
    </div>
  ),
}));

const HEADER = <h1>Protocol Public Goods contributions</h1>;

function withDeposits(
  data: unknown[] | undefined,
  state: { isLoading?: boolean; isError?: boolean } = {},
) {
  mockUseCharityCGDeposits.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...state,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue({ data: undefined });
  withDeposits([]);
});

describe('CharityCGDeposits', () => {
  it('renders the server header it is given', () => {
    render(<CharityCGDeposits header={HEADER} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Protocol Public Goods contributions',
    );
  });

  it('hands the loading state to the ledger', () => {
    withDeposits(undefined, { isLoading: true });
    render(<CharityCGDeposits header={HEADER} />);
    expect(screen.getByTestId('deposit-table')).toHaveAttribute('data-loading', 'true');
  });

  it('renders the table when loaded', () => {
    withDeposits([{ id: 1 }, { id: 2 }]);
    render(<CharityCGDeposits header={HEADER} />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 2');
  });

  it('offers a retry when the records cannot be read', () => {
    withDeposits(undefined, { isError: true });
    render(<CharityCGDeposits header={HEADER} />);
    fireEvent.click(
      screen.getByRole('button', { name: "The Public Goods records couldn't be loaded." }),
    );
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('puts the compact Public Goods summary above the protocol-forward table', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: {
        CharityPercentage: 7,
        CosmicGameBalanceEth: 10,
        CharityBalanceEth: 0.5,
        SumVoluntaryDonationsEth: 0.8,
        MainStats: { SumCosmicGameDonationsEth: 1.2, SumWithdrawals: 0.4 },
      },
    });

    render(<CharityCGDeposits header={HEADER} />);

    const summary = screen.getByTestId('public-goods-impact-card');
    const table = screen.getByTestId('deposit-table');
    expect(summary).toHaveAttribute('data-variant', 'compact');
    expect(summary.compareDocumentPosition(table)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(summary).toHaveTextContent('0.7000 ETH');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharityCGDeposits header={HEADER} />);
    await checkA11y(container);
  });
});

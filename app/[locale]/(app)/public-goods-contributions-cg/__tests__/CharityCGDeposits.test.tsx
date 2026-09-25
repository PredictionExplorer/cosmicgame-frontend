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
      screen.getByRole('button', { name: 'The Public Goods records couldn’t be loaded.' }),
    );
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  describe('the Public Goods Vault', () => {
    const dashboard = {
      CharityPercentage: 7,
      CosmicGameBalanceEth: 10,
      CharityBalanceEth: 0.5,
      MainStats: { SumWithdrawals: 0.4 },
    };

    /** The figure whose label is `label`, as the text of its group. */
    const figure = (label: string) =>
      screen.getByText(label, { selector: 'span' }).closest('[data-figure]');

    it('sits above the forwards it receives', () => {
      mockUseDashboardInfo.mockReturnValue({ data: dashboard, isLoading: false });
      render(<CharityCGDeposits header={HEADER} />);
      const vault = screen.getByRole('region', { name: 'formats.address.known.publicGoods' });
      expect(vault.compareDocumentPosition(screen.getByTestId('deposit-table'))).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(vault).toHaveTextContent('retrieved for Protocol Guild');
    });

    it("shows the live cycle's share, the balance and what has been retrieved", () => {
      mockUseDashboardInfo.mockReturnValue({ data: dashboard, isLoading: false });
      render(<CharityCGDeposits header={HEADER} />);
      expect(figure('Due from this cycle')).toHaveTextContent('0.70');
      expect(figure('Due from this cycle')).toHaveTextContent('7% of the Cycle Reserve so far');
      expect(figure('In the vault now')).toHaveTextContent('0.50');
      expect(figure('Retrieved so far')).toHaveTextContent('0.40');
    });

    it('marks a figure it could not read as unavailable, never 0', () => {
      mockUseDashboardInfo.mockReturnValue({
        data: { ...dashboard, CharityBalanceEth: undefined },
        isLoading: false,
      });
      render(<CharityCGDeposits header={HEADER} />);
      expect(figure('In the vault now')).not.toHaveTextContent('0');
      expect(figure('Due from this cycle')).toHaveTextContent('0.70');
    });

    it('holds each figure with a placeholder while the dashboard loads', () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<CharityCGDeposits header={HEADER} />);
      const vault = screen.getByRole('region', { name: 'formats.address.known.publicGoods' });
      expect(vault.querySelectorAll('[data-slot="skeleton"], .animate-pulse').length).toBe(3);
      expect(container).not.toHaveTextContent('ETH');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharityCGDeposits header={HEADER} />);
    await checkA11y(container);
  });
});

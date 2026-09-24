import { render, screen, checkA11y, within } from '@/test-utils';

import CharityDepositsVoluntary from '../CharityDepositsVoluntary';

const mockUseCharityVoluntary = jest.fn();

jest.mock('../../../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () =>
    jest.requireActual('../../../../../test-utils/contractAddressesFixture')
      .TEST_APP_CONTRACT_ADDRESSES,
}));

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCharityVoluntary: (...args: unknown[]) => mockUseCharityVoluntary(...args),
}));

jest.mock('../../../../../components/tables/CharityDepositTable', () => ({
  CharityDepositTable: ({
    list,
    loading,
    emptyAction,
  }: {
    list: unknown[];
    loading?: boolean;
    emptyAction?: React.ReactNode;
  }) => (
    <div data-testid="deposit-table" data-loading={loading ? 'true' : undefined}>
      rows: {list.length}
      {list.length === 0 && !loading ? emptyAction : null}
    </div>
  ),
}));

const HEADER = <h1>Voluntary Public Goods contributions</h1>;

beforeEach(() => jest.clearAllMocks());

describe('CharityDepositsVoluntary', () => {
  it('renders the server header it is given', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary header={HEADER} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Voluntary Public Goods contributions',
    );
  });

  it('shows loading state', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: true });
    render(<CharityDepositsVoluntary header={HEADER} />);
    expect(screen.getByTestId('deposit-table')).toHaveAttribute('data-loading', 'true');
  });

  it('renders the table when loaded', () => {
    mockUseCharityVoluntary.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    });
    render(<CharityDepositsVoluntary header={HEADER} />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 1');
  });

  it('renders empty table when no data', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary header={HEADER} />);
    expect(screen.getByTestId('deposit-table')).toHaveTextContent('rows: 0');
  });

  it('names the vault that voluntary contributions go to, with its address to copy', () => {
    // Regression: the empty state showed the vault as a bare hex chip.
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary header={HEADER} />);
    const table = screen.getByTestId('deposit-table');
    expect(within(table).getByText('formats.address.known.publicGoods')).toBeInTheDocument();
    expect(
      within(table).getByTitle('0x6666666666666666666666666666666666666666'),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('button', { name: 'common.actions.copyAddress' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CharityDepositsVoluntary header={HEADER} />);
    await checkA11y(container);
  });
});

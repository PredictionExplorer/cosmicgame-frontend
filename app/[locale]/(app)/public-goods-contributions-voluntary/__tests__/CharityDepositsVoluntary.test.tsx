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
    title,
    emptyAction,
  }: {
    list: unknown[];
    loading?: boolean;
    title?: React.ReactNode;
    emptyAction?: React.ReactNode;
  }) => (
    <div data-testid="deposit-table" data-loading={loading ? 'true' : undefined}>
      <h2>{title}</h2>
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

  it('names the ledger, not the page again', () => {
    // Regression: its H2 repeated the H1 ("Voluntary contributions").
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary header={HEADER} />);
    expect(within(screen.getByTestId('deposit-table')).getByRole('heading')).toHaveTextContent(
      'Contributions',
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

  it('says how to contribute, with the vault address to copy, also once the ledger has rows (regression)', () => {
    // The instructions and the address lived only in the empty state, so the
    // first contribution took away the page's only guidance.
    mockUseCharityVoluntary.mockReturnValue({ data: [{ id: 1 }], isLoading: false });
    render(<CharityDepositsVoluntary header={HEADER} />);
    const section = screen.getByRole('region', { name: 'Contribute to the vault' });
    expect(within(section).getByText('formats.address.known.publicGoods')).toBeInTheDocument();
    expect(
      within(section).getByTitle('0x6666666666666666666666666666666666666666'),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('button', { name: 'common.actions.copyAddress' }),
    ).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /Arbiscan/ })).toHaveAttribute(
      'href',
      expect.stringContaining('0x6666666666666666666666666666666666666666'),
    );
  });

  // V332: the page told readers to send ETH without naming the one network
  // the vault exists on, and showed a shortened address on phones.
  it('names the network three times and shows the whole address', () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    render(<CharityDepositsVoluntary header={HEADER} />);
    const section = screen.getByRole('region', { name: 'Contribute to the vault' });
    expect(
      within(section).getByText(/^Send ETH on Arbitrum Sepolia straight to/),
    ).toBeInTheDocument();
    expect(within(section).getByText('Network')).toBeInTheDocument();
    expect(within(section).getByText('Arbitrum Sepolia')).toBeInTheDocument();
    expect(within(section).getByText(/^Send only on Arbitrum Sepolia\./)).toBeInTheDocument();
    expect(
      within(section).getByText('0x6666666666666666666666666666666666666666'),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('form', { name: 'publicGoods.contribute.form.label' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseCharityVoluntary.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CharityDepositsVoluntary header={HEADER} />);
    await checkA11y(container);
  });
});

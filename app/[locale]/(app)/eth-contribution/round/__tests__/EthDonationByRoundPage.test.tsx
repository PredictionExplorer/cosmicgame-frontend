import { checkA11y, render, screen, within } from '@/test-utils';

import EthDonationByRoundPage from '../[round]/EthDonationByRoundPage';

const mockUseDonationsBothByRound = jest.fn();
const mockUseDashboardInfo = jest.fn();
const mockRefetch = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useDonationsBothByRound: (...args: unknown[]) => mockUseDonationsBothByRound(...args),
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

jest.mock('@/components/tables/EthDonationTable', () => ({
  __esModule: true,
  default: ({
    list,
    loading,
    emptyDescription,
  }: {
    list: unknown[];
    loading?: boolean;
    emptyDescription?: string;
  }) => (
    <div data-testid="contribution-table" data-loading={loading ? 'true' : undefined}>
      rows: {list.length}
      {list.length === 0 && !loading ? <p>{emptyDescription}</p> : null}
    </div>
  ),
}));

const ROWS = [
  { EvtLogId: 1, DonorAddr: '0xAA', AmountEth: 1.5 },
  { EvtLogId: 2, DonorAddr: '0xaa', AmountEth: 2 },
  { EvtLogId: 3, DonorAddr: '0xBB', AmountEth: 0.5 },
];

function withRows(
  data: unknown[] | undefined,
  state: { isLoading?: boolean; isError?: boolean } = {},
) {
  mockUseDonationsBothByRound.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...state,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 9 } });
  withRows(ROWS);
});

describe('EthDonationByRoundPage', () => {
  it('titles the cycle and totals its contributions in the header', () => {
    render(<EthDonationByRoundPage round={7} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.cycle.title(cycle=7)',
    );
    expect(document.querySelector('[data-figure="count"]')).toHaveTextContent('3');
    expect(document.querySelector('[data-figure="total"]')).toHaveTextContent('4.0000 ETH');
    // Contributors count once per address, in any letter case.
    expect(document.querySelector('[data-figure="contributors"]')).toHaveTextContent('2');
    expect(screen.getByTestId('contribution-table')).toHaveTextContent('rows: 3');
  });

  it('links the neighbouring cycles and the finalized cycle allocation', () => {
    render(<EthDonationByRoundPage round={7} />);

    const nav = screen.getByRole('navigation', { name: 'ethContribution.cycle.otherCycles' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/eth-contribution/round/6',
      '/eth-contribution/round/8',
    ]);
    expect(
      screen.getByRole('link', { name: /ethContribution\.cycle\.viewAllocation\(cycle=7\)/ }),
    ).toHaveAttribute('href', '/allocation/7');
  });

  it('stops at cycle 0 and at the live cycle, which links to the live page', () => {
    const { unmount } = render(<EthDonationByRoundPage round={0} />);
    let nav = screen.getByRole('navigation', { name: 'ethContribution.cycle.otherCycles' });
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    unmount();

    render(<EthDonationByRoundPage round={9} />);
    nav = screen.getByRole('navigation', { name: 'ethContribution.cycle.otherCycles' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/eth-contribution/round/8']);
    expect(screen.getByRole('link', { name: /ethContribution\.cycle\.viewLive/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('says once, in the past tense, that a closed cycle had no contributions (regression)', () => {
    // A finished cycle read "Contributions sent while cycle 7 is active appear
    // here." under three zero figures.
    withRows([]);
    render(<EthDonationByRoundPage round={7} />);

    expect(document.querySelector('[data-figure]')).toBeNull();
    expect(
      screen.getByText('ethContribution.cycle.emptyDescriptionPast(cycle=7)'),
    ).toBeInTheDocument();
  });

  it.each([
    ['contributions', ROWS, {}, true],
    ['a loading ledger', undefined, { isLoading: true }, true],
    ['no contributions', [], {}, false],
    ['a failed read', undefined, { isError: true }, false],
  ])(
    'puts %s in the reading column only when there are rows to read (regression)',
    (_, data, state, narrow) => {
      // An empty cycle's state sat in the left 48rem column, off-centre.
      withRows(data, state);
      render(<EthDonationByRoundPage round={3} />);
      expect(
        screen.getByTestId('contribution-table').parentElement?.classList.contains('max-w-3xl'),
      ).toBe(narrow);
    },
  );

  it('keeps the present tense for the live cycle', () => {
    withRows([]);
    render(<EthDonationByRoundPage round={9} />);

    expect(screen.getByText('ethContribution.cycle.emptyDescription(cycle=9)')).toBeInTheDocument();
  });

  it('hands the loading state to the ledger', () => {
    withRows(undefined, { isLoading: true });
    render(<EthDonationByRoundPage round={1} />);
    expect(screen.getByTestId('contribution-table')).toHaveAttribute('data-loading', 'true');
  });

  it('refuses a negative cycle without querying', () => {
    render(<EthDonationByRoundPage round={-1} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.cycle.invalidNumber',
    );
    expect(screen.queryByTestId('contribution-table')).not.toBeInTheDocument();
    expect(mockUseDonationsBothByRound).toHaveBeenCalledWith(-1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EthDonationByRoundPage round={7} />);
    await checkA11y(container);
  });
});

import { protocolFacts } from '@/content/protocol-facts';

import { checkA11y, render, screen } from '@/test-utils';

import AllocationRecipientsPage from '../AllocationRecipientsPage';

const mockUseRoundList = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
}));

let capturedList: unknown[] = [];
let capturedProps: { error?: unknown; onRetry?: () => void; showArt?: boolean } = {};
jest.mock('../../../../../components/tables/AllocationTable', () => ({
  AllocationTable: ({
    list,
    loading,
    ...props
  }: {
    list: unknown[];
    loading: boolean;
    error?: unknown;
    onRetry?: () => void;
    showArt?: boolean;
  }) => {
    capturedList = list;
    capturedProps = props;
    return (
      <div data-testid="allocation-table">{loading ? 'Loading...' : `rows: ${list.length}`}</div>
    );
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  capturedList = [];
});

const createRound = (overrides = {}) => ({
  TimeStamp: 100,
  AmountEth: 1.5,
  RecipientAddr: '0xRecipient',
  RoundStats: { TotalBids: 10 },
  ...overrides,
});

describe('AllocationRecipientsPage', () => {
  it('renders the heading', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);
    expect(screen.getByText('allocation.recipients.header.title')).toBeInTheDocument();
  });

  it('renders the enhanced subtitle', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);
    expect(screen.getByText(/allocation\.recipients\.header\.subtitle/i)).toBeInTheDocument();
  });

  it('explains the scope once, and the split in one sentence under its heading', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);

    expect(
      screen.getByRole('button', {
        name: 'More information about allocation.recipients.header.scope',
      }),
    ).toBeInTheDocument();
    // The legend's terms explain themselves: the heading carries no second (i).
    expect(
      screen.queryByRole('button', {
        name: 'More information about allocation.recipients.reserveSplit.label',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('allocation.recipients.reserveSplit.tooltip')).toBeInTheDocument();
  });

  it('leads with the ledger of finalized cycles, each shown by its Signature', () => {
    mockUseRoundList.mockReturnValue({ data: [createRound()], isLoading: false });
    render(<AllocationRecipientsPage />);
    const ledger = screen.getByTestId('allocation-table');
    const split = screen.getByRole('region', { name: 'allocation.recipients.reserveSplit.label' });
    expect(ledger.compareDocumentPosition(split) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(capturedProps.showArt).toBe(true);
  });

  it('shows a failed cycle list as an error with a retry, never as "no finalized cycles"', () => {
    const refetch = jest.fn();
    mockUseRoundList.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<AllocationRecipientsPage />);
    expect(capturedProps.error).toBe('allocation.recipients.loadError');
    capturedProps.onRetry?.();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('passes loading state to AllocationTable', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: true });
    render(<AllocationRecipientsPage />);
    expect(screen.getByTestId('allocation-table')).toHaveTextContent('Loading...');
  });

  it('sorts data by TimeStamp descending', () => {
    mockUseRoundList.mockReturnValue({
      data: [
        createRound({ TimeStamp: 100, id: 'a' }),
        createRound({ TimeStamp: 300, id: 'c' }),
        createRound({ TimeStamp: 200, id: 'b' }),
      ],
      isLoading: false,
    });
    render(<AllocationRecipientsPage />);
    expect(capturedList).toEqual([
      expect.objectContaining({ TimeStamp: 300, id: 'c' }),
      expect.objectContaining({ TimeStamp: 200, id: 'b' }),
      expect.objectContaining({ TimeStamp: 100, id: 'a' }),
    ]);
  });

  it('renders empty table for no data', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);
    expect(screen.getByTestId('allocation-table')).toHaveTextContent('rows: 0');
  });

  it('renders contract-aligned allocation track percentages', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);
    expect(screen.getByText(`${protocolFacts.mainEthPercentage}%`)).toBeInTheDocument();
    expect(screen.getByText(`${protocolFacts.chronoWarriorEthPercentage}%`)).toBeInTheDocument();
    expect(screen.getByText(`${protocolFacts.stellarSelectionEthPercentage}%`)).toBeInTheDocument();
    expect(screen.getByText(`${protocolFacts.anchorDistributionPercentage}%`)).toBeInTheDocument();
    expect(screen.getByText(`${protocolFacts.publicGoodsPercentage}%`)).toBeInTheDocument();
    expect(screen.getByText(`~${protocolFacts.compoundingReservePercentage}%`)).toBeInTheDocument();
  });

  it('names every track by its canonical label, which explains itself', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);

    // The labels and definitions are the ones /contracts uses (contracts.funds.segments).
    for (const label of [
      'Signature Allocation',
      'Chrono-Warrior',
      'Stellar Selection',
      'Anchor Distribution',
      'Public Goods',
      'Compounding Cycle Reserve',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('draws the split as one bar that names every share for screen readers', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<AllocationRecipientsPage />);
    const bar = screen.getByRole('img', { name: /allocation\.recipients\.reserveSplit\.label/ });
    expect(bar.getAttribute('aria-label')).toContain(
      `track=Signature Allocation,share=${protocolFacts.mainEthPercentage}%`,
    );
  });

  describe('page header', () => {
    it('leaves the totals to the header instead of a second stat row', () => {
      mockUseRoundList.mockReturnValue({
        data: [
          createRound({ AmountEth: 1.5, WinnerAddr: '0xA', RoundStats: { TotalBids: 10 } }),
          createRound({ AmountEth: 2.5, WinnerAddr: '0xB', RoundStats: { TotalBids: 20 } }),
        ],
        isLoading: false,
      });
      render(<AllocationRecipientsPage seoSummary={<h1>Allocation Recipients</h1>} />);

      // The server header (PublicDataRouteSeoSummary) carries cycles, recipients, ETH and
      // gestures; the page body starts with the reserve split and the ledger.
      expect(screen.queryByTestId('summary-stats')).not.toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it('renders its own header with the records scope when rendered without the server one', () => {
      mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
      render(<AllocationRecipientsPage />);
      expect(
        screen.getByRole('heading', { level: 1, name: 'allocation.recipients.header.title' }),
      ).toBeInTheDocument();
      expect(screen.getByText('allocation.recipients.header.scope')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<AllocationRecipientsPage />);
    await checkA11y(container);
  });

  it('has no accessibility violations with data', async () => {
    mockUseRoundList.mockReturnValue({
      data: [createRound(), createRound({ TimeStamp: 200, RecipientAddr: '0xB' })],
      isLoading: false,
    });
    const { container } = render(<AllocationRecipientsPage />);
    await checkA11y(container);
  });
});

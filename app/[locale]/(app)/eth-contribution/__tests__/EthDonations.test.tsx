import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import EthDonations from '../EthDonations';

const mockRefetch = jest.fn();
const mockUseDonationsBoth = jest.fn();
const mockTableProps = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useDonationsBoth: (...args: unknown[]) => mockUseDonationsBoth(...args),
}));

jest.mock('@/components/contributions/EthContributionForm', () => ({
  EthContributionForm: ({ id, onSuccess }: { id?: string; onSuccess?: () => void }) => (
    <section id={id} aria-label="contribution form">
      <button type="button" onClick={onSuccess}>
        confirm contribution
      </button>
    </section>
  ),
}));

jest.mock('@/components/tables/EthDonationTable', () => ({
  __esModule: true,
  default: (props: {
    list: unknown[];
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    title?: string;
  }) => {
    mockTableProps(props);
    return (
      <div data-testid="contribution-table">
        <h2>{props.title}</h2>
        {props.error ? (
          <button type="button" onClick={props.onRetry}>
            {props.error}
          </button>
        ) : null}
        contributions: {props.list.length}
      </div>
    );
  },
}));

const ROWS = [
  {
    EvtLogId: 1,
    TxHash: '0x1',
    TimeStamp: 1,
    RecordType: 0,
    CGRecordId: -1,
    RoundNum: 1,
    DonorAddr: '0xA',
    AmountEth: 1,
  },
  {
    EvtLogId: 2,
    TxHash: '0x2',
    TimeStamp: 2,
    RecordType: 1,
    CGRecordId: 3,
    RoundNum: 1,
    DonorAddr: '0xB',
    AmountEth: 2,
  },
];

function renderPage() {
  return render(<EthDonations formId="contribute" header={<h1>Direct ETH contributions</h1>} />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDonationsBoth.mockReturnValue({
    data: ROWS,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  });
});

describe('EthDonations', () => {
  it('renders the server header, the history ledger and the form for every visitor', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Direct ETH contributions');
    expect(screen.getByTestId('contribution-table')).toHaveTextContent('contributions: 2');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Contribution history');
    expect(screen.getByLabelText('contribution form')).toHaveAttribute('id', 'contribute');
  });

  it('hands the loading state to the ledger instead of a spinner', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });
    renderPage();

    expect(mockTableProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ loading: true, list: [] }),
    );
  });

  it('offers a retry when the history cannot be read', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /couldn't be loaded/ }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('refreshes the history once a contribution confirms', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'confirm contribution' }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPage();
    await checkA11y(container);
  });
});

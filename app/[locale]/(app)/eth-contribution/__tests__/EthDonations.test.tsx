import { render, screen, fireEvent, checkA11y, waitFor } from '@/test-utils';

import EthDonations from '../EthDonations';

const mockRefetch = jest.fn();
const mockSetNotification = jest.fn();
const mockDonateEth = jest.fn();
const mockDonateEthWithInfo = jest.fn();
const mockWaitForTransactionReceipt = jest.fn();
const mockReportError = jest.fn();
const mockUseDonationsBoth = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: mockRefetch,
});

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDonationsBoth: (...args: unknown[]) => mockUseDonationsBoth(...args),
}));

jest.mock('../../../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));

jest.mock('../../../../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: () => ({
    write: {
      donateEth: mockDonateEth,
      donateEthWithInfo: mockDonateEthWithInfo,
    },
  }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args),
  }),
}));

jest.mock('../../../../../utils/errors', () => {
  const actual = jest.requireActual('../../../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

jest.mock('../../../../../components/tables/EthDonationTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="contribution-table">contributions: {list.length}</div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockDonateEth.mockResolvedValue('0xhash');
  mockDonateEthWithInfo.mockResolvedValue('0xhash-info');
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
});

describe('EthDonations', () => {
  it('shows loading state', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders contribution table with data', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByTestId('contribution-table')).toHaveTextContent('contributions: 2');
  });

  it('renders page title', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByText('ETH Contributions')).toBeInTheDocument();
  });

  it('renders contribution form when account is connected', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument();
    expect(screen.getByText('Contribute')).toBeInTheDocument();
    expect(screen.getByText('Contribute with Info')).toBeInTheDocument();
  });

  it('updates contribution amount on input change', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(input).toHaveValue(1.5);
  });

  it('waits for confirmation and shows the localized success notification', async () => {
    render(<EthDonations />);
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '1.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute' }));

    await waitFor(() =>
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xhash' }),
    );
    expect(mockSetNotification).toHaveBeenCalledWith({
      text: 'toasts.contribution.submitted(amount=1.5)',
      type: 'success',
      visible: true,
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('localizes confirmation for a contribution with information', async () => {
    render(<EthDonations />);
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '0.5' } });
    fireEvent.change(screen.getByPlaceholderText(/"name"/), {
      target: { value: '{"message":"hello"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute with Info' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.contribution.submittedWithInfo(amount=0.5)',
        type: 'success',
        visible: true,
      }),
    );
    expect(mockDonateEthWithInfo).toHaveBeenCalled();
  });

  it('shows informational cancellation for wallet rejection code 4001', async () => {
    mockDonateEth.mockRejectedValueOnce({ code: 4001 });
    render(<EthDonations />);
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.walletTransactionCancelled',
        type: 'info',
        visible: true,
      }),
    );
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('reports RPC failures with the localized contribution fallback', async () => {
    const error = new Error('RPC unavailable');
    mockDonateEth.mockRejectedValueOnce(error);
    render(<EthDonations />);
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.contribution.failed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockReportError).toHaveBeenCalledWith(error, 'Contribution error');
  });

  it('treats a reverted receipt as an error instead of success', async () => {
    mockWaitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted' });
    render(<EthDonations />);
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.contribution.failed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockSetNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('shows the localized pending label while contributing', async () => {
    let resolveDonation!: (hash: string) => void;
    mockDonateEth.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDonation = resolve;
      }),
    );
    render(<EthDonations />);
    fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute' }));

    expect(await screen.findByText('toasts.contribution.submitting')).toBeInTheDocument();

    resolveDonation('0xhash');
    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      ),
    );
  });

  it('has no accessibility violations', async () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { container } = render(<EthDonations />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});

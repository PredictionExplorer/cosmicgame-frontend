import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import UserStellarSelectionETHPage from '../stellar-selection-eth/[address]/UserStellarSelectionETHPage';

const mockRefetchDeposits = jest.fn();
const mockFetchStatusData = jest.fn();
const mockWithdrawEth = jest.fn();
const mockWaitForTransactionReceipt = jest.fn();
const mockSetNotification = jest.fn();
const mockReportError = jest.fn();
let mockEthToClaim = 0;
const mockUseStellarSelectionDepositsByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: mockRefetchDeposits,
});

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useStellarSelectionDepositsByUser: (...args: unknown[]) =>
    mockUseStellarSelectionDepositsByUser(...args),
}));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0x1234567890123456789012345678901234567890' }),
}));

jest.mock('../../../../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: { ETHRaffleToClaim: mockEthToClaim },
    fetchData: mockFetchStatusData,
  }),
}));

jest.mock('../../../../../hooks/useStellarSelectionWalletContract', () => ({
  __esModule: true,
  default: () => ({ write: { withdrawEth: mockWithdrawEth } }),
}));

jest.mock('../../../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
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

beforeEach(() => {
  jest.clearAllMocks();
  mockEthToClaim = 0;
  mockWithdrawEth.mockResolvedValue('0xhash');
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
});

describe('UserStellarSelectionETHPage', () => {
  const validAddr = '0x1234567890123456789012345678901234567890';

  it('shows loading when query is loading', () => {
    mockUseStellarSelectionDepositsByUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserStellarSelectionETHPage address={validAddr} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows invalid address message for bad addresses', () => {
    mockUseStellarSelectionDepositsByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserStellarSelectionETHPage address="not-an-address" />);
    expect(screen.getByText('Invalid Address')).toBeInTheDocument();
  });

  it('renders deposits after loading', () => {
    mockUseStellarSelectionDepositsByUser.mockReturnValue({
      data: [{ EvtLogId: 1, TxHash: '0xabc', TimeStamp: 1000000, RoundNum: 1, Amount: 1.5 }],
      isLoading: false,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserStellarSelectionETHPage address={validAddr} />);
    expect(
      screen.getByText('Stellar Selection ETH allocated to this participant'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no deposits', () => {
    mockUseStellarSelectionDepositsByUser.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserStellarSelectionETHPage address={validAddr} />);
    expect(screen.getByText('No Stellar Selection ETH yet.')).toBeInTheDocument();
  });

  it('waits for receipt and shows a localized retrieval success', async () => {
    mockEthToClaim = 1.25;
    render(<UserStellarSelectionETHPage address={validAddr} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retrieve All' }));

    await waitFor(() =>
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xhash' }),
    );
    expect(mockSetNotification).toHaveBeenCalledWith({
      text: 'toasts.claim.stellarEthSuccess',
      type: 'success',
      visible: true,
    });
  });

  it('shows informational cancellation for wallet rejection code 4001', async () => {
    mockEthToClaim = 1;
    mockWithdrawEth.mockRejectedValueOnce({ code: 4001 });
    render(<UserStellarSelectionETHPage address={validAddr} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retrieve All' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.walletTransactionCancelled',
        type: 'info',
        visible: true,
      }),
    );
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('reports RPC failures with the localized claim fallback', async () => {
    const error = new Error('RPC unavailable');
    mockEthToClaim = 1;
    mockWithdrawEth.mockRejectedValueOnce(error);
    render(<UserStellarSelectionETHPage address={validAddr} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retrieve All' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.claim.failed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockReportError).toHaveBeenCalledWith(error, 'retrieve stellar selection ETH');
  });

  it('treats a reverted receipt as an error and keeps success hidden', async () => {
    mockEthToClaim = 1;
    mockWaitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted' });
    render(<UserStellarSelectionETHPage address={validAddr} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retrieve All' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.claim.failed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockSetNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('shows the localized pending label while retrieval is in flight', async () => {
    mockEthToClaim = 1;
    let resolveWithdraw!: (hash: string) => void;
    mockWithdrawEth.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveWithdraw = resolve;
      }),
    );
    render(<UserStellarSelectionETHPage address={validAddr} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retrieve All' }));
    expect(await screen.findByText('toasts.claim.retrieving')).toBeInTheDocument();

    resolveWithdraw('0xhash');
    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      ),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <UserStellarSelectionETHPage address="0x1234567890123456789012345678901234567890" />,
    );
    await checkA11y(container);
  });
});

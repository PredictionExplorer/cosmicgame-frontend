import { fireEvent, render, screen, waitFor } from '@/test-utils';

import { EthContributionForm } from '../EthContributionForm';

const mockSetNotification = jest.fn();
const mockDonateEth = jest.fn();
const mockDonateEthWithInfo = jest.fn();
const mockWaitForTransactionReceipt = jest.fn();
const mockReportError = jest.fn();
let mockAccount: string | null = '0xUser';

jest.mock('@rainbow-me/rainbowkit');

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args),
  }),
}));

jest.mock('../../../utils/errors', () => {
  const actual = jest.requireActual('../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: () => ({
    write: {
      donateEth: mockDonateEth,
      donateEthWithInfo: mockDonateEthWithInfo,
    },
  }),
}));

beforeEach(() => {
  mockAccount = '0xUser';
  mockSetNotification.mockClear();
  mockDonateEth.mockReset().mockResolvedValue('0xhash');
  mockDonateEthWithInfo.mockReset().mockResolvedValue('0xhash');
  mockWaitForTransactionReceipt.mockReset().mockResolvedValue({ status: 'success' });
  mockReportError.mockClear();
});

describe('EthContributionForm', () => {
  it('submits a simple ETH contribution without metadata', async () => {
    const onSuccess = jest.fn();
    render(<EthContributionForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1.25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute ETH' }));

    await waitFor(() => expect(mockDonateEth).toHaveBeenCalledTimes(1));
    expect(mockDonateEth).toHaveBeenCalledWith([], { value: 1250000000000000000n });
    expect(mockDonateEthWithInfo).not.toHaveBeenCalled();
    expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xhash' });
    expect(mockSetNotification).toHaveBeenCalledWith({
      text: 'toasts.contribution.formSubmitted(amount=1.25)',
      type: 'success',
      visible: true,
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('submits structured title, message, and URL metadata', async () => {
    render(<EthContributionForm />);

    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '0.5' } });
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Public goods' } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'Keep building' } });
    fireEvent.change(screen.getByLabelText(/URL/), { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute with Message' }));

    await waitFor(() => expect(mockDonateEthWithInfo).toHaveBeenCalledTimes(1));
    expect(mockDonateEthWithInfo).toHaveBeenCalledWith(
      [
        JSON.stringify({
          title: 'Public goods',
          message: 'Keep building',
          url: 'https://example.com',
        }),
      ],
      { value: 500000000000000000n },
    );
    expect(mockDonateEth).not.toHaveBeenCalled();
    expect(mockSetNotification).toHaveBeenCalledWith({
      text: 'toasts.contribution.formSubmittedWithInfo(amount=0.5)',
      type: 'success',
      visible: true,
    });
  });

  it('blocks invalid amounts and URLs', () => {
    render(<EthContributionForm />);

    const submit = screen.getByRole('button', { name: 'Contribute ETH' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '0' } });
    expect(screen.getByText('toasts.contribution.invalidAmount')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/URL/), { target: { value: 'example.com' } });
    expect(screen.getByRole('button', { name: 'Contribute with Message' })).toBeDisabled();
    expect(screen.getByText('toasts.contribution.invalidUrlInline')).toBeInTheDocument();
  });

  it('shows disconnected wallet guidance', () => {
    mockAccount = null;
    render(<EthContributionForm />);

    expect(screen.getByText('toasts.contribution.connectWalletInline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contribute ETH' })).toBeDisabled();
  });

  it('shows informational cancellation for wallet rejection code 4001', async () => {
    mockDonateEth.mockRejectedValueOnce({ code: 4001 });
    render(<EthContributionForm />);
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute ETH' }));

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
    render(<EthContributionForm />);
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute ETH' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.contribution.formFailed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockReportError).toHaveBeenCalledWith(error, 'ETH contribution error');
  });

  it('treats a reverted receipt as an error and does not call onSuccess', async () => {
    const onSuccess = jest.fn();
    mockWaitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted' });
    render(<EthContributionForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute ETH' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.contribution.formFailed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockReportError).toHaveBeenCalledWith(expect.any(Error), 'ETH contribution error');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows the localized pending label while submitting', async () => {
    let resolveDonation!: (hash: string) => void;
    mockDonateEth.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDonation = resolve;
      }),
    );
    render(<EthContributionForm />);
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Contribute ETH' }));

    expect(await screen.findByText('toasts.contribution.submitting')).toBeInTheDocument();

    resolveDonation('0xhash');
    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      ),
    );
  });
});

import { fireEvent, render, screen, waitFor } from '@/test-utils';

import { EthContributionForm } from '../EthContributionForm';

const mockSetNotification = jest.fn();
const mockDonateEth = jest.fn();
const mockDonateEthWithInfo = jest.fn();
let mockAccount: string | null = '0xUser';

jest.mock('@rainbow-me/rainbowkit');

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
  });

  it('blocks invalid amounts and URLs', () => {
    render(<EthContributionForm />);

    const submit = screen.getByRole('button', { name: 'Contribute ETH' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '0' } });
    expect(screen.getByText('Enter an amount greater than 0.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/URL/), { target: { value: 'example.com' } });
    expect(screen.getByRole('button', { name: 'Contribute with Message' })).toBeDisabled();
  });

  it('shows disconnected wallet guidance', () => {
    mockAccount = null;
    render(<EthContributionForm />);

    expect(screen.getByText('Connect your wallet to contribute ETH.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contribute ETH' })).toBeDisabled();
  });
});

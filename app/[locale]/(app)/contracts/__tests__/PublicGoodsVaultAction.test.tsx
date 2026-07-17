import { fireEvent, renderWithQuery, screen, waitFor } from '@/test-utils';

import { PublicGoodsVaultAction } from '../components/PublicGoodsVaultAction';

const mockWriteContract = jest.fn();
const mockWaitForTransactionReceipt = jest.fn();
const mockUseActiveWeb3React = jest.fn();

jest.mock('@wagmi/core', () => ({
  writeContract: (...args: unknown[]) => mockWriteContract(...args),
}));

jest.mock('wagmi', () => ({
  useConfig: () => ({ id: 'test-config' }),
  usePublicClient: () => ({
    waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args),
  }),
}));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

describe('PublicGoodsVaultAction', () => {
  const defaultProps = {
    vaultAddress: '0x96bB0ADB414d5350f435E52f94946B6C7A0760a9',
    beneficiaryAddress: '0x1234567890123456789012345678901234567890',
    vaultBalanceEth: 0.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteContract.mockResolvedValue('0xhash');
    mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
    mockUseActiveWeb3React.mockReturnValue({
      account: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      active: true,
      chainId: 42161,
    });
  });

  it('renders the current vault balance and action button', () => {
    renderWithQuery(<PublicGoodsVaultAction {...defaultProps} />);

    expect(screen.getByText('Public Goods Vault Action')).toBeInTheDocument();
    expect(screen.getByText('0.5000 ETH')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Forward Public Goods Vault balance to Protocol Guild' }),
    ).toBeEnabled();
  });

  it('disables forwarding when the vault has no funds', () => {
    renderWithQuery(<PublicGoodsVaultAction {...defaultProps} vaultBalanceEth={0} />);

    expect(screen.getByRole('button', { name: /forward public goods vault/i })).toBeDisabled();
    expect(screen.getByText('Nothing to Forward')).toBeInTheDocument();
  });

  it('calls the no-argument send overload and waits for confirmation', async () => {
    renderWithQuery(<PublicGoodsVaultAction {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /forward public goods vault/i }));

    await waitFor(() => {
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-config' }),
        expect.objectContaining({
          address: defaultProps.vaultAddress,
          functionName: 'send',
          args: [],
        }),
      );
    });
    expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xhash' });
  });
});

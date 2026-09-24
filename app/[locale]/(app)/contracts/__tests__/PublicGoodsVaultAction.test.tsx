import { createFakeTxFlow } from '@/test-utils/txFlow';

import { checkA11y, fireEvent, renderWithQuery, screen, waitFor } from '@/test-utils';

import { PublicGoodsVaultAction } from '../components/PublicGoodsVaultAction';

const mockTx = createFakeTxFlow('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
const mockUseActiveWeb3React = jest.fn();

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

jest.mock('@/hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/wallet/ConnectWalletAction', () => ({
  ConnectWalletAction: () => <button type="button">wallet.connect</button>,
}));

const VAULT = '0x96bB0ADB414d5350f435E52f94946B6C7A0760a9';
const BENEFICIARY = '0xdddd576bAF106bAAe54bDE40BCac602bB4a7cf79';

describe('PublicGoodsVaultAction', () => {
  const props = {
    vaultAddress: VAULT,
    beneficiaryAddress: BENEFICIARY,
    vaultBalanceEth: 0.5,
    sharePercent: 7,
  };

  beforeEach(() => {
    mockTx.reset();
    mockUseActiveWeb3React.mockReturnValue({
      account: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      active: true,
      chainId: 42161,
    });
  });

  it('shows the vault, its beneficiary, share and balance', () => {
    renderWithQuery(<PublicGoodsVaultAction {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Public Goods' })).toBeInTheDocument();
    expect(document.querySelector('[data-row="share"] dd')).toHaveTextContent('7%');
    expect(document.querySelector('[data-row="balance"] dd')).toHaveTextContent(/0\.5/);
  });

  it('forwards the balance through the transaction flow', async () => {
    renderWithQuery(<PublicGoodsVaultAction {...props} />);
    fireEvent.click(
      screen.getByRole('button', { name: /contribution\.publicGoodsVault\.forward/ }),
    );
    await waitFor(() => expect(mockTx.runs).toHaveLength(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: VAULT, functionName: 'send', args: [] }),
    );
    expect(mockTx.lastSuccessMessage()).toBe('toasts.contribution.publicGoodsVault.forwarded');
  });

  it('says the vault is empty instead of offering a dead button', () => {
    renderWithQuery(<PublicGoodsVaultAction {...props} vaultBalanceEth={0} />);
    expect(screen.getByTestId('vault-empty')).toHaveTextContent(
      'The vault is empty: nothing to forward yet.',
    );
    expect(screen.queryByRole('button', { name: /forward/i })).not.toBeInTheDocument();
  });

  it('asks a visitor without a wallet to connect one', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: undefined, active: false });
    renderWithQuery(<PublicGoodsVaultAction {...props} />);
    expect(screen.getByRole('button', { name: 'wallet.connect' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /publicGoodsVault\.forward/ })).toBeNull();
  });

  it('shows a skeleton, never a zero, while the balance loads', () => {
    renderWithQuery(<PublicGoodsVaultAction {...props} vaultBalanceEth={undefined} />);
    expect(document.querySelector('[data-row="balance"] dd')).not.toHaveTextContent(/\d/);
    expect(screen.queryByTestId('vault-empty')).toBeNull();
  });

  it('renders nothing without a vault address', () => {
    const { container } = renderWithQuery(<PublicGoodsVaultAction {...props} vaultAddress="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithQuery(<PublicGoodsVaultAction {...props} />);
    await checkA11y(container);
  });
});

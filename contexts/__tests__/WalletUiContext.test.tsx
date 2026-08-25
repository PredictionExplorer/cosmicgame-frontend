import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { WalletUiProvider, useWalletUi } from '../WalletUiContext';

/**
 * The whole point of WalletUiProvider is that the RainbowKit surface (and
 * its chunk) stays unloaded until a visitor asks to connect. The WalletUi
 * module is mocked with a mount probe so these tests observe exactly when
 * the deferred tree mounts.
 */
const walletUiMounted = jest.fn();

jest.mock('@/config/wagmi', () => ({
  wagmiConfig: { kind: 'test-config' },
}));

jest.mock('@/components/wallet/WalletUi', () => ({
  WalletUi: ({ connectRequestId }: { connectRequestId: number }) => {
    walletUiMounted(connectRequestId);
    return <div data-testid="wallet-ui" data-request-id={connectRequestId} />;
  },
}));

function ConnectProbe() {
  const { requestConnectModal } = useWalletUi();
  return (
    <button type="button" onClick={requestConnectModal}>
      connect
    </button>
  );
}

describe('WalletUiProvider', () => {
  beforeEach(() => {
    walletUiMounted.mockClear();
  });

  it('does not mount the wallet UI until a connect request', () => {
    render(
      <WalletUiProvider>
        <ConnectProbe />
      </WalletUiProvider>,
    );

    expect(screen.queryByTestId('wallet-ui')).not.toBeInTheDocument();
    expect(walletUiMounted).not.toHaveBeenCalled();
  });

  it('mounts the wallet UI when a connect is requested', async () => {
    render(
      <WalletUiProvider>
        <ConnectProbe />
      </WalletUiProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'connect' }));

    await waitFor(() => expect(screen.getByTestId('wallet-ui')).toBeInTheDocument());
    expect(screen.getByTestId('wallet-ui')).toHaveAttribute('data-request-id', '1');
  });

  it('re-signals the modal on every subsequent connect request', async () => {
    render(
      <WalletUiProvider>
        <ConnectProbe />
      </WalletUiProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'connect' });
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByTestId('wallet-ui')).toBeInTheDocument());
    fireEvent.click(trigger);

    await waitFor(() =>
      expect(screen.getByTestId('wallet-ui')).toHaveAttribute('data-request-id', '2'),
    );
  });

  it('throws a clear error when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ConnectProbe />)).toThrow(
      'useWalletUi must be used inside WalletUiProvider',
    );
    consoleError.mockRestore();
  });
});

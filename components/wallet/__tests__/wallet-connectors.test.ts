import { createConnector } from 'wagmi';
import { reconnect } from 'wagmi/actions';
import { injected } from 'wagmi/connectors';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import type { Config } from 'wagmi';

import {
  injectedMetaMaskWallet,
  installWalletConnectors,
  restoreWalletSession,
  walletList,
} from '../wallet-connectors';

jest.mock('wagmi', () => ({
  createConnector: jest.fn((factory) => ({ kind: 'rainbowkit-wrapped-connector', factory })),
}));

jest.mock('wagmi/actions', () => ({
  reconnect: jest.fn(() => Promise.resolve([])),
}));

jest.mock('wagmi/connectors', () => ({
  injected: jest.fn((config) => (wagmiConfig: unknown) => ({
    kind: 'injected-connector',
    config,
    wagmiConfig,
  })),
}));

jest.mock('@rainbow-me/rainbowkit', () => ({
  connectorsForWallets: jest.fn(() => [
    () => ({ id: 'walletConnect' }),
    () => ({ id: 'coinbase' }),
  ]),
}));

jest.mock('@rainbow-me/rainbowkit/wallets', () => ({
  baseAccount: jest.fn(() => ({ id: 'baseAccount', name: 'Base Account' })),
  coinbaseWallet: jest.fn(() => ({ id: 'coinbase', name: 'Coinbase Wallet' })),
  rabbyWallet: jest.fn(() => ({ id: 'rabby', name: 'Rabby Wallet' })),
  rainbowWallet: jest.fn(() => ({ id: 'rainbow', name: 'Rainbow' })),
  walletConnectWallet: jest.fn(() => ({ id: 'walletConnect', name: 'WalletConnect' })),
}));

jest.mock('@/config/wagmi', () => ({
  walletAppName: 'Cosmic Signature',
  walletConnectProjectId: 'test-project-id',
}));

const mockConnectorsForWallets = connectorsForWallets as jest.MockedFunction<
  typeof connectorsForWallets
>;
const mockReconnect = reconnect as jest.MockedFunction<typeof reconnect>;
const mockCreateConnector = createConnector as jest.MockedFunction<typeof createConnector>;
const mockInjected = injected as jest.MockedFunction<typeof injected>;

/** Minimal stand-in for wagmi's runtime connector store. */
function makeFakeConfig() {
  const connectors: Array<{ id: string }> = [{ id: 'injected' }];
  return {
    connectors,
    _internal: {
      connectors: {
        setup: jest.fn((connectorFn: () => { id: string }) => connectorFn()),
        setState: jest.fn((updater: (current: Array<{ id: string }>) => Array<{ id: string }>) => {
          const next = updater(connectors);
          connectors.length = 0;
          connectors.push(...next);
        }),
      },
    },
  } as unknown as Config;
}

describe('wallet-connectors runtime installation', () => {
  it('installs the RainbowKit wallet list into the live config exactly once', () => {
    const config = makeFakeConfig();

    installWalletConnectors(config);
    installWalletConnectors(config);

    expect(mockConnectorsForWallets).toHaveBeenCalledTimes(1);
    expect(mockConnectorsForWallets).toHaveBeenCalledWith(walletList, {
      appName: 'Cosmic Signature',
      projectId: 'test-project-id',
    });

    const ids = (config as unknown as { connectors: Array<{ id: string }> }).connectors.map(
      (connector) => connector.id,
    );
    expect(ids).toEqual(['injected', 'walletConnect', 'coinbase']);
  });

  it('replays reconnect after installing connectors for returning sessions', async () => {
    const config = makeFakeConfig();

    await restoreWalletSession(config);

    expect(mockReconnect).toHaveBeenCalledWith(config);
  });

  it('swallows reconnect failures — an expired session is not an error', async () => {
    mockReconnect.mockRejectedValueOnce(new Error('session expired'));

    await expect(restoreWalletSession(makeFakeConfig())).resolves.toBeUndefined();
  });
});

describe('wallet list definition', () => {
  it('keeps the explicit wallet groups so MetaMask avoids the SDK-backed default', () => {
    expect(walletList[0]?.groupName).toBe('Popular');
    const popularIds = walletList[0]?.wallets.map(
      (createWallet) => createWallet({ appName: 'Cosmic Signature', projectId: 'test' }).id,
    );
    expect(popularIds).toEqual(
      expect.arrayContaining(['rabby', 'rainbow', 'baseAccount', 'metaMask', 'walletConnect']),
    );
  });

  it('creates MetaMask through the wagmi injected connector instead of MetaMask SDK', () => {
    const wallet = injectedMetaMaskWallet();
    const connector = wallet.createConnector({
      rkDetails: {
        ...wallet,
        index: 0,
        groupIndex: 0,
        groupName: 'Popular',
        isRainbowKitConnector: true,
      },
    });

    expect(connector).toEqual({
      kind: 'rainbowkit-wrapped-connector',
      factory: expect.any(Function),
    });
    expect(mockInjected).toHaveBeenCalledWith(
      expect.objectContaining({
        shimDisconnect: true,
        unstable_shimAsyncInject: 1_000,
        target: 'metaMask',
      }),
    );
  });

  it('wraps the injected connector with RainbowKit wallet metadata', () => {
    const wallet = injectedMetaMaskWallet();
    wallet.createConnector({
      rkDetails: {
        ...wallet,
        index: 0,
        groupIndex: 0,
        groupName: 'Popular',
        isRainbowKitConnector: true,
      },
    });

    const factory = mockCreateConnector.mock.calls.at(-1)?.[0];
    expect(factory).toBeDefined();
    const result = factory?.({ chains: [], storage: null } as never) as Record<string, unknown>;

    expect(result).toMatchObject({
      kind: 'injected-connector',
      rkDetails: expect.objectContaining({
        id: 'metaMask',
        name: 'MetaMask',
        groupName: 'Popular',
        isRainbowKitConnector: true,
      }),
    });
  });

  it('marks injected MetaMask as installed when window.ethereum advertises MetaMask', () => {
    const originalEthereum = (window as unknown as { ethereum?: unknown }).ethereum;
    (window as unknown as { ethereum?: { isMetaMask: true } }).ethereum = { isMetaMask: true };

    try {
      expect(injectedMetaMaskWallet().installed).toBe(true);
    } finally {
      (window as unknown as { ethereum?: unknown }).ethereum = originalEthereum;
    }
  });
});

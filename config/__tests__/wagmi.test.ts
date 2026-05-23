import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConnector, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { activeChain, localChain } from '../chains';
import { injectedMetaMaskWallet, wagmiConfig } from '../wagmi';

jest.mock('@rainbow-me/rainbowkit', () => ({
  getDefaultConfig: jest.fn((config) => ({ kind: 'wagmi-config', ...config })),
}));

jest.mock('wagmi', () => ({
  createConnector: jest.fn((factory) => ({ kind: 'rainbowkit-wrapped-connector', factory })),
  http: jest.fn((url?: string) => ({ kind: 'http-transport', url })),
}));

jest.mock('wagmi/connectors', () => ({
  injected: jest.fn((config) => (wagmiConfig: unknown) => ({
    kind: 'injected-connector',
    config,
    wagmiConfig,
  })),
}));

jest.mock('@rainbow-me/rainbowkit/wallets', () => ({
  baseAccount: jest.fn(() => ({ id: 'baseAccount', name: 'Base Account' })),
  coinbaseWallet: jest.fn(() => ({ id: 'coinbase', name: 'Coinbase Wallet' })),
  rainbowWallet: jest.fn(() => ({ id: 'rainbow', name: 'Rainbow' })),
  walletConnectWallet: jest.fn(() => ({ id: 'walletConnect', name: 'WalletConnect' })),
}));

const mockGetDefaultConfig = getDefaultConfig as jest.MockedFunction<typeof getDefaultConfig>;
const mockCreateConnector = createConnector as jest.MockedFunction<typeof createConnector>;
const mockHttp = http as jest.MockedFunction<typeof http>;
const mockInjected = injected as jest.MockedFunction<typeof injected>;

describe('wagmi wallet configuration', () => {
  it('builds a RainbowKit-compatible wagmi config', () => {
    expect(wagmiConfig).toMatchObject({ kind: 'wagmi-config', ssr: true });
    expect(mockGetDefaultConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: 'Cosmic Signature',
        projectId: expect.any(String),
        ssr: true,
      }),
    );
  });

  it('registers active and local chains with HTTP transports', () => {
    const configArg = mockGetDefaultConfig.mock.calls[0]?.[0];

    expect(configArg?.chains).toEqual(
      activeChain.id === localChain.id ? [activeChain] : [activeChain, localChain],
    );
    expect(configArg?.transports).toHaveProperty(String(activeChain.id));
    expect(configArg?.transports).toHaveProperty(String(localChain.id));
    expect(mockHttp).toHaveBeenCalled();
  });

  it('passes the configured WalletConnect project id without a placeholder fallback', () => {
    const configArg = mockGetDefaultConfig.mock.calls[0]?.[0];

    expect(configArg?.projectId).toBe(
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? '',
    );
    expect(configArg?.projectId).not.toBe('placeholder_get_real_id_from_cloud_walletconnect_com');
  });

  it('uses an explicit wallet list so MetaMask does not use the SDK-backed default wallet', () => {
    const configArg = mockGetDefaultConfig.mock.calls[0]?.[0];
    const walletIds = configArg?.wallets?.flatMap((group) =>
      group.wallets.map(
        (createWallet) => createWallet({ appName: 'Cosmic Signature', projectId: 'test' }).id,
      ),
    );

    expect(walletIds).toEqual(
      expect.arrayContaining(['rainbow', 'baseAccount', 'metaMask', 'walletConnect']),
    );
    expect(configArg?.wallets?.[0]?.groupName).toBe('Popular');
  });

  it('creates MetaMask through wagmi injected connector instead of MetaMask SDK', () => {
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
    const originalEthereum = window.ethereum;
    (window as unknown as { ethereum?: { isMetaMask: true } }).ethereum = { isMetaMask: true };

    try {
      expect(injectedMetaMaskWallet().installed).toBe(true);
    } finally {
      (window as unknown as { ethereum?: typeof originalEthereum }).ethereum = originalEthereum;
    }
  });
});

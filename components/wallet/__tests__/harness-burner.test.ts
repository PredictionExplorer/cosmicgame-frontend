// The module under test imports wagmi entry points that ship untransformed
// ESM; the repo's jest setup always mocks wagmi (see __mocks__/wagmi.ts).
jest.mock('wagmi', () => ({}));
jest.mock('wagmi/actions', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  getAccount: jest.fn(() => ({ connector: undefined })),
}));
jest.mock('wagmi/connectors', () => ({ injected: jest.fn(() => jest.fn()) }));
jest.mock('viem/accounts', () => ({
  privateKeyToAccount: (key: string) => ({ address: `0x${key.slice(2, 42)}` }),
}));
jest.mock('viem/chains', () => ({
  hardhat: { id: 31337, rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } } },
}));

import { connect, disconnect, getAccount } from 'wagmi/actions';
import type { Config } from 'wagmi';

import {
  connectHarnessBurner,
  createBurnerProvider,
  harnessPersonaOptions,
  type BurnerWalletLike,
} from '@/components/wallet/harness-burner';

const mockedGetAccount = getAccount as jest.Mock;
const mockedConnect = connect as jest.Mock;
const mockedDisconnect = disconnect as jest.Mock;

const BURNER_ID = 'cosmicHarnessPersonas';

/** Minimal wagmi Config stand-in exercising the connector install path. */
function fakeWagmiConfig(): Config {
  const installed: Array<{ id: string }> = [];
  return {
    get connectors() {
      return installed;
    },
    _internal: {
      connectors: {
        setup: jest.fn(() => ({ id: BURNER_ID })),
        setState: jest.fn((update: (current: Array<{ id: string }>) => Array<{ id: string }>) => {
          const next = update(installed.slice());
          installed.length = 0;
          installed.push(...next);
        }),
      },
    },
  } as unknown as Config;
}

function fakeWallet(address: `0x${string}`): BurnerWalletLike & {
  sendTransaction: jest.Mock;
  signMessage: jest.Mock;
  signTypedData: jest.Mock;
} {
  return {
    account: { address },
    sendTransaction: jest.fn().mockResolvedValue('0xtxhash'),
    signMessage: jest.fn().mockResolvedValue('0xsignature'),
    signTypedData: jest.fn().mockResolvedValue('0xtyped'),
  };
}

describe('harnessPersonaOptions', () => {
  it('exposes the persona cast with unique names and addresses', () => {
    const options = harnessPersonaOptions();
    expect(options.length).toBeGreaterThanOrEqual(6);
    expect(new Set(options.map((o) => o.name)).size).toBe(options.length);
    expect(new Set(options.map((o) => o.address)).size).toBe(options.length);
    for (const option of options) {
      expect(option.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });
});

describe('createBurnerProvider', () => {
  const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const;

  function build() {
    const wallet = fakeWallet(address);
    const passthrough = jest.fn().mockResolvedValue('passthrough-result');
    const listeners = new Map<string, Set<(payload: unknown) => void>>();
    const provider = createBurnerProvider({
      chainId: 31337,
      currentWallet: () => wallet,
      passthrough,
      listeners,
    });
    return { provider, wallet, passthrough, listeners };
  }

  it('answers account and chain queries locally', async () => {
    const { provider, passthrough } = build();
    await expect(provider.request({ method: 'eth_requestAccounts' })).resolves.toEqual([address]);
    await expect(provider.request({ method: 'eth_accounts' })).resolves.toEqual([address]);
    await expect(provider.request({ method: 'eth_chainId' })).resolves.toBe('0x7a69');
    expect(passthrough).not.toHaveBeenCalled();
  });

  it('signs and sends through the active persona wallet', async () => {
    const { provider, wallet } = build();
    await provider.request({
      method: 'eth_sendTransaction',
      params: [{ to: address, data: '0xdead', value: '0x0de0b6b3a7640000', gas: '0x5208' }],
    } as never);
    expect(wallet.sendTransaction).toHaveBeenCalledWith({
      to: address,
      data: '0xdead',
      value: 10n ** 18n,
      gas: 21_000n,
    });

    await provider.request({ method: 'personal_sign', params: ['0xbeef', address] } as never);
    expect(wallet.signMessage).toHaveBeenCalledWith({ message: { raw: '0xbeef' } });

    await provider.request({
      method: 'eth_signTypedData_v4',
      params: [address, JSON.stringify({ domain: {}, types: {}, message: {} })],
    } as never);
    expect(wallet.signTypedData).toHaveBeenCalled();
  });

  it('accepts chain-switch requests and forwards reads to the RPC', async () => {
    const { provider, passthrough } = build();
    await expect(
      provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }],
      } as never),
    ).resolves.toBeNull();

    await expect(provider.request({ method: 'eth_blockNumber' })).resolves.toBe(
      'passthrough-result',
    );
    expect(passthrough).toHaveBeenCalledWith({ method: 'eth_blockNumber' });
  });

  it('registers and removes event listeners', () => {
    const { provider, listeners } = build();
    const listener = jest.fn();
    provider.on('accountsChanged', listener);
    expect(listeners.get('accountsChanged')?.has(listener)).toBe(true);
    provider.removeListener('accountsChanged', listener);
    expect(listeners.get('accountsChanged')?.has(listener)).toBe(false);
  });
});

describe('connectHarnessBurner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connects the burner when nothing is connected', async () => {
    mockedGetAccount.mockReturnValue({ connector: undefined });
    const config = fakeWagmiConfig();

    const persona = await connectHarnessBurner(config);

    expect(persona).toBe('Nova');
    expect(mockedDisconnect).not.toHaveBeenCalled();
    expect(mockedConnect).toHaveBeenCalledWith(config, {
      connector: expect.objectContaining({ id: BURNER_ID }),
    });
  });

  it('replaces a restored session whose connector is on the wrong chain', async () => {
    // A stale wallet session from a mainnet dev run: connector reports
    // Arbitrum One while the harness chain is 31337 — every wagmi client
    // query would fail with ConnectorChainMismatchError.
    const stale = { id: 'io.metamask', getChainId: jest.fn().mockResolvedValue(42_161) };
    mockedGetAccount
      .mockReturnValueOnce({ connector: stale })
      .mockReturnValue({ connector: undefined });
    const config = fakeWagmiConfig();

    await connectHarnessBurner(config);

    expect(mockedDisconnect).toHaveBeenCalledWith(config);
    expect(mockedConnect).toHaveBeenCalledWith(config, {
      connector: expect.objectContaining({ id: BURNER_ID }),
    });
  });

  it('leaves a foreign wallet alone when it is on the harness chain', async () => {
    const deliberate = { id: 'io.metamask', getChainId: jest.fn().mockResolvedValue(31_337) };
    mockedGetAccount.mockReturnValue({ connector: deliberate });
    const config = fakeWagmiConfig();

    await connectHarnessBurner(config);

    expect(mockedDisconnect).not.toHaveBeenCalled();
    expect(mockedConnect).not.toHaveBeenCalled();
  });

  it('does not reconnect when the burner is already active', async () => {
    mockedGetAccount.mockReturnValue({ connector: { id: BURNER_ID } });
    const config = fakeWagmiConfig();

    await connectHarnessBurner(config);

    expect(mockedDisconnect).not.toHaveBeenCalled();
    expect(mockedConnect).not.toHaveBeenCalled();
  });
});

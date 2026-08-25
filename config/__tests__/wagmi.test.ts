import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { activeChain, localChain } from '../chains';
import { wagmiConfig, walletAppName, walletConnectProjectId } from '../wagmi';

jest.mock('wagmi', () => ({
  createConfig: jest.fn((config) => ({ kind: 'wagmi-config', ...config })),
  http: jest.fn((url?: string) => ({ kind: 'http-transport', url })),
}));

jest.mock('wagmi/connectors', () => ({
  injected: jest.fn((config) => ({ kind: 'injected-connector-fn', config })),
}));

const mockCreateConfig = createConfig as jest.MockedFunction<typeof createConfig>;
const mockHttp = http as jest.MockedFunction<typeof http>;
const mockInjected = injected as jest.MockedFunction<typeof injected>;

describe('wagmi wallet configuration (light boot config)', () => {
  it('builds the config with wagmi createConfig and ssr enabled', () => {
    expect(wagmiConfig).toMatchObject({ kind: 'wagmi-config', ssr: true });
    expect(mockCreateConfig).toHaveBeenCalledTimes(1);
  });

  it('boots with only the injected connector — heavy wallets install on demand', () => {
    const configArg = mockCreateConfig.mock.calls[0]?.[0];
    expect(configArg?.connectors).toHaveLength(1);
    expect(configArg?.connectors?.[0]).toMatchObject({ kind: 'injected-connector-fn' });
    expect(mockInjected).toHaveBeenCalledWith({ shimDisconnect: true });
  });

  it('registers active and local chains with HTTP transports', () => {
    const configArg = mockCreateConfig.mock.calls[0]?.[0];

    expect(configArg?.chains).toEqual(
      activeChain.id === localChain.id ? [activeChain] : [activeChain, localChain],
    );
    expect(configArg?.transports).toHaveProperty(String(activeChain.id));
    expect(configArg?.transports).toHaveProperty(String(localChain.id));
    expect(mockHttp).toHaveBeenCalled();
  });

  it('exposes the WalletConnect project id for the lazily installed wallet list', () => {
    expect(walletConnectProjectId).toBe(
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? '',
    );
    expect(walletConnectProjectId).not.toBe('placeholder_get_real_id_from_cloud_walletconnect_com');
    expect(walletAppName).toBe('Cosmic Signature');
  });

  it('never imports RainbowKit — that would drag the wallet stack into every page', () => {
    // This is the load-bearing bundle guarantee: config/wagmi.ts sits in the
    // entry graph of every app page, so a single static RainbowKit import
    // here re-adds ~95 KB gzip for every visitor.
    const source = readFileSync(resolve(__dirname, '..', 'wagmi.ts'), 'utf-8');
    expect(source).not.toContain('@rainbow-me/rainbowkit');
    expect(source).not.toContain('@walletconnect');
    expect(source).not.toContain('@coinbase');
  });
});

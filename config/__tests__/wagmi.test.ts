import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

import { activeChain, localChain } from '../chains';
import { isPlaceholderWalletConnectId, wagmiConfig } from '../wagmi';

jest.mock('@rainbow-me/rainbowkit', () => ({
  getDefaultConfig: jest.fn((config) => ({ kind: 'wagmi-config', ...config })),
}));

jest.mock('wagmi', () => ({
  http: jest.fn((url?: string) => ({ kind: 'http-transport', url })),
}));

const mockGetDefaultConfig = getDefaultConfig as jest.MockedFunction<typeof getDefaultConfig>;
const mockHttp = http as jest.MockedFunction<typeof http>;

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

  it('falls back to the placeholder WalletConnect project id only when env is missing', () => {
    const configArg = mockGetDefaultConfig.mock.calls[0]?.[0];

    expect(typeof configArg?.projectId).toBe('string');
    expect(configArg?.projectId.length).toBeGreaterThan(0);
    expect(isPlaceholderWalletConnectId).toBe(
      !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim(),
    );
  });
});

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

import { activeChain, localChain } from '../chains';
import { wagmiConfig } from '../wagmi';

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

  it('passes the configured WalletConnect project id without a placeholder fallback', () => {
    const configArg = mockGetDefaultConfig.mock.calls[0]?.[0];

    expect(configArg?.projectId).toBe(
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? '',
    );
    expect(configArg?.projectId).not.toBe('placeholder_get_real_id_from_cloud_walletconnect_com');
  });
});

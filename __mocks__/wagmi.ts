/**
 * Jest mock for `wagmi`. Returns benign no-op / empty-data values so
 * components that call wagmi hooks render deterministically under jsdom
 * without a real wallet connection.
 */
import type { ReactNode } from 'react';

module.exports = {
  useConnection: () => ({
    address: undefined,
    isConnected: false,
    chainId: undefined,
    status: 'disconnected',
    connector: undefined,
  }),
  useBalance: () => ({ data: undefined }),
  useChainId: () => 421614,
  useConfig: () => ({}),
  useConnectorClient: () => ({ data: undefined }),
  useDisconnect: () => ({ mutateAsync: async () => undefined, isPending: false }),
  usePublicClient: () => undefined,
  useWalletClient: () => ({ data: undefined }),
  useSwitchChain: () => ({ mutateAsync: async () => undefined, isPending: false }),
  WagmiProvider: ({ children }: { children: ReactNode }) => children,
};

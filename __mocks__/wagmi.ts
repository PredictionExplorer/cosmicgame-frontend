/**
 * Jest mock for `wagmi`. Returns benign no-op / empty-data values so
 * components that call wagmi hooks render deterministically under jsdom
 * without a real wallet connection.
 */
import type { ReactNode } from 'react';

module.exports = {
  useAccount: () => ({ address: undefined, isConnected: false, chainId: undefined }),
  useChainId: () => 421614,
  useConfig: () => ({}),
  useConnectorClient: () => ({ data: undefined }),
  usePublicClient: () => undefined,
  useWalletClient: () => ({ data: undefined }),
  useSwitchChain: () => ({ switchChainAsync: async () => undefined }),
  WagmiProvider: ({ children }: { children: ReactNode }) => children,
};

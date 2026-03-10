module.exports = {
  useAccount: () => ({ address: undefined, isConnected: false }),
  useChainId: () => 421614,
  useConnectorClient: () => ({ data: undefined }),
  usePublicClient: () => undefined,
  useWalletClient: () => ({ data: undefined }),
  WagmiProvider: ({ children }) => children,
};

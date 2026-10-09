/**
 * Jest mock for `@wagmi/core`. Like the `wagmi` mock next to it, the real
 * package ships untransformed ESM; imperative actions resolve to benign
 * values so modules that import them (useContract, the chain guard,
 * useTxFlow) load in jsdom. Tests that exercise a write path override these
 * with `jest.mock('@wagmi/core', …)` or `jest.mocked(...)`.
 */
module.exports = {
  getAccount: jest.fn(() => ({ address: undefined, isConnected: false, chainId: undefined })),
  getConnectorClient: jest.fn(async () => undefined),
  switchChain: jest.fn(async () => undefined),
  writeContract: jest.fn(async () => '0x'),
  sendTransaction: jest.fn(async () => '0x'),
  waitForTransactionReceipt: jest.fn(async () => ({ status: 'success' })),
};

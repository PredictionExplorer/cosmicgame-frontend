import { getConnectorClient, switchChain, type Config } from '@wagmi/core';
import { getChainId } from 'viem/actions';

import { activeChain } from '@/config/chains';
import { classifyTxError } from '@/lib/txErrors';

import {
  ChainGuardError,
  EXPLORER_NAME,
  REQUIRED_CHAIN_NAME,
  ensureWalletOnRequiredChain,
  getChainDisplayName,
} from '../chainGuard';

jest.mock('viem/actions', () => ({ getChainId: jest.fn() }));

const config = {} as Config;
const mockGetConnectorClient = getConnectorClient as jest.Mock;
const mockSwitchChain = switchChain as jest.Mock;
const mockGetChainId = getChainId as jest.Mock;
const SIGNER = { id: 'signer' };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetConnectorClient.mockResolvedValue(SIGNER);
  mockGetChainId.mockResolvedValue(activeChain.id);
  mockSwitchChain.mockResolvedValue(undefined);
});

describe('network names', () => {
  it('names the configured chain and its explorer', () => {
    expect(REQUIRED_CHAIN_NAME).toBe('Arbitrum Sepolia');
    expect(EXPLORER_NAME).toBe('Arbiscan');
  });

  it('names common wallet chains and admits unknown ones', () => {
    expect(getChainDisplayName(activeChain.id)).toBe(REQUIRED_CHAIN_NAME);
    expect(getChainDisplayName(1)).toBe('Ethereum');
    expect(getChainDisplayName(8453)).toBe('Base');
    expect(getChainDisplayName(999_999)).toBeNull();
    expect(getChainDisplayName(null)).toBeNull();
  });
});

describe('ensureWalletOnRequiredChain', () => {
  it('passes when the wallet already reports the app chain', async () => {
    await expect(ensureWalletOnRequiredChain(config)).resolves.toBe('ok');
    expect(mockGetChainId).toHaveBeenCalledWith(SIGNER);
    expect(mockSwitchChain).not.toHaveBeenCalled();
  });

  it('asks the wallet to switch when it is elsewhere', async () => {
    mockGetChainId.mockResolvedValue(1);
    await expect(ensureWalletOnRequiredChain(config)).resolves.toBe('ok');
    expect(mockSwitchChain).toHaveBeenCalledWith(config, { chainId: activeChain.id });
  });

  it('uses an injected switch implementation when given', async () => {
    const switchTo = jest.fn().mockResolvedValue(undefined);
    mockGetChainId.mockResolvedValue(1);

    await ensureWalletOnRequiredChain(config, { switchTo });

    expect(mockGetConnectorClient).toHaveBeenCalledWith(config);
    expect(mockGetChainId).toHaveBeenCalledWith(SIGNER);
    expect(switchTo).toHaveBeenCalledWith(activeChain.id);
    expect(mockSwitchChain).not.toHaveBeenCalled();
  });

  it('distinguishes a declined switch from a failed one', async () => {
    mockGetChainId.mockResolvedValue(1);
    mockSwitchChain.mockRejectedValueOnce({ code: 4001, message: 'User rejected' });
    await expect(ensureWalletOnRequiredChain(config)).resolves.toBe('rejected');

    mockSwitchChain.mockRejectedValueOnce(new Error('Unrecognized chain'));
    await expect(ensureWalletOnRequiredChain(config)).resolves.toBe('failed');
  });

  it('reports no wallet when there is no connector client', async () => {
    mockGetConnectorClient.mockRejectedValue(new Error('Connector not connected'));
    await expect(ensureWalletOnRequiredChain(config)).resolves.toBe('no-wallet');
  });

  it('falls back to the chain wagmi reports when the wallet refuses eth_chainId', async () => {
    mockGetChainId.mockRejectedValue(new Error('unsupported'));
    await expect(ensureWalletOnRequiredChain(config, { fallbackChainId: 1 })).resolves.toBe('ok');
    expect(mockSwitchChain).toHaveBeenCalled();
  });
});

describe('ChainGuardError', () => {
  it('classifies like the wallet errors it stands for', () => {
    expect(classifyTxError(new ChainGuardError('rejected')).kind).toBe('rejected');
    expect(classifyTxError(new ChainGuardError('failed')).kind).toBe('wrong-network');
    expect(classifyTxError(new ChainGuardError('no-wallet')).kind).toBe('wallet-not-connected');
  });
});

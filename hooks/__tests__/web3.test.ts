import { renderHook } from '@testing-library/react';
import { useAccount, useChainId } from 'wagmi';

import { networkConfig } from '@/config/networks';

import { useActiveWeb3React } from '../web3';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useChainId: jest.fn(),
}));

const mockUseAccount = useAccount as jest.Mock;
const mockUseChainId = useChainId as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useActiveWeb3React', () => {
  it('returns connected state when wallet is connected', () => {
    mockUseAccount.mockReturnValue({
      address: '0xAlice',
      isConnected: true,
    });
    mockUseChainId.mockReturnValue(42161);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(result.current).toEqual({
      account: '0xAlice',
      chainId: 42161,
      active: true,
    });
  });

  it('returns null account and false active when disconnected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    });
    mockUseChainId.mockReturnValue(networkConfig.chainId);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(result.current).toEqual({
      account: null,
      chainId: networkConfig.chainId,
      active: false,
    });
  });

  it('falls back to networkConfig.chainId when useChainId returns undefined', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    });
    mockUseChainId.mockReturnValue(undefined);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(result.current.chainId).toBe(networkConfig.chainId);
  });
});

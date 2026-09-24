import { renderHook } from '@testing-library/react';
import { useChainId, useConnection } from 'wagmi';

import { networkConfig } from '@/config/networks';

import { useActiveWeb3React } from '../web3';

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
  useChainId: jest.fn(),
}));

const mockUseConnection = useConnection as jest.Mock;
const mockUseChainId = useChainId as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useActiveWeb3React', () => {
  it('returns connected state when wallet is connected', () => {
    mockUseConnection.mockReturnValue({
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
    mockUseConnection.mockReturnValue({
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
    mockUseConnection.mockReturnValue({
      address: undefined,
      isConnected: false,
    });
    mockUseChainId.mockReturnValue(undefined);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(result.current.chainId).toBe(networkConfig.chainId);
  });

  it('return object has exactly account, chainId, and active keys', () => {
    mockUseConnection.mockReturnValue({ address: '0xBob', isConnected: true });
    mockUseChainId.mockReturnValue(1);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(Object.keys(result.current).sort()).toEqual(['account', 'active', 'chainId']);
  });

  it('account is null (not undefined) when address is undefined', () => {
    mockUseConnection.mockReturnValue({ address: undefined, isConnected: false });
    mockUseChainId.mockReturnValue(1);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(result.current.account).toBeNull();
    expect(result.current.account).not.toBeUndefined();
  });

  it('active mirrors isConnected as a boolean', () => {
    mockUseConnection.mockReturnValue({ address: '0xAlice', isConnected: true });
    mockUseChainId.mockReturnValue(1);

    const { result } = renderHook(() => useActiveWeb3React());
    expect(result.current.active).toBe(true);

    mockUseConnection.mockReturnValue({ address: undefined, isConnected: false });
    const { result: result2 } = renderHook(() => useActiveWeb3React());
    expect(result2.current.active).toBe(false);
  });

  it('uses actual chainId when non-nullish (not the fallback)', () => {
    mockUseConnection.mockReturnValue({ address: undefined, isConnected: false });
    mockUseChainId.mockReturnValue(137);

    const { result } = renderHook(() => useActiveWeb3React());

    expect(result.current.chainId).toBe(137);
    expect(result.current.chainId).not.toBe(networkConfig.chainId);
  });

  it('returns chainId 0 as-is without falling back', () => {
    mockUseConnection.mockReturnValue({ address: undefined, isConnected: false });
    mockUseChainId.mockReturnValue(0);

    const { result } = renderHook(() => useActiveWeb3React());

    // `0 ?? fallback` returns 0 since ?? only triggers on null/undefined
    expect(result.current.chainId).toBe(0);
  });
});

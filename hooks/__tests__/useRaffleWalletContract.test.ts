import { renderHook } from '@testing-library/react';

import { prizesWalletAbi } from '@/contracts/abis';

import { RAFFLE_WALLET_ADDRESS } from '@/config/networks';

import useRaffleWalletContract from '../useRaffleWalletContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useRaffleWalletContract', () => {
  it('calls useContract with RAFFLE_WALLET_ADDRESS and prizesWalletAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useRaffleWalletContract());
    expect(mockUseContract).toHaveBeenCalledWith(RAFFLE_WALLET_ADDRESS, prizesWalletAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useRaffleWalletContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useRaffleWalletContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useRaffleWalletContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    expect(typeof RAFFLE_WALLET_ADDRESS).toBe('string');
    expect(RAFFLE_WALLET_ADDRESS.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(prizesWalletAbi)).toBe(true);
    expect(prizesWalletAbi.length).toBeGreaterThan(0);
  });
});

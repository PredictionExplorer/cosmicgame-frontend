import { renderHook } from '@testing-library/react';

import { stakingWalletRwlkAbi } from '@/contracts/abis';

import { STAKING_WALLET_RWLK_ADDRESS } from '@/config/networks';

import useStakingWalletRWLKContract from '../useStakingWalletRWLKContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useStakingWalletRWLKContract', () => {
  it('calls useContract with STAKING_WALLET_RWLK_ADDRESS and stakingWalletRwlkAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useStakingWalletRWLKContract());
    expect(mockUseContract).toHaveBeenCalledWith(STAKING_WALLET_RWLK_ADDRESS, stakingWalletRwlkAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useStakingWalletRWLKContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useStakingWalletRWLKContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useStakingWalletRWLKContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    expect(typeof STAKING_WALLET_RWLK_ADDRESS).toBe('string');
    expect(STAKING_WALLET_RWLK_ADDRESS.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(stakingWalletRwlkAbi)).toBe(true);
    expect(stakingWalletRwlkAbi.length).toBeGreaterThan(0);
  });
});

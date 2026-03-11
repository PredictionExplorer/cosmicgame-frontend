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
});

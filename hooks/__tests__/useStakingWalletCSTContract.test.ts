import { renderHook } from '@testing-library/react';

import { stakingWalletCstAbi } from '@/contracts/abis';

import { STAKING_WALLET_CST_ADDRESS } from '@/config/networks';

import useStakingWalletCSTContract from '../useStakingWalletCSTContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useStakingWalletCSTContract', () => {
  it('calls useContract with STAKING_WALLET_CST_ADDRESS and stakingWalletCstAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useStakingWalletCSTContract());
    expect(mockUseContract).toHaveBeenCalledWith(STAKING_WALLET_CST_ADDRESS, stakingWalletCstAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useStakingWalletCSTContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useStakingWalletCSTContract());
    expect(result.current).toBeNull();
  });
});

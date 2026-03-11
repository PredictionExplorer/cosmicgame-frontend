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
});

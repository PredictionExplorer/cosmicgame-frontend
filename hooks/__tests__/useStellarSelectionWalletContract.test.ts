import { renderHook } from '@testing-library/react';

import { prizesWalletAbi } from '@/contracts/abis';

import { STELLAR_SELECTION_WALLET_ADDRESS } from '@/config/networks';

import useStellarSelectionWalletContract from '../useStellarSelectionWalletContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useStellarSelectionWalletContract', () => {
  it('calls useContract with STELLAR_SELECTION_WALLET_ADDRESS and prizesWalletAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useStellarSelectionWalletContract());
    expect(mockUseContract).toHaveBeenCalledWith(STELLAR_SELECTION_WALLET_ADDRESS, prizesWalletAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useStellarSelectionWalletContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useStellarSelectionWalletContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useStellarSelectionWalletContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    expect(typeof STELLAR_SELECTION_WALLET_ADDRESS).toBe('string');
    expect(STELLAR_SELECTION_WALLET_ADDRESS.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(prizesWalletAbi)).toBe(true);
    expect(prizesWalletAbi.length).toBeGreaterThan(0);
  });
});

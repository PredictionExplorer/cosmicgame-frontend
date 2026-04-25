import { renderHook } from '@testing-library/react';

import { stakingWalletRwlkAbi } from '@/contracts/abis';

import { ANCHORING_WALLET_RWLK_ADDRESS } from '@/config/networks';

import useAnchoringWalletRWLKContract from '../useAnchoringWalletRWLKContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAnchoringWalletRWLKContract', () => {
  it('calls useContract with ANCHORING_WALLET_RWLK_ADDRESS and stakingWalletRwlkAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useAnchoringWalletRWLKContract());
    expect(mockUseContract).toHaveBeenCalledWith(
      ANCHORING_WALLET_RWLK_ADDRESS,
      stakingWalletRwlkAbi,
    );
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useAnchoringWalletRWLKContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useAnchoringWalletRWLKContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useAnchoringWalletRWLKContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    expect(typeof ANCHORING_WALLET_RWLK_ADDRESS).toBe('string');
    expect(ANCHORING_WALLET_RWLK_ADDRESS.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(stakingWalletRwlkAbi)).toBe(true);
    expect(stakingWalletRwlkAbi.length).toBeGreaterThan(0);
  });
});

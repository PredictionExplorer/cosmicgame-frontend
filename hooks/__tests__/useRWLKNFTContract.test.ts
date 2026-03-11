import { renderHook } from '@testing-library/react';

import { randomWalkNftAbi } from '@/contracts/abis';

import { NFT_ADDRESS } from '@/config/networks';

import useRWLKNFTContract from '../useRWLKNFTContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useRWLKNFTContract', () => {
  it('calls useContract with NFT_ADDRESS and randomWalkNftAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useRWLKNFTContract());
    expect(mockUseContract).toHaveBeenCalledWith(NFT_ADDRESS, randomWalkNftAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useRWLKNFTContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useRWLKNFTContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useRWLKNFTContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    expect(typeof NFT_ADDRESS).toBe('string');
    expect(NFT_ADDRESS.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(randomWalkNftAbi)).toBe(true);
    expect(randomWalkNftAbi.length).toBeGreaterThan(0);
  });
});

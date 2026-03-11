import { renderHook } from '@testing-library/react';

import { artBlocksAbi } from '@/contracts/abis';

import { ART_BLOCKS_ADDRESS } from '@/config/networks';

import useArtBlocksContract from '../useArtBlocksContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useArtBlocksContract', () => {
  it('calls useContract with ART_BLOCKS_ADDRESS and artBlocksAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useArtBlocksContract());
    expect(mockUseContract).toHaveBeenCalledWith(ART_BLOCKS_ADDRESS, artBlocksAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useArtBlocksContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useArtBlocksContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useArtBlocksContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    expect(typeof ART_BLOCKS_ADDRESS).toBe('string');
    expect(ART_BLOCKS_ADDRESS.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(artBlocksAbi)).toBe(true);
    expect(artBlocksAbi.length).toBeGreaterThan(0);
  });
});

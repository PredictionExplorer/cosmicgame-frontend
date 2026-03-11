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
});

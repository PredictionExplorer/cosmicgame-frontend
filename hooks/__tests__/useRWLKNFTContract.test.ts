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
});

import { renderHook } from '@testing-library/react';

import { cosmicGameAbi } from '@/contracts/abis';

import { COSMICGAME_ADDRESS } from '@/config/networks';

import useCosmicGameContract from '../useCosmicGameContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCosmicGameContract', () => {
  it('calls useContract with COSMICGAME_ADDRESS and cosmicGameAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useCosmicGameContract());
    expect(mockUseContract).toHaveBeenCalledWith(COSMICGAME_ADDRESS, cosmicGameAbi);
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {}, write: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useCosmicGameContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useCosmicGameContract());
    expect(result.current).toBeNull();
  });
});

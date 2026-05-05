import { renderHook } from '@testing-library/react';

import { randomWalkNftAbi } from '@/contracts/abis';

import {
  emptyContractAddresses,
  publishDashboardContractAddresses,
  getCachedDashboardContractAddresses,
} from '@/config/networks';
import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import useRWLKNFTContract from '../useRWLKNFTContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  publishDashboardContractAddresses(TEST_APP_CONTRACT_ADDRESSES);
});

afterEach(() => {
  publishDashboardContractAddresses(emptyContractAddresses());
});

describe('useRWLKNFTContract', () => {
  it('calls useContract with RandomWalk NFT address and randomWalkNftAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useRWLKNFTContract());
    expect(mockUseContract).toHaveBeenCalledWith(
      getCachedDashboardContractAddresses().randomWalkNft,
      randomWalkNftAbi,
    );
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
    const addr = TEST_APP_CONTRACT_ADDRESSES.randomWalkNft;
    expect(typeof addr).toBe('string');
    expect(addr.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(randomWalkNftAbi)).toBe(true);
    expect(randomWalkNftAbi.length).toBeGreaterThan(0);
  });
});

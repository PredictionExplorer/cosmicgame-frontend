import { renderHook } from '@testing-library/react';

import { cosmicGameAbi } from '@/contracts/abis';
import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import {
  emptyContractAddresses,
  publishDashboardContractAddresses,
  getCachedDashboardContractAddresses,
} from '@/config/networks';

import useCosmicGameContract from '../useCosmicGameContract';
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

describe('useCosmicGameContract', () => {
  it('calls useContract with cosmic game address and cosmicGameAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useCosmicGameContract());
    expect(mockUseContract).toHaveBeenCalledWith(
      getCachedDashboardContractAddresses().cosmicGame,
      cosmicGameAbi,
    );
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

  it('returns same reference on re-render', () => {
    const mockContract = { read: {}, write: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useCosmicGameContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    const addr = TEST_APP_CONTRACT_ADDRESSES.cosmicGame;
    expect(typeof addr).toBe('string');
    expect(addr.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(cosmicGameAbi)).toBe(true);
    expect(cosmicGameAbi.length).toBeGreaterThan(0);
  });
});

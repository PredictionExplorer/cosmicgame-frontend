import { renderHook } from '@testing-library/react';

import { stakingWalletCstAbi } from '@/contracts/abis';
import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import {
  emptyContractAddresses,
  publishDashboardContractAddresses,
  getCachedDashboardContractAddresses,
} from '@/config/networks';

import useAnchoringWalletCSTContract from '../useAnchoringWalletCSTContract';
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

describe('useAnchoringWalletCSTContract', () => {
  it('calls useContract with CST anchoring wallet address and stakingWalletCstAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useAnchoringWalletCSTContract());
    expect(mockUseContract).toHaveBeenCalledWith(
      getCachedDashboardContractAddresses().stakingCst,
      stakingWalletCstAbi,
    );
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useAnchoringWalletCSTContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useAnchoringWalletCSTContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useAnchoringWalletCSTContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    const addr = TEST_APP_CONTRACT_ADDRESSES.stakingCst;
    expect(typeof addr).toBe('string');
    expect(addr.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(stakingWalletCstAbi)).toBe(true);
    expect(stakingWalletCstAbi.length).toBeGreaterThan(0);
  });
});

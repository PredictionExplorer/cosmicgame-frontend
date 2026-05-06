import { renderHook } from '@testing-library/react';

import { prizesWalletAbi } from '@/contracts/abis';
import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import {
  emptyContractAddresses,
  publishDashboardContractAddresses,
  getCachedDashboardContractAddresses,
} from '@/config/networks';

import useStellarSelectionWalletContract from '../useStellarSelectionWalletContract';
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

describe('useStellarSelectionWalletContract', () => {
  it('calls useContract with stellar selection wallet address and ABI', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useStellarSelectionWalletContract());
    expect(mockUseContract).toHaveBeenCalledWith(
      getCachedDashboardContractAddresses().prizesWallet,
      prizesWalletAbi,
    );
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
    const addr = TEST_APP_CONTRACT_ADDRESSES.prizesWallet;
    expect(typeof addr).toBe('string');
    expect(addr.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(prizesWalletAbi)).toBe(true);
    expect(prizesWalletAbi.length).toBeGreaterThan(0);
  });
});

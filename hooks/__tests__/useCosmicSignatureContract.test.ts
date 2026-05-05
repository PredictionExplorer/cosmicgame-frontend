import { renderHook } from '@testing-library/react';

import { cosmicSignatureAbi } from '@/contracts/abis';

import {
  emptyContractAddresses,
  publishDashboardContractAddresses,
  getCachedDashboardContractAddresses,
} from '@/config/networks';
import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import useCosmicSignatureContract from '../useCosmicSignatureContract';
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

describe('useCosmicSignatureContract', () => {
  it('calls useContract with cosmic signature NFT address and cosmicSignatureAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useCosmicSignatureContract());
    expect(mockUseContract).toHaveBeenCalledWith(
      getCachedDashboardContractAddresses().cosmicSignature,
      cosmicSignatureAbi,
    );
  });

  it('returns the contract from useContract', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result } = renderHook(() => useCosmicSignatureContract());
    expect(result.current).toBe(mockContract);
  });

  it('returns null when useContract returns null', () => {
    mockUseContract.mockReturnValue(null);
    const { result } = renderHook(() => useCosmicSignatureContract());
    expect(result.current).toBeNull();
  });

  it('returns same reference on re-render', () => {
    const mockContract = { read: {} };
    mockUseContract.mockReturnValue(mockContract);
    const { result, rerender } = renderHook(() => useCosmicSignatureContract());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('uses a valid non-empty address', () => {
    const addr = TEST_APP_CONTRACT_ADDRESSES.cosmicSignature;
    expect(typeof addr).toBe('string');
    expect(addr.length).toBeGreaterThan(0);
  });

  it('uses a non-empty ABI array', () => {
    expect(Array.isArray(cosmicSignatureAbi)).toBe(true);
    expect(cosmicSignatureAbi.length).toBeGreaterThan(0);
  });
});

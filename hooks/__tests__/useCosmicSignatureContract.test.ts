import { renderHook } from '@testing-library/react';

import { cosmicSignatureAbi } from '@/contracts/abis';

import { COSMIC_SIGNATURE_ADDRESS } from '@/config/networks';

import useCosmicSignatureContract from '../useCosmicSignatureContract';
import useContract from '../useContract';

jest.mock('../useContract');

const mockUseContract = useContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCosmicSignatureContract', () => {
  it('calls useContract with COSMIC_SIGNATURE_ADDRESS and cosmicSignatureAbi', () => {
    mockUseContract.mockReturnValue(null);
    renderHook(() => useCosmicSignatureContract());
    expect(mockUseContract).toHaveBeenCalledWith(COSMIC_SIGNATURE_ADDRESS, cosmicSignatureAbi);
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
});

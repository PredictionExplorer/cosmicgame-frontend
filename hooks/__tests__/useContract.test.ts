import { renderHook } from '@testing-library/react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Abi } from 'viem';

import useContract from '@/hooks/useContract';

jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(),
  useWalletClient: jest.fn(() => ({ data: undefined })),
}));

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem.js'),
  getContract: jest.fn(),
}));

const mockUsePublicClient = usePublicClient as jest.Mock;
const mockUseWalletClient = useWalletClient as jest.Mock;
const mockGetContract = getContract as unknown as jest.Mock;

const TEST_ABI = [
  {
    type: 'function' as const,
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view' as const,
  },
] as const;

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePublicClient.mockReturnValue(undefined);
  mockUseWalletClient.mockReturnValue({ data: undefined });
});

describe('useContract', () => {
  describe('when dependencies are missing', () => {
    it('returns null when address is empty', () => {
      mockUsePublicClient.mockReturnValue({ chain: { id: 1 } });

      const { result } = renderHook(() => useContract('', TEST_ABI));

      expect(result.current).toBeNull();
      expect(mockGetContract).not.toHaveBeenCalled();
    });

    it('returns null when abi is null/undefined', () => {
      mockUsePublicClient.mockReturnValue({ chain: { id: 1 } });

      const { result } = renderHook(() => useContract(TEST_ADDRESS, null as unknown as Abi));

      expect(result.current).toBeNull();
      expect(mockGetContract).not.toHaveBeenCalled();
    });

    it('returns null when publicClient is undefined', () => {
      mockUsePublicClient.mockReturnValue(undefined);

      const { result } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      expect(result.current).toBeNull();
      expect(mockGetContract).not.toHaveBeenCalled();
    });
  });

  describe('when all dependencies are provided', () => {
    const mockPublicClient = { chain: { id: 1 }, request: jest.fn() };
    const mockContract = { read: {}, write: {}, address: TEST_ADDRESS };

    beforeEach(() => {
      mockUsePublicClient.mockReturnValue(mockPublicClient);
      mockGetContract.mockReturnValue(mockContract);
    });

    it('returns a contract object with only publicClient', () => {
      mockUseWalletClient.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      expect(result.current).toBe(mockContract);
      expect(mockGetContract).toHaveBeenCalledWith({
        address: TEST_ADDRESS,
        abi: TEST_ABI,
        client: mockPublicClient,
      });
    });

    it('passes both public and wallet clients when wallet is connected', () => {
      const mockWalletClient = { account: { address: TEST_ADDRESS } };
      mockUseWalletClient.mockReturnValue({ data: mockWalletClient });

      const { result } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      expect(result.current).toBe(mockContract);
      expect(mockGetContract).toHaveBeenCalledWith({
        address: TEST_ADDRESS,
        abi: TEST_ABI,
        client: { public: mockPublicClient, wallet: mockWalletClient },
      });
    });

    it('memoises the contract across re-renders with the same inputs', () => {
      mockUseWalletClient.mockReturnValue({ data: undefined });

      const { result, rerender } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      const firstResult = result.current;
      rerender();

      expect(result.current).toBe(firstResult);
      expect(mockGetContract).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('returns null and logs error when getContract throws', () => {
      const mockPublicClient = { chain: { id: 1 } };
      mockUsePublicClient.mockReturnValue(mockPublicClient);
      mockGetContract.mockImplementation(() => {
        throw new Error('Invalid ABI');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      expect(result.current).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('[useContract init]', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});

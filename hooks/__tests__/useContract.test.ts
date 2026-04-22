import { renderHook } from '@testing-library/react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Abi } from 'viem';

import { reportError } from '@/utils/errors';
import useContract from '@/hooks/useContract';

jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(),
  useWalletClient: jest.fn(() => ({ data: undefined })),
  useConnectorClient: jest.fn(() => ({ data: undefined })),
}));

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem.js'),
  getContract: jest.fn(),
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

const mockUsePublicClient = usePublicClient as jest.Mock;
const mockUseWalletClient = useWalletClient as jest.Mock;
const mockGetContract = getContract as unknown as jest.Mock;
const mockReportError = reportError as jest.Mock;

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

  describe('dependency recalculation', () => {
    const mockPublicClient1 = { chain: { id: 1 }, request: jest.fn() };
    const mockPublicClient2 = { chain: { id: 2 }, request: jest.fn() };
    const contract1 = { read: {}, id: 1 };
    const contract2 = { read: {}, id: 2 };

    it('recalculates when walletClient connects', () => {
      mockUsePublicClient.mockReturnValue(mockPublicClient1);
      mockUseWalletClient.mockReturnValue({ data: undefined });
      mockGetContract.mockReturnValueOnce(contract1).mockReturnValueOnce(contract2);

      const { result, rerender } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));
      expect(result.current).toBe(contract1);

      const mockWalletClient = { account: { address: TEST_ADDRESS } };
      mockUseWalletClient.mockReturnValue({ data: mockWalletClient });
      rerender();

      expect(result.current).toBe(contract2);
      expect(mockGetContract).toHaveBeenCalledTimes(2);
    });

    it('recalculates when walletClient disconnects', () => {
      const mockWalletClient = { account: { address: TEST_ADDRESS } };
      mockUsePublicClient.mockReturnValue(mockPublicClient1);
      mockUseWalletClient.mockReturnValue({ data: mockWalletClient });
      mockGetContract.mockReturnValueOnce(contract1).mockReturnValueOnce(contract2);

      const { result, rerender } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));
      expect(result.current).toBe(contract1);

      mockUseWalletClient.mockReturnValue({ data: undefined });
      rerender();

      expect(result.current).toBe(contract2);
      expect(mockGetContract).toHaveBeenCalledTimes(2);
    });

    it('recalculates when publicClient changes', () => {
      mockUsePublicClient.mockReturnValue(mockPublicClient1);
      mockUseWalletClient.mockReturnValue({ data: undefined });
      mockGetContract.mockReturnValueOnce(contract1).mockReturnValueOnce(contract2);

      const { result, rerender } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));
      expect(result.current).toBe(contract1);

      mockUsePublicClient.mockReturnValue(mockPublicClient2);
      rerender();

      expect(result.current).toBe(contract2);
      expect(mockGetContract).toHaveBeenCalledTimes(2);
    });

    it('recalculates when address changes', () => {
      const OTHER_ADDRESS = '0x0000000000000000000000000000000000000001';
      mockUsePublicClient.mockReturnValue(mockPublicClient1);
      mockUseWalletClient.mockReturnValue({ data: undefined });
      mockGetContract.mockReturnValueOnce(contract1).mockReturnValueOnce(contract2);

      const { result, rerender } = renderHook(({ addr }) => useContract(addr, TEST_ABI), {
        initialProps: { addr: TEST_ADDRESS },
      });
      expect(result.current).toBe(contract1);

      rerender({ addr: OTHER_ADDRESS });
      expect(result.current).toBe(contract2);
    });
  });

  describe('error handling', () => {
    it('returns null and calls reportError when getContract throws', () => {
      const mockPublicClient = { chain: { id: 1 } };
      mockUsePublicClient.mockReturnValue(mockPublicClient);
      const error = new Error('Invalid ABI');
      mockGetContract.mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      expect(result.current).toBeNull();
      expect(mockReportError).toHaveBeenCalledWith(error, 'useContract init');
    });

    it('does not call reportError when no error occurs', () => {
      const mockPublicClient = { chain: { id: 1 } };
      mockUsePublicClient.mockReturnValue(mockPublicClient);
      mockGetContract.mockReturnValue({ read: {} });

      renderHook(() => useContract(TEST_ADDRESS, TEST_ABI));

      expect(mockReportError).not.toHaveBeenCalled();
    });
  });
});

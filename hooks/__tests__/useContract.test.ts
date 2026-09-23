import { renderHook } from '@testing-library/react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Abi } from 'viem';
import { writeContract } from '@wagmi/core';

import { ensureWalletOnRequiredChain } from '@/lib/chainGuard';
import { reportError } from '@/utils/errors';
import useContract from '@/hooks/useContract';

// wagmi's config is one stable object for the app's lifetime.
const mockConfig = { id: 'config' };

jest.mock('wagmi', () => ({
  useConfig: () => mockConfig,
  usePublicClient: jest.fn(),
  useWalletClient: jest.fn(() => ({ data: undefined })),
  useConnectorClient: jest.fn(() => ({ data: undefined })),
}));

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem'),
  getContract: jest.fn(),
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

jest.mock('../../lib/chainGuard', () => {
  const actual = jest.requireActual('../../lib/chainGuard');
  return { ...actual, ensureWalletOnRequiredChain: jest.fn(async () => 'ok') };
});

const mockUsePublicClient = usePublicClient as jest.Mock;
const mockUseWalletClient = useWalletClient as jest.Mock;
const mockGetContract = getContract as unknown as jest.Mock;
const mockReportError = reportError as jest.Mock;
const mockWriteContract = writeContract as jest.Mock;
const mockEnsureChain = ensureWalletOnRequiredChain as jest.Mock;

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

  describe('chain-guarded writes', () => {
    const WRITE_ABI = [
      ...TEST_ABI,
      {
        type: 'function' as const,
        name: 'transfer',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable' as const,
      },
      {
        type: 'function' as const,
        name: 'poke',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable' as const,
      },
    ] as const;

    /** The guarded writes, untyped: viem's typed signatures want a full wallet client. */
    type GuardedWrites = Record<string, (...params: unknown[]) => Promise<string>>;
    const writesOf = (contract: unknown) => (contract as { write: GuardedWrites }).write;

    beforeEach(() => {
      mockUsePublicClient.mockReturnValue({ chain: { id: 421614 } });
      mockGetContract.mockImplementation(() => ({ read: {}, write: {} }));
      mockEnsureChain.mockResolvedValue('ok');
      mockWriteContract.mockResolvedValue('0xwritten');
    });

    it('checks the wallet chain, then writes on the app chain with the current signer', async () => {
      const { result } = renderHook(() => useContract(TEST_ADDRESS, WRITE_ABI));

      const hash = await writesOf(result.current).transfer!(
        ['0x0000000000000000000000000000000000000002', 5n],
        { gas: 21_000n },
      );

      expect(hash).toBe('0xwritten');
      expect(mockEnsureChain).toHaveBeenCalledWith({ id: 'config' });
      expect(mockWriteContract).toHaveBeenCalledWith(
        { id: 'config' },
        expect.objectContaining({
          address: TEST_ADDRESS,
          functionName: 'transfer',
          args: ['0x0000000000000000000000000000000000000002', 5n],
          gas: 21_000n,
          chainId: 421614,
        }),
      );
    });

    it('treats a lone argument of an argument-less function as options', async () => {
      const { result } = renderHook(() => useContract(TEST_ADDRESS, WRITE_ABI));

      await writesOf(result.current).poke!({ value: 1n });

      const request = mockWriteContract.mock.calls[0]![1] as Record<string, unknown>;
      expect(request).toMatchObject({ functionName: 'poke', value: 1n });
      expect(request).not.toHaveProperty('args');
    });

    it('does not write when the wallet stays on another network', async () => {
      mockEnsureChain.mockResolvedValue('failed');
      const { result } = renderHook(() => useContract(TEST_ADDRESS, WRITE_ABI));

      await expect(writesOf(result.current).poke!()).rejects.toMatchObject({
        name: 'ChainMismatchError',
      });
      expect(mockWriteContract).not.toHaveBeenCalled();
    });

    it('reports a declined switch as a rejection', async () => {
      mockEnsureChain.mockResolvedValue('rejected');
      const { result } = renderHook(() => useContract(TEST_ADDRESS, WRITE_ABI));

      await expect(writesOf(result.current).poke!()).rejects.toMatchObject({ code: 4001 });
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

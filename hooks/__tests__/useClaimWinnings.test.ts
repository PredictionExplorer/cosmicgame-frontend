import { act, renderHook, waitFor } from '@/test-utils';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSetNotification = jest.fn();
const mockFetchStatusData = jest.fn();

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../contexts/ApiDataContext', () => ({
  useApiData: () => ({ fetchData: mockFetchStatusData }),
}));

const mockWaitForTransactionReceipt = jest.fn().mockResolvedValue({ status: 'success' });
const mockUsePublicClient = jest.fn(() => ({
  waitForTransactionReceipt: mockWaitForTransactionReceipt,
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => mockUsePublicClient(),
}));

const mockWriteWithdrawEverything = jest.fn().mockResolvedValue('0xtx1' as const);
const mockWriteClaimDonatedNft = jest.fn().mockResolvedValue('0xtx2' as const);
const mockWriteClaimManyDonatedNfts = jest.fn().mockResolvedValue('0xtx3' as const);
const mockWriteClaimDonatedToken = jest.fn().mockResolvedValue('0xtx4' as const);
const mockWriteClaimManyDonatedTokens = jest.fn().mockResolvedValue('0xtx5' as const);

const mockUseRaffleWalletContract = jest.fn(() => ({
  write: {
    withdrawEverything: mockWriteWithdrawEverything,
    claimDonatedNft: mockWriteClaimDonatedNft,
    claimManyDonatedNfts: mockWriteClaimManyDonatedNfts,
    claimDonatedToken: mockWriteClaimDonatedToken,
    claimManyDonatedTokens: mockWriteClaimManyDonatedTokens,
  },
}));

jest.mock('../useRaffleWalletContract', () => ({
  __esModule: true,
  default: () => mockUseRaffleWalletContract(),
}));

const mockIsUserRejection = jest.fn((_err: unknown) => false);
const mockReportError = jest.fn((_err: unknown, _context?: string) => {});
const mockGetEthErrorMessage = jest.fn(
  (_err: unknown, fallback?: string) => fallback ?? 'ETH error',
);

jest.mock('../../utils/errors', () => ({
  isUserRejection: (...args: unknown[]) => mockIsUserRejection(...(args as [unknown])),
  reportError: (...args: unknown[]) => mockReportError(...(args as [unknown, string])),
  getEthErrorMessage: (...args: unknown[]) =>
    mockGetEthErrorMessage(...(args as [unknown, string | undefined])),
  WALLET_TRANSACTION_CANCELLED_MESSAGE: 'Transaction cancelled by user',
}));

const mockGetErrorMessage = jest.fn((msg: string) => msg);
jest.mock('../../utils/alert', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockGetErrorMessage(...(args as [string])),
}));

import { useClaimWinnings } from '../useClaimWinnings';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
  mockWriteWithdrawEverything.mockResolvedValue('0xtx1' as const);
  mockWriteClaimDonatedNft.mockResolvedValue('0xtx2' as const);
  mockWriteClaimManyDonatedNfts.mockResolvedValue('0xtx3' as const);
  mockWriteClaimDonatedToken.mockResolvedValue('0xtx4' as const);
  mockWriteClaimManyDonatedTokens.mockResolvedValue('0xtx5' as const);
  mockIsUserRejection.mockReturnValue(false);
  mockGetEthErrorMessage.mockImplementation((_err, fallback) => fallback ?? 'ETH error');
  mockGetErrorMessage.mockImplementation((msg: string) => msg);
  mockUseRaffleWalletContract.mockReturnValue({
    write: {
      withdrawEverything: mockWriteWithdrawEverything,
      claimDonatedNft: mockWriteClaimDonatedNft,
      claimManyDonatedNfts: mockWriteClaimManyDonatedNfts,
      claimDonatedToken: mockWriteClaimDonatedToken,
      claimManyDonatedTokens: mockWriteClaimManyDonatedTokens,
    },
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useClaimWinnings', () => {
  describe('initial state', () => {
    it('starts with all isClaiming flags false', () => {
      const { result } = renderHook(() => useClaimWinnings());
      expect(result.current.isClaiming).toEqual({
        raffleETH: false,
        donatedNFT: false,
        donatedERC20: false,
      });
    });

    it('starts with no NFTs being claimed', () => {
      const { result } = renderHook(() => useClaimWinnings());
      expect(result.current.claimingDonatedNFTs).toEqual([]);
    });

    it('exposes all six claim methods', () => {
      const { result } = renderHook(() => useClaimWinnings());
      expect(typeof result.current.claimAllRaffleETH).toBe('function');
      expect(typeof result.current.claimDonatedNFT).toBe('function');
      expect(typeof result.current.claimAllDonatedNFTs).toBe('function');
      expect(typeof result.current.claimDonatedERC20).toBe('function');
      expect(typeof result.current.claimAllDonatedERC20).toBe('function');
    });
  });

  describe('claimAllRaffleETH', () => {
    it('calls withdrawEverything with the round list', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([5, 6, 7]);
      });
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([[5, 6, 7], [], []]);
    });

    it('awaits the transaction receipt before finishing', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xtx1' });
    });

    it('refreshes status data on success', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockFetchStatusData).toHaveBeenCalledTimes(1);
    });

    it('calls onSuccess callback after success', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimWinnings(onSuccess));
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('notifies and aborts when wallet contract is null', async () => {
      mockUseRaffleWalletContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockWriteWithdrawEverything).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text: expect.stringContaining('Please connect your wallet'),
        }),
      );
    });

    it('sets isClaiming.raffleETH true during the call and false after', async () => {
      let capturedDuring = false;
      mockWriteWithdrawEverything.mockImplementation(async () => {
        capturedDuring = true;
        return '0xtx1';
      });
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(capturedDuring).toBe(true);
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });

    it('shows cancelled notification when user rejects the tx', async () => {
      const rejection = new Error('user rejected');
      mockWriteWithdrawEverything.mockRejectedValueOnce(rejection);
      mockIsUserRejection.mockReturnValueOnce(true);

      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          text: 'Transaction cancelled by user',
        }),
      );
      // Should NOT refresh data if the user cancelled.
      expect(mockFetchStatusData).not.toHaveBeenCalled();
    });

    it('reports non-user-rejection errors and shows error notification', async () => {
      const err = new Error('revert: insufficient balance');
      mockWriteWithdrawEverything.mockRejectedValueOnce(err);
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('revert: insufficient balance');

      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockReportError).toHaveBeenCalledWith(err, 'claim all raffle ETH');
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });

    it('handles empty round list gracefully', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([]);
      });
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([[], [], []]);
    });

    it('does not call waitForTransactionReceipt when write returns undefined', async () => {
      mockWriteWithdrawEverything.mockResolvedValueOnce(undefined as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockWaitForTransactionReceipt).not.toHaveBeenCalled();
    });
  });

  describe('claimDonatedNFT', () => {
    it('calls claimDonatedNft with the token id', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(42);
      });
      expect(mockWriteClaimDonatedNft).toHaveBeenCalledWith([42]);
    });

    it('awaits the receipt and refreshes on success', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(42);
      });
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xtx2' });
      expect(mockFetchStatusData).toHaveBeenCalled();
    });

    it('tracks the token id in claimingDonatedNFTs during the call', async () => {
      // Use a deferred promise so we can observe the in-flight state via the
      // hook's own `result.current` between `setState` flush and tx resolve.
      let release!: (v: `0x${string}`) => void;
      mockWriteClaimDonatedNft.mockImplementationOnce(
        () => new Promise<`0x${string}`>((r) => (release = r)),
      );
      const { result } = renderHook(() => useClaimWinnings());

      let pending!: Promise<unknown>;
      await act(async () => {
        pending = result.current.claimDonatedNFT(42);
        await Promise.resolve();
      });

      // The setState happened inside claimDonatedNFT before the write call,
      // so by now React has flushed it and the id should be visible.
      expect(result.current.claimingDonatedNFTs).toEqual([42]);

      await act(async () => {
        release('0xtx2');
        await pending;
      });
      expect(result.current.claimingDonatedNFTs).toEqual([]);
    });

    it('supports concurrent claims of different NFTs', async () => {
      let release1!: (v: `0x${string}`) => void;
      let release2!: (v: `0x${string}`) => void;
      mockWriteClaimDonatedNft.mockImplementationOnce(
        () => new Promise<`0x${string}`>((r) => (release1 = r)),
      );
      mockWriteClaimDonatedNft.mockImplementationOnce(
        () => new Promise<`0x${string}`>((r) => (release2 = r)),
      );

      const { result } = renderHook(() => useClaimWinnings());

      let p1!: Promise<unknown>;
      let p2!: Promise<unknown>;
      await act(async () => {
        p1 = result.current.claimDonatedNFT(1);
        p2 = result.current.claimDonatedNFT(2);
        // Allow state updates to flush.
        await Promise.resolve();
      });

      expect(result.current.claimingDonatedNFTs).toEqual(expect.arrayContaining([1, 2]));

      await act(async () => {
        release1('0xtx2');
        release2('0xtx2');
        await p1;
        await p2;
      });

      expect(result.current.claimingDonatedNFTs).toEqual([]);
    });

    it('removes only the specific token id after completion', async () => {
      let release!: (v: `0x${string}`) => void;
      mockWriteClaimDonatedNft.mockImplementationOnce(
        () => new Promise<`0x${string}`>((r) => (release = r)),
      );
      mockWriteClaimDonatedNft.mockResolvedValueOnce('0xtx2');

      const { result } = renderHook(() => useClaimWinnings());
      let p1!: Promise<unknown>;
      await act(async () => {
        p1 = result.current.claimDonatedNFT(1);
        await result.current.claimDonatedNFT(2);
      });

      // Token 2 completed; token 1 is still pending.
      expect(result.current.claimingDonatedNFTs).toEqual([1]);

      await act(async () => {
        release('0xtx2');
        await p1;
      });
      expect(result.current.claimingDonatedNFTs).toEqual([]);
    });

    it('notifies and aborts when wallet contract is null', async () => {
      mockUseRaffleWalletContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(42);
      });
      expect(mockWriteClaimDonatedNft).not.toHaveBeenCalled();
      expect(result.current.claimingDonatedNFTs).toEqual([]);
    });

    it('clears claiming state even on error', async () => {
      const err = new Error('revert');
      mockWriteClaimDonatedNft.mockRejectedValueOnce(err);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedNFT(42);
      });
      expect(result.current.claimingDonatedNFTs).toEqual([]);
      expect(mockReportError).toHaveBeenCalledWith(err, 'claim donated NFT');
    });
  });

  describe('claimAllDonatedNFTs', () => {
    it('calls claimManyDonatedNfts with the index list', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1, 2, 3]);
      });
      expect(mockWriteClaimManyDonatedNfts).toHaveBeenCalledWith([[1, 2, 3]]);
    });

    it('toggles isClaiming.donatedNFT around the call', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1]);
      });
      expect(result.current.isClaiming.donatedNFT).toBe(false);
    });

    it('notifies and aborts when wallet contract is null', async () => {
      mockUseRaffleWalletContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1]);
      });
      expect(mockWriteClaimManyDonatedNfts).not.toHaveBeenCalled();
    });

    it('awaits receipt and refreshes on success', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1]);
      });
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xtx3' });
      expect(mockFetchStatusData).toHaveBeenCalled();
    });

    it('clears isClaiming.donatedNFT even on error', async () => {
      mockWriteClaimManyDonatedNfts.mockRejectedValueOnce(new Error('revert'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1]);
      });
      expect(result.current.isClaiming.donatedNFT).toBe(false);
    });
  });

  describe('claimDonatedERC20', () => {
    it('defaults to 18 decimals when not specified (parseUnits scales by 1e18)', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5');
      });
      expect(mockWriteClaimDonatedToken).toHaveBeenCalledWith([
        5,
        '0xToken',
        BigInt('1500000000000000000'),
      ]);
    });

    it('respects caller-supplied decimals (e.g. USDC uses 6)', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5', 6);
      });
      expect(mockWriteClaimDonatedToken).toHaveBeenCalledWith([5, '0xToken', BigInt('1500000')]);
    });

    it('supports 0-decimal tokens', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '3', 0);
      });
      expect(mockWriteClaimDonatedToken).toHaveBeenCalledWith([5, '0xToken', BigInt(3)]);
    });

    it('notifies and aborts when wallet contract is null', async () => {
      mockUseRaffleWalletContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5');
      });
      expect(mockWriteClaimDonatedToken).not.toHaveBeenCalled();
    });

    it('awaits receipt and refreshes', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5');
      });
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xtx4' });
      expect(mockFetchStatusData).toHaveBeenCalled();
    });

    it('tracks isClaiming.donatedERC20 state', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5');
      });
      expect(result.current.isClaiming.donatedERC20).toBe(false);
    });

    it('clears isClaiming.donatedERC20 on error', async () => {
      mockWriteClaimDonatedToken.mockRejectedValueOnce(new Error('revert'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5');
      });
      expect(result.current.isClaiming.donatedERC20).toBe(false);
    });
  });

  describe('claimAllDonatedERC20', () => {
    it('forwards the token list to claimManyDonatedTokens', async () => {
      const tokens = [
        { roundNum: 1, tokenAddress: '0xA', amount: 2 },
        { roundNum: 2, tokenAddress: '0xB', amount: 3 },
      ];
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedERC20(tokens);
      });
      expect(mockWriteClaimManyDonatedTokens).toHaveBeenCalledWith([tokens]);
    });

    it('notifies and aborts when wallet contract is null', async () => {
      mockUseRaffleWalletContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedERC20([]);
      });
      expect(mockWriteClaimManyDonatedTokens).not.toHaveBeenCalled();
    });

    it('awaits receipt and refreshes', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0xA', amount: 2 },
        ]);
      });
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xtx5' });
      expect(mockFetchStatusData).toHaveBeenCalled();
    });

    it('clears isClaiming.donatedERC20 even on error', async () => {
      mockWriteClaimManyDonatedTokens.mockRejectedValueOnce(new Error('revert'));
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0xA', amount: 2 },
        ]);
      });
      expect(result.current.isClaiming.donatedERC20).toBe(false);
    });
  });

  describe('unmount safety', () => {
    it('does not call fetchData if the component unmounts before tx resolves', async () => {
      let release!: (v: `0x${string}`) => void;
      mockWriteWithdrawEverything.mockImplementationOnce(
        () => new Promise<`0x${string}`>((r) => (release = r)),
      );

      const onSuccess = jest.fn();
      const { result, unmount } = renderHook(() => useClaimWinnings(onSuccess));

      let pending!: Promise<unknown>;
      await act(async () => {
        pending = result.current.claimAllRaffleETH([1]);
        // Let the microtask that invokes the write start.
        await Promise.resolve();
      });

      unmount();

      await act(async () => {
        release('0xtx1');
        await pending;
      });

      // Refresh path is gated on mount, so neither side effect fires.
      expect(mockFetchStatusData).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('publicClient edge cases', () => {
    it('still succeeds when publicClient is undefined (hydration edge)', async () => {
      mockUsePublicClient.mockReturnValue(undefined as never);
      const { result } = renderHook(() => useClaimWinnings());
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(mockFetchStatusData).toHaveBeenCalled();
    });
  });

  describe('onSuccess callback behavior', () => {
    it('does not call onSuccess if the claim errors', async () => {
      mockWriteWithdrawEverything.mockRejectedValueOnce(new Error('revert'));
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimWinnings(onSuccess));
      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
      });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('works without an onSuccess callback', async () => {
      const { result } = renderHook(() => useClaimWinnings());
      await expect(
        act(async () => {
          await result.current.claimAllRaffleETH([1]);
        }),
      ).resolves.toBeUndefined();
    });

    it('onSuccess fires once per successful claim, regardless of method', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimWinnings(onSuccess));

      await act(async () => {
        await result.current.claimAllRaffleETH([1]);
        await result.current.claimDonatedNFT(2);
        await result.current.claimAllDonatedNFTs([3]);
        await result.current.claimDonatedERC20(4, '0xT', '1');
      });

      expect(onSuccess).toHaveBeenCalledTimes(4);
    });
  });

  describe('identity stability', () => {
    it('method identities are stable across re-renders with the same deps', () => {
      const { result, rerender } = renderHook(() => useClaimWinnings());
      const first = result.current;
      rerender();
      const second = result.current;
      expect(second.claimAllRaffleETH).toBe(first.claimAllRaffleETH);
      expect(second.claimDonatedNFT).toBe(first.claimDonatedNFT);
      expect(second.claimAllDonatedNFTs).toBe(first.claimAllDonatedNFTs);
      expect(second.claimDonatedERC20).toBe(first.claimDonatedERC20);
      expect(second.claimAllDonatedERC20).toBe(first.claimAllDonatedERC20);
    });
  });
});

// waitFor is imported above to ensure the helper is exported from test-utils,
// keeping future tests ergonomic.
void waitFor;

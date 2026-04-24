import { act, renderHook } from '@/test-utils';

// ---------------------------------------------------------------------------
// Mocks — keep every external collaborator stubbed so tests are hermetic.
// ---------------------------------------------------------------------------

const mockAccount = '0xUser';
const mockSetNotification = jest.fn();
const mockFetchStakedTokens = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('../web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../contexts/StakedTokenContext', () => ({
  useStakedToken: () => ({ fetchData: mockFetchStakedTokens }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

const mockWaitForTransactionReceipt = jest
  .fn<Promise<unknown>, unknown[]>()
  .mockResolvedValue({ status: 'success' });
const mockUsePublicClient = jest.fn(() => ({
  waitForTransactionReceipt: mockWaitForTransactionReceipt,
}));
jest.mock('wagmi', () => ({
  usePublicClient: () => mockUsePublicClient(),
}));

// Contract write methods on the NFT, CST staking wallet, and RWLK staking wallet.
const mockSetApprovalForAll = jest.fn().mockResolvedValue('0xapproveHash' as const);
const mockIsApprovedForAll = jest.fn().mockResolvedValue(false);

// CST path mocks
const mockCstStake = jest.fn().mockResolvedValue('0xstakeHash' as const);
const mockCstStakeMany = jest.fn().mockResolvedValue('0xstakeManyHash' as const);
const mockCstUnstake = jest.fn().mockResolvedValue('0xunstakeHash' as const);
const mockCstUnstakeMany = jest.fn().mockResolvedValue('0xunstakeManyHash' as const);

// RWLK path mocks (separate instances so tests can assert non-crossover).
const mockRwlkStake = jest.fn().mockResolvedValue('0xstakeHash' as const);
const mockRwlkStakeMany = jest.fn().mockResolvedValue('0xstakeManyHash' as const);
const mockRwlkUnstake = jest.fn().mockResolvedValue('0xunstakeHash' as const);
const mockRwlkUnstakeMany = jest.fn().mockResolvedValue('0xunstakeManyHash' as const);

const mockCosmicSignatureContract = {
  read: { isApprovedForAll: mockIsApprovedForAll },
  write: { setApprovalForAll: mockSetApprovalForAll },
};

const mockRwalkContract = {
  read: { isApprovedForAll: mockIsApprovedForAll },
  write: { setApprovalForAll: mockSetApprovalForAll },
};

const mockCstStakingContract = {
  write: {
    stake: mockCstStake,
    stakeMany: mockCstStakeMany,
    unstake: mockCstUnstake,
    unstakeMany: mockCstUnstakeMany,
  },
};

const mockRwlkStakingContract = {
  write: {
    stake: mockRwlkStake,
    stakeMany: mockRwlkStakeMany,
    unstake: mockRwlkUnstake,
    unstakeMany: mockRwlkUnstakeMany,
  },
};

const mockUseCosmicSignatureContract = jest.fn(() => mockCosmicSignatureContract);
const mockUseRWLKNFTContract = jest.fn(() => mockRwalkContract);
const mockUseStakingWalletCSTContract = jest.fn(() => mockCstStakingContract);
const mockUseStakingWalletRWLKContract = jest.fn(() => mockRwlkStakingContract);

jest.mock('../useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => mockUseCosmicSignatureContract(),
}));

jest.mock('../useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => mockUseRWLKNFTContract(),
}));

jest.mock('../useStakingWalletCSTContract', () => ({
  __esModule: true,
  default: () => mockUseStakingWalletCSTContract(),
}));

jest.mock('../useStakingWalletRWLKContract', () => ({
  __esModule: true,
  default: () => mockUseStakingWalletRWLKContract(),
}));

jest.mock('../../config/networks', () => ({
  STAKING_WALLET_CST_ADDRESS: '0xCstWallet',
  STAKING_WALLET_RWLK_ADDRESS: '0xRwlkWallet',
}));

const mockIsUserRejection = jest.fn((_err: unknown) => false);
const mockReportError = jest.fn((_err: unknown, _context?: string) => {});
const mockGetEthErrorMessage = jest.fn(
  (_err: unknown, fallback?: string) => fallback ?? 'An error occurred',
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

import { useStakingActions } from '../useStakingActions';

// ---------------------------------------------------------------------------
// Test scaffolding
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
  mockIsApprovedForAll.mockResolvedValue(false);
  mockSetApprovalForAll.mockResolvedValue('0xapproveHash');
  mockCstStake.mockResolvedValue('0xstakeHash');
  mockCstStakeMany.mockResolvedValue('0xstakeManyHash');
  mockCstUnstake.mockResolvedValue('0xunstakeHash');
  mockCstUnstakeMany.mockResolvedValue('0xunstakeManyHash');
  mockRwlkStake.mockResolvedValue('0xstakeHash');
  mockRwlkStakeMany.mockResolvedValue('0xstakeManyHash');
  mockRwlkUnstake.mockResolvedValue('0xunstakeHash');
  mockRwlkUnstakeMany.mockResolvedValue('0xunstakeManyHash');
  mockIsUserRejection.mockReturnValue(false);
  mockGetEthErrorMessage.mockImplementation((_err, fallback) => fallback ?? 'An error occurred');
  mockGetErrorMessage.mockImplementation((msg: string) => msg);
  mockUseCosmicSignatureContract.mockReturnValue(mockCosmicSignatureContract);
  mockUseRWLKNFTContract.mockReturnValue(mockRwalkContract);
  mockUseStakingWalletCSTContract.mockReturnValue(mockCstStakingContract);
  mockUseStakingWalletRWLKContract.mockReturnValue(mockRwlkStakingContract);
});

afterEach(() => {
  jest.useRealTimers();
});

// Helper that advances the internal setTimeout(..., 2000) inside the hook so
// the deferred notification + invalidation fires.
async function flushDeferredStakingEffects() {
  await act(async () => {
    jest.advanceTimersByTime(2100);
    // Let the microtask queue flush so setState side-effects land.
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useStakingActions', () => {
  describe('return shape', () => {
    it('exposes stake, unstake, handleError, rwalkContract', () => {
      const { result } = renderHook(() => useStakingActions());
      expect(typeof result.current.stake).toBe('function');
      expect(typeof result.current.unstake).toBe('function');
      expect(typeof result.current.handleError).toBe('function');
      expect(result.current.rwalkContract).toBe(mockRwalkContract);
    });
  });

  describe('stake (CST single token)', () => {
    it('approves if not approved, then calls stake, then invalidates queries', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });

      expect(mockIsApprovedForAll).toHaveBeenCalledWith(['0xUser', '0xCstWallet']);
      expect(mockSetApprovalForAll).toHaveBeenCalledWith(['0xCstWallet', true]);
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xapproveHash' });
      expect(mockCstStake).toHaveBeenCalledWith([42]);
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xstakeHash' });

      await flushDeferredStakingEffects();
      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(mockFetchStakedTokens).toHaveBeenCalled();
    });

    it('skips approval when already approved', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });

      expect(mockSetApprovalForAll).not.toHaveBeenCalled();
      expect(mockCstStake).toHaveBeenCalledWith([42]);
    });

    it('routes to the CST contracts when isRwalk=false', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });

      // The CST staking wallet contract receives the stake call.
      expect(mockCstStakingContract.write.stake).toHaveBeenCalledWith([42]);
    });

    it('shows success notification after the 2s deferred indexer delay', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });
      expect(mockSetNotification).not.toHaveBeenCalled();

      await flushDeferredStakingEffects();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text: expect.stringContaining('staked token 42'),
        }),
      );
    });

    it('notifies and aborts when NFT contract is null', async () => {
      mockUseCosmicSignatureContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });
      expect(mockCstStake).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text: expect.stringContaining('connect your wallet'),
        }),
      );
    });

    it('notifies and aborts when staking wallet contract is null', async () => {
      mockUseStakingWalletCSTContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });
      expect(mockCstStake).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('shows the cancelled notification on user rejection (approval phase)', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      mockSetApprovalForAll.mockRejectedValueOnce(new Error('user rejected'));
      mockIsUserRejection.mockReturnValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });

      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Transaction cancelled by user', type: 'info' }),
      );
      expect(mockCstStake).not.toHaveBeenCalled();
    });

    it('reports non-rejection approval errors', async () => {
      const err = new Error('gas estimation failed');
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      mockSetApprovalForAll.mockRejectedValueOnce(err);
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('gas estimation failed');
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, false);
      });
      expect(mockReportError).toHaveBeenCalledWith(err, 'staking error');
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  describe('stake (CST batch)', () => {
    it('calls stakeMany when given an array of ids', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake([1, 2, 3], false);
      });

      expect(mockCstStakeMany).toHaveBeenCalledWith([[1, 2, 3]]);
      expect(mockCstStake).not.toHaveBeenCalled();
    });

    it('uses plural success message for batch', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake([1, 2, 3], false);
      });
      await flushDeferredStakingEffects();

      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('selected tokens were staked'),
        }),
      );
    });
  });

  describe('stake (RWLK)', () => {
    it('routes to RWLK contracts and uses RWLK wallet address when isRwalk=true', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());

      await act(async () => {
        await result.current.stake(42, true);
      });

      // CST path must NOT be touched.
      expect(mockCstStakingContract.write.stake).not.toHaveBeenCalled();
      // RWLK path used the RWLK wallet address for approval and the RWLK
      // staking wallet for the stake call.
      expect(mockIsApprovedForAll).toHaveBeenCalledWith(['0xUser', '0xRwlkWallet']);
      expect(mockRwlkStakingContract.write.stake).toHaveBeenCalledWith([42]);
    });
  });

  describe('unstake (CST single action)', () => {
    it('calls unstake with the action id', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake(7, false);
      });
      expect(mockCstUnstake).toHaveBeenCalledWith([7]);
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xunstakeHash' });
    });

    it('notifies and aborts when staking wallet contract is null', async () => {
      mockUseStakingWalletCSTContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake(7, false);
      });
      expect(mockCstUnstake).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('emits success notification after the deferred delay', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake(7, false);
      });
      expect(mockSetNotification).not.toHaveBeenCalled();
      await flushDeferredStakingEffects();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });

    it('handles user rejection cleanly without reporting an error', async () => {
      mockCstUnstake.mockRejectedValueOnce(new Error('user rejected'));
      mockIsUserRejection.mockReturnValueOnce(true);
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake(7, false);
      });
      expect(mockReportError).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info', text: 'Transaction cancelled by user' }),
      );
    });
  });

  describe('unstake (batch)', () => {
    it('calls unstakeMany for batch action ids', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake([10, 11], false);
      });
      expect(mockCstUnstakeMany).toHaveBeenCalledWith([[10, 11]]);
      expect(mockCstUnstake).not.toHaveBeenCalled();
    });

    it('uses plural success message for batch unstake', async () => {
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.unstake([10, 11], false);
      });
      await flushDeferredStakingEffects();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('selected tokens were unstaked'),
        }),
      );
    });
  });

  describe('invalidateStakingQueries', () => {
    it('invalidates each expected query key after a successful stake', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(42, false);
      });
      await flushDeferredStakingEffects();

      const expectedKeys = [
        'dashboardInfo',
        'stakingCSTActionsByUser',
        'cstTokensByUser',
        'stakingRewardsByUser',
        'stakingRWLKActionsByUser',
        'stakingRWLKMintsByUser',
      ];
      for (const key of expectedKeys) {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [key] });
      }
    });
  });

  describe('handleError (exposed for callers)', () => {
    it('shows info notification on user rejection', () => {
      const { result } = renderHook(() => useStakingActions());
      mockIsUserRejection.mockReturnValueOnce(true);
      result.current.handleError(new Error('rejected'));
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info', text: 'Transaction cancelled by user' }),
      );
      expect(mockReportError).not.toHaveBeenCalled();
    });

    it('reports and notifies on a real error', () => {
      const err = new Error('revert: bad state');
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('revert: bad state');
      const { result } = renderHook(() => useStakingActions());
      result.current.handleError(err);
      expect(mockReportError).toHaveBeenCalledWith(err, 'staking error');
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('stays silent when getEthErrorMessage returns the generic fallback', () => {
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('An error occurred');
      const { result } = renderHook(() => useStakingActions());
      result.current.handleError(new Error('unknown'));
      // The hook treats 'An error occurred' as a "no actionable message" signal
      // and skips the user-facing notification (it still reports to Sentry).
      expect(mockReportError).toHaveBeenCalled();
      const errorCalls = mockSetNotification.mock.calls.filter(([arg]) => arg?.type === 'error');
      expect(errorCalls).toHaveLength(0);
    });
  });

  describe('transaction receipt waiting', () => {
    it('does not emit a success notification if the tx hash is undefined', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      mockCstStake.mockResolvedValueOnce(undefined as never);
      const { result } = renderHook(() => useStakingActions());
      await act(async () => {
        await result.current.stake(42, false);
      });
      await flushDeferredStakingEffects();
      // No receipt => no user-facing "staked successfully" notification,
      // but queries still get invalidated so the UI re-queries state.
      const successCalls = mockSetNotification.mock.calls.filter(
        ([arg]) => arg?.type === 'success',
      );
      expect(successCalls).toHaveLength(0);
    });
  });
});

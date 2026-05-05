import { act, renderHook } from '@/test-utils';

// ---------------------------------------------------------------------------
// Mocks — keep every external collaborator stubbed so tests are hermetic.
// ---------------------------------------------------------------------------

const mockAccount = '0xUser';
const mockSetNotification = jest.fn();
const mockFetchAnchoredTokens = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('../web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

jest.mock('../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ fetchData: mockFetchAnchoredTokens }),
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
jest.mock('@wagmi/core', () => ({
  getConnectorClient: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => mockUsePublicClient(),
  useWalletClient: () => ({ data: {} }),
  useConnectorClient: () => ({ data: undefined }),
  useConfig: () => ({}),
}));

// Contract write methods on the NFT, CST anchoring wallet, and RWLK anchoring wallet.
const mockSetApprovalForAll = jest.fn().mockResolvedValue('0xapproveHash' as const);
const mockIsApprovedForAll = jest.fn().mockResolvedValue(false);

// CST path mocks
const mockCstAnchor = jest.fn().mockResolvedValue('0xstakeHash' as const);
const mockCstAnchorMany = jest.fn().mockResolvedValue('0xstakeManyHash' as const);
const mockCstRelease = jest.fn().mockResolvedValue('0xunstakeHash' as const);
const mockCstReleaseMany = jest.fn().mockResolvedValue('0xunstakeManyHash' as const);

// RWLK path mocks (separate instances so tests can assert non-crossover).
const mockRwlkAnchor = jest.fn().mockResolvedValue('0xstakeHash' as const);
const mockRwlkAnchorMany = jest.fn().mockResolvedValue('0xstakeManyHash' as const);
const mockRwlkRelease = jest.fn().mockResolvedValue('0xunstakeHash' as const);
const mockRwlkReleaseMany = jest.fn().mockResolvedValue('0xunstakeManyHash' as const);

const mockCosmicSignatureContract = {
  read: { isApprovedForAll: mockIsApprovedForAll },
  write: { setApprovalForAll: mockSetApprovalForAll },
};

const mockRwalkContract = {
  read: { isApprovedForAll: mockIsApprovedForAll },
  write: { setApprovalForAll: mockSetApprovalForAll },
};

const mockCstAnchoringContract = {
  write: {
    stake: mockCstAnchor,
    stakeMany: mockCstAnchorMany,
    unstake: mockCstRelease,
    unstakeMany: mockCstReleaseMany,
  },
};

const mockRwlkAnchoringContract = {
  write: {
    stake: mockRwlkAnchor,
    stakeMany: mockRwlkAnchorMany,
    unstake: mockRwlkRelease,
    unstakeMany: mockRwlkReleaseMany,
  },
};

const mockUseCosmicSignatureContract = jest.fn(() => mockCosmicSignatureContract);
const mockUseRWLKNFTContract = jest.fn(() => mockRwalkContract);
const mockUseAnchoringWalletCSTContract = jest.fn(() => mockCstAnchoringContract);
const mockUseAnchoringWalletRWLKContract = jest.fn(() => mockRwlkAnchoringContract);

jest.mock('../useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => mockUseCosmicSignatureContract(),
}));

jest.mock('../useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => mockUseRWLKNFTContract(),
}));

jest.mock('../useAnchoringWalletCSTContract', () => ({
  __esModule: true,
  default: () => mockUseAnchoringWalletCSTContract(),
}));

jest.mock('../useAnchoringWalletRWLKContract', () => ({
  __esModule: true,
  default: () => mockUseAnchoringWalletRWLKContract(),
}));

jest.mock('../../config/networks', () => {
  const actual = jest.requireActual('../../config/networks') as Record<string, unknown>;
  return {
    ...actual,
    ANCHORING_WALLET_CST_ADDRESS: '0xCstWallet',
    ANCHORING_WALLET_RWLK_ADDRESS: '0xRwlkWallet',
  };
});

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

import { useAnchorActions } from '../useAnchorActions';

// ---------------------------------------------------------------------------
// Test scaffolding
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
  mockIsApprovedForAll.mockResolvedValue(false);
  mockSetApprovalForAll.mockResolvedValue('0xapproveHash');
  mockCstAnchor.mockResolvedValue('0xstakeHash');
  mockCstAnchorMany.mockResolvedValue('0xstakeManyHash');
  mockCstRelease.mockResolvedValue('0xunstakeHash');
  mockCstReleaseMany.mockResolvedValue('0xunstakeManyHash');
  mockRwlkAnchor.mockResolvedValue('0xstakeHash');
  mockRwlkAnchorMany.mockResolvedValue('0xstakeManyHash');
  mockRwlkRelease.mockResolvedValue('0xunstakeHash');
  mockRwlkReleaseMany.mockResolvedValue('0xunstakeManyHash');
  mockIsUserRejection.mockReturnValue(false);
  mockGetEthErrorMessage.mockImplementation((_err, fallback) => fallback ?? 'An error occurred');
  mockGetErrorMessage.mockImplementation((msg: string) => msg);
  mockUseCosmicSignatureContract.mockReturnValue(mockCosmicSignatureContract);
  mockUseRWLKNFTContract.mockReturnValue(mockRwalkContract);
  mockUseAnchoringWalletCSTContract.mockReturnValue(mockCstAnchoringContract);
  mockUseAnchoringWalletRWLKContract.mockReturnValue(mockRwlkAnchoringContract);
});

afterEach(() => {
  jest.useRealTimers();
});

// Helper that advances the internal setTimeout(..., 2000) inside the hook so
// the deferred notification + invalidation fires.
async function flushDeferredAnchoringEffects() {
  await act(async () => {
    jest.advanceTimersByTime(2100);
    // Let the microtask queue flush so setState side-effects land.
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAnchorActions', () => {
  describe('return shape', () => {
    it('exposes anchor, release, handleError, rwalkContract', () => {
      const { result } = renderHook(() => useAnchorActions());
      expect(typeof result.current.anchor).toBe('function');
      expect(typeof result.current.release).toBe('function');
      expect(typeof result.current.handleError).toBe('function');
      expect(result.current.rwalkContract).toBe(mockRwalkContract);
    });
  });

  describe('anchor (CST single token)', () => {
    it('approves if not approved, then calls anchor, then invalidates queries', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      expect(mockIsApprovedForAll).toHaveBeenCalledWith(['0xUser', '0xCstWallet']);
      expect(mockSetApprovalForAll).toHaveBeenCalledWith(['0xCstWallet', true]);
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xapproveHash' });
      expect(mockCstAnchor).toHaveBeenCalledWith([42]);
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xstakeHash' });

      await flushDeferredAnchoringEffects();
      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(mockFetchAnchoredTokens).toHaveBeenCalled();
    });

    it('skips approval when already approved', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      expect(mockSetApprovalForAll).not.toHaveBeenCalled();
      expect(mockCstAnchor).toHaveBeenCalledWith([42]);
    });

    it('routes to the CST contracts when isRwalk=false', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      // The CST anchoring wallet contract receives the anchor call.
      expect(mockCstAnchoringContract.write.stake).toHaveBeenCalledWith([42]);
    });

    it('shows success notification after the 2s deferred indexer delay', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });
      expect(mockSetNotification).not.toHaveBeenCalled();

      await flushDeferredAnchoringEffects();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text: expect.stringContaining('anchored token 42'),
        }),
      );
    });

    it('notifies and aborts when NFT contract is null', async () => {
      mockUseCosmicSignatureContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });
      expect(mockCstAnchor).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text: expect.stringContaining('connect your wallet'),
        }),
      );
    });

    it('notifies and aborts when anchoring wallet contract is null', async () => {
      mockUseAnchoringWalletCSTContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });
      expect(mockCstAnchor).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('shows the cancelled notification on user rejection (approval phase)', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      mockSetApprovalForAll.mockRejectedValueOnce(new Error('user rejected'));
      mockIsUserRejection.mockReturnValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Transaction cancelled by user', type: 'info' }),
      );
      expect(mockCstAnchor).not.toHaveBeenCalled();
    });

    it('reports non-rejection approval errors', async () => {
      const err = new Error('gas estimation failed');
      mockIsApprovedForAll.mockResolvedValueOnce(false);
      mockSetApprovalForAll.mockRejectedValueOnce(err);
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('gas estimation failed');
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });
      expect(mockReportError).toHaveBeenCalledWith(err, 'anchor action error');
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  describe('anchor (CST batch)', () => {
    it('calls stakeMany when given an array of ids', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor([1, 2, 3], false);
      });

      expect(mockCstAnchorMany).toHaveBeenCalledWith([[1, 2, 3]]);
      expect(mockCstAnchor).not.toHaveBeenCalled();
    });

    it('uses plural success message for batch', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor([1, 2, 3], false);
      });
      await flushDeferredAnchoringEffects();

      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('selected tokens were anchored'),
        }),
      );
    });
  });

  describe('anchor (RWLK)', () => {
    it('routes to RWLK contracts and uses RWLK wallet address when isRwalk=true', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, true);
      });

      // CST path must NOT be touched.
      expect(mockCstAnchoringContract.write.stake).not.toHaveBeenCalled();
      // RWLK path used the RWLK wallet address for approval and the RWLK
      // anchoring wallet for the anchor call.
      expect(mockIsApprovedForAll).toHaveBeenCalledWith(['0xUser', '0xRwlkWallet']);
      expect(mockRwlkAnchoringContract.write.stake).toHaveBeenCalledWith([42]);
    });
  });

  describe('release (CST single action)', () => {
    it('calls release with the action id', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(7, false);
      });
      expect(mockCstRelease).toHaveBeenCalledWith([7]);
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xunstakeHash' });
    });

    it('notifies and aborts when anchoring wallet contract is null', async () => {
      mockUseAnchoringWalletCSTContract.mockReturnValue(null as never);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(7, false);
      });
      expect(mockCstRelease).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('emits success notification after the deferred delay', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(7, false);
      });
      expect(mockSetNotification).not.toHaveBeenCalled();
      await flushDeferredAnchoringEffects();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });

    it('handles user rejection cleanly without reporting an error', async () => {
      mockCstRelease.mockRejectedValueOnce(new Error('user rejected'));
      mockIsUserRejection.mockReturnValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(7, false);
      });
      expect(mockReportError).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info', text: 'Transaction cancelled by user' }),
      );
    });
  });

  describe('release (batch)', () => {
    it('calls unstakeMany for batch action ids', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release([10, 11], false);
      });
      expect(mockCstReleaseMany).toHaveBeenCalledWith([[10, 11]]);
      expect(mockCstRelease).not.toHaveBeenCalled();
    });

    it('uses plural success message for batch release', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release([10, 11], false);
      });
      await flushDeferredAnchoringEffects();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('selected tokens were unanchored'),
        }),
      );
    });
  });

  describe('invalidateAnchoringQueries', () => {
    it('invalidates each expected query key after a successful anchor', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(42, false);
      });
      await flushDeferredAnchoringEffects();

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
      const { result } = renderHook(() => useAnchorActions());
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
      const { result } = renderHook(() => useAnchorActions());
      result.current.handleError(err);
      expect(mockReportError).toHaveBeenCalledWith(err, 'anchor action error');
      expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('stays silent when getEthErrorMessage returns the generic fallback', () => {
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('An error occurred');
      const { result } = renderHook(() => useAnchorActions());
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
      mockCstAnchor.mockResolvedValueOnce(undefined as never);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(42, false);
      });
      await flushDeferredAnchoringEffects();
      // No receipt => no user-facing "anchored successfully" notification,
      // but queries still get invalidated so the UI re-queries state.
      const successCalls = mockSetNotification.mock.calls.filter(
        ([arg]) => arg?.type === 'success',
      );
      expect(successCalls).toHaveLength(0);
    });
  });
});

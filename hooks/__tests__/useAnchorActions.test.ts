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

const mockSwitchChainAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('wagmi', () => ({
  usePublicClient: () => mockUsePublicClient(),
  useWalletClient: () => ({ data: {} }),
  useConnectorClient: () => ({ data: undefined }),
  useConfig: () => ({}),
  useAccount: () => ({ address: mockAccount, isConnected: true, chainId: 421614 }),
  useSwitchChain: () => ({ switchChainAsync: mockSwitchChainAsync }),
}));

// The chain guard reads the wallet client's real chain before every write;
// default it to the app chain so existing cases exercise the happy path.
const mockGetChainId = jest.fn<Promise<number>, [unknown]>();
jest.mock('viem/actions', () => ({
  getChainId: (...args: unknown[]) => mockGetChainId(args[0]),
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

jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({
    randomWalkNft: '0x0',
    cosmicGame: '0x0',
    cosmicSignature: '0x0',
    cosmicToken: '0x0',
    cosmicDao: '0x0',
    charity: '0x0',
    prizesWallet: '0x0',
    stakingCst: '0xCstWallet',
    stakingRwalk: '0xRwlkWallet',
    marketing: '0x0',
    implementation: '0x0',
  }),
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
  mockGetChainId.mockResolvedValue(421614);
  mockSwitchChainAsync.mockResolvedValue(undefined);
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
          text: 'toasts.anchor.anchored(count=1)',
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
          text: 'toasts.wallet.connectCorrectNetwork',
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
        expect.objectContaining({ text: 'toasts.walletTransactionCancelled', type: 'info' }),
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
          text: 'toasts.anchor.anchored(count=3)',
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
      mockCstRelease.mockRejectedValueOnce({ code: 4001, message: 'user rejected' });
      mockIsUserRejection.mockReturnValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(7, false);
      });
      expect(mockReportError).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info', text: 'toasts.walletTransactionCancelled' }),
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
          text: 'toasts.anchor.released(count=2)',
        }),
      );
    });
  });

  describe('chain guard', () => {
    it('blocks the anchor write when the wallet will not move to the app chain', async () => {
      mockGetChainId.mockResolvedValueOnce(1);
      mockSwitchChainAsync.mockRejectedValueOnce(new Error('switch refused'));
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      expect(mockCstAnchor).not.toHaveBeenCalled();
      expect(mockSetApprovalForAll).not.toHaveBeenCalled();
    });

    it('blocks the release write on the same mismatch', async () => {
      mockGetChainId.mockResolvedValueOnce(1);
      mockSwitchChainAsync.mockRejectedValueOnce(new Error('switch refused'));
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.release(7, false);
      });

      expect(mockCstRelease).not.toHaveBeenCalled();
    });

    it('proceeds once the wallet accepts the switch', async () => {
      mockGetChainId.mockResolvedValueOnce(1);
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 421614 });
      expect(mockCstAnchor).toHaveBeenCalledWith([42]);
    });
  });

  describe('deferred refresh cleanup', () => {
    it('cancels the pending anchor refresh when the caller unmounts first', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result, unmount } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      unmount();
      await flushDeferredAnchoringEffects();

      expect(mockInvalidateQueries).not.toHaveBeenCalled();
      expect(mockFetchAnchoredTokens).not.toHaveBeenCalled();
      expect(mockSetNotification).not.toHaveBeenCalled();
    });

    it('cancels the pending release refresh when the caller unmounts first', async () => {
      const { result, unmount } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.release(7, false);
      });

      unmount();
      await flushDeferredAnchoringEffects();

      expect(mockInvalidateQueries).not.toHaveBeenCalled();
      expect(mockSetNotification).not.toHaveBeenCalled();
    });

    it('still fires the refresh when the caller stays mounted', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });
      await flushDeferredAnchoringEffects();

      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
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
        expect.objectContaining({ type: 'info', text: 'toasts.walletTransactionCancelled' }),
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

    it('shows the localized generic fallback when no provider message exists', () => {
      mockIsUserRejection.mockReturnValueOnce(false);
      mockGetEthErrorMessage.mockReturnValueOnce('toasts.anchor.failed');
      const { result } = renderHook(() => useAnchorActions());
      result.current.handleError(new Error('unknown'));
      expect(mockReportError).toHaveBeenCalled();
      expect(mockGetEthErrorMessage).toHaveBeenCalledWith(
        expect.any(Error),
        'toasts.anchor.failed',
        { locale: 'en' },
      );
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text: 'toasts.anchor.failed' }),
      );
    });
  });

  describe('transaction receipt waiting', () => {
    it('reports a reverted receipt and shows the localized anchor fallback', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      mockWaitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted' });
      const { result } = renderHook(() => useAnchorActions());

      await act(async () => {
        await result.current.anchor(42, false);
      });

      expect(mockReportError).toHaveBeenCalledWith(expect.any(Error), 'anchor action error');
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.anchor.failed',
        type: 'error',
        visible: true,
      });
    });

    it('shows the localized failure if the tx hash is undefined', async () => {
      mockIsApprovedForAll.mockResolvedValueOnce(true);
      mockCstAnchor.mockResolvedValueOnce(undefined as never);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(42, false);
      });
      await flushDeferredAnchoringEffects();
      const successCalls = mockSetNotification.mock.calls.filter(
        ([arg]) => arg?.type === 'success',
      );
      expect(successCalls).toHaveLength(0);
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.anchor.failed',
        type: 'error',
        visible: true,
      });
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});

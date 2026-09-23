import { act, renderHook } from '@testing-library/react';

import { createFakeTxFlow } from '@/test-utils/txFlow';

const USER = '0xUser' as const;
const STAKING_CST = '0xStakingCst';
const STAKING_RWALK = '0xStakingRwalk';

const mockTx = createFakeTxFlow(USER);
const mockTranslate = (key: string) => `toasts.${key}`;
const mockNotify = jest.fn();
const mockNotifyErrorFromEthers = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockFetchStakedTokens = jest.fn();

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => mockTranslate,
}));
jest.mock('../useTxFlow', () => ({ useTxFlow: () => mockTx.flow }));
jest.mock('../useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: mockNotifyErrorFromEthers }),
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));
jest.mock('../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ fetchData: mockFetchStakedTokens }),
}));
jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ stakingCst: STAKING_CST, stakingRwalk: STAKING_RWALK }),
}));
jest.mock('../web3', () => ({
  useActiveWeb3React: () => ({ account: USER, chainId: 421614, active: true }),
}));

function nftContract() {
  return {
    read: { isApprovedForAll: jest.fn().mockResolvedValue(false) },
    write: { setApprovalForAll: jest.fn().mockResolvedValue('0xapprove') },
  };
}
function anchoringContract() {
  return {
    write: {
      stake: jest.fn().mockResolvedValue('0xstake'),
      stakeMany: jest.fn().mockResolvedValue('0xstakemany'),
      unstake: jest.fn().mockResolvedValue('0xunstake'),
      unstakeMany: jest.fn().mockResolvedValue('0xunstakemany'),
    },
  };
}

let mockCsNft = nftContract();
let mockRwalkNft = nftContract();
let mockCstAnchoring: ReturnType<typeof anchoringContract> | null = anchoringContract();
let mockRwlkAnchoring: ReturnType<typeof anchoringContract> | null = anchoringContract();

jest.mock('../useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => mockCsNft,
}));
jest.mock('../useRWLKNFTContract', () => ({ __esModule: true, default: () => mockRwalkNft }));
jest.mock('../useAnchoringWalletCSTContract', () => ({
  __esModule: true,
  default: () => mockCstAnchoring,
}));
jest.mock('../useAnchoringWalletRWLKContract', () => ({
  __esModule: true,
  default: () => mockRwlkAnchoring,
}));

import { useAnchorActions } from '../useAnchorActions';

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockTx.reset();
  mockCsNft = nftContract();
  mockRwalkNft = nftContract();
  mockCstAnchoring = anchoringContract();
  mockRwlkAnchoring = anchoringContract();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useAnchorActions', () => {
  it('exposes the actions, the RWLK contract and the shared stage', () => {
    const { result } = renderHook(() => useAnchorActions());
    expect(typeof result.current.anchor).toBe('function');
    expect(typeof result.current.release).toBe('function');
    expect(typeof result.current.handleError).toBe('function');
    expect(result.current.rwalkContract).toBe(mockRwalkNft);
    expect(result.current.txStage).toEqual({ status: 'idle' });
  });

  describe('anchor', () => {
    it('asks for the anchoring approval as step 1 when the collection has none', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(7, false);
      });

      expect(mockCsNft.read.isApprovedForAll).toHaveBeenCalledWith([USER, STAKING_CST]);
      expect(mockCsNft.write.setApprovalForAll).toHaveBeenCalledWith([STAKING_CST, true]);
      expect(mockTx.sentApprovals()).toEqual(['toasts.anchor.approval']);
      expect(mockCstAnchoring!.write.stake).toHaveBeenCalledWith([7]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.anchor.anchored');
    });

    it('skips the approval when the anchoring contract is already approved', async () => {
      mockCsNft.read.isApprovedForAll.mockResolvedValue(true);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(7, false);
      });

      expect(mockCsNft.write.setApprovalForAll).not.toHaveBeenCalled();
      expect(mockTx.sentApprovals()).toEqual([]);
      expect(mockCstAnchoring!.write.stake).toHaveBeenCalledWith([7]);
    });

    it('anchors a batch with stakeMany', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor([1, 2, 3], false);
      });
      expect(mockCstAnchoring!.write.stakeMany).toHaveBeenCalledWith([[1, 2, 3]]);
    });

    it('routes RandomWalk NFTs to the RandomWalk contracts', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(9, true);
      });
      expect(mockRwalkNft.read.isApprovedForAll).toHaveBeenCalledWith([USER, STAKING_RWALK]);
      expect(mockRwlkAnchoring!.write.stake).toHaveBeenCalledWith([9]);
      expect(mockCstAnchoring!.write.stake).not.toHaveBeenCalled();
    });

    it('names the network when the anchoring contract is not available', async () => {
      mockCstAnchoring = null;
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(7, false);
      });
      expect(mockTx.runs).toHaveLength(0);
      expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.anchor.walletNotReady');
    });

    it('fails with the anchoring fallback when the write returns no hash', async () => {
      mockCstAnchoring!.write.stake.mockResolvedValueOnce(undefined);
      mockCsNft.read.isApprovedForAll.mockResolvedValue(true);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(7, false);
      });
      expect(mockTx.lastFailureMessage()).toBe('toasts.anchor.failed');
    });
  });

  describe('release', () => {
    it('releases one anchor or many', async () => {
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(3, false);
        await result.current.release([4, 5], true);
      });
      expect(mockCstAnchoring!.write.unstake).toHaveBeenCalledWith([3]);
      expect(mockRwlkAnchoring!.write.unstakeMany).toHaveBeenCalledWith([[4, 5]]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.anchor.released');
    });

    it('names the network when the anchoring contract is not available', async () => {
      mockRwlkAnchoring = null;
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(3, true);
      });
      expect(mockTx.runs).toHaveLength(0);
      expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.anchor.walletNotReady');
    });
  });

  describe('refresh after the indexer settles', () => {
    it('invalidates the anchoring queries two seconds after confirmation', async () => {
      mockCsNft.read.isApprovedForAll.mockResolvedValue(true);
      const { result } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.anchor(7, false);
      });
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboardInfo'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['stakingCSTActionsByUser'] });
      expect(mockFetchStakedTokens).toHaveBeenCalledTimes(1);
    });

    it('cancels the pending refresh when the caller unmounts first', async () => {
      const { result, unmount } = renderHook(() => useAnchorActions());
      await act(async () => {
        await result.current.release(3, false);
      });
      unmount();
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });

  it('reports read failures with the anchoring fallback', () => {
    const { result } = renderHook(() => useAnchorActions());
    const err = new Error('rpc down');
    result.current.handleError(err);
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(err, 'toasts.anchor.failed');
  });
});

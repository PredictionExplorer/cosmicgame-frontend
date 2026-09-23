import { createFakeTxFlow } from '@/test-utils/txFlow';

import { act, renderHook } from '@/test-utils';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockNotify = jest.fn();
const mockFetchStatusData = jest.fn();
const mockTx = createFakeTxFlow();
// A stable translator (like next-intl's) so callback identities can be checked.
const mockTranslate = (key: string) => `toasts.${key}`;

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => mockTranslate,
}));

jest.mock('../useTxFlow', () => ({ useTxFlow: () => mockTx.flow }));

jest.mock('../useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: jest.fn() }),
}));

jest.mock('../../contexts/ApiDataContext', () => ({
  useApiData: () => ({ fetchData: mockFetchStatusData }),
}));

const mockWriteWithdrawEverything = jest.fn();
const mockWriteClaimDonatedNft = jest.fn();
const mockWriteClaimManyDonatedNfts = jest.fn();
const mockWriteClaimDonatedToken = jest.fn();
const mockWriteClaimManyDonatedTokens = jest.fn();

const walletContract = {
  write: {
    withdrawEverything: mockWriteWithdrawEverything,
    claimDonatedNft: mockWriteClaimDonatedNft,
    claimManyDonatedNfts: mockWriteClaimManyDonatedNfts,
    claimDonatedToken: mockWriteClaimDonatedToken,
    claimManyDonatedTokens: mockWriteClaimManyDonatedTokens,
  },
};
const mockUseStellarSelectionWalletContract = jest.fn(() => walletContract as unknown);

jest.mock('../useStellarSelectionWalletContract', () => ({
  __esModule: true,
  default: () => mockUseStellarSelectionWalletContract(),
}));

import { useClaimAllocations } from '../useClaimAllocations';

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.reset();
  mockUseStellarSelectionWalletContract.mockReturnValue(walletContract);
  mockWriteWithdrawEverything.mockResolvedValue('0xtx1');
  mockWriteClaimDonatedNft.mockResolvedValue('0xtx2');
  mockWriteClaimManyDonatedNfts.mockResolvedValue('0xtx3');
  mockWriteClaimDonatedToken.mockResolvedValue('0xtx4');
  mockWriteClaimManyDonatedTokens.mockResolvedValue('0xtx5');
});

describe('useClaimAllocations', () => {
  it('starts idle, with every flag false and the shared stage exposed', () => {
    const { result } = renderHook(() => useClaimAllocations());
    expect(result.current.isClaiming).toEqual({
      raffleETH: false,
      donatedNFT: false,
      donatedERC20: false,
    });
    expect(result.current.claimingDonatedNFTs).toEqual([]);
    expect(result.current.txStage).toEqual({ status: 'idle' });
  });

  describe('retrieveAllStellarSelectionETH', () => {
    it('writes withdrawEverything through the transaction flow', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimAllocations(onSuccess));
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([5, 6, 7]);
      });

      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([[5, 6, 7], [], []]);
      expect(mockTx.runs).toHaveLength(1);
      expect(mockTx.runs[0]!.failureMessage).toBe('toasts.claim.failed');
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.stellarEthSuccess');
      expect(mockFetchStatusData).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });

    it('holds the flag while the transaction runs', async () => {
      let release!: (hash: string) => void;
      mockWriteWithdrawEverything.mockImplementationOnce(
        () => new Promise<string>((resolve) => (release = resolve)),
      );
      const { result } = renderHook(() => useClaimAllocations());

      let pending!: Promise<void>;
      await act(async () => {
        pending = result.current.retrieveAllStellarSelectionETH([1]);
        await Promise.resolve();
      });
      expect(result.current.isClaiming.raffleETH).toBe(true);

      await act(async () => {
        release('0xtx1');
        await pending;
      });
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });

    it('tells the person when the contract is not available yet', async () => {
      mockUseStellarSelectionWalletContract.mockReturnValue(null);
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([1]);
      });

      expect(mockTx.runs).toHaveLength(0);
      expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.claim.walletNotConnected');
    });

    it('treats a missing transaction hash as a failure, never a success', async () => {
      mockWriteWithdrawEverything.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([1]);
      });

      expect(mockTx.lastSuccessMessage()).toBeUndefined();
      expect(mockTx.lastFailureMessage()).toBe('toasts.claim.failed');
      expect(mockFetchStatusData).not.toHaveBeenCalled();
    });

    it('does not refresh when the wallet prompt is dismissed', async () => {
      mockWriteWithdrawEverything.mockRejectedValueOnce({ code: 4001, message: 'User rejected' });
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimAllocations(onSuccess));
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([1]);
      });

      expect(mockFetchStatusData).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });
  });

  describe('attached NFTs', () => {
    it('retrieves one NFT and tracks its id while pending', async () => {
      let release!: (hash: string) => void;
      mockWriteClaimDonatedNft.mockImplementationOnce(
        () => new Promise<string>((resolve) => (release = resolve)),
      );
      const { result } = renderHook(() => useClaimAllocations());

      let pending!: Promise<void>;
      await act(async () => {
        pending = result.current.claimDonatedNFT(42);
        await Promise.resolve();
      });
      expect(result.current.claimingDonatedNFTs).toEqual([42]);

      await act(async () => {
        release('0xtx2');
        await pending;
      });
      expect(mockWriteClaimDonatedNft).toHaveBeenCalledWith([42]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.nftSuccess');
      expect(result.current.claimingDonatedNFTs).toEqual([]);
    });

    it('clears the pending id even when the write fails', async () => {
      mockWriteClaimDonatedNft.mockRejectedValueOnce(new Error('execution reverted'));
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimDonatedNFT(7);
      });
      expect(result.current.claimingDonatedNFTs).toEqual([]);
      expect(mockTx.lastFailureMessage()).toBe('toasts.claim.failed');
    });

    it('retrieves many NFTs with a counted success message', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([1, 2, 3]);
      });
      expect(mockWriteClaimManyDonatedNfts).toHaveBeenCalledWith([[1, 2, 3]]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.nftsSuccess');
      expect(result.current.isClaiming.donatedNFT).toBe(false);
    });
  });

  describe('attached ERC-20 tokens', () => {
    it('forwards raw base-unit amounts as bigint without scaling', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1500000000000000000');
      });
      expect(mockWriteClaimDonatedToken).toHaveBeenCalledWith([5, '0xToken', 1500000000000000000n]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.tokenSuccess');
    });

    it('fails inside the flow, before any write, for display-denominated amounts', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', '1.5');
      });
      expect(mockWriteClaimDonatedToken).not.toHaveBeenCalled();
      expect(mockTx.lastFailureMessage()).toBe('toasts.claim.failed');
      expect(result.current.isClaiming.donatedERC20).toBe(false);
    });

    it('retrieves a batch with raw amounts', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0xA', amount: '10' },
          { roundNum: 2, tokenAddress: '0xB', amount: 20n },
        ]);
      });
      expect(mockWriteClaimManyDonatedTokens).toHaveBeenCalledWith([
        [
          { roundNum: 1, tokenAddress: '0xA', amount: 10n },
          { roundNum: 2, tokenAddress: '0xB', amount: 20n },
        ],
      ]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.tokensSuccess');
    });

    it('does not write a batch when any amount is display-denominated', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0xA', amount: '10' },
          { roundNum: 2, tokenAddress: '0xB', amount: '0.5' },
        ]);
      });
      expect(mockWriteClaimManyDonatedTokens).not.toHaveBeenCalled();
      expect(mockTx.lastFailureMessage()).toBe('toasts.claim.failed');
    });
  });

  it('does not refresh after the component unmounts mid-transaction', async () => {
    let release!: (hash: string) => void;
    mockWriteWithdrawEverything.mockImplementationOnce(
      () => new Promise<string>((resolve) => (release = resolve)),
    );
    const onSuccess = jest.fn();
    const { result, unmount } = renderHook(() => useClaimAllocations(onSuccess));

    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.retrieveAllStellarSelectionETH([1]);
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      release('0xtx1');
      await pending;
    });

    expect(mockFetchStatusData).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('keeps method identities stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useClaimAllocations());
    const first = result.current;
    rerender();
    expect(result.current.retrieveAllStellarSelectionETH).toBe(
      first.retrieveAllStellarSelectionETH,
    );
    expect(result.current.claimDonatedNFT).toBe(first.claimDonatedNFT);
    expect(result.current.claimAllDonatedNFTs).toBe(first.claimAllDonatedNFTs);
    expect(result.current.claimDonatedERC20).toBe(first.claimDonatedERC20);
    expect(result.current.claimAllDonatedERC20).toBe(first.claimAllDonatedERC20);
  });
});

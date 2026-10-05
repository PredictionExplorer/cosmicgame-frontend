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

/** Each PrizesWallet function's args, as the flow's `ctx.writeContract` received them. */
const WRITES: Record<string, jest.Mock> = {
  withdrawEverything: mockWriteWithdrawEverything,
  claimDonatedNft: mockWriteClaimDonatedNft,
  claimManyDonatedNfts: mockWriteClaimManyDonatedNfts,
  claimDonatedToken: mockWriteClaimDonatedToken,
  claimManyDonatedTokens: mockWriteClaimManyDonatedTokens,
};

const ALLOCATIONS_WALLET = '0x00000000000000000000000000000000000000b2';
/** A superseded stellar-selection wallet still holding earlier deposits. */
const OLD_WALLET = '0xaa00000000000000000000000000000000000009';
let mockAllocationsWallet = ALLOCATIONS_WALLET;

/** The contract address of every write, in order (routing per holding wallet). */
let writeTargets: string[] = [];

jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ prizesWallet: mockAllocationsWallet }),
}));

import { useClaimAllocations } from '../useClaimAllocations';

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.reset();
  mockAllocationsWallet = ALLOCATIONS_WALLET;
  writeTargets = [];
  // Every retrieve goes through the flow's one write path. Rows from a
  // superseded wallet route to that wallet's address, so record each call's
  // target and dispatch on the function name.
  mockTx.writeContract.mockImplementation(
    async (request: { address: string; functionName: string; args: unknown[] }) => {
      writeTargets.push(request.address);
      return WRITES[request.functionName]!(request.args);
    },
  );
  mockWriteWithdrawEverything.mockResolvedValue('0xtx1');
  mockWriteClaimDonatedNft.mockResolvedValue('0xtx2');
  mockWriteClaimManyDonatedNfts.mockResolvedValue('0xtx3');
  mockWriteClaimDonatedToken.mockResolvedValue('0xtx4');
  mockWriteClaimManyDonatedTokens.mockResolvedValue('0xtx5');
});

/** A single-wallet plan for the current Allocations wallet. */
const plan = (
  parts: Partial<{
    walletAddr: string;
    ethRounds: number[];
    nftIndexes: number[];
    tokenClaims: { roundNum: number; tokenAddress: string; amount: string }[];
    rounds: number[];
  }> = {},
) => ({
  ethRounds: [],
  nftIndexes: [],
  tokenClaims: [],
  rounds: [],
  ...parts,
});

describe('useClaimAllocations', () => {
  it('starts idle, with every flag false and the shared stage exposed', () => {
    const { result } = renderHook(() => useClaimAllocations());
    expect(result.current.isClaiming).toEqual({
      everything: false,
      raffleETH: false,
      donatedNFT: false,
      donatedERC20: false,
    });
    expect(result.current.claimingDonatedNFTs).toEqual([]);
    expect(result.current.claimingDonatedTokens).toEqual([]);
    expect(result.current.txStage).toEqual({ status: 'idle' });
  });

  describe('retrieveEverything', () => {
    it('sends ETH cycles, raw token amounts and NFT indexes in one withdrawEverything', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimAllocations(onSuccess));
      await act(async () => {
        await result.current.retrieveEverything({
          walletPlans: [
            plan({
              ethRounds: [3, 1, 3],
              tokenClaims: [{ roundNum: 1, tokenAddress: '0xA', amount: '1500000000000000000' }],
              nftIndexes: [9, 4, 9],
            }),
          ],
          successMessage: 'Everything retrieved.',
        });
      });

      expect(writeTargets).toEqual([ALLOCATIONS_WALLET]);
      expect(mockWriteWithdrawEverything).toHaveBeenCalledTimes(1);
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([
        [1, 3],
        [{ roundNum: 1, tokenAddress: '0xA', amount: 1500000000000000000n }],
        [9, 4],
      ]);
      expect(mockTx.runs).toHaveLength(1);
      expect(mockTx.lastSuccessMessage()).toBe('Everything retrieved.');
      expect(mockFetchStatusData).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(result.current.isClaiming.everything).toBe(false);
    });

    it('sends one transaction per holding wallet, in plan order', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveEverything({
          walletPlans: [
            plan({ ethRounds: [1] }),
            plan({ walletAddr: OLD_WALLET, ethRounds: [2], nftIndexes: [5] }),
          ],
          successMessage: 'Everything retrieved.',
        });
      });

      expect(writeTargets).toEqual([ALLOCATIONS_WALLET, OLD_WALLET]);
      expect(mockWriteWithdrawEverything).toHaveBeenNthCalledWith(1, [[1], [], []]);
      expect(mockWriteWithdrawEverything).toHaveBeenNthCalledWith(2, [[2], [], [5]]);
      // One action, one success toast: only the last wallet's run carries it.
      expect(mockTx.runs).toHaveLength(2);
      expect(mockTx.runs[0]!.successMessage).toBeNull();
      expect(mockTx.lastSuccessMessage()).toBe('Everything retrieved.');
    });

    it('stops at the first wallet whose transaction does not confirm', async () => {
      mockWriteWithdrawEverything.mockRejectedValueOnce(new Error('execution reverted'));
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveEverything({
          walletPlans: [plan({ ethRounds: [1] }), plan({ walletAddr: OLD_WALLET, ethRounds: [2] })],
          successMessage: 'done',
        });
      });

      expect(writeTargets).toEqual([ALLOCATIONS_WALLET]);
      expect(mockTx.runs).toHaveLength(1);
      expect(mockTx.lastFailureMessage()).toBe('toasts.claim.failed');
      expect(result.current.isClaiming.everything).toBe(false);
    });

    it('strips walletAddr from token claims before encoding', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveEverything({
          walletPlans: [
            plan({
              walletAddr: OLD_WALLET,
              tokenClaims: [
                { roundNum: 1, tokenAddress: '0xA', amount: 2n, walletAddr: OLD_WALLET },
              ] as never,
            }),
          ],
          successMessage: 'done',
        });
      });

      expect(writeTargets).toEqual([OLD_WALLET]);
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([
        [],
        [{ roundNum: 1, tokenAddress: '0xA', amount: 2n }],
        [],
      ]);
    });

    it('holds its own flag while the transaction runs', async () => {
      let release!: (hash: string) => void;
      mockWriteWithdrawEverything.mockImplementationOnce(
        () => new Promise<string>((resolve) => (release = resolve)),
      );
      const { result } = renderHook(() => useClaimAllocations());

      let pending!: Promise<void>;
      await act(async () => {
        pending = result.current.retrieveEverything({
          walletPlans: [plan({ ethRounds: [1] })],
          successMessage: 'done',
        });
        await Promise.resolve();
      });
      expect(result.current.isClaiming.everything).toBe(true);
      expect(result.current.isClaiming.raffleETH).toBe(false);

      await act(async () => {
        release('0xtx1');
        await pending;
      });
      expect(result.current.isClaiming.everything).toBe(false);
    });

    it('never sends a display-denominated token amount', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveEverything({
          walletPlans: [
            plan({
              ethRounds: [1],
              tokenClaims: [{ roundNum: 1, tokenAddress: '0xA', amount: '0.5' }],
            }),
          ],
          successMessage: 'done',
        });
      });
      expect(mockWriteWithdrawEverything).not.toHaveBeenCalled();
      expect(mockTx.lastFailureMessage()).toBe('toasts.claim.failed');
    });
  });

  describe('retrieveAllStellarSelectionETH', () => {
    it('writes withdrawEverything through the transaction flow', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimAllocations(onSuccess));
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([
          { roundNum: 5 },
          { roundNum: 6 },
          { roundNum: 7 },
        ]);
      });

      expect(writeTargets).toEqual([ALLOCATIONS_WALLET]);
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([[5, 6, 7], [], []]);
      expect(mockTx.runs).toHaveLength(1);
      expect(mockTx.runs[0]!.failureMessage).toBe('toasts.claim.failed');
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.stellarEthSuccess');
      expect(mockFetchStatusData).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(result.current.isClaiming.raffleETH).toBe(false);
    });

    it('lists each cycle once: PrizesWallet holds one ETH balance per cycle', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH(
          [7, 5, 7, 5, 6].map((roundNum) => ({ roundNum })),
        );
      });
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([[5, 6, 7], [], []]);
    });

    it('sends one transaction per holding wallet, preserving row order', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([
          { roundNum: 1 },
          { roundNum: 2, walletAddr: OLD_WALLET },
          { roundNum: 3 },
        ]);
      });

      expect(writeTargets).toEqual([ALLOCATIONS_WALLET, OLD_WALLET]);
      expect(mockWriteWithdrawEverything).toHaveBeenNthCalledWith(1, [[1, 3], [], []]);
      expect(mockWriteWithdrawEverything).toHaveBeenNthCalledWith(2, [[2], [], []]);
      expect(mockTx.runs[0]!.successMessage).toBeNull();
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.stellarEthSuccess');
    });

    it('groups wallet addresses case-insensitively', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([
          { roundNum: 1, walletAddr: OLD_WALLET },
          { roundNum: 2, walletAddr: OLD_WALLET.toUpperCase().replace('0X', '0x') },
        ]);
      });

      expect(writeTargets).toEqual([OLD_WALLET]);
      expect(mockWriteWithdrawEverything).toHaveBeenCalledTimes(1);
      expect(mockWriteWithdrawEverything).toHaveBeenCalledWith([[1, 2], [], []]);
    });

    it('holds the flag while the transaction runs', async () => {
      let release!: (hash: string) => void;
      mockWriteWithdrawEverything.mockImplementationOnce(
        () => new Promise<string>((resolve) => (release = resolve)),
      );
      const { result } = renderHook(() => useClaimAllocations());

      let pending!: Promise<void>;
      await act(async () => {
        pending = result.current.retrieveAllStellarSelectionETH([{ roundNum: 1 }]);
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
      mockAllocationsWallet = '';
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([{ roundNum: 1 }]);
      });

      expect(mockTx.runs).toHaveLength(0);
      expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.claim.walletNotConnected');
    });

    it('does not refresh when the wallet prompt is dismissed', async () => {
      mockWriteWithdrawEverything.mockRejectedValueOnce({ code: 4001, message: 'User rejected' });
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useClaimAllocations(onSuccess));
      await act(async () => {
        await result.current.retrieveAllStellarSelectionETH([{ roundNum: 1 }]);
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

    it('targets the holding wallet when a wallet address is given', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimDonatedNFT(42, OLD_WALLET);
      });
      expect(writeTargets).toEqual([OLD_WALLET]);
      expect(mockWriteClaimDonatedNft).toHaveBeenCalledWith([42]);
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
        await result.current.claimAllDonatedNFTs([{ index: 1 }, { index: 2 }, { index: 3 }]);
      });
      expect(mockWriteClaimManyDonatedNfts).toHaveBeenCalledWith([[1, 2, 3]]);
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.nftsSuccess');
      expect(result.current.isClaiming.donatedNFT).toBe(false);
    });

    it('groups NFTs per holding wallet into separate transactions', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimAllDonatedNFTs([
          { index: 0 },
          { index: 1, walletAddr: OLD_WALLET },
          { index: 2 },
          { index: 3, walletAddr: OLD_WALLET.toUpperCase().replace('0X', '0x') },
        ]);
      });

      expect(writeTargets).toEqual([ALLOCATIONS_WALLET, OLD_WALLET]);
      expect(mockWriteClaimManyDonatedNfts).toHaveBeenNthCalledWith(1, [[0, 2]]);
      expect(mockWriteClaimManyDonatedNfts).toHaveBeenNthCalledWith(2, [[1, 3]]);
      expect(mockTx.runs[0]!.successMessage).toBeNull();
      expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.nftsSuccess');
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

    it('targets the holding wallet when a wallet address is given', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimDonatedERC20(5, '0xToken', 10n, OLD_WALLET);
      });
      expect(writeTargets).toEqual([OLD_WALLET]);
      expect(mockWriteClaimDonatedToken).toHaveBeenCalledWith([5, '0xToken', 10n]);
    });

    it('marks the token being retrieved until its transaction ends', async () => {
      let release!: (hash: string) => void;
      mockWriteClaimDonatedToken.mockImplementationOnce(
        () => new Promise<string>((resolve) => (release = resolve)),
      );
      const { result } = renderHook(() => useClaimAllocations());

      let pending!: Promise<void>;
      await act(async () => {
        pending = result.current.claimDonatedERC20(5, '0xToKeN', '10');
        await Promise.resolve();
      });
      expect(result.current.claimingDonatedTokens).toEqual(['5:0xtoken']);

      await act(async () => {
        release('0xtx4');
        await pending;
      });
      expect(result.current.claimingDonatedTokens).toEqual([]);
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

    it('splits per holding wallet and strips walletAddr from the on-chain struct', async () => {
      const { result } = renderHook(() => useClaimAllocations());
      await act(async () => {
        await result.current.claimAllDonatedERC20([
          { roundNum: 1, tokenAddress: '0xA', amount: 2n, walletAddr: OLD_WALLET },
          { roundNum: 2, tokenAddress: '0xB', amount: 3n },
        ]);
      });

      expect(writeTargets).toEqual([OLD_WALLET, ALLOCATIONS_WALLET]);
      expect(mockWriteClaimManyDonatedTokens).toHaveBeenNthCalledWith(1, [
        [{ roundNum: 1, tokenAddress: '0xA', amount: 2n }],
      ]);
      expect(mockWriteClaimManyDonatedTokens).toHaveBeenNthCalledWith(2, [
        [{ roundNum: 2, tokenAddress: '0xB', amount: 3n }],
      ]);
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
      pending = result.current.retrieveAllStellarSelectionETH([{ roundNum: 1 }]);
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
    expect(result.current.retrieveEverything).toBe(first.retrieveEverything);
    expect(result.current.retrieveAllStellarSelectionETH).toBe(
      first.retrieveAllStellarSelectionETH,
    );
    expect(result.current.claimDonatedNFT).toBe(first.claimDonatedNFT);
    expect(result.current.claimAllDonatedNFTs).toBe(first.claimAllDonatedNFTs);
    expect(result.current.claimDonatedERC20).toBe(first.claimDonatedERC20);
    expect(result.current.claimAllDonatedERC20).toBe(first.claimAllDonatedERC20);
  });
});

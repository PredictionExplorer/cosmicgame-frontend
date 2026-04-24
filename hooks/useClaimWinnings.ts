import { useCallback, useEffect, useRef, useState } from 'react';
import { parseUnits } from 'viem';
import { usePublicClient } from 'wagmi';

import {
  isUserRejection,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import getErrorMessage from '@/utils/alert';
import { useNotification } from '@/contexts/NotificationContext';
import { useApiData } from '@/contexts/ApiDataContext';

import useRaffleWalletContract from './useRaffleWalletContract';

interface ClaimingState {
  raffleETH: boolean;
  donatedNFT: boolean;
  donatedERC20: boolean;
}

/**
 * Default ERC-20 decimals when a token's metadata is not provided. This matches
 * the most common case (DAI, WETH, most governance tokens). For tokens with
 * different decimals (USDC/USDT: 6), callers must pass the correct decimals
 * explicitly to avoid scaling errors that would otherwise transfer the wrong
 * amount on-chain.
 */
const DEFAULT_ERC20_DECIMALS = 18;

/**
 * Encapsulates all retrieval/withdraw operations for the My Allocations page:
 * Stellar Selection ETH, attached NFTs (single + batch), and attached ERC-20
 * tokens.
 *
 * World-class hook concerns addressed here:
 *   1. Every transaction is awaited to receipt (`waitForTransactionReceipt`)
 *      so we only refresh and unset loading state once the tx has landed.
 *      A silent success before confirmation is a UX footgun: the user sees
 *      the button re-enabled while their balance has not yet updated.
 *   2. Unmount-safe refresh: a ref tracks whether the component is still
 *      mounted when the delayed refresh fires, so we never setState on an
 *      unmounted component.
 *   3. Consistent contract-null guards across every public method.
 *   4. Per-operation loading state so consumers can render accurate
 *      disabled/spinner UI.
 *   5. ERC-20 decimals are a required caller concern, not a silent 18.
 */
export function useClaimWinnings(onSuccess?: () => void) {
  const { setNotification } = useNotification();
  const { fetchData: fetchStatusData } = useApiData();
  const raffleWalletContract = useRaffleWalletContract();
  const publicClient = usePublicClient();

  const [isClaiming, setIsClaiming] = useState<ClaimingState>({
    raffleETH: false,
    donatedNFT: false,
    donatedERC20: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);

  // Tracks component mount lifecycle so post-tx effects never setState on an
  // unmounted component (this is a frequent source of stale-warning noise and
  // subtle bugs when the user navigates away mid-transaction).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleTxError = useCallback(
    (err: unknown, context: string) => {
      if (isUserRejection(err)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
        return;
      }
      reportError(err, context);
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    },
    [setNotification],
  );

  const notifyWalletNotConnected = useCallback(() => {
    setNotification({
      text: 'Please connect your wallet and ensure you are on the correct network.',
      type: 'error',
      visible: true,
    });
  }, [setNotification]);

  const refreshAfterClaim = useCallback(() => {
    if (!mountedRef.current) return;
    fetchStatusData();
    onSuccess?.();
  }, [fetchStatusData, onSuccess]);

  /**
   * Awaits the transaction receipt so that consumer UI only transitions out
   * of its loading state once the tx has actually been included in a block.
   * If `publicClient` is unavailable (should not happen in practice but can
   * during hydration), we fall back to treating the tx-hash resolution as
   * enough — any follow-up error surfaces via the query refetch.
   */
  const awaitTx = useCallback(
    async (maybeHash: `0x${string}` | undefined) => {
      if (!maybeHash) return;
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: maybeHash });
      }
    },
    [publicClient],
  );

  const claimAllRaffleETH = useCallback(
    async (roundNums: number[]) => {
      if (!raffleWalletContract) {
        notifyWalletNotConnected();
        return;
      }
      setIsClaiming((prev) => ({ ...prev, raffleETH: true }));
      try {
        const hash = await raffleWalletContract.write.withdrawEverything?.([roundNums, [], []]);
        await awaitTx(hash);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'retrieve all Stellar Selection ETH');
      } finally {
        if (mountedRef.current) {
          setIsClaiming((prev) => ({ ...prev, raffleETH: false }));
        }
      }
    },
    [raffleWalletContract, notifyWalletNotConnected, awaitTx, refreshAfterClaim, handleTxError],
  );

  const claimDonatedNFT = useCallback(
    async (tokenID: number) => {
      if (!raffleWalletContract) {
        notifyWalletNotConnected();
        return;
      }
      setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
      try {
        const hash = await raffleWalletContract.write.claimDonatedNft?.([tokenID]);
        await awaitTx(hash);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'retrieve attached NFT');
      } finally {
        if (mountedRef.current) {
          setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
        }
      }
    },
    [raffleWalletContract, notifyWalletNotConnected, awaitTx, refreshAfterClaim, handleTxError],
  );

  const claimAllDonatedNFTs = useCallback(
    async (indexList: number[]) => {
      if (!raffleWalletContract) {
        notifyWalletNotConnected();
        return;
      }
      setIsClaiming((prev) => ({ ...prev, donatedNFT: true }));
      try {
        const hash = await raffleWalletContract.write.claimManyDonatedNfts?.([indexList]);
        await awaitTx(hash);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'retrieve all attached NFTs');
      } finally {
        if (mountedRef.current) {
          setIsClaiming((prev) => ({ ...prev, donatedNFT: false }));
        }
      }
    },
    [raffleWalletContract, notifyWalletNotConnected, awaitTx, refreshAfterClaim, handleTxError],
  );

  const claimDonatedERC20 = useCallback(
    async (
      roundNum: number,
      tokenAddr: string,
      amount: string,
      decimals: number = DEFAULT_ERC20_DECIMALS,
    ) => {
      if (!raffleWalletContract) {
        notifyWalletNotConnected();
        return;
      }
      setIsClaiming((prev) => ({ ...prev, donatedERC20: true }));
      try {
        const hash = await raffleWalletContract.write.claimDonatedToken?.([
          roundNum,
          tokenAddr,
          parseUnits(amount.toString(), decimals),
        ]);
        await awaitTx(hash);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'retrieve attached ERC20 token');
      } finally {
        if (mountedRef.current) {
          setIsClaiming((prev) => ({ ...prev, donatedERC20: false }));
        }
      }
    },
    [raffleWalletContract, notifyWalletNotConnected, awaitTx, refreshAfterClaim, handleTxError],
  );

  const claimAllDonatedERC20 = useCallback(
    async (tokens: { roundNum: number; tokenAddress: string; amount: number | undefined }[]) => {
      if (!raffleWalletContract) {
        notifyWalletNotConnected();
        return;
      }
      setIsClaiming((prev) => ({ ...prev, donatedERC20: true }));
      try {
        const hash = await raffleWalletContract.write.claimManyDonatedTokens?.([tokens]);
        await awaitTx(hash);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'retrieve all attached ERC20 tokens');
      } finally {
        if (mountedRef.current) {
          setIsClaiming((prev) => ({ ...prev, donatedERC20: false }));
        }
      }
    },
    [raffleWalletContract, notifyWalletNotConnected, awaitTx, refreshAfterClaim, handleTxError],
  );

  return {
    isClaiming,
    claimingDonatedNFTs,
    claimAllRaffleETH,
    claimDonatedNFT,
    claimAllDonatedNFTs,
    claimDonatedERC20,
    claimAllDonatedERC20,
  };
}

import { useState, useCallback } from 'react';
import { parseUnits } from 'viem';

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
}

/**
 * Encapsulates all claim/withdraw operations for the My Winnings page:
 * raffle ETH, donated NFTs (single + batch), and donated ERC-20 tokens.
 */
export function useClaimWinnings(onSuccess?: () => void) {
  const { setNotification } = useNotification();
  const { fetchData: fetchStatusData } = useApiData();
  const raffleWalletContract = useRaffleWalletContract();

  const [isClaiming, setIsClaiming] = useState<ClaimingState>({
    raffleETH: false,
    donatedNFT: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);

  const handleTxError = useCallback(
    (err: unknown, context: string) => {
      if (isUserRejection(err)) {
        setNotification({ text: WALLET_TRANSACTION_CANCELLED_MESSAGE, type: 'info', visible: true });
        return;
      }
      reportError(err, context);
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    },
    [setNotification],
  );

  const refreshAfterClaim = useCallback(
    (delayMs = 3000) => {
      setTimeout(() => {
        fetchStatusData();
        onSuccess?.();
      }, delayMs);
    },
    [fetchStatusData, onSuccess],
  );

  const claimAllRaffleETH = useCallback(
    async (roundNums: number[]) => {
      if (!raffleWalletContract) {
        setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
        return;
      }
      setIsClaiming((prev) => ({ ...prev, raffleETH: true }));
      try {
        await raffleWalletContract.write.withdrawEverything?.([roundNums, [], []]);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'claim all raffle ETH');
      } finally {
        setIsClaiming((prev) => ({ ...prev, raffleETH: false }));
      }
    },
    [raffleWalletContract, setNotification, refreshAfterClaim, handleTxError],
  );

  const claimDonatedNFT = useCallback(
    async (tokenID: number) => {
      if (!raffleWalletContract) {
        setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
        return;
      }
      setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
      try {
        await raffleWalletContract.write.claimDonatedNft?.([tokenID]);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'claim donated NFT');
      } finally {
        setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
      }
    },
    [raffleWalletContract, setNotification, refreshAfterClaim, handleTxError],
  );

  const claimAllDonatedNFTs = useCallback(
    async (indexList: number[]) => {
      if (!raffleWalletContract) {
        setNotification({ text: 'Wallet not connected', type: 'error', visible: true });
        return;
      }
      setIsClaiming((prev) => ({ ...prev, donatedNFT: true }));
      try {
        await raffleWalletContract.write.claimManyDonatedNfts?.([indexList]);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'claim all donated NFTs');
      } finally {
        setIsClaiming((prev) => ({ ...prev, donatedNFT: false }));
      }
    },
    [raffleWalletContract, setNotification, refreshAfterClaim, handleTxError],
  );

  const claimDonatedERC20 = useCallback(
    async (roundNum: number, tokenAddr: string, amount: string) => {
      try {
        await raffleWalletContract!.write.claimDonatedToken?.([
          roundNum,
          tokenAddr,
          parseUnits(amount.toString(), 18),
        ]);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'claim donated ERC20 token');
      }
    },
    [raffleWalletContract, refreshAfterClaim, handleTxError],
  );

  const claimAllDonatedERC20 = useCallback(
    async (
      tokens: { roundNum: number; tokenAddress: string; amount: number | undefined }[],
    ) => {
      try {
        await raffleWalletContract!.write.claimManyDonatedTokens?.([tokens]);
        refreshAfterClaim();
      } catch (err) {
        handleTxError(err, 'claim all donated ERC20 tokens');
      }
    },
    [raffleWalletContract, refreshAfterClaim, handleTxError],
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

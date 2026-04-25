import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import { ANCHORING_WALLET_CST_ADDRESS, ANCHORING_WALLET_RWLK_ADDRESS } from '@/config/networks';
import {
  isUserRejection,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import getErrorMessage from '@/utils/alert';
import { useNotification } from '@/contexts/NotificationContext';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';

import { useActiveWeb3React } from './web3';
import useAnchoringWalletCSTContract from './useAnchoringWalletCSTContract';
import useAnchoringWalletRWLKContract from './useAnchoringWalletRWLKContract';
import useCosmicSignatureContract from './useCosmicSignatureContract';
import useRWLKNFTContract from './useRWLKNFTContract';

const ANCHORING_QUERY_KEYS = [
  'dashboardInfo',
  'stakingCSTActionsByUser',
  'cstTokensByUser',
  'stakingRewardsByUser',
  'stakingRWLKActionsByUser',
  'stakingRWLKMintsByUser',
] as const;

/**
 * Encapsulates approval, anchoring, and unstaking logic for both CST and RWLK tokens.
 * Handles contract calls, receipt waiting, query invalidation, and error reporting.
 */
export function useAnchorActions() {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const { fetchData: fetchStakedTokens } = useAnchoredToken();

  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cstAnchoringContract = useAnchoringWalletCSTContract();
  const rwlkAnchoringContract = useAnchoringWalletRWLKContract();

  const handleError = useCallback(
    (err: unknown) => {
      if (isUserRejection(err)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
        return;
      }
      reportError(err, 'anchor action error');
      const msg = getEthErrorMessage(err);
      if (msg !== 'An error occurred') {
        setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
      }
    },
    [setNotification],
  );

  const invalidateAnchoringQueries = useCallback(() => {
    for (const key of ANCHORING_QUERY_KEYS) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    fetchStakedTokens();
  }, [queryClient, fetchStakedTokens]);

  const approveIfNeeded = useCallback(
    async (
      nftContract: NonNullable<typeof cosmicSignatureContract | typeof rwalkContract>,
      walletAddress: string,
    ) => {
      if (!nftContract) throw new Error('Contract not initialized');
      const isApprovedForAll = await nftContract.read.isApprovedForAll?.([account, walletAddress]);
      if (!isApprovedForAll) {
        const hash = await nftContract.write.setApprovalForAll?.([walletAddress, true]);
        if (hash) await publicClient?.waitForTransactionReceipt({ hash });
      }
    },
    [account, publicClient],
  );

  const anchor = useCallback(
    async (tokenIds: number | number[], isRwalk: boolean) => {
      try {
        const nftContract = isRwalk ? rwalkContract : cosmicSignatureContract;
        const anchoringContract = isRwalk ? rwlkAnchoringContract : cstAnchoringContract;
        const walletAddress = isRwalk
          ? ANCHORING_WALLET_RWLK_ADDRESS
          : ANCHORING_WALLET_CST_ADDRESS;

        if (!nftContract || !anchoringContract) {
          setNotification({
            visible: true,
            text: 'Please connect your wallet and ensure you are on the correct network.',
            type: 'error',
          });
          return;
        }

        await approveIfNeeded(nftContract, walletAddress);

        const hash = Array.isArray(tokenIds)
          ? await anchoringContract.write.stakeMany?.([tokenIds])
          : await anchoringContract.write.anchor?.([tokenIds]);

        const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;

        setTimeout(() => {
          invalidateAnchoringQueries();
          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: Array.isArray(tokenIds)
                ? 'The selected tokens were staked successfully!'
                : `You have successfully staked token ${tokenIds}!`,
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    [
      approveIfNeeded,
      cosmicSignatureContract,
      rwalkContract,
      cstAnchoringContract,
      rwlkAnchoringContract,
      publicClient,
      setNotification,
      invalidateAnchoringQueries,
      handleError,
    ],
  );

  const release = useCallback(
    async (actionIds: number | number[], isRwalk: boolean) => {
      try {
        const anchoringContract = isRwalk ? rwlkAnchoringContract : cstAnchoringContract;

        if (!anchoringContract) {
          setNotification({
            visible: true,
            text: 'Please connect your wallet and ensure you are on the correct network.',
            type: 'error',
          });
          return;
        }

        const hash = Array.isArray(actionIds)
          ? await anchoringContract.write.unstakeMany?.([actionIds])
          : await anchoringContract.write.release?.([actionIds]);

        const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;

        setTimeout(() => {
          invalidateAnchoringQueries();
          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: Array.isArray(actionIds)
                ? 'The selected tokens were unstaked successfully!'
                : 'You have successfully unstaked token!',
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    [
      cstAnchoringContract,
      rwlkAnchoringContract,
      publicClient,
      setNotification,
      invalidateAnchoringQueries,
      handleError,
    ],
  );

  return { anchor, release, handleError, rwalkContract };
}

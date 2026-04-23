import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import { STAKING_WALLET_CST_ADDRESS, STAKING_WALLET_RWLK_ADDRESS } from '@/config/networks';
import {
  isUserRejection,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import getErrorMessage from '@/utils/alert';
import { useNotification } from '@/contexts/NotificationContext';
import { useStakedToken } from '@/contexts/StakedTokenContext';

import { useActiveWeb3React } from './web3';
import useStakingWalletCSTContract from './useStakingWalletCSTContract';
import useStakingWalletRWLKContract from './useStakingWalletRWLKContract';
import useCosmicSignatureContract from './useCosmicSignatureContract';
import useRWLKNFTContract from './useRWLKNFTContract';

const STAKING_QUERY_KEYS = [
  'dashboardInfo',
  'stakingCSTActionsByUser',
  'cstTokensByUser',
  'stakingRewardsByUser',
  'stakingRWLKActionsByUser',
  'stakingRWLKMintsByUser',
] as const;

/**
 * Encapsulates approval, staking, and unstaking logic for both CST and RWLK tokens.
 * Handles contract calls, receipt waiting, query invalidation, and error reporting.
 */
export function useStakingActions() {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const { fetchData: fetchStakedTokens } = useStakedToken();

  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cstStakingContract = useStakingWalletCSTContract();
  const rwlkStakingContract = useStakingWalletRWLKContract();

  const handleError = useCallback(
    (err: unknown) => {
      if (isUserRejection(err)) {
        setNotification({ text: WALLET_TRANSACTION_CANCELLED_MESSAGE, type: 'info', visible: true });
        return;
      }
      reportError(err, 'staking error');
      const msg = getEthErrorMessage(err);
      if (msg !== 'An error occurred') {
        setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
      }
    },
    [setNotification],
  );

  const invalidateStakingQueries = useCallback(() => {
    for (const key of STAKING_QUERY_KEYS) {
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

  const stake = useCallback(
    async (tokenIds: number | number[], isRwalk: boolean) => {
      try {
        const nftContract = isRwalk ? rwalkContract : cosmicSignatureContract;
        const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
        const walletAddress = isRwalk ? STAKING_WALLET_RWLK_ADDRESS : STAKING_WALLET_CST_ADDRESS;

        if (!nftContract || !stakingContract) {
          setNotification({
            visible: true,
            text: 'Please connect your wallet and ensure you are on the correct network.',
            type: 'error',
          });
          return;
        }

        await approveIfNeeded(nftContract, walletAddress);

        const hash = Array.isArray(tokenIds)
          ? await stakingContract.write.stakeMany?.([tokenIds])
          : await stakingContract.write.stake?.([tokenIds]);

        const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;

        setTimeout(() => {
          invalidateStakingQueries();
          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: Array.isArray(tokenIds)
                ? 'The selected NFTs were anchored successfully!'
                : `You have successfully anchored token ${tokenIds}!`,
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
      cstStakingContract,
      rwlkStakingContract,
      publicClient,
      setNotification,
      invalidateStakingQueries,
      handleError,
    ],
  );

  const unstake = useCallback(
    async (actionIds: number | number[], isRwalk: boolean) => {
      try {
        const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;

        if (!stakingContract) {
          setNotification({
            visible: true,
            text: 'Please connect your wallet and ensure you are on the correct network.',
            type: 'error',
          });
          return;
        }

        const hash = Array.isArray(actionIds)
          ? await stakingContract.write.unstakeMany?.([actionIds])
          : await stakingContract.write.unstake?.([actionIds]);

        const res = hash ? await publicClient?.waitForTransactionReceipt({ hash }) : undefined;

        setTimeout(() => {
          invalidateStakingQueries();
          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: Array.isArray(actionIds)
                ? 'The selected anchors were released successfully!'
                : 'You have successfully released your anchor!',
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    [cstStakingContract, rwlkStakingContract, publicClient, setNotification, invalidateStakingQueries, handleError],
  );

  return { stake, unstake, handleError, rwalkContract };
}

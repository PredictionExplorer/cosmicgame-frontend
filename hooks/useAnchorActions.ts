import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getConnectorClient } from '@wagmi/core';
import { useConfig, useConnectorClient, usePublicClient, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import getErrorMessage from '@/utils/alert';
import { useNotification } from '@/contexts/NotificationContext';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import { assertSuccessfulTransactionReceipt, assertTransactionHash } from '@/utils/transactions';

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
  const t = useTranslations('toasts');
  const locale = useLocale();
  const { stakingCst, stakingRwalk } = useContractAddresses();
  const { account } = useActiveWeb3React();
  const config = useConfig();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { data: walletClient } = useWalletClient({ chainId: activeChain.id });
  const { data: connectorClient } = useConnectorClient({ chainId: activeChain.id });

  const { setNotification } = useNotification();
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
          text: t('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
        return;
      }
      reportError(err, 'anchor action error');
      const msg = getEthErrorMessage(err, t('anchor.failed'), { locale });
      setNotification({ text: getErrorMessage(msg) || msg, type: 'error', visible: true });
    },
    [locale, setNotification, t],
  );

  const invalidateAnchoringQueries = useCallback(() => {
    for (const key of ANCHORING_QUERY_KEYS) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    fetchStakedTokens();
  }, [queryClient, fetchStakedTokens]);

  /** Same pattern as `useGestureForm`: hooks scoped to `activeChain`, then imperative fallback. */
  const ensureSignerReady = useCallback(async () => {
    const fromHooks = connectorClient ?? walletClient;
    if (fromHooks) return fromHooks;
    try {
      return await getConnectorClient(config, { chainId: activeChain.id });
    } catch {
      return undefined;
    }
  }, [config, connectorClient, walletClient]);

  const approveIfNeeded = useCallback(
    async (
      nftContract: NonNullable<typeof cosmicSignatureContract | typeof rwalkContract>,
      walletAddress: string,
    ) => {
      if (!nftContract) throw new Error('Contract not initialized');
      const isApprovedForAll = await nftContract.read.isApprovedForAll?.([account, walletAddress]);
      if (!isApprovedForAll) {
        const hash = await nftContract.write.setApprovalForAll?.([walletAddress, true]);
        assertTransactionHash(hash);
        const receipt = await publicClient?.waitForTransactionReceipt({ hash });
        assertSuccessfulTransactionReceipt(receipt);
      }
    },
    [account, publicClient],
  );

  const anchor = useCallback(
    async (tokenIds: number | number[], isRwalk: boolean) => {
      try {
        const nftContract = isRwalk ? rwalkContract : cosmicSignatureContract;
        const anchoringContract = isRwalk ? rwlkAnchoringContract : cstAnchoringContract;
        const walletAddress = isRwalk ? stakingRwalk : stakingCst;

        if (!nftContract || !anchoringContract) {
          setNotification({
            visible: true,
            text: t('wallet.connectCorrectNetwork'),
            type: 'error',
          });
          return;
        }

        if (!account) {
          setNotification({
            visible: true,
            text: t('wallet.connectCorrectNetwork'),
            type: 'error',
          });
          return;
        }

        if (!(await ensureSignerReady())) {
          setNotification({
            visible: true,
            text: t('anchor.walletNotReady'),
            type: 'error',
          });
          return;
        }

        await approveIfNeeded(nftContract, walletAddress);

        const hash = Array.isArray(tokenIds)
          ? await anchoringContract.write.stakeMany?.([tokenIds])
          : await anchoringContract.write.stake?.([tokenIds]);

        assertTransactionHash(hash);
        const res = await publicClient?.waitForTransactionReceipt({ hash });
        assertSuccessfulTransactionReceipt(res);

        setTimeout(() => {
          invalidateAnchoringQueries();
          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: t('anchor.anchored', {
                count: Array.isArray(tokenIds) ? tokenIds.length : 1,
              }),
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
      account,
      ensureSignerReady,
      approveIfNeeded,
      cosmicSignatureContract,
      rwalkContract,
      cstAnchoringContract,
      rwlkAnchoringContract,
      publicClient,
      setNotification,
      invalidateAnchoringQueries,
      handleError,
      stakingCst,
      stakingRwalk,
      t,
    ],
  );

  const release = useCallback(
    async (actionIds: number | number[], isRwalk: boolean) => {
      try {
        const anchoringContract = isRwalk ? rwlkAnchoringContract : cstAnchoringContract;

        if (!anchoringContract) {
          setNotification({
            visible: true,
            text: t('wallet.connectCorrectNetwork'),
            type: 'error',
          });
          return;
        }

        if (!account) {
          setNotification({
            visible: true,
            text: t('wallet.connectCorrectNetwork'),
            type: 'error',
          });
          return;
        }

        if (!(await ensureSignerReady())) {
          setNotification({
            visible: true,
            text: t('anchor.walletNotReady'),
            type: 'error',
          });
          return;
        }

        const hash = Array.isArray(actionIds)
          ? await anchoringContract.write.unstakeMany?.([actionIds])
          : await anchoringContract.write.unstake?.([actionIds]);

        assertTransactionHash(hash);
        const res = await publicClient?.waitForTransactionReceipt({ hash });
        assertSuccessfulTransactionReceipt(res);

        setTimeout(() => {
          invalidateAnchoringQueries();
          if (res) {
            setNotification({
              visible: true,
              type: 'success',
              text: t('anchor.released', {
                count: Array.isArray(actionIds) ? actionIds.length : 1,
              }),
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
      account,
      ensureSignerReady,
      cstAnchoringContract,
      rwlkAnchoringContract,
      publicClient,
      setNotification,
      invalidateAnchoringQueries,
      handleError,
      t,
    ],
  );

  return { anchor, release, handleError, rwalkContract };
}

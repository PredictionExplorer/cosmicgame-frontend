import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, type TxResult } from '@/hooks/useTxFlow';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';

import useAnchoringWalletCSTContract from './useAnchoringWalletCSTContract';
import useAnchoringWalletRWLKContract from './useAnchoringWalletRWLKContract';
import useCosmicSignatureContract from './useCosmicSignatureContract';
import useRWLKNFTContract from './useRWLKNFTContract';

/** The indexer needs a beat after the receipt before the new state is queryable. */
const INDEXER_SETTLE_MS = 2000;

const ANCHORING_QUERY_KEYS = [
  'dashboardInfo',
  'stakingCSTActionsByUser',
  'cstTokensByUser',
  'stakingRewardsByUser',
  'stakingRWLKActionsByUser',
  'stakingRWLKMintsByUser',
  // The unretrieved-distribution reads and the header's notice, which a
  // release changes as much as the anchored lists.
  'stakingCSTRewardsToClaim',
  'stakingCSTRewardsCollected',
  'stakingCSTByUserByDeposit',
  'notifyRedBox',
] as const;

const NOT_RUN: TxResult = { status: 'aborted' };

/**
 * Anchoring and releasing for Cosmic Signature and RandomWalk NFTs.
 *
 * Both run through `useTxFlow` (chain guard, one lifecycle toast, localized
 * failures). Anchoring asks for the anchoring contract's operator approval
 * first when the collection has none — shown as step 1 of 2 with a sentence
 * explaining why the extra prompt appears. That approval is collection-wide
 * by design: the anchoring contract holds every anchored NFT of the
 * collection, and per-token approvals would cost one prompt per NFT.
 */
export function useAnchorActions() {
  const t = useTranslations('toasts');
  const { stakingCst, stakingRwalk } = useContractAddresses();
  const { notify, notifyErrorFromEthers } = useNotify();
  const queryClient = useQueryClient();
  const { fetchData: fetchStakedTokens } = useAnchoredToken();
  const { run: runTx, stage: txStage } = useTxFlow();

  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cstAnchoringContract = useAnchoringWalletCSTContract();
  const rwlkAnchoringContract = useAnchoringWalletRWLKContract();

  /** Reports a failed read (e.g. listing owned tokens) with the anchoring fallback. */
  const handleError = useCallback(
    (err: unknown) => notifyErrorFromEthers(err, t('anchor.failed')),
    [notifyErrorFromEthers, t],
  );

  const invalidateAnchoringQueries = useCallback(() => {
    for (const key of ANCHORING_QUERY_KEYS) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
    fetchStakedTokens();
  }, [queryClient, fetchStakedTokens]);

  const pendingTimers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      for (const timerId of pendingTimers.current) clearTimeout(timerId);
      pendingTimers.current.clear();
    },
    [],
  );

  /**
   * Defers the post-receipt refresh, keeping the handle so an unmount between
   * the receipt and the timeout cancels it instead of invalidating queries
   * against a tree that is already gone.
   */
  const deferUntilIndexed = useCallback((task: () => void) => {
    const timers = pendingTimers.current;
    const timerId = setTimeout(() => {
      timers.delete(timerId);
      task();
    }, INDEXER_SETTLE_MS);
    timers.add(timerId);
  }, []);

  const anchor = useCallback(
    async (tokenIds: number | number[], isRwalk: boolean): Promise<TxResult> => {
      const nftContract = isRwalk ? rwalkContract : cosmicSignatureContract;
      const anchoringContract = isRwalk ? rwlkAnchoringContract : cstAnchoringContract;
      const anchoringWallet = isRwalk ? stakingRwalk : stakingCst;

      if (!nftContract || !anchoringContract || !anchoringWallet) {
        notify('error', t('anchor.walletNotReady', { network: REQUIRED_CHAIN_NAME }));
        return NOT_RUN;
      }
      const count = Array.isArray(tokenIds) ? tokenIds.length : 1;

      return runTx({
        approvals: [
          {
            description: t('anchor.approval'),
            isNeeded: async (ctx) =>
              !(await nftContract.read.isApprovedForAll?.([ctx.account, anchoringWallet])),
            write: (ctx) =>
              ctx.writeContract({
                address: nftContract.address,
                abi: nftContract.abi,
                functionName: 'setApprovalForAll',
                args: [anchoringWallet as `0x${string}`, true],
              }),
          },
        ],
        write: (ctx) =>
          ctx.writeContract({
            address: anchoringContract.address,
            abi: anchoringContract.abi,
            ...(Array.isArray(tokenIds)
              ? { functionName: 'stakeMany', args: [tokenIds] }
              : { functionName: 'stake', args: [tokenIds] }),
          }),
        successMessage: t('anchor.anchored', { count }),
        failureMessage: t('anchor.failed'),
        errorContext: 'anchor',
        onConfirmed: () => deferUntilIndexed(invalidateAnchoringQueries),
      });
    },
    [
      cosmicSignatureContract,
      cstAnchoringContract,
      deferUntilIndexed,
      invalidateAnchoringQueries,
      notify,
      rwalkContract,
      rwlkAnchoringContract,
      stakingCst,
      stakingRwalk,
      t,
      runTx,
    ],
  );

  const release = useCallback(
    async (actionIds: number | number[], isRwalk: boolean): Promise<TxResult> => {
      const anchoringContract = isRwalk ? rwlkAnchoringContract : cstAnchoringContract;
      if (!anchoringContract) {
        notify('error', t('anchor.walletNotReady', { network: REQUIRED_CHAIN_NAME }));
        return NOT_RUN;
      }
      const count = Array.isArray(actionIds) ? actionIds.length : 1;

      return runTx({
        write: (ctx) =>
          ctx.writeContract({
            address: anchoringContract.address,
            abi: anchoringContract.abi,
            ...(Array.isArray(actionIds)
              ? { functionName: 'unstakeMany', args: [actionIds] }
              : { functionName: 'unstake', args: [actionIds] }),
          }),
        // Releasing a Cosmic Signature NFT also retrieves its accumulated ETH Anchor
        // Distributions: the toast says so. A Random Walk NFT has none to retrieve.
        successMessage: isRwalk
          ? t('anchor.released', { count })
          : t('anchor.releasedWithDistributions', { count }),
        failureMessage: t('anchor.failed'),
        errorContext: 'anchor-release',
        onConfirmed: () => deferUntilIndexed(invalidateAnchoringQueries),
      });
    },
    [
      cstAnchoringContract,
      deferUntilIndexed,
      invalidateAnchoringQueries,
      notify,
      rwlkAnchoringContract,
      t,
      runTx,
    ],
  );

  return { anchor, release, handleError, rwalkContract, txStage };
}

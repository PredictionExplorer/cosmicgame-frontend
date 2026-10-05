import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Hash } from 'viem';

import { prizesWalletAbi } from '@/contracts/abis';

import {
  groupByHoldingWallet,
  tokenClaimKey,
  uniqueRounds,
  type WalletRetrievalPlan,
} from '@/utils/allocationRetrieval';
import { useApiData } from '@/contexts/ApiDataContext';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, type TxResult } from '@/hooks/useTxFlow';
import { toDonatedErc20ClaimAmountBigInt } from '@/utils/donatedErc20';

interface ClaimingState {
  /** The one-transaction retrieval of everything PrizesWallet holds for the wallet. */
  everything: boolean;
  raffleETH: boolean;
  donatedNFT: boolean;
  donatedERC20: boolean;
}

/** What `retrieveEverything` sends: one `withdrawEverything` per holding wallet. */
export interface RetrieveEverythingRequest {
  /** Per-wallet lists (utils/allocationRetrieval `buildRetrievalPlan`). */
  walletPlans: readonly WalletRetrievalPlan[];
  /** The success toast, written by the page that knows what was retrieved. */
  successMessage: string;
}

type ClaimingFlag = keyof ClaimingState;

/** One Allocations wallet (PrizesWallet) write. */
interface RetrieveCall {
  functionName:
    | 'withdrawEverything'
    | 'claimDonatedNft'
    | 'claimManyDonatedNfts'
    | 'claimDonatedToken'
    | 'claimManyDonatedTokens';
  args: readonly unknown[];
}

const NOT_RUN: TxResult = { status: 'aborted' };

/**
 * Retrieve operations for the My Allocations page: everything at once
 * (`withdrawEverything`: ETH, attached ERC-20 tokens and attached NFTs in one
 * transaction), Stellar Selection ETH, attached NFTs (single + batch) and
 * attached ERC-20 tokens (single + batch).
 *
 * The game can be pointed at a replacement stellar-selection wallet; assets
 * deposited into a superseded wallet stay there until retrieved. Batch
 * operations therefore group rows by the wallet holding them and send one
 * transaction per wallet, in order, stopping at the first that does not
 * confirm; single-row operations target the row's own wallet.
 *
 * Every write runs through `useTxFlow`: the chain guard, the single lifecycle
 * toast (confirm in wallet → pending with an explorer link → confirmed), a
 * localized cause-plus-next-step message on failure, and a neutral notice when
 * the wallet prompt is dismissed. The per-operation flags stay for the
 * buttons; `txStage` is the shared lifecycle for a `TxStatus` strip.
 *
 * ERC-20 retrievals use raw token base-unit amounts from the API/contract,
 * never human-readable display amounts.
 */
export function useClaimAllocations(onSuccess?: () => void) {
  const t = useTranslations('toasts');
  const { notify } = useNotify();
  const { fetchData: fetchStatusData } = useApiData();
  const { prizesWallet } = useContractAddresses();
  const { run: runTx, stage: txStage } = useTxFlow();

  const [isClaiming, setIsClaiming] = useState<ClaimingState>({
    everything: false,
    raffleETH: false,
    donatedNFT: false,
    donatedERC20: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  /** `tokenClaimKey`s of the attached tokens being retrieved one by one. */
  const [claimingDonatedTokens, setClaimingDonatedTokens] = useState<string[]>([]);

  // Post-transaction effects must never setState on an unmounted component
  // (the person can navigate away while a transaction is pending).
  const mountedRef = useRef(true);
  // Pending burst-refresh timers (see refreshAfterClaim); cleared on unmount
  // and whenever a new claim lands so bursts never overlap.
  const refreshTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    mountedRef.current = true;
    const timers = refreshTimersRef.current;
    return () => {
      mountedRef.current = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  /**
   * Refreshes page data after a claim transaction has been confirmed.
   *
   * By the time this runs the receipt has landed, so on-chain state (e.g. the
   * PrizesWallet ETH balance dropping to zero) is already final. The API,
   * however, lags behind while the backend indexer processes the new block:
   * a single immediate refetch usually returns pre-claim data and the page
   * then sits stale until the next slow polling cycle. Refetching in a short
   * burst makes the page converge as soon as the backend has indexed the
   * claim — typically the first or second retry — at the cost of a few extra
   * lightweight API calls. React Query only re-renders when the data
   * actually changes, so intermediate stale responses are invisible.
   */
  const refreshAfterClaim = useCallback(() => {
    if (!mountedRef.current) return;
    refreshTimersRef.current.forEach(clearTimeout);
    refreshTimersRef.current = [];
    const refresh = () => {
      fetchStatusData();
      onSuccess?.();
    };
    refresh();
    for (const delayMs of [1_500, 3_000, 5_000, 8_000, 12_000]) {
      refreshTimersRef.current.push(
        setTimeout(() => {
          if (mountedRef.current) refresh();
        }, delayMs),
      );
    }
  }, [fetchStatusData, onSuccess]);

  /**
   * Runs one retrieve transaction through the shared flow, which checks the
   * Allocations wallet against the game's own record of it (or, for a
   * superseded wallet, its on-chain lineage) and simulates the call before
   * the wallet prompt. `buildCall` runs inside the flow, so an amount it
   * cannot convert fails like any other write, before anything is sent.
   *
   * `walletAddr` targets the stellar-selection wallet holding the items;
   * without one the currently configured wallet takes the call (rows from a
   * backend that predates multi-wallet support carry no address).
   */
  const retrieve = useCallback(
    async (
      buildCall: () => RetrieveCall,
      successMessage: string | null,
      errorContext: string,
      walletAddr?: string,
    ): Promise<TxResult> => {
      const target = walletAddr ?? prizesWallet;
      if (!target) {
        notify('error', t('claim.walletNotConnected'));
        return NOT_RUN;
      }
      return runTx({
        write: (ctx): Promise<Hash> => {
          const { functionName, args } = buildCall();
          return ctx.writeContract({
            address: target as `0x${string}`,
            abi: prizesWalletAbi,
            functionName,
            args,
          });
        },
        successMessage,
        failureMessage: t('claim.failed'),
        errorContext,
        onConfirmed: refreshAfterClaim,
      });
    },
    [notify, prizesWallet, refreshAfterClaim, runTx, t],
  );

  /**
   * One retrieve transaction per holding wallet, in order. A group whose
   * transaction does not confirm stops the sequence (its own toast already
   * explains why); only the last group shows the success toast, so one
   * retrieval reads as one action however many wallets it spans.
   */
  const retrieveForEachWallet = useCallback(
    async <G extends { walletAddr?: string }>(
      groups: readonly G[],
      buildCallFor: (group: G) => RetrieveCall,
      successMessage: string,
      errorContext: string,
    ): Promise<TxResult> => {
      let result: TxResult = NOT_RUN;
      for (let i = 0; i < groups.length; i += 1) {
        const group = groups[i];
        if (!group) continue;
        const last = i === groups.length - 1;
        result = await retrieve(
          () => buildCallFor(group),
          last ? successMessage : null,
          errorContext,
          group.walletAddr,
        );
        if (result.status !== 'confirmed') return result;
      }
      return result;
    },
    [retrieve],
  );

  const withFlag = useCallback(
    async (flag: ClaimingFlag, action: () => Promise<TxResult>): Promise<TxResult> => {
      setIsClaiming((prev) => ({ ...prev, [flag]: true }));
      try {
        return await action();
      } finally {
        if (mountedRef.current) setIsClaiming((prev) => ({ ...prev, [flag]: false }));
      }
    },
    [],
  );

  const retrieveEverything = useCallback(
    async ({ walletPlans, successMessage }: RetrieveEverythingRequest): Promise<void> => {
      const plans = walletPlans.filter(
        (plan) =>
          plan.ethRounds.length > 0 || plan.nftIndexes.length > 0 || plan.tokenClaims.length > 0,
      );
      if (plans.length === 0) return;
      await withFlag('everything', () =>
        retrieveForEachWallet(
          plans,
          (plan) => {
            // Inside the flow, so a display-unit amount fails like any other
            // write, before anything is sent. walletAddr is routing data,
            // never part of the encoded call.
            const tokens = plan.tokenClaims.map(({ roundNum, tokenAddress, amount }) => ({
              roundNum,
              tokenAddress,
              amount: toDonatedErc20ClaimAmountBigInt(amount),
            }));
            return {
              functionName: 'withdrawEverything',
              args: [uniqueRounds(plan.ethRounds), tokens, [...new Set(plan.nftIndexes)]],
            };
          },
          successMessage,
          'retrieve everything',
        ),
      );
    },
    [retrieveForEachWallet, withFlag],
  );

  const retrieveAllStellarSelectionETH = useCallback(
    async (
      deposits: readonly { roundNum: number | null | undefined; walletAddr?: string }[],
    ): Promise<void> => {
      const groups = groupByHoldingWallet(deposits).filter(
        (group) => uniqueRounds(group.rows.map((row) => row.roundNum)).length > 0,
      );
      if (groups.length === 0) return;
      await withFlag('raffleETH', () =>
        retrieveForEachWallet(
          groups,
          (group) => ({
            functionName: 'withdrawEverything',
            args: [uniqueRounds(group.rows.map((row) => row.roundNum)), [], []],
          }),
          t('claim.stellarEthSuccess'),
          'retrieve all Stellar Selection ETH',
        ),
      );
    },
    [retrieveForEachWallet, t, withFlag],
  );

  const claimDonatedNFT = useCallback(
    async (tokenID: number, walletAddr?: string): Promise<void> => {
      setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
      try {
        await retrieve(
          () => ({ functionName: 'claimDonatedNft', args: [tokenID] }),
          t('claim.nftSuccess'),
          'retrieve attached NFT',
          walletAddr,
        );
      } finally {
        if (mountedRef.current) {
          setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
        }
      }
    },
    [retrieve, t],
  );

  const claimAllDonatedNFTs = useCallback(
    async (nfts: readonly { index: number; walletAddr?: string }[]): Promise<void> => {
      if (nfts.length === 0) return;
      await withFlag('donatedNFT', () =>
        retrieveForEachWallet(
          groupByHoldingWallet(nfts),
          (group) => ({
            functionName: 'claimManyDonatedNfts',
            args: [group.rows.map((row) => row.index)],
          }),
          t('claim.nftsSuccess', { count: nfts.length }),
          'retrieve all attached NFTs',
        ),
      );
    },
    [retrieveForEachWallet, t, withFlag],
  );

  const claimDonatedERC20 = useCallback(
    async (
      roundNum: number,
      tokenAddr: string,
      amount: string | number | bigint,
      walletAddr?: string,
    ): Promise<void> => {
      const key = tokenClaimKey(roundNum, tokenAddr);
      setClaimingDonatedTokens((prev) => [...prev, key]);
      try {
        await retrieve(
          () => ({
            functionName: 'claimDonatedToken',
            args: [roundNum, tokenAddr, toDonatedErc20ClaimAmountBigInt(amount)],
          }),
          t('claim.tokenSuccess'),
          'retrieve attached ERC20 token',
          walletAddr,
        );
      } finally {
        if (mountedRef.current) {
          setClaimingDonatedTokens((prev) => prev.filter((pending) => pending !== key));
        }
      }
    },
    [retrieve, t],
  );

  const claimAllDonatedERC20 = useCallback(
    async (
      tokens: readonly {
        roundNum: number;
        tokenAddress: string;
        amount: string | number | bigint | null | undefined;
        walletAddr?: string;
      }[],
    ): Promise<void> => {
      if (tokens.length === 0) return;
      await withFlag('donatedERC20', () =>
        retrieveForEachWallet(
          groupByHoldingWallet(tokens),
          (group) => {
            // Inside the flow, so an amount in display units (which would be
            // scaled wrongly) fails like any other write, before anything is
            // sent. walletAddr is routing data, never part of the encoded call.
            const rawTokens = group.rows.map(({ roundNum, tokenAddress, amount }) => ({
              roundNum,
              tokenAddress,
              amount: toDonatedErc20ClaimAmountBigInt(amount),
            }));
            return { functionName: 'claimManyDonatedTokens', args: [rawTokens] };
          },
          t('claim.tokensSuccess', { count: tokens.length }),
          'retrieve all attached ERC20 tokens',
        ),
      );
    },
    [retrieveForEachWallet, t, withFlag],
  );

  return {
    isClaiming,
    claimingDonatedNFTs,
    claimingDonatedTokens,
    /** Shared lifecycle of the latest retrieve, for a `TxStatus` strip. */
    txStage,
    retrieveEverything,
    retrieveAllStellarSelectionETH,
    claimDonatedNFT,
    claimAllDonatedNFTs,
    claimDonatedERC20,
    claimAllDonatedERC20,
  };
}

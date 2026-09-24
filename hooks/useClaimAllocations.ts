import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Hash } from 'viem';

import { tokenClaimKey, uniqueRounds, type TokenClaim } from '@/components/winnings/retrieval';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, type TxResult } from '@/hooks/useTxFlow';
import { toDonatedErc20ClaimAmountBigInt } from '@/utils/donatedErc20';
import { assertTransactionHash } from '@/utils/transactions';

import useStellarSelectionWalletContract from './useStellarSelectionWalletContract';

interface ClaimingState {
  /** The one-transaction retrieval of everything PrizesWallet holds for the wallet. */
  everything: boolean;
  raffleETH: boolean;
  donatedNFT: boolean;
  donatedERC20: boolean;
}

/** What `retrieveEverything` sends in its single `withdrawEverything` transaction. */
export interface RetrieveEverythingRequest {
  /** Cycles with unretrieved ETH (duplicates are dropped). */
  ethRounds: readonly number[];
  /** Attached ERC-20 tokens, with raw base-unit amounts. */
  tokenClaims: readonly TokenClaim[];
  /** PrizesWallet indexes of attached NFTs. */
  nftIndexes: readonly number[];
  /** The success toast, written by the page that knows what was retrieved. */
  successMessage: string;
}

type ClaimingFlag = keyof ClaimingState;

const NOT_RUN: TxResult = { status: 'aborted' };

/**
 * Retrieve operations for the My Allocations page: everything at once
 * (`withdrawEverything`: ETH, attached ERC-20 tokens and attached NFTs in one
 * transaction), Stellar Selection ETH, attached NFTs (single + batch) and
 * attached ERC-20 tokens (single + batch).
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
  const stellarSelectionWalletContract = useStellarSelectionWalletContract();
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
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshAfterClaim = useCallback(() => {
    if (!mountedRef.current) return;
    fetchStatusData();
    onSuccess?.();
  }, [fetchStatusData, onSuccess]);

  /**
   * Runs one retrieve transaction through the shared flow. `send` returns the
   * contract write's hash; a missing hash is a failure, never a success.
   */
  const retrieve = useCallback(
    async (
      send: (
        contract: NonNullable<typeof stellarSelectionWalletContract>,
      ) => Promise<unknown> | undefined,
      successMessage: string,
      errorContext: string,
    ): Promise<TxResult> => {
      const contract = stellarSelectionWalletContract;
      if (!contract) {
        notify('error', t('claim.walletNotConnected'));
        return NOT_RUN;
      }
      return runTx({
        write: async () => {
          const hash = (await send(contract)) as Hash | undefined;
          assertTransactionHash(hash);
          return hash;
        },
        successMessage,
        failureMessage: t('claim.failed'),
        errorContext,
        onConfirmed: refreshAfterClaim,
      });
    },
    [notify, refreshAfterClaim, stellarSelectionWalletContract, runTx, t],
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
    async ({
      ethRounds,
      tokenClaims,
      nftIndexes,
      successMessage,
    }: RetrieveEverythingRequest): Promise<void> => {
      await withFlag('everything', () =>
        retrieve(
          (contract) => {
            // Inside the flow, so a display-unit amount fails like any other
            // write, before anything is sent.
            const tokens = tokenClaims.map((claim) => ({
              ...claim,
              amount: toDonatedErc20ClaimAmountBigInt(claim.amount),
            }));
            return contract.write.withdrawEverything?.([
              uniqueRounds(ethRounds),
              tokens,
              [...new Set(nftIndexes)],
            ]);
          },
          successMessage,
          'retrieve everything',
        ),
      );
    },
    [retrieve, withFlag],
  );

  const retrieveAllStellarSelectionETH = useCallback(
    async (roundNums: readonly number[]): Promise<void> => {
      await withFlag('raffleETH', () =>
        retrieve(
          (contract) => contract.write.withdrawEverything?.([uniqueRounds(roundNums), [], []]),
          t('claim.stellarEthSuccess'),
          'retrieve all Stellar Selection ETH',
        ),
      );
    },
    [retrieve, t, withFlag],
  );

  const claimDonatedNFT = useCallback(
    async (tokenID: number): Promise<void> => {
      setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
      try {
        await retrieve(
          (contract) => contract.write.claimDonatedNft?.([tokenID]),
          t('claim.nftSuccess'),
          'retrieve attached NFT',
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
    async (indexList: number[]): Promise<void> => {
      await withFlag('donatedNFT', () =>
        retrieve(
          (contract) => contract.write.claimManyDonatedNfts?.([indexList]),
          t('claim.nftsSuccess', { count: indexList.length }),
          'retrieve all attached NFTs',
        ),
      );
    },
    [retrieve, t, withFlag],
  );

  const claimDonatedERC20 = useCallback(
    async (
      roundNum: number,
      tokenAddr: string,
      amount: string | number | bigint,
    ): Promise<void> => {
      const key = tokenClaimKey(roundNum, tokenAddr);
      setClaimingDonatedTokens((prev) => [...prev, key]);
      try {
        await retrieve(
          (contract) =>
            contract.write.claimDonatedToken?.([
              roundNum,
              tokenAddr,
              toDonatedErc20ClaimAmountBigInt(amount),
            ]),
          t('claim.tokenSuccess'),
          'retrieve attached ERC20 token',
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
      tokens: {
        roundNum: number;
        tokenAddress: string;
        amount: string | number | bigint | null | undefined;
      }[],
    ): Promise<void> => {
      await withFlag('donatedERC20', () =>
        retrieve(
          (contract) => {
            // Inside the flow, so an amount in display units (which would be
            // scaled wrongly) fails like any other write, before anything is sent.
            const rawTokens = tokens.map((token) => ({
              ...token,
              amount: toDonatedErc20ClaimAmountBigInt(token.amount),
            }));
            return contract.write.claimManyDonatedTokens?.([rawTokens]);
          },
          t('claim.tokensSuccess', { count: tokens.length }),
          'retrieve all attached ERC20 tokens',
        ),
      );
    },
    [retrieve, t, withFlag],
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

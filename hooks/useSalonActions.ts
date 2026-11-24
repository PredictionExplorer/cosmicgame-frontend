import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import type { Abi, Address } from 'viem';

import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, type TxResult, type TxWriteRequest } from '@/hooks/useTxFlow';
import { useFormat } from '@/hooks/useFormat';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import type { TxErrorInfo } from '@/lib/txErrors';

import useSalonContract from './useSalonContract';
import { SALON_CREDIT_QUERY_KEY, SALON_LOTS_QUERY_KEY } from './useSalonLots';

/** The indexer needs a beat after the receipt before API-served lists change. */
const INDEXER_SETTLE_MS = 2000;

/** Chain-read queries: fresh the moment the receipt lands. */
const CHAIN_QUERY_KEYS = [SALON_LOTS_QUERY_KEY, SALON_CREDIT_QUERY_KEY] as const;

/** API-served queries a retrieved piece changes (the wallet's Signatures). */
const INDEXED_QUERY_KEYS = ['cstTokensByUser', 'dashboardInfo'] as const;

const NOT_RUN: TxResult = { status: 'aborted' };

/**
 * The salon's four writes — placing an offer, concluding a lot, retrieving
 * the piece, and retrieving returned offers — all through `useTxFlow`
 * (chain guard, on-chain target check, simulation, one lifecycle toast).
 *
 * An offer names its full amount; the ETH it must carry depends on who
 * leads: raising one's own leading offer sends only the difference, any
 * other offer sends the full amount, and the contract rejects anything
 * else to the wei (`IncorrectBidFunding`). The amount is therefore read
 * fresh from the chain right before the write, and a stale page state ends
 * here as a friendly "the offers moved" instead of a wallet error.
 */
export function useSalonActions() {
  const t = useTranslations('toasts');
  const format = useFormat();
  const { notify } = useNotify();
  const queryClient = useQueryClient();
  const { run: runTx, stage: txStage } = useTxFlow();
  const salonContract = useSalonContract();

  const invalidateChainQueries = useCallback(() => {
    for (const key of CHAIN_QUERY_KEYS) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  }, [queryClient]);

  const pendingTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(
    () => () => {
      for (const timerId of pendingTimers.current) clearTimeout(timerId);
      pendingTimers.current.clear();
    },
    [],
  );

  /** Chain queries refresh at once; API-served lists after the indexer settles. */
  const refreshAfterWrite = useCallback(() => {
    invalidateChainQueries();
    const timers = pendingTimers.current;
    const timerId = setTimeout(() => {
      timers.delete(timerId);
      for (const key of INDEXED_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    }, INDEXER_SETTLE_MS);
    timers.add(timerId);
  }, [invalidateChainQueries, queryClient]);

  /** Flow-specific copy for the races the simulation catches. */
  const describeSalonError = useCallback(
    (_err: unknown, info: TxErrorInfo): string | null => {
      switch (info.contractErrorName) {
        // lexicon-allow-start: contract custom-error names
        case 'BidTooLow':
        case 'IncorrectBidFunding':
          return t('salon.offersMoved');
        case 'AuctionEnded':
        case 'AuctionAlreadySettled':
          return t('salon.lotClosed');
        case 'AuctionNotEligible':
          return t('salon.lotNotOpen');
        // lexicon-allow-end
        default:
          return null;
      }
    },
    [t],
  );

  /**
   * Places (or raises to) `totalOffer` wei on a lot. The previous leading
   * offer is re-read right before the write to fund the exact difference.
   */
  const placeOffer = useCallback(
    async (nftId: number, totalOffer: bigint): Promise<TxResult> => {
      if (!salonContract) {
        notify('error', t('salon.walletNotReady', { network: REQUIRED_CHAIN_NAME }));
        return NOT_RUN;
      }

      return runTx({
        write: async (ctx) => {
          const id = BigInt(nftId);
          // The exact funding rule needs the leading offer as the contract
          // sees it now, not as the page last rendered it. An offer that
          // became too low in the meantime is caught by the simulation and
          // reads as "the offers moved" (`describeSalonError`).
          const state = await salonContract.read.getAuction([id]);
          const leadsAlready = state.highestBidder.toLowerCase() === ctx.account.toLowerCase();
          const value = leadsAlready ? totalOffer - state.highestBid : totalOffer;
          // The generic write-request type cannot see that this function is
          // payable, so `value` types as undefined; cast as the ETH gesture
          // write does for the same reason.
          return ctx.writeContract({
            address: salonContract.address,
            abi: salonContract.abi as Abi,
            functionName: 'bid', // lexicon-allow-abi
            args: [id, totalOffer],
            value,
          } as unknown as TxWriteRequest);
        },
        successMessage: t('salon.offerPlaced', {
          amount: format.amount(totalOffer, { unit: 'ETH', context: 'exact' }),
          nftId,
        }),
        failureMessage: t('salon.offerFailed'),
        describeError: describeSalonError,
        errorContext: 'salon-offer',
        onConfirmed: refreshAfterWrite,
      });
    },
    [describeSalonError, format, notify, refreshAfterWrite, runTx, salonContract, t],
  );

  /** Concludes a lot whose window has closed. Anyone may; the chain checks. */
  const concludeLot = useCallback(
    async (nftId: number): Promise<TxResult> => {
      if (!salonContract) {
        notify('error', t('salon.walletNotReady', { network: REQUIRED_CHAIN_NAME }));
        return NOT_RUN;
      }
      return runTx({
        write: (ctx) =>
          ctx.writeContract({
            address: salonContract.address,
            abi: salonContract.abi,
            functionName: 'settle',
            args: [BigInt(nftId)],
          }),
        successMessage: t('salon.lotConcluded', { nftId }),
        failureMessage: t('salon.concludeFailed'),
        describeError: describeSalonError,
        errorContext: 'salon-conclude',
        onConfirmed: refreshAfterWrite,
      });
    },
    [describeSalonError, notify, refreshAfterWrite, runTx, salonContract, t],
  );

  /** Retrieves a concluded piece to the recipient's own wallet. */
  const retrievePiece = useCallback(
    async (nftId: number): Promise<TxResult> => {
      if (!salonContract) {
        notify('error', t('salon.walletNotReady', { network: REQUIRED_CHAIN_NAME }));
        return NOT_RUN;
      }
      return runTx({
        write: (ctx) =>
          ctx.writeContract({
            address: salonContract.address,
            abi: salonContract.abi,
            functionName: 'claimNft',
            args: [BigInt(nftId), ctx.account],
          }),
        successMessage: t('salon.pieceRetrieved', { nftId }),
        failureMessage: t('salon.retrieveFailed'),
        describeError: describeSalonError,
        errorContext: 'salon-retrieve',
        onConfirmed: refreshAfterWrite,
      });
    },
    [describeSalonError, notify, refreshAfterWrite, runTx, salonContract, t],
  );

  /** Retrieves the wallet's returned offers (held after being outdone). */
  const retrieveReturnedOffers = useCallback(
    async (amount: bigint): Promise<TxResult> => {
      if (!salonContract) {
        notify('error', t('salon.walletNotReady', { network: REQUIRED_CHAIN_NAME }));
        return NOT_RUN;
      }
      return runTx({
        write: (ctx) =>
          ctx.writeContract({
            address: salonContract.address,
            abi: salonContract.abi,
            functionName: 'withdrawRefund',
            args: [ctx.account as Address],
          }),
        successMessage: t('salon.returnedOffersRetrieved', {
          amount: format.amount(amount, { unit: 'ETH', context: 'exact' }),
        }),
        failureMessage: t('salon.retrieveFailed'),
        describeError: describeSalonError,
        errorContext: 'salon-returned-offers',
        onConfirmed: refreshAfterWrite,
      });
    },
    [describeSalonError, format, notify, refreshAfterWrite, runTx, salonContract, t],
  );

  return { placeOffer, concludeLot, retrievePiece, retrieveReturnedOffers, txStage };
}

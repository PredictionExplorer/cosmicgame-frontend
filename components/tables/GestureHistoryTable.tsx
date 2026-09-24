'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { useTranslations } from 'next-intl';

import { getRWLKImageUrl, getExplorerUrl } from '@/utils';
import ERC20_ABI from '@/contracts/CosmicToken.json';

import { formatAddress, type AmountUnit } from '@/utils/format';
import { Amount } from '@/components/ui/amount';
import { DataTable, ExternalTableLink, type DataTableColumn } from '@/components/ui/data-table';
import { Duration } from '@/components/ui/duration';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GestureMethodTag, resolveGestureType } from '@/components/tables/GestureMethodTag';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';

interface GestureHistory {
  EvtLogId: number;
  TimeStamp: number;
  BidderAddr: string;
  EthPriceEth?: number;
  CstPriceEth?: number;
  GestureType: number;
  RoundNum?: number;
  RWalkNFTId?: number;
  NFTDonationTokenAddr?: string;
  NFTDonationTokenId?: number;
  DonatedERC20TokenAddr?: string;
  DonatedERC20TokenAmount?: string;
  Message?: string;
}

interface GestureHistoryTableProps extends LedgerStateProps {
  gestureHistory: GestureHistory[];
  /** Show each gesture's cycle; a page about one cycle hides it. Default `true`. */
  showRound?: boolean;
  /**
   * Show who made each gesture. A participant's own page hides it: every row
   * would repeat the address in the page's title. Default `true`.
   */
  showParticipant?: boolean;
  /**
   * Show how long each gesture stayed the latest one. That needs every
   * gesture of the cycle in the list, so a participant's page, which lists
   * only theirs, hides it rather than show the gap between their own
   * gestures. Default `true`.
   */
  showHold?: boolean;
}

const CST_GESTURE = 2;
const RANDOM_WALK_GESTURE = 1;

function hasGestureInfo(gesture: GestureHistory): boolean {
  return (
    (resolveGestureType(gesture) === RANDOM_WALK_GESTURE && Boolean(gesture.RWalkNFTId)) ||
    Boolean(gesture.NFTDonationTokenAddr) ||
    Boolean(gesture.DonatedERC20TokenAddr)
  );
}

/** Reads an attached ERC-20's symbol and decimals from its contract. */
function useErc20Meta(tokenAddr: string | undefined) {
  const publicClient = usePublicClient();
  const [meta, setMeta] = useState<{ symbol: string; decimals: number } | null>(null);

  useEffect(() => {
    if (!tokenAddr || !publicClient) return;
    let cancelled = false;
    const read = { address: tokenAddr as `0x${string}`, abi: ERC20_ABI } as const;
    Promise.all([
      publicClient.readContract({ ...read, functionName: 'symbol' }),
      publicClient.readContract({ ...read, functionName: 'decimals' }),
    ])
      .then(([symbol, decimals]) => {
        if (cancelled) return;
        const parsed = Number(decimals);
        setMeta({ symbol: String(symbol), decimals: Number.isFinite(parsed) ? parsed : 18 });
      })
      .catch(() => {
        // A missing or non-standard ERC-20 leaves the amount unlabelled
        // rather than breaking the row.
      });
    return () => {
      cancelled = true;
    };
  }, [tokenAddr, publicClient]);

  return meta;
}

/** What else the gesture carried: a Random Walk NFT, an attached NFT or ERC-20. */
function GestureInfo({ gesture }: { gesture: GestureHistory }) {
  const t = useTranslations('tables');
  const erc20 = useErc20Meta(gesture.DonatedERC20TokenAddr);
  const gestureType = resolveGestureType(gesture);

  return (
    <span className="break-words">
      {gestureType === RANDOM_WALK_GESTURE && gesture.RWalkNFTId ? (
        <>
          {t('gestureHistory.randomWalkGesture', { id: gesture.RWalkNFTId })}{' '}
          <Image
            src={getRWLKImageUrl(gesture.RWalkNFTId.toString().padStart(6, '0'))}
            width={32}
            height={32}
            className="inline rounded-edge align-middle"
            alt={t('gestureHistory.randomWalkImageAlt')}
            unoptimized
          />
        </>
      ) : null}
      {gesture.NFTDonationTokenAddr || gesture.DonatedERC20TokenAddr ? (
        <>
          {gestureType === CST_GESTURE && t('gestureHistory.cstGesture')}
          {gestureType === 0 && t('gestureHistory.ethGesture')}
          {gesture.NFTDonationTokenAddr
            ? t('gestureHistory.nftAttached', {
                address: formatAddress(gesture.NFTDonationTokenAddr),
                id: String(gesture.NFTDonationTokenId),
              })
            : null}
          {gesture.DonatedERC20TokenAddr ? (
            <>
              {t('gestureHistory.erc20AttachedPrefix', {
                amount: formatUnits(
                  BigInt(gesture.DonatedERC20TokenAmount || '0'),
                  erc20?.decimals ?? 18,
                ),
              })}{' '}
              <ExternalTableLink href={getExplorerUrl('token', gesture.DonatedERC20TokenAddr)}>
                {erc20?.symbol ?? formatAddress(gesture.DonatedERC20TokenAddr)}
              </ExternalTableLink>
              {t('gestureHistory.attachedSuffix')}
            </>
          ) : null}
        </>
      ) : null}
    </span>
  );
}

/**
 * The latest gesture's hold, which keeps growing until the next gesture. It
 * ticks in its own cell, so the rest of the table does not re-render every
 * second, and shows nothing until the browser clock is known rather than a
 * confident "0s".
 */
function GrowingDuration({ since }: { since: number }) {
  const nowMs = useNow(1000);
  if (nowMs <= 0) return null;
  return <Duration seconds={Math.floor(nowMs / 1000) - since} />;
}

/**
 * A cycle's (or a participant's) gestures, newest first: when (leading to the
 * gesture's page), who, what it cost and how, how long it held the lead,
 * and what it carried. The info and message columns appear only when some
 * gesture has one. A participant's page passes `showParticipant={false}` and
 * `showHold={false}`.
 */
const GestureHistoryTable = ({
  gestureHistory,
  showRound = true,
  showParticipant = true,
  showHold = true,
  ...state
}: GestureHistoryTableProps) => {
  const t = useTranslations('tables');
  const { data: bannedGestures } = useBannedGestures();

  const banned = useMemo(
    () => new Set((bannedGestures ?? []).map((entry: { bid_id: number }) => entry.bid_id)),
    [bannedGestures],
  );

  // How long each gesture stayed the latest one: until the next gesture in
  // the list (which is newest first). The newest is still holding.
  const holds = useMemo(() => {
    const byId = new Map<number, number | null>();
    gestureHistory.forEach((gesture, index) => {
      const next = gestureHistory[index - 1];
      byId.set(gesture.EvtLogId, next ? next.TimeStamp - gesture.TimeStamp : null);
    });
    return byId;
  }, [gestureHistory]);

  const columns = useMemo<DataTableColumn<GestureHistory>[]>(() => {
    const cost = (gesture: GestureHistory) =>
      resolveGestureType(gesture) === CST_GESTURE ? gesture.CstPriceEth : gesture.EthPriceEth;
    const costUnit = (gesture: GestureHistory): AmountUnit =>
      resolveGestureType(gesture) === CST_GESTURE ? 'CST' : 'ETH';

    const all: (DataTableColumn<GestureHistory> | false)[] = [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (gesture) => gesture.TimeStamp,
        seconds: true,
        sortable: true,
      },
      showParticipant && {
        id: 'participant',
        kind: 'address',
        header: t('columns.participant'),
        value: (gesture) => gesture.BidderAddr,
      },
      {
        id: 'cost',
        kind: 'amount',
        header: t('columns.gestureCost'),
        value: (gesture) => {
          const amount = cost(gesture);
          return amount != null && amount >= 0 ? amount : null;
        },
        cell: (gesture, { value }) =>
          value == null ? null : (
            <Amount
              value={value as number}
              unit={costUnit(gesture)}
              context="table"
              unitClassName="text-subtle"
            />
          ),
        sortable: true,
      },
      showRound && {
        id: 'cycle',
        kind: 'link',
        header: t('columns.cycle'),
        value: (gesture) => gesture.RoundNum,
        href: (gesture) => (gesture.RoundNum == null ? null : `/allocation/${gesture.RoundNum}`),
      },
      {
        id: 'type',
        kind: 'text',
        header: t('columns.gestureType'),
        value: (gesture) => resolveGestureType(gesture),
        cell: (gesture) => (
          <GestureMethodTag
            gestureType={resolveGestureType(gesture)}
            unknownLabel={t('status.unknown')}
          />
        ),
      },
      showHold && {
        id: 'hold',
        kind: 'duration',
        header: t('columns.gestureDuration'),
        value: (gesture) => holds.get(gesture.EvtLogId) ?? Number.POSITIVE_INFINITY,
        cell: (gesture) => {
          const hold = holds.get(gesture.EvtLogId);
          return hold == null ? (
            <GrowingDuration since={gesture.TimeStamp} />
          ) : (
            <Duration seconds={hold} />
          );
        },
        sortable: true,
      },
      {
        id: 'info',
        kind: 'text',
        header: t('columns.gestureInfo'),
        value: (gesture) => (hasGestureInfo(gesture) ? gesture.EvtLogId : null),
        cell: (gesture) => (hasGestureInfo(gesture) ? <GestureInfo gesture={gesture} /> : null),
        hideWhenEmpty: true,
        stack: true,
      },
      {
        id: 'message',
        kind: 'text',
        header: t('columns.message'),
        value: (gesture) =>
          !banned.has(gesture.EvtLogId) && gesture.Message ? gesture.Message : null,
        cell: (_gesture, { value }) =>
          value ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {/*
                 * On a phone the message wraps in full: a hover tooltip never
                 * opens on touch, and tapping the row opens the gesture.
                 */}
                <span className="block break-words sm:max-w-[18rem] sm:truncate">
                  {String(value)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[min(20rem,90vw)] break-words">
                {String(value)}
              </TooltipContent>
            </Tooltip>
          ) : null,
        hideWhenEmpty: true,
        stack: true,
      },
    ];
    return all.filter((column): column is DataTableColumn<GestureHistory> => Boolean(column));
  }, [t, showRound, showParticipant, showHold, holds, banned]);

  return (
    <DataTable
      data={gestureHistory}
      columns={columns}
      ariaLabel={t('gestureHistory.tableLabel')}
      getRowKey={(gesture) => gesture.EvtLogId}
      getRowHref={(gesture) => `/gesture/${gesture.EvtLogId}`}
      getRowLabel={(gesture) => t('gestureHistory.viewGesture', { id: gesture.EvtLogId })}
      emptyTitle={t('empty.gestures')}
      {...state}
    />
  );
};

export default GestureHistoryTable;

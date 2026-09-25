'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';
import ERC20_ABI from '@/contracts/CosmicToken.json';

import { NBSP, formatAddress, formatId, formatNumber, type AmountUnit } from '@/utils/format';
import { anchorTokenHref } from '@/components/anchoring/anchorLinks';
import { Amount } from '@/components/ui/amount';
import {
  DataTable,
  ExternalTableLink,
  TableLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { Duration } from '@/components/ui/duration';
import { Skeleton } from '@/components/ui/skeleton';
import { ClampedText } from '@/components/tables/ClampedText';
import { GestureMethodTag, resolveGestureType } from '@/components/tables/GestureMethodTag';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useCycleHref } from '@/components/tables/useCycleHref';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { DateTime } from '@/components/ui/date-time';

interface GestureHistory {
  EvtLogId: number;
  TimeStamp: number;
  BidderAddr: string;
  EthPriceEth?: number;
  CstPriceEth?: number;
  GestureType: number;
  RoundNum?: number;
  /** The gesture's place in its cycle ("Gesture #1143" on its own page). */
  BidPosition?: number;
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
  /**
   * When the cycle ended (Unix seconds). The newest gesture held the lead
   * until then, so a finished cycle's last hold is a fixed figure instead of
   * a clock that keeps running. Omit it for the cycle in progress.
   */
  heldUntil?: number | null;
}

const CST_GESTURE = 2;
const RANDOM_WALK_GESTURE = 1;

/**
 * A link that is a flex item stops being inline text, so it needs its own
 * 24px target (WCAG 2.5.8) rather than borrowing the line's.
 */
const INFO_LINK_CLASS = 'inline-flex min-h-6 items-center whitespace-nowrap';

const randomWalkId = (gesture: GestureHistory): number | null =>
  resolveGestureType(gesture) === RANDOM_WALK_GESTURE &&
  typeof gesture.RWalkNFTId === 'number' &&
  gesture.RWalkNFTId >= 0
    ? gesture.RWalkNFTId
    : null;

function hasGestureInfo(gesture: GestureHistory): boolean {
  return (
    randomWalkId(gesture) !== null ||
    Boolean(gesture.NFTDonationTokenAddr) ||
    Boolean(gesture.DonatedERC20TokenAddr)
  );
}

type Erc20Meta =
  | { status: 'pending' }
  | { status: 'ready'; symbol: string; decimals: number }
  | { status: 'failed' };

/**
 * Reads an attached ERC-20's symbol and decimals from its contract, once per
 * token and chain for the session: every gesture that attaches the same
 * token, on any page of any ledger, shares the one read.
 */
function useErc20Meta(tokenAddr: string | undefined): Erc20Meta {
  const publicClient = usePublicClient();
  const query = useQuery({
    queryKey: ['erc20Meta', publicClient?.chain?.id ?? null, tokenAddr?.toLowerCase() ?? null],
    enabled: Boolean(tokenAddr && publicClient),
    // A token's symbol and decimals never change.
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
    queryFn: async () => {
      if (!tokenAddr || !publicClient) throw new Error('No token to read');
      const read = { address: tokenAddr as `0x${string}`, abi: ERC20_ABI } as const;
      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({ ...read, functionName: 'symbol' }),
        publicClient.readContract({ ...read, functionName: 'decimals' }),
      ]);
      const parsed = Number(decimals);
      return { symbol: String(symbol), decimals: Number.isFinite(parsed) ? parsed : 18 };
    },
  });

  // Without a client there is nothing to read, and a missing or
  // non-standard ERC-20 is shown by its address, with the amount read at
  // the usual 18 decimals.
  if (!tokenAddr || !publicClient || query.isError) return { status: 'failed' };
  return query.data ? { status: 'ready', ...query.data } : { status: 'pending' };
}

/** An attached ERC-20: its amount in the token's own decimals and its symbol, linked to the token. */
function AttachedErc20({ address, amount }: { address: string; amount: string | undefined }) {
  const locale = useLocale();
  const meta = useErc20Meta(address);
  if (meta.status === 'pending') {
    return <Skeleton className="inline-block h-3.5 w-24 align-middle" />;
  }
  let units: bigint;
  try {
    units = BigInt(amount || '0');
  } catch {
    units = BigInt(0);
  }
  const decimals = meta.status === 'ready' ? meta.decimals : 18;
  const figure = formatNumber(Number(formatUnits(units, decimals)), locale, {
    maximumFractionDigits: 4,
  });
  const symbol = meta.status === 'ready' ? meta.symbol : formatAddress(address);
  return (
    <ExternalTableLink href={getExplorerUrl('token', address)} className={INFO_LINK_CLASS}>
      <span className="tabular-nums">{figure}</span>
      {NBSP}
      {symbol}
    </ExternalTableLink>
  );
}

/**
 * What else the gesture carried, as data rather than a sentence (its method
 * is already in the Gesture type column): the Random Walk NFT it used, and
 * any NFT or ERC-20 attached to it, each linked to the token.
 */
function GestureInfo({ gesture }: { gesture: GestureHistory }) {
  const t = useTranslations('tables');
  const walk = randomWalkId(gesture);
  const attachedLabel = <span className="text-subtle">{t('gestureHistory.attached')}</span>;

  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      {walk !== null ? (
        <ExternalTableLink href={anchorTokenHref('randomWalk', walk)} className={INFO_LINK_CLASS}>
          {t('gestureHistory.randomWalkToken', { id: formatId(walk) })}
        </ExternalTableLink>
      ) : null}
      {gesture.NFTDonationTokenAddr ? (
        <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
          {attachedLabel}
          <ExternalTableLink
            href={`${getExplorerUrl('token', gesture.NFTDonationTokenAddr)}?a=${gesture.NFTDonationTokenId ?? ''}`}
            className={INFO_LINK_CLASS}
          >
            {t('recipientHistory.nft', { id: String(gesture.NFTDonationTokenId ?? '') })}
          </ExternalTableLink>
        </span>
      ) : null}
      {gesture.DonatedERC20TokenAddr ? (
        <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
          {attachedLabel}
          <AttachedErc20
            address={gesture.DonatedERC20TokenAddr}
            amount={gesture.DonatedERC20TokenAmount}
          />
        </span>
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
  return <Duration seconds={Math.floor(nowMs / 1000) - since} variant="clock" />;
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
  heldUntil = null,
  ...state
}: GestureHistoryTableProps) => {
  const t = useTranslations('tables');
  const { data: bannedGestures } = useBannedGestures();
  const cycleHref = useCycleHref();

  const banned = useMemo(
    () => new Set((bannedGestures ?? []).map((entry: { bid_id: number }) => entry.bid_id)),
    [bannedGestures],
  );

  const holds = useMemo(
    () => holdDurations(gestureHistory, heldUntil),
    [gestureHistory, heldUntil],
  );

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
        // A phone record opens on when the gesture was made, with its method.
        phone: 'title',
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
        // "Cycle 2", not a bare "2": a word-wide target that says where it leads.
        cell: (gesture) =>
          gesture.RoundNum == null ? null : (
            <TableLink href={cycleHref(gesture.RoundNum)}>
              {t('allocation.cycle', { cycle: gesture.RoundNum })}
            </TableLink>
          ),
        nowrap: true,
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
            // Fixed fields ("04:10:00", "1d 04:16:52"), so the right-aligned
            // column lines up instead of dropping trailing zero units.
            <Duration seconds={hold} variant="clock" />
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
          value ? <ClampedText text={String(value)} className="sm:max-w-[22rem]" /> : null,
        hideWhenEmpty: true,
        stack: true,
      },
    ];
    return all.filter((column): column is DataTableColumn<GestureHistory> => Boolean(column));
  }, [t, showRound, showParticipant, showHold, holds, banned, cycleHref]);

  const phoneColumns = useMemo(
    () => withPhoneLines(columns, gestureHistory, t('status.unknown')),
    [columns, gestureHistory, t],
  );

  return (
    <DataTable
      data={gestureHistory}
      columns={phoneColumns}
      ariaLabel={t('gestureHistory.tableLabel')}
      getRowKey={(gesture) => gesture.EvtLogId}
      // The list arrives newest first: the date header says so, and a first
      // click turns it around.
      initialSort={{ id: 'datetime', direction: 'desc' }}
      getRowHref={(gesture) => `/gesture/${gesture.EvtLogId}`}
      // The date names the link; the words after it say which gesture it
      // opens, by the number that page shows in its title.
      getRowLabel={(gesture) =>
        typeof gesture.BidPosition === 'number' && gesture.BidPosition > 0
          ? t('gestureHistory.viewGesture', { position: String(gesture.BidPosition) })
          : ''
      }
      emptyTitle={t('empty.gestures')}
      // Every row carries its date, participant and cycle as links: they
      // underline on hover and focus only, leaving the figures to be read.
      links="quiet"
      {...state}
    />
  );
};

/**
 * How long each gesture stayed the latest one, by `EvtLogId`: until the next
 * gesture of the list in time, whatever order the list arrives in. The
 * newest holds until `heldUntil` (a finished cycle's end), or is still
 * holding (`null`) while the cycle runs.
 */
export function holdDurations(
  gestures: readonly Pick<GestureHistory, 'EvtLogId' | 'TimeStamp'>[],
  heldUntil: number | null,
): Map<number, number | null> {
  const newestFirst = [...gestures].sort(
    (a, b) => b.TimeStamp - a.TimeStamp || b.EvtLogId - a.EvtLogId,
  );
  const byId = new Map<number, number | null>();
  newestFirst.forEach((gesture, index) => {
    const next = newestFirst[index - 1];
    const until = next ? next.TimeStamp : heldUntil;
    byId.set(gesture.EvtLogId, until == null ? null : Math.max(0, until - gesture.TimeStamp));
  });
  return byId;
}

/**
 * On a phone a gesture reads as lines rather than a spec sheet: its method
 * rides on the date line (the method column is hidden there, the tag beside
 * a unit that already says CST was a line of its own), and the cycle shows
 * only when the list spans more than one, so a participant's gestures in
 * one cycle do not each repeat "Cycle 2". Wider screens keep every column.
 */
function withPhoneLines(
  columns: DataTableColumn<GestureHistory>[],
  gestures: readonly GestureHistory[],
  unknownLabel: string,
): DataTableColumn<GestureHistory>[] {
  const spansCycles = new Set(gestures.map((gesture) => gesture.RoundNum)).size > 1;
  return columns.map((column): DataTableColumn<GestureHistory> => {
    if (column.id === 'type' || (column.id === 'cycle' && !spansCycles)) {
      return { ...column, priority: 'secondary' };
    }
    if (column.id !== 'datetime') return column;
    return {
      ...column,
      // The date stays inline, so the row link's underline still reaches it.
      cell: (gesture, { value }) => (
        <>
          <DateTime timestamp={typeof value === 'number' ? value : null} seconds />
          <span className="ms-2 inline-block align-middle sm:hidden">
            <GestureMethodTag
              gestureType={resolveGestureType(gesture)}
              unknownLabel={unknownLabel}
            />
          </span>
        </>
      ),
    };
  });
}

export default GestureHistoryTable;

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  TableLink,
  TableTag,
  TxProofLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { SearchField } from '@/components/ui/search-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';
import { ClampedText } from '@/components/tables/ClampedText';
import { GestureMethodTag } from '@/components/tables/GestureMethodTag';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useCycleHref } from '@/components/tables/useCycleHref';
import api from '@/services/api';
import type { BannedGesture } from '@/services/api/types';
import { useNotification } from '@/contexts/NotificationContext';
import { reportError } from '@/utils/errors';

interface GestureHistory {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  GestureType: number;
  BidderAddr: string;
  Message?: string;
}

interface BanGestureTableProps extends LedgerStateProps {
  gestureHistory: GestureHistory[];
  /**
   * The connected moderator wallet. Without one the list is read-only: the
   * Hide and Restore column is not rendered at all.
   */
  moderatorAddress?: string | null;
  /**
   * Hide and Restore stand in each row but cannot be pressed: the wallet
   * holds no operator role, or its roles are still being read.
   */
  actionsDisabled?: boolean;
  /** The id of the line that says why the actions are off (their description). */
  actionsDisabledReasonId?: string;
  /** A line under the title. */
  description?: ReactNode;
  /**
   * Shown above the filters in every state, loading and error included (the
   * read-only notice), so it never moves the list when the rows arrive.
   */
  notice?: ReactNode;
}

type Visibility = 'all' | 'visible' | 'hidden';

const VISIBILITY: readonly Visibility[] = ['all', 'visible', 'hidden'];
const ALL_CYCLES = 'all';
/** Enough messages to review at once without a page of tens of thousands of pixels. */
const MODERATION_PAGE_SIZE = 25;
/** Placeholder rows while the list loads: about a first screen of messages. */
const MODERATION_SKELETON_ROWS = 8;

/** The public ledgers' hidden list (`useBannedGestures`). */
const PUBLIC_HIDDEN_KEY = ['bannedBids'] as const;
/**
 * The moderation view's own read of the same list, strict where the public
 * one is lenient, under the public key so that one invalidation refreshes
 * both.
 */
const MODERATION_HIDDEN_KEY = [...PUBLIC_HIDDEN_KEY, 'moderation'] as const;

/**
 * Which messages are hidden, for moderation. It shares React Query's cache
 * with every public ledger (`useBannedGestures`), so a message hidden here
 * disappears there too, and its reads are deduplicated, so two quick
 * changes cannot land out of order. The read is strict: a refused or failed
 * read is an error here, never an empty list that shows every hidden
 * message as visible.
 */
function useHiddenGestures() {
  const queryClient = useQueryClient();
  const query = useQuery<BannedGesture[]>({
    queryKey: MODERATION_HIDDEN_KEY,
    queryFn: ({ signal }) => api.get_banned_bids_required({ signal }),
    staleTime: 30_000,
  });
  const ids = useMemo(() => new Set((query.data ?? []).map((entry) => entry.bid_id)), [query.data]);

  /** A confirmed change: shown at once in both caches, then read again to reconcile. */
  const apply = useCallback(
    (id: number, hidden: boolean) => {
      const update = (list: BannedGesture[] | undefined) => {
        if (!list) return list;
        const rest = list.filter((entry) => entry.bid_id !== id);
        return hidden ? [...rest, { bid_id: id }] : rest;
      };
      queryClient.setQueryData<BannedGesture[]>(MODERATION_HIDDEN_KEY, update);
      queryClient.setQueryData<BannedGesture[]>(PUBLIC_HIDDEN_KEY, update);
      void queryClient.invalidateQueries({ queryKey: PUBLIC_HIDDEN_KEY });
    },
    [queryClient],
  );

  return {
    ids,
    /** The list is known: counts and actions can be trusted. */
    ready: query.data !== undefined,
    /** The list could not be read at all. */
    failed: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
    apply,
  };
}

/**
 * Hides a message from public view, or restores it: the request, then the
 * change applied at once and a toast whose Undo sends the opposite request.
 * Only the request itself can fail the action: once it succeeds the change
 * is reported and applied, whatever happens to the refresh that follows.
 * Resolves `true` when the change went through.
 */
function useModerate(
  moderatorAddress: string | null,
  apply: (id: number, hidden: boolean) => void,
) {
  const t = useTranslations('tables');
  const { setNotification } = useNotification();
  // Undo calls the latest `moderate`, which the toast outlives.
  const latest = useRef<(id: number, hide: boolean) => Promise<boolean>>(async () => false);

  const moderate = useCallback(
    async (id: number, hide: boolean): Promise<boolean> => {
      if (!moderatorAddress) return false;
      try {
        if (hide) await api.ban_bid(id, moderatorAddress);
        else await api.unban_gesture(id);
      } catch (error) {
        reportError(error, hide ? 'ban gesture' : 'unban gesture');
        setNotification({ visible: true, type: 'error', text: t('banGesture.error') });
        return false;
      }
      apply(id, hide);
      // A hide is one press on a phone; the toast offers the way back.
      toast.success(t(hide ? 'banGesture.banned' : 'banGesture.unbanned'), {
        id: `moderation:${id}`,
        action: {
          label: t('banGesture.undo'),
          onClick: () => void latest.current(id, !hide),
        },
      });
      return true;
    },
    [moderatorAddress, apply, setNotification, t],
  );

  useEffect(() => {
    latest.current = moderate;
  }, [moderate]);

  return moderate;
}

/**
 * Hide or Restore for one message. The button keeps its label beside a
 * spinner while the request runs and ignores further presses until it
 * settles.
 */
function ModerationAction({
  gesture,
  hidden,
  disabled,
  disabledReasonId,
  onModerate,
}: {
  gesture: GestureHistory;
  hidden: boolean;
  disabled: boolean;
  disabledReasonId?: string;
  onModerate: (id: number, hide: boolean) => Promise<boolean>;
}) {
  const t = useTranslations('tables');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    await onModerate(gesture.EvtLogId, !hidden);
    setBusy(false);
  };

  return (
    <Button
      variant={hidden ? 'outline' : 'ghost'}
      size="sm"
      onClick={() => void run()}
      loading={busy}
      disabled={disabled}
      aria-describedby={disabled ? disabledReasonId : undefined}
      className="px-3"
    >
      {hidden ? t('banGesture.unban') : t('banGesture.ban')}
    </Button>
  );
}

/**
 * Where and when a message was written, as one quiet line under it on a
 * phone record ("0x1Ec1…E990 · Cycle 42 · ETH · Sep 24, 07:49"), so the
 * record opens on the message being moderated. A wide screen shows the same
 * facts in their own columns instead.
 */
function MessageMeta({ gesture, cycleHref }: { gesture: GestureHistory; cycleHref: string }) {
  const t = useTranslations('tables');
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 type-caption text-subtle sm:hidden">
      <AddressChip address={gesture.BidderAddr} variant="plain" showCopy={false} />
      <span aria-hidden>·</span>
      {/* Flex items, not inline text: each link carries its own 24px target. */}
      <TableLink href={cycleHref} className="inline-flex min-h-6 items-center">
        {t('allocation.cycle', { cycle: gesture.RoundNum })}
      </TableLink>
      <span aria-hidden>·</span>
      <GestureMethodTag gestureType={gesture.GestureType} unknownLabel={t('status.unknown')} />
      <span aria-hidden>·</span>
      <TxProofLink hash={gesture.TxHash} className="inline-flex min-h-6 items-center">
        <DateTime timestamp={gesture.TimeStamp} />
      </TxProofLink>
    </span>
  );
}

/**
 * Gesture messages for moderation, 25 at a time: filter by visibility, cycle
 * or text, then hide a message from public view or restore it. A hidden
 * message is marked with a tag and set in the subtle tier. Without a
 * moderator wallet the same list is read-only.
 *
 * The message is what is being judged, so it leads: it takes the width a
 * wide row has left, two lines at a time with "Show all" for the rest, and
 * it breaks anywhere, so a spam URL or a run of letters with no spaces can
 * never push the table wider than the page. Links in the row show their
 * underline only on hover and focus. On a phone each record opens on the
 * message, with who, which cycle, how and when on one line beneath it.
 */
const BanGestureTable = ({
  gestureHistory,
  moderatorAddress = null,
  actionsDisabled = false,
  actionsDisabledReasonId,
  description,
  notice,
  loading: listLoading = false,
  error: listError,
  onRetry: onListRetry,
  ...state
}: BanGestureTableProps) => {
  const t = useTranslations('tables');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const cycleHref = useCycleHref();
  const hidden = useHiddenGestures();
  const hiddenIds = hidden.ids;
  const moderate = useModerate(moderatorAddress, hidden.apply);
  // Until both the messages and which of them are hidden are known, the
  // list waits in its skeleton: no row offers Hide for a message that is
  // already hidden, and no filter counts "Hidden 0" before it can count.
  const loading = (listLoading && gestureHistory.length === 0) || (!hidden.ready && !hidden.failed);
  const [visibility, setVisibility] = useState<Visibility>('all');
  const [cycle, setCycle] = useState<string>(ALL_CYCLES);
  const [query, setQuery] = useState('');

  const cycles = useMemo(
    () => [...new Set(gestureHistory.map((gesture) => gesture.RoundNum))].sort((a, b) => b - a),
    [gestureHistory],
  );

  const counts = useMemo(() => {
    const hidden = gestureHistory.filter((gesture) => hiddenIds.has(gesture.EvtLogId)).length;
    return { all: gestureHistory.length, hidden, visible: gestureHistory.length - hidden };
  }, [gestureHistory, hiddenIds]);

  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return gestureHistory.filter((gesture) => {
      const hidden = hiddenIds.has(gesture.EvtLogId);
      if (visibility === 'hidden' && !hidden) return false;
      if (visibility === 'visible' && hidden) return false;
      if (cycle !== ALL_CYCLES && String(gesture.RoundNum) !== cycle) return false;
      return !needle || (gesture.Message ?? '').toLocaleLowerCase(locale).includes(needle);
    });
  }, [gestureHistory, hiddenIds, visibility, cycle, query, locale]);

  const columns = useMemo<DataTableColumn<GestureHistory>[]>(() => {
    // Date, who, cycle and method keep a fixed width from `lg`, so the
    // message column takes exactly what is left; a phone record shows them
    // on one line under the message instead (MessageMeta).
    const base: DataTableColumn<GestureHistory>[] = [
      {
        id: 'date',
        kind: 'datetime',
        header: t('columns.date'),
        value: (gesture) => gesture.TimeStamp,
        txHash: (gesture) => gesture.TxHash,
        width: '9.5rem',
        priority: 'secondary',
      },
      {
        id: 'participant',
        kind: 'address',
        header: t('columns.participant'),
        value: (gesture) => gesture.BidderAddr,
        width: '8.5rem',
        priority: 'secondary',
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('columns.cycle'),
        value: (gesture) => gesture.RoundNum,
        cell: (gesture) => (
          <TableLink href={cycleHref(gesture.RoundNum)}>
            {t('allocation.cycle', { cycle: gesture.RoundNum })}
          </TableLink>
        ),
        nowrap: true,
        width: '6.5rem',
        // A moderator judges a message by its cycle: on a phone it rides in
        // the quiet line under the message instead of a row of its own.
        priority: 'secondary',
      },
      {
        id: 'type',
        kind: 'text',
        header: t('columns.gestureType'),
        value: (gesture) => gesture.GestureType,
        cell: (gesture) => (
          <GestureMethodTag gestureType={gesture.GestureType} unknownLabel={t('status.unknown')} />
        ),
        headerClassName: 'whitespace-nowrap',
        // The widest tag ("ETH + RWLK") with its dot, plus the cell's inset.
        width: '8.75rem',
        priority: 'secondary',
      },
      {
        id: 'message',
        kind: 'text',
        header: t('columns.message'),
        // The message is what a phone record is about: it opens the record
        // with no "Message" label before it (the moderator reads 25 a page).
        label: '',
        value: (gesture) => gesture.Message,
        cell: (gesture) => {
          const hidden = hiddenIds.has(gesture.EvtLogId);
          return (
            <span className="flex min-w-0 flex-col items-start gap-1">
              {hidden ? <TableTag>{t('banGesture.hiddenTag')}</TableTag> : null}
              <ClampedText
                text={gesture.Message ?? ''}
                className={hidden ? 'text-subtle' : 'text-foreground'}
              />
              <MessageMeta gesture={gesture} cycleHref={cycleHref(gesture.RoundNum)} />
            </span>
          );
        },
        stack: true,
      },
    ];
    if (!moderatorAddress) return base;
    return [
      ...base,
      {
        id: 'action',
        kind: 'text',
        header: <span className="sr-only">{t('columns.actions')}</span>,
        // The button names itself; a phone record shows it unlabelled.
        label: '',
        align: 'end',
        width: '7rem',
        cell: (gesture) => (
          <ModerationAction
            gesture={gesture}
            hidden={hiddenIds.has(gesture.EvtLogId)}
            disabled={actionsDisabled}
            disabledReasonId={actionsDisabledReasonId}
            onModerate={moderate}
          />
        ),
      },
    ];
  }, [
    t,
    hiddenIds,
    moderate,
    moderatorAddress,
    actionsDisabled,
    actionsDisabledReasonId,
    cycleHref,
  ]);

  // The filters are there from the first paint, disabled until the list
  // arrives, so the rows land under them rather than pushing them in.
  const toolbar = (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label={t('banGesture.visibilityLabel')}
        className={tabsListVariants({ variant: 'segmented' })}
      >
        {VISIBILITY.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={visibility === option}
            data-state={visibility === option ? 'active' : 'inactive'}
            onClick={() => setVisibility(option)}
            disabled={loading}
            // 32px from sm, so the track (4px padding) matches the 40px fields beside it.
            className={cn(tabsTriggerVariants({ variant: 'segmented' }), 'sm:min-h-8 sm:py-1')}
          >
            {t(`banGesture.filters.${option}`)}
            <span className="tabular-nums text-subtle">
              {loading ? '–' : formatCount(counts[option], locale)}
            </span>
          </button>
        ))}
      </div>
      <Select value={cycle} onValueChange={setCycle} disabled={loading}>
        <SelectTrigger className="h-11 w-auto min-w-36 sm:h-10" aria-label={t('columns.cycle')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CYCLES}>{t('banGesture.allCycles')}</SelectItem>
          {cycles.map((round) => (
            <SelectItem key={round} value={String(round)}>
              {t('allocation.cycle', { cycle: round })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SearchField
        value={query}
        onValueChange={setQuery}
        aria-label={t('banGesture.search')}
        placeholder={t('banGesture.search')}
        clearLabel={tAdmin('moderation.clearSearch')}
        disabled={loading}
        containerClassName="min-w-0 flex-1 basis-56"
      />
    </div>
  );

  const filtered = rows.length !== gestureHistory.length;
  // The messages failing to load wins; otherwise a hidden list that cannot
  // be read is an error of its own, with its own retry.
  const error = listError ?? (hidden.failed ? t('banGesture.hiddenLoadError') : undefined);

  return (
    <DataTable
      // Without the hidden list every message would read as visible, so none
      // shows: the table's error replaces it. (A failed refresh of the
      // messages alone keeps the rows already on screen.)
      data={loading || hidden.failed ? [] : rows}
      columns={columns}
      ariaLabel={t('names.gestureMessages')}
      description={description}
      notice={notice ? <div className="mb-4">{notice}</div> : undefined}
      // An empty list has nothing to filter; a filtered-out one keeps the
      // filters so they can be cleared.
      toolbar={gestureHistory.length > 0 || loading ? toolbar : undefined}
      getRowKey={(gesture) => gesture.EvtLogId}
      emptyTitle={filtered ? t('banGesture.noMatches') : t('empty.gestureHistory')}
      pageSize={MODERATION_PAGE_SIZE}
      resetPageKey={`${visibility}|${cycle}|${query}`}
      layout="cards"
      links="quiet"
      width="fill"
      tableClassName="lg:table-fixed"
      skeletonRows={MODERATION_SKELETON_ROWS}
      {...state}
      loading={loading}
      error={error}
      onRetry={listError ? onListRetry : hidden.failed ? hidden.retry : undefined}
    />
  );
};

export default BanGestureTable;

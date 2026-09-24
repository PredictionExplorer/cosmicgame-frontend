'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { DataTable, TableTag, type DataTableColumn } from '@/components/ui/data-table';
import { SearchField } from '@/components/ui/search-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GestureMethodTag } from '@/components/tables/GestureMethodTag';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import api from '@/services/api';
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
  /** A line under the title. */
  description?: ReactNode;
  /** Shown above the filters (the read-only notice). */
  notice?: ReactNode;
}

type Visibility = 'all' | 'visible' | 'hidden';

const VISIBILITY: readonly Visibility[] = ['all', 'visible', 'hidden'];
const ALL_CYCLES = 'all';
/** Enough messages to review at once without a page of tens of thousands of pixels. */
const MODERATION_PAGE_SIZE = 25;

/**
 * Hides a gesture's message from public view, or restores it. The button
 * keeps its label beside a spinner while the request runs and ignores
 * further presses until it settles. Only the hide or restore request can
 * fail the action: once it succeeds the change is reported and applied,
 * whatever happens to the list refresh that follows.
 */
function ModerationAction({
  gesture,
  hidden,
  moderatorAddress,
  onChanged,
}: {
  gesture: GestureHistory;
  hidden: boolean;
  moderatorAddress: string;
  /** The request succeeded: the gesture is now hidden (`true`) or visible. */
  onChanged: (id: number, hidden: boolean) => void;
}) {
  const t = useTranslations('tables');
  const { setNotification } = useNotification();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      if (hidden) await api.unban_gesture(gesture.EvtLogId);
      else await api.ban_bid(gesture.EvtLogId, moderatorAddress);
    } catch (error) {
      reportError(error, hidden ? 'unban gesture' : 'ban gesture');
      setNotification({ visible: true, type: 'error', text: t('banGesture.error') });
      setBusy(false);
      return;
    }
    setBusy(false);
    onChanged(gesture.EvtLogId, !hidden);
    setNotification({
      visible: true,
      type: 'success',
      text: t(hidden ? 'banGesture.unbanned' : 'banGesture.banned'),
    });
  };

  return (
    <Button
      variant={hidden ? 'outline' : 'ghost'}
      size="sm"
      onClick={() => void run()}
      loading={busy}
      className="px-3"
    >
      {hidden ? t('banGesture.unban') : t('banGesture.ban')}
    </Button>
  );
}

/**
 * Gesture messages for moderation, 25 at a time: filter by visibility, cycle
 * or text, then hide a message from public view or restore it. A hidden
 * message is marked with a tag and set in the subtle tier. Without a
 * moderator wallet the same list is read-only.
 */
const BanGestureTable = ({
  gestureHistory,
  moderatorAddress = null,
  description,
  notice,
  ...state
}: BanGestureTableProps) => {
  const t = useTranslations('tables');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(() => new Set());
  const [visibility, setVisibility] = useState<Visibility>('all');
  const [cycle, setCycle] = useState<string>(ALL_CYCLES);
  const [query, setQuery] = useState('');

  /** Reads the hidden list; a failed read keeps the list as it is and is reported. */
  const refreshHidden = useCallback(async () => {
    try {
      const hidden = await api.get_banned_bids();
      setHiddenIds(new Set(hidden.map((entry: { bid_id: number }) => entry.bid_id)));
    } catch (error) {
      reportError(error, 'load hidden gestures');
    }
  }, []);

  /** Applies a confirmed change at once, then re-reads the list to reconcile. */
  const applyChange = useCallback(
    (id: number, hidden: boolean) => {
      setHiddenIds((current) => {
        const next = new Set(current);
        if (hidden) next.add(id);
        else next.delete(id);
        return next;
      });
      void refreshHidden();
    },
    [refreshHidden],
  );

  useEffect(() => {
    // The hidden list is small; it loads once and after every change.
    void refreshHidden(); // eslint-disable-line react-hooks/set-state-in-effect -- async fetch on mount
  }, [refreshHidden]);

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
    const base: DataTableColumn<GestureHistory>[] = [
      {
        id: 'date',
        kind: 'datetime',
        header: t('columns.date'),
        value: (gesture) => gesture.TimeStamp,
        txHash: (gesture) => gesture.TxHash,
      },
      {
        id: 'participant',
        kind: 'address',
        header: t('columns.participant'),
        value: (gesture) => gesture.BidderAddr,
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('columns.cycle'),
        value: (gesture) => gesture.RoundNum,
        href: (gesture) => `/allocation/${gesture.RoundNum}`,
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
        priority: 'secondary',
      },
      {
        id: 'message',
        kind: 'text',
        header: t('columns.message'),
        value: (gesture) => gesture.Message,
        cell: (gesture) => {
          const hidden = hiddenIds.has(gesture.EvtLogId);
          return (
            <span className="flex flex-col items-start gap-1">
              {hidden ? <TableTag>{t('banGesture.hiddenTag')}</TableTag> : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  {/*
                   * Two lines on a desktop row, the whole message on a phone.
                   * `max-w-full`: as a start-aligned flex item the span would
                   * otherwise size to an unbroken word and never wrap it.
                   */}
                  <span
                    className={cn(
                      'block max-w-full break-words sm:line-clamp-2',
                      hidden ? 'text-subtle' : 'text-foreground',
                    )}
                  >
                    {gesture.Message}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[min(24rem,90vw)] break-words">
                  {gesture.Message}
                </TooltipContent>
              </Tooltip>
            </span>
          );
        },
        stack: true,
        width: '100%',
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
        cell: (gesture) => (
          <ModerationAction
            gesture={gesture}
            hidden={hiddenIds.has(gesture.EvtLogId)}
            moderatorAddress={moderatorAddress}
            onChanged={applyChange}
          />
        ),
      },
    ];
  }, [t, hiddenIds, applyChange, moderatorAddress]);

  const toolbar = (
    <div className="mb-4 space-y-4">
      {notice}
      <div className="flex flex-wrap items-center gap-3">
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
              // 32px from sm, so the track (4px padding) matches the 40px fields beside it.
              className={cn(tabsTriggerVariants({ variant: 'segmented' }), 'sm:min-h-8 sm:py-1')}
            >
              {t(`banGesture.filters.${option}`)}
              <span className="tabular-nums text-subtle">
                {formatCount(counts[option], locale)}
              </span>
            </button>
          ))}
        </div>
        <Select value={cycle} onValueChange={setCycle}>
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
          containerClassName="min-w-0 flex-1 basis-56"
        />
      </div>
    </div>
  );

  const filtered = rows.length !== gestureHistory.length;

  return (
    <DataTable
      data={rows}
      columns={columns}
      ariaLabel={t('names.gestureMessages')}
      description={description}
      toolbar={gestureHistory.length > 0 ? toolbar : undefined}
      getRowKey={(gesture) => gesture.EvtLogId}
      emptyTitle={filtered ? t('banGesture.noMatches') : t('empty.gestureHistory')}
      pageSize={MODERATION_PAGE_SIZE}
      resetPageKey={`${visibility}|${cycle}|${query}`}
      layout="cards"
      {...state}
    />
  );
};

export default BanGestureTable;

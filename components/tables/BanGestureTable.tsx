'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { DataTable, TableTag, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GestureMethodTag } from '@/components/tables/GestureMethodTag';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import api from '@/services/api';
import { useActiveWeb3React } from '@/hooks/web3';
import { useNotification } from '@/contexts/NotificationContext';
import getErrorMessage from '@/utils/alert';
import { reportError, getEthErrorMessage } from '@/utils/errors';

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
}

type Visibility = 'all' | 'visible' | 'hidden';

const VISIBILITY: readonly Visibility[] = ['all', 'visible', 'hidden'];
const ALL_CYCLES = 'all';
/** Enough messages to review at once without a page of tens of thousands of pixels. */
const MODERATION_PAGE_SIZE = 25;

/** Hides a gesture's message from public view, or restores it. */
function ModerationAction({
  gesture,
  hidden,
  onChanged,
}: {
  gesture: GestureHistory;
  hidden: boolean;
  onChanged: () => Promise<void> | void;
}) {
  const t = useTranslations('tables');
  const tToast = useTranslations('toasts');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      if (hidden) await api.unban_gesture(gesture.EvtLogId);
      else await api.ban_bid(gesture.EvtLogId, account as string);
      await onChanged();
      setNotification({
        visible: true,
        type: 'success',
        text: tToast(hidden ? 'admin.gestureBan.unbanned' : 'admin.gestureBan.banned'),
      });
    } catch (error) {
      reportError(error, hidden ? 'unban gesture' : 'ban gesture');
      const rawMessage = getEthErrorMessage(error, tToast('admin.gestureBan.failed'), { locale });
      if (rawMessage) {
        setNotification({
          visible: true,
          type: 'error',
          text: getErrorMessage(rawMessage) || rawMessage,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={hidden ? 'outline' : 'ghost'}
      size="sm"
      onClick={run}
      disabled={busy}
      className="px-3"
    >
      {hidden ? t('banGesture.unban') : t('banGesture.ban')}
    </Button>
  );
}

/**
 * Gesture messages for moderation, 25 at a time: filter by visibility, cycle
 * or text, then hide a message from public view or restore it. A hidden
 * message is marked with a tag and set in the subtle tier.
 */
const BanGestureTable = ({ gestureHistory, ...state }: BanGestureTableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(() => new Set());
  const [visibility, setVisibility] = useState<Visibility>('all');
  const [cycle, setCycle] = useState<string>(ALL_CYCLES);
  const [query, setQuery] = useState('');

  const refreshHidden = useCallback(async () => {
    const hidden = await api.get_banned_bids();
    setHiddenIds(new Set(hidden.map((entry: { bid_id: number }) => entry.bid_id)));
  }, []);

  useEffect(() => {
    // The moderation list is admin-only and cheap; it loads once and after
    // every change.
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

  const columns = useMemo<DataTableColumn<GestureHistory>[]>(
    () => [
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
                  {/* Two lines on a desktop row, the whole message on a phone. */}
                  <span
                    className={cn(
                      'block break-words sm:line-clamp-2',
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
      {
        id: 'action',
        kind: 'text',
        header: <span className="sr-only">{t('columns.actions')}</span>,
        label: t('columns.actions'),
        align: 'end',
        cell: (gesture) => (
          <ModerationAction
            gesture={gesture}
            hidden={hiddenIds.has(gesture.EvtLogId)}
            onChanged={refreshHidden}
          />
        ),
      },
    ],
    [t, hiddenIds, refreshHidden],
  );

  const toolbar = (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label={t('banGesture.visibilityLabel')}
        className="inline-flex rounded-control border border-input bg-surface-sunken p-0.5"
      >
        {VISIBILITY.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={visibility === option}
            onClick={() => setVisibility(option)}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3 type-body-sm',
              'text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground sm:h-8',
              visibility === option && 'bg-surface-raised text-foreground',
            )}
          >
            {t(`banGesture.filters.${option}`)}
            <span className="tabular-nums text-subtle">{formatCount(counts[option], locale)}</span>
          </button>
        ))}
      </div>
      <Select value={cycle} onValueChange={setCycle}>
        <SelectTrigger className="h-11 w-auto min-w-36 sm:h-9" aria-label={t('columns.cycle')}>
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
      <label className="relative min-w-0 flex-1 basis-56">
        <span className="sr-only">{t('banGesture.search')}</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('banGesture.search')}
          className="pl-9 sm:h-9"
        />
      </label>
    </div>
  );

  const filtered = rows.length !== gestureHistory.length;

  return (
    <DataTable
      data={rows}
      columns={columns}
      ariaLabel={t('names.gestureMessages')}
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

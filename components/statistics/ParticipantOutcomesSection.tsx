'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useFormat } from '@/hooks/useFormat';
import type { RoiLeaderboardEntry as OutcomeEntry } from '@/services/api/types';
// lexicon-allow-start: the hook name mirrors the backend route statistics/leaderboard/roi
import { useRoiLeaderboard as useOutcomesQuery } from '@/hooks/useApiQuery';
// lexicon-allow-end
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

/** The backend's order key for "most gestures first"; the table re-sorts client-side. */
const GESTURE_ORDER = 'bids'; // lexicon-allow-backend-type

/** The gesture floors a reader can filter by. */
export const MIN_GESTURE_OPTIONS = [5, 10, 25] as const;

/** Totals across the listed participants, in ETH. */
export function outcomeTotals(list: readonly OutcomeEntry[]) {
  return list.reduce(
    (acc, entry) => ({
      spent: acc.spent + (entry.TotalEthSpentEth ?? 0),
      received: acc.received + (entry.EthWonEth ?? 0),
      receivedMore: acc.receivedMore + (entry.EthWonEth > entry.TotalEthSpentEth ? 1 : 0),
    }),
    { spent: 0, received: 0, receivedMore: 0 },
  );
}

/**
 * What each participant spent on gestures and what came back to them as ETH
 * allocations, side by side and in neutral ink: no gain/loss colours, no
 * "biggest spender" ranking. The strip above totals the same columns, and
 * says how many received more ETH than they spent. Sorted by gestures;
 * every figure column sorts from its header.
 */
export const ParticipantOutcomesSection = () => {
  const t = useTranslations('statistics');
  const format = useFormat();
  const [minGestures, setMinGestures] = useState<number>(MIN_GESTURE_OPTIONS[0]);
  const { data, isLoading, isError, refetch } = useOutcomesQuery(GESTURE_ORDER, minGestures);
  const list = useMemo(() => data ?? [], [data]);
  const totals = useMemo(() => outcomeTotals(list), [list]);
  const eth = (value: number) => format.amount(value, { unit: 'ETH' });

  const figures: PageHeaderFigure[] = [
    {
      id: 'participants',
      label: t('performance.outcomes.participants', { min: format.count(minGestures) }),
      value: format.count(list.length),
    },
    { id: 'spent', label: t('performance.outcomes.spent'), value: eth(totals.spent) },
    { id: 'received', label: t('performance.outcomes.received'), value: eth(totals.received) },
    {
      id: 'receivedMore',
      label: t('performance.outcomes.receivedMore'),
      value: t('performance.outcomes.ofParticipants', {
        part: format.count(totals.receivedMore),
        whole: format.count(list.length),
      }),
    },
  ];

  const columns = useMemo<DataTableColumn<OutcomeEntry>[]>(
    () => [
      {
        id: 'rank',
        kind: 'count',
        header: '#',
        label: t('performance.outcomes.rank'),
        cell: (_row, { index }) => format.count(index + 1),
        width: '3rem',
        // A phone record is already one participant; its place in the list says the rest.
        priority: 'secondary',
      },
      {
        id: 'participant',
        kind: 'address',
        header: t('performance.leaderboard.columns.participant'),
        value: (row) => row.BidderAddr,
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('performance.leaderboard.columns.gestures'),
        value: (row) => row.NumBids,
        sortable: true,
      },
      {
        id: 'spent',
        kind: 'amount',
        unit: 'ETH',
        showUnit: false,
        header: t('performance.leaderboard.columns.spent'),
        value: (row) => row.TotalEthSpentEth,
        sortable: true,
        cell: (row) => (
          <span className="inline-flex flex-col items-end">
            <span>{format.amount(row.TotalEthSpentEth, { unit: 'ETH', withUnit: false })}</span>
            {row.TotalCstSpentEth > 0 ? (
              <span className="type-caption text-muted-foreground">
                {format.amount(row.TotalCstSpentEth, { unit: 'CST' })}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'received',
        kind: 'amount',
        unit: 'ETH',
        showUnit: false,
        header: t('performance.leaderboard.columns.received'),
        value: (row) => row.EthWonEth,
        sortable: true,
      },
      {
        id: 'net',
        kind: 'amount',
        unit: 'ETH',
        showUnit: false,
        header: t('performance.leaderboard.columns.net'),
        help: t('performance.outcomes.netHelp'),
        value: (row) => row.NetPlEth,
        sortable: true,
        // Spent and received sit side by side above it on a phone; the difference stays on wider screens.
        priority: 'secondary',
        // Signed, in the same ink as every other figure.
        cell: (row) =>
          `${row.NetPlEth > 0 ? '+' : ''}${format.amount(row.NetPlEth, { unit: 'ETH', withUnit: false })}`,
      },
      {
        id: 'rate',
        kind: 'percent',
        percentScale: 'ratio',
        header: t('performance.leaderboard.columns.allocationRate'),
        help: t('performance.outcomes.rateHelp'),
        value: (row) => row.WinRate,
        sortable: true,
        cell: (row) => (
          <span className="inline-flex flex-col items-end">
            <span>{format.percent(row.WinRate, { scale: 'ratio' })}</span>
            <span className="type-caption text-muted-foreground">
              {t('performance.outcomes.cycles', {
                part: format.count(row.RoundsWon),
                whole: row.RoundsParticipated,
              })}
            </span>
          </span>
        ),
      },
      {
        id: 'allocations',
        kind: 'count',
        header: t('performance.leaderboard.columns.allocations'),
        value: (row) => row.PrizesCount,
        sortable: true,
        priority: 'secondary',
        cell: (row) =>
          row.PrizesCount > 0 ? (
            <span className="inline-flex flex-col items-end">
              <span>{format.count(row.PrizesCount)}</span>
              {row.NftPrizesCount > 0 || row.CstPrizesCount > 0 ? (
                <span className="type-caption text-muted-foreground">
                  {[
                    row.NftPrizesCount > 0 ? `${format.count(row.NftPrizesCount)} NFT` : null,
                    row.CstPrizesCount > 0 ? `${format.count(row.CstPrizesCount)} CST` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              ) : null}
            </span>
          ) : (
            format.count(0)
          ),
      },
    ],
    [format, t],
  );

  return (
    <div className="space-y-6">
      <p className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
        {t('performance.leaderboard.description')}
      </p>
      <SegmentedControl
        label={t('performance.leaderboard.minimumGestures')}
        value={String(minGestures)}
        onValueChange={(value) => setMinGestures(Number(value))}
        options={MIN_GESTURE_OPTIONS.map((option) => ({
          value: String(option),
          label: `${format.count(option)}+`,
        }))}
      />
      {isLoading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : isError ? (
        <ErrorState
          headingLevel={3}
          title={t('performance.leaderboard.loadErrorTitle')}
          message={t('performance.leaderboard.loadErrorMessage')}
          onRetry={() => refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState headingLevel={3} variant="inline" title={t('performance.leaderboard.empty')} />
      ) : (
        <>
          <PageHeaderFigures figures={figures} className="mt-0 sm:mt-0" />
          <DataTable
            data={list}
            columns={columns}
            ariaLabel={t('performance.leaderboardTitle')}
            initialSort={{ id: 'gestures', direction: 'desc' }}
            getRowKey={(row) => String(row.BidderAid)}
            resetPageKey={minGestures}
          />
        </>
      )}
    </div>
  );
};

export default ParticipantOutcomesSection;

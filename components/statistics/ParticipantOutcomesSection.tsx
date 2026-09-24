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

import { CountBreakdown } from './CountBreakdown';

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
 * rank. The strip above totals the same columns, and says how many received
 * more ETH than they spent. Listed by gestures; gestures, spent, received and
 * allocations sort from their headers. The difference and the cycles with an
 * allocation do not: a table sorted by either would be a board of who came
 * out ahead, and a position number beside it a ranking.
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
        // Spent and received sit side by side above it on a phone; the difference stays on wider screens.
        priority: 'secondary',
        // Signed by the formatter, in the same ink as every other figure.
        cell: (row) =>
          format.amount(row.NetPlEth, {
            unit: 'ETH',
            context: 'table',
            withUnit: false,
            signDisplay: 'exceptZero',
          }),
      },
      {
        // A count of cycles ("1 of 2 cycles"), never a percentage: no rate to compare by.
        id: 'cycles',
        kind: 'count',
        header: t('performance.leaderboard.columns.cyclesWithAllocation'),
        help: t('performance.outcomes.cyclesHelp'),
        value: (row) => row.RoundsWon,
        cell: (row) =>
          t('performance.outcomes.cycles', {
            part: format.count(row.RoundsWon),
            // A number, for the plural; the message formats it (#) in the locale's style.
            whole: row.RoundsParticipated,
          }),
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
              <CountBreakdown
                className="type-caption text-muted-foreground"
                parts={[
                  { key: 'nft', count: row.NftPrizesCount, unit: 'NFT' },
                  { key: 'cst', count: row.CstPrizesCount, unit: 'CST' },
                ]}
              />
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

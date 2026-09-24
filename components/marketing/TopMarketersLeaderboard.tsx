'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatPercent } from '@/utils/format';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { MarketingReward } from '@/services/api/types';

import { rankOutreachContributors, type OutreachContributor } from './outreachTotals';

/** A share of the whole as a thin bar in the outreach track colour, beside its figure. */
function ShareCell({ percent }: { percent: number }) {
  const locale = useLocale();
  return (
    <span className="inline-flex items-center justify-end gap-3">
      <span aria-hidden className="hidden h-1.5 w-24 rounded-pill bg-surface-sunken sm:block">
        <span
          className="block h-full rounded-pill bg-track-outreach"
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </span>
      {formatPercent(percent, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
    </span>
  );
}

/** Contributors per page: the first page is the top ten. */
const RANKING_PAGE_SIZE = 10;

export interface TopMarketersLeaderboardProps extends LedgerStateProps {
  rewards: readonly MarketingReward[];
}

/**
 * The outreach contributors ranked as a ledger, ten to a page (the first page
 * is the top ten, and the pager says how many there are): rank, contributor
 * (to their outreach history), share of all outreach CST as a bar in the
 * outreach track colour, CST received and allocation count, the figures
 * grouped at the row's end. One neutral row style for every rank: this is a
 * record, not a podium.
 */
export function TopMarketersLeaderboard({ rewards, ...state }: TopMarketersLeaderboardProps) {
  const t = useTranslations('marketing.leaderboard');
  const contributors = useMemo(() => rankOutreachContributors(rewards), [rewards]);

  const columns = useMemo<DataTableColumn<OutreachContributor>[]>(
    () => [
      {
        id: 'rank',
        kind: 'count',
        header: t('columns.rank'),
        value: (row) => row.rank,
        width: '4rem',
        cellClassName: 'text-subtle',
        // Phone records keep the ranked order; a numbered line per record adds nothing.
        priority: 'secondary',
      },
      {
        id: 'contributor',
        kind: 'address',
        header: t('columns.contributor'),
        value: (row) => row.address,
        href: (row) => `/marketing/${row.address}`,
      },
      {
        id: 'share',
        kind: 'percent',
        header: t('columns.share'),
        help: t('columns.shareHelp'),
        value: (row) => row.sharePercent,
        cell: (row) => <ShareCell percent={row.sharePercent} />,
        width: '12rem',
      },
      {
        id: 'received',
        kind: 'amount',
        header: t('columns.received'),
        unit: 'CST',
        value: (row) => row.totalCst,
        width: '10rem',
      },
      {
        id: 'allocations',
        kind: 'count',
        header: t('columns.allocations'),
        value: (row) => row.allocations,
        priority: 'secondary',
        width: '7rem',
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={contributors}
      columns={columns}
      ariaLabel={t('title')}
      title={t('title')}
      description={t('description')}
      getRowKey={(row) => row.address}
      emptyTitle={t('empty')}
      pageSize={RANKING_PAGE_SIZE}
      {...state}
    />
  );
}

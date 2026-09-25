'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useOutreachDustNote } from '@/components/tables/outreachDust';
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

export interface OutreachAllocationsTableProps extends LedgerStateProps {
  list: MarketingReward[];
  /**
   * Show who received each allocation, linked to their outreach history:
   * the ledger of every contributor. One contributor's own page leaves it
   * out. Default `false`.
   */
  showContributor?: boolean;
  /** Phone layout (`DataTable` `layout`); `compact` keeps the columns side by side. */
  layout?: 'auto' | 'cards' | 'compact';
}

/**
 * Outreach Reserve allocations, newest first: when (linked to its
 * transaction), to whom when `showContributor` is set, and how much CST.
 * The table has no heading of its own unless the page passes `title` (a
 * profile shows it under its own section heading). An allocation too small
 * to show at table precision ("<0.01", a test transfer of a few base units)
 * is muted like dust in every ledger, and a note beside the row range says
 * why whenever the list holds one.
 */
export function OutreachAllocationsTable({
  list,
  showContributor = false,
  layout,
  ...state
}: OutreachAllocationsTableProps) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const dustNote = useOutreachDustNote(list, locale);

  const columns = useMemo<DataTableColumn<MarketingReward>[]>(() => {
    const all: (DataTableColumn<MarketingReward> | false)[] = [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
        phone: 'title',
      },
      showContributor && {
        id: 'contributor',
        kind: 'address',
        header: t('columns.outreachContributor'),
        value: (row) => row.MarketerAddr,
        href: (row) => `/marketing/${row.MarketerAddr}`,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amountCst'),
        unit: 'CST',
        showUnit: false,
        value: (row) => row.AmountEth,
        sortable: true,
      },
    ];
    return all.filter((column): column is DataTableColumn<MarketingReward> => Boolean(column));
  }, [t, showContributor]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.outreachAllocations')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.outreachAllocations')}
      initialSort={{ id: 'datetime', direction: 'desc' }}
      caption={dustNote}
      layout={layout}
      {...state}
    />
  );
}

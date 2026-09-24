'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { isSmallAllocation } from '@/components/marketing/outreachTotals';
import { Amount } from '@/components/ui/amount';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

interface MarketingRewardsTableProps extends LedgerStateProps {
  list: MarketingReward[];
  /** Phone layout (`DataTable` `layout`); `compact` keeps the two columns side by side. */
  layout?: 'auto' | 'cards' | 'compact';
}

/**
 * One contributor's Outreach Reserve allocations, each date linked to its
 * transaction. An allocation too small to show at table precision ("<0.01",
 * a test transfer of a few base units) is muted; a page that shows such rows
 * says why in the table's `description`.
 */
const MarketingRewardsTable = ({ list, layout, ...state }: MarketingRewardsTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<MarketingReward>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amountCst'),
        unit: 'CST',
        showUnit: false,
        value: (row) => row.AmountEth,
        cell: (row) => (
          <Amount
            value={row.AmountEth}
            unit="CST"
            context="table"
            showUnit={false}
            className={isSmallAllocation(row.AmountEth) ? 'text-subtle' : undefined}
          />
        ),
        sortable: true,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.outreachAllocations')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.outreachAllocations')}
      layout={layout}
      {...state}
    />
  );
};

export default MarketingRewardsTable;

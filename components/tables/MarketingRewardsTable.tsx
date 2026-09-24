'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

interface MarketingRewardsTableProps extends LedgerStateProps {
  list: MarketingReward[];
}

/** One contributor's Outreach Reserve allocations, each date linked to its transaction. */
const MarketingRewardsTable = ({ list, ...state }: MarketingRewardsTableProps) => {
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
      {...state}
    />
  );
};

export default MarketingRewardsTable;

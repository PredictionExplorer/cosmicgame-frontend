'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useOutreachDustNote } from '@/components/tables/outreachDust';
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

interface MarketingRewardsTableProps extends LedgerStateProps {
  list: MarketingReward[];
}

/**
 * One contributor's Outreach Reserve allocations, each date linked to its
 * transaction. The table has no heading of its own: the outreach address
 * page passes `title` ("Allocations"), while a participant's profile shows
 * it under its own "Outreach allocations" section heading. An allocation
 * too small to show at table precision ("<0.01", a test transfer of a few
 * base units) is muted like dust in every ledger, and a note beside the row
 * range says why whenever the list holds one.
 */
const MarketingRewardsTable = ({ list, ...state }: MarketingRewardsTableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const dustNote = useOutreachDustNote(list, locale);

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
      initialSort={{ id: 'datetime', direction: 'desc' }}
      caption={dustNote}
      {...state}
    />
  );
};

export default MarketingRewardsTable;

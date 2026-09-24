'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useOutreachDustNote } from '@/components/tables/outreachDust';
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

interface GlobalMarketingRewardsTableProps extends LedgerStateProps {
  list: MarketingReward[];
}

/**
 * Every Outreach Reserve allocation, newest first: when (linked to its
 * transaction), to whom (linked to that contributor's outreach history) and
 * how much CST. Dust ("<0.01") is muted, with a note beside the row range,
 * exactly as on a contributor's own page.
 */
export const GlobalMarketingRewardsTable = ({
  list,
  ...state
}: GlobalMarketingRewardsTableProps) => {
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
        id: 'contributor',
        kind: 'address',
        header: t('columns.outreachContributor'),
        value: (row) => row.MarketerAddr,
        href: (row) => `/marketing/${row.MarketerAddr}`,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amount'),
        unit: 'CST',
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

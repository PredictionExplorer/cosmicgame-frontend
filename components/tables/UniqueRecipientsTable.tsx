'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { Recipient } from '@/services/api/types';

export type { Recipient };

interface UniqueRecipientsTableProps extends LedgerStateProps {
  list: Recipient[];
}

/** Every wallet that has received an allocation, with counts and ETH totals. */
export const UniqueRecipientsTable = ({ list, ...state }: UniqueRecipientsTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<Recipient>[]>(
    () => [
      {
        id: 'recipient',
        kind: 'address',
        header: t('columns.recipientAddress'),
        help: t('statisticsTooltips.recipientAddress'),
        value: (row) => row.WinnerAddr,
      },
      {
        id: 'allocations',
        kind: 'count',
        header: t('columns.allocationsReceived'),
        help: t('statisticsTooltips.allocationsReceived'),
        // A count missing from the payload reads as unavailable, never as 0.
        value: (row) => (typeof row.AllocationsCount === 'number' ? row.AllocationsCount : null),
        sortable: true,
      },
      {
        id: 'maxAllocation',
        kind: 'amount',
        header: t('columns.maxAllocationEth'),
        help: t('statisticsTooltips.maxAllocationEth'),
        value: (row) => row.MaxWinAmountEth,
        showUnit: false,
        sortable: true,
      },
      {
        id: 'allocationsSum',
        kind: 'amount',
        header: t('columns.allocationsSumEth'),
        help: t('statisticsTooltips.allocationsSumEth'),
        value: (row) => row.PrizesSum,
        showUnit: false,
        sortable: true,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.recipients')}
      getRowKey={(row) => row.WinnerAid}
      emptyTitle={t('empty.recipients')}
      {...state}
    />
  );
};

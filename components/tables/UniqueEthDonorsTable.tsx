'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { UniqueEthDonor } from '@/services/api/types';

export type { UniqueEthDonor };

interface UniqueEthDonorsTableProps extends LedgerStateProps {
  list: UniqueEthDonor[];
}

/** Every wallet that has contributed ETH, with its contribution count and total. */
export const UniqueEthDonorsTable = ({ list, ...state }: UniqueEthDonorsTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<UniqueEthDonor>[]>(
    () => [
      {
        id: 'contributor',
        kind: 'address',
        header: t('columns.contributor'),
        value: (row) => row.DonorAddr,
        phone: 'title',
      },
      {
        id: 'contributions',
        kind: 'count',
        header: t('columns.numberOfContributions'),
        value: (row) => row.CountDonations,
        sortable: true,
      },
      {
        id: 'total',
        kind: 'amount',
        header: t('columns.totalContributedEth'),
        value: (row) => row.TotalDonatedEth,
        showUnit: false,
        sortable: true,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list ?? []}
      columns={columns}
      ariaLabel={t('names.ethContributors')}
      getRowKey={(row) => row.DonorAid}
      // Largest total first: the header shows it.
      initialSort={{ id: 'total', direction: 'desc' }}
      emptyTitle={t('empty.contributors')}
      {...state}
    />
  );
};

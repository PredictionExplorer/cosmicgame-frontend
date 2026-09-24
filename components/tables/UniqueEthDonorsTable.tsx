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
        header: t('columns.contributorAddress'),
        help: t('statisticsTooltips.contributorAddress'),
        value: (row) => row.DonorAddr,
      },
      {
        id: 'contributions',
        kind: 'count',
        header: t('columns.numberOfContributions'),
        help: t('statisticsTooltips.numberOfContributions'),
        value: (row) => row.CountDonations,
        sortable: true,
      },
      {
        id: 'total',
        kind: 'amount',
        header: t('columns.totalContributedEth'),
        help: t('statisticsTooltips.totalContributedEth'),
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
      emptyTitle={t('empty.contributors')}
      {...state}
    />
  );
};

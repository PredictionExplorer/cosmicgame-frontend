'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';

export interface PublicGoodsContributionEntry {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
}

interface CharityDepositTableProps extends LedgerStateProps {
  list: PublicGoodsContributionEntry[];
}

/**
 * ETH that reached the Public Goods Vault. Each date links to its
 * transaction, and the protocol's own contract reads by name. Voluntary
 * contributions carry no cycle, so that column appears only when a row has one.
 */
export const CharityDepositTable = ({ list, ...state }: CharityDepositTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<PublicGoodsContributionEntry>[]>(
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
        id: 'cycle',
        kind: 'link',
        header: t('columns.cycle'),
        value: (row) => (row.RoundNum >= 0 ? row.RoundNum : null),
        href: (row) => (row.RoundNum >= 0 ? `/allocation/${row.RoundNum}` : null),
        hideWhenEmpty: true,
      },
      {
        id: 'contributor',
        kind: 'address',
        header: t('columns.contributorAddress'),
        label: t('columns.contributor'),
        value: (row) => row.DonorAddr,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.contributionAmountEth'),
        value: (row) => row.AmountEth,
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
      ariaLabel={t('names.publicGoodsContributions')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.contributions')}
      {...state}
    />
  );
};

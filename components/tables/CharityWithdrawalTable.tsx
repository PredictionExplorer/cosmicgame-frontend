'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { CharityWithdrawal } from '@/services/api/types';

export type { CharityWithdrawal };

interface CharityWithdrawalTableProps extends LedgerStateProps {
  list: CharityWithdrawal[];
}

/** ETH forwarded out of the Public Goods Vault, each date linked to its transaction. */
const CharityWithdrawalTable = ({ list, ...state }: CharityWithdrawalTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<CharityWithdrawal>[]>(
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
        id: 'destination',
        kind: 'address',
        header: t('columns.destinationAddress'),
        value: (row) => row.DestinationAddr,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.retrievalAmountEth'),
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
      ariaLabel={t('names.publicGoodsRetrievals')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.retrievals')}
      {...state}
    />
  );
};

export default CharityWithdrawalTable;

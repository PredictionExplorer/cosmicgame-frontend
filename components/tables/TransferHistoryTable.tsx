'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { isZeroAddress } from '@/utils/format';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { CSTTransferRecord } from '@/services/api';

interface TransferHistoryTableProps extends LedgerStateProps {
  list: CSTTransferRecord[];
}

/**
 * A token's transfers, each date linked to its transaction. The imprint
 * itself (a transfer from the zero address) is left out; protocol wallets,
 * such as the anchoring wallets, read by name.
 */
export const TransferHistoryTable = ({ list, ...state }: TransferHistoryTableProps) => {
  const t = useTranslations('tables');
  const transfers = useMemo(() => list.filter((row) => !isZeroAddress(row.FromAddr)), [list]);

  const columns = useMemo<DataTableColumn<CSTTransferRecord>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.dateTimeCompact'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
      },
      {
        id: 'from',
        kind: 'address',
        header: t('columns.from'),
        value: (row) => row.FromAddr,
        zeroRole: 'from',
      },
      {
        id: 'to',
        kind: 'address',
        header: t('columns.to'),
        value: (row) => row.ToAddr,
        zeroRole: 'to',
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={transfers}
      columns={columns}
      ariaLabel={t('names.transfers')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.history')}
      {...state}
    />
  );
};

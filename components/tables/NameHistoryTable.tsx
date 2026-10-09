'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { NameHistoryRecord } from '@/services/api';

interface NameHistoryTableProps extends LedgerStateProps {
  // Defaulted because the name history can be absent from the token payload.
  list?: NameHistoryRecord[];
}

/**
 * A token's names over time, each change linked to its transaction. Two
 * short columns stay a table on a phone: one line per change rather than a
 * record repeating "Date / Token name".
 */
const NameHistoryTable = ({ list = [], ...state }: NameHistoryTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<NameHistoryRecord>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.dateTimeCompact'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
      },
      {
        id: 'name',
        kind: 'text',
        header: t('columns.tokenName'),
        value: (row) => row.TokenName || null,
        cell: (row) =>
          row.TokenName ? (
            <span className="text-foreground">{row.TokenName}</span>
          ) : (
            <span className="text-subtle">{t('nameHistory.removed')}</span>
          ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.nameHistory')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.history')}
      layout="compact"
      {...state}
    />
  );
};

export default NameHistoryTable;

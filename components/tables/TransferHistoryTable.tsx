'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { isZeroAddress } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { DataTable, usePhoneLayout, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { CSTTransferRecord } from '@/services/api';

interface TransferHistoryTableProps extends LedgerStateProps {
  list: CSTTransferRecord[];
}

/**
 * A token's transfers, each date linked to its transaction. The imprint
 * itself (a transfer from the zero address) is left out; protocol wallets,
 * such as the anchoring wallets, read by name.
 *
 * On a phone the table stays a table of one line per transfer: the date,
 * then "From → To" in one cell that wraps onto a second line when it must,
 * instead of a three-line record repeating "Date / From / To" each time.
 */
export const TransferHistoryTable = ({ list, ...state }: TransferHistoryTableProps) => {
  const t = useTranslations('tables');
  const isPhone = usePhoneLayout();
  const transfers = useMemo(() => list.filter((row) => !isZeroAddress(row.FromAddr)), [list]);

  const columns = useMemo<DataTableColumn<CSTTransferRecord>[]>(() => {
    const date: DataTableColumn<CSTTransferRecord> = {
      id: 'datetime',
      kind: 'datetime',
      header: t('columns.dateTimeCompact'),
      value: (row) => row.TimeStamp,
      txHash: (row) => row.TxHash,
    };
    if (isPhone) {
      return [
        date,
        {
          id: 'route',
          // An address cell (the ledger's link style), allowed to wrap
          // between its two addresses.
          kind: 'address',
          nowrap: false,
          header: `${t('columns.from')} → ${t('columns.to')}`,
          label: `${t('columns.from')} → ${t('columns.to')}`,
          value: (row) => row.FromAddr,
          // A protocol wallet shown by name ("Cosmic Signature NFT Anchoring
          // Wallet") wraps onto more lines rather than being cut off.
          cell: (row) => (
            <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="sr-only">{t('columns.from')}</span>
              {row.FromAddr ? (
                <AddressChip
                  address={row.FromAddr}
                  variant="plain"
                  showCopy={false}
                  zeroRole="from"
                  wrapLabel
                />
              ) : null}
              <ArrowRight aria-hidden className="size-3.5 shrink-0 text-subtle" />
              <span className="sr-only">{t('columns.to')}</span>
              {row.ToAddr ? (
                <AddressChip
                  address={row.ToAddr}
                  variant="plain"
                  showCopy={false}
                  zeroRole="to"
                  wrapLabel
                />
              ) : null}
            </span>
          ),
        },
      ];
    }
    return [
      date,
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
    ];
  }, [t, isPhone]);

  return (
    <DataTable
      data={transfers}
      columns={columns}
      ariaLabel={t('names.transfers')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.history')}
      layout="compact"
      {...state}
    />
  );
};

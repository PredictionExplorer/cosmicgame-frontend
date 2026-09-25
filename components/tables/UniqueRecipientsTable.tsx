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

/**
 * Every wallet that has received an allocation: how many allocations of
 * every kind (ETH, CST and NFTs alike), its largest Signature Allocation,
 * and the ETH it has received in all. The count and the ETH sum measure
 * different things, so a wallet with eight NFT and CST allocations reads
 * "8" beside "0" ETH; the headers and the one explanation on the sum say so.
 */
export const UniqueRecipientsTable = ({ list, ...state }: UniqueRecipientsTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<Recipient>[]>(
    () => [
      {
        id: 'recipient',
        kind: 'address',
        header: t('columns.recipient'),
        value: (row) => row.WinnerAddr,
        phone: 'title',
      },
      {
        id: 'allocations',
        kind: 'count',
        header: t('columns.allocationsReceived'),
        // A count missing from the payload reads as unavailable, never as 0.
        value: (row) => (typeof row.AllocationsCount === 'number' ? row.AllocationsCount : null),
        sortable: true,
      },
      {
        id: 'maxAllocation',
        kind: 'amount',
        header: t('columns.maxAllocationEth'),
        help: t('statisticsTooltips.maxAllocationEth'),
        // 0 means the wallet never received one (its allocations came from
        // other tracks): a dash that says "None", not a column of zeros.
        value: (row) => (row.MaxWinAmountEth > 0 ? row.MaxWinAmountEth : null),
        whenBlank: 'none',
        showUnit: false,
        sortable: true,
        // Most recipients have none: on a phone the ledger keeps the address,
        // the count and the ETH received, and stays a table like the other
        // ledgers of the page instead of a stack of dashes.
        priority: 'secondary',
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
      // Most allocations first, as the API lists them: the header shows it.
      initialSort={{ id: 'allocations', direction: 'desc' }}
      emptyTitle={t('empty.recipients')}
      {...state}
    />
  );
};

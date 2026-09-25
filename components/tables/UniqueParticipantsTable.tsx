'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { Participant } from '@/services/api/types';

export type { Participant };

interface UniqueParticipantsTableProps extends LedgerStateProps {
  list: Participant[];
}

/**
 * Every wallet that has made a gesture, with its gesture count and largest
 * ETH gesture. The headers say what each column holds, so none needs an
 * explanation of its own.
 */
export const UniqueParticipantsTable = ({ list, ...state }: UniqueParticipantsTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<Participant>[]>(
    () => [
      {
        id: 'participant',
        kind: 'address',
        header: t('columns.participant'),
        value: (row) => row.BidderAddr,
        phone: 'title',
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('columns.gestureCount'),
        value: (row) => row.NumBids,
        sortable: true,
      },
      {
        id: 'maxGesture',
        kind: 'amount',
        header: t('columns.maxGestureEth'),
        // A wallet that only ever gestured with CST has no ETH gesture: the
        // API reports a negative sentinel, which reads as none, not as dust.
        value: (row) => (row.MaxBidAmountEth >= 0 ? row.MaxBidAmountEth : null),
        whenBlank: 'none',
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
      ariaLabel={t('names.participants')}
      getRowKey={(row) => row.BidderAid}
      emptyTitle={t('empty.participants')}
      {...state}
    />
  );
};

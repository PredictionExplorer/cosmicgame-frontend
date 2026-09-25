'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { CSTAnchorDistribution } from '@/services/api';

interface AnchoringRecipientTableProps extends LedgerStateProps {
  list: CSTAnchorDistribution[];
}

/** A cycle's Anchor Distribution: each anchor-holder, their anchored NFTs and ETH. */
const AnchoringRecipientTable = ({ list, ...state }: AnchoringRecipientTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<CSTAnchorDistribution>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
      },
      {
        id: 'holder',
        kind: 'address',
        header: t('columns.anchorHolder'),
        value: (row) => row.StakerAddr,
        phone: 'title',
      },
      {
        id: 'nfts',
        kind: 'count',
        header: t('columns.numberOfNfts'),
        value: (row) => row.StakerNumStakedNFTs,
        sortable: true,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.distributionAmountEth'),
        value: (row) => row.StakerAmountEth,
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
      ariaLabel={t('names.anchorDistribution')}
      getRowKey={(row) => row.StakerAddr ?? row.EvtLogId}
      emptyTitle={t('anchoringRecipient.emptyTitle')}
      emptyDescription={t('anchoringRecipient.empty')}
      {...state}
    />
  );
};

export default AnchoringRecipientTable;

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { UniqueAnchorHolderRWLK } from '@/services/api/types';

export type { UniqueAnchorHolderRWLK };

interface UniqueAnchorHoldersRWLKTableProps extends LedgerStateProps {
  list: UniqueAnchorHolderRWLK[];
}

/**
 * Every wallet that has anchored a Random Walk NFT, most anchored now first:
 * its anchor and release actions, the NFTs it keeps anchored, and the
 * Cosmic Signature NFTs imprinted for it by the Anchored-NFT Stellar
 * Selection. Each column has one short name, the header on a wide screen
 * and the label in a phone record.
 */
export const UniqueAnchorHoldersRWLKTable = ({
  list,
  ...state
}: UniqueAnchorHoldersRWLKTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<UniqueAnchorHolderRWLK>[]>(
    () => [
      {
        id: 'holder',
        kind: 'address',
        header: t('columns.anchorHolder'),
        value: (row) => row.StakerAddr,
        phone: 'title',
      },
      {
        id: 'anchors',
        kind: 'count',
        header: t('uniqueAnchorHolders.anchors'),
        value: (row) => row.NumStakeActions,
        sortable: true,
        priority: 'secondary',
      },
      {
        id: 'releases',
        kind: 'count',
        header: t('uniqueAnchorHolders.releases'),
        value: (row) => row.NumUnstakeActions,
        sortable: true,
        priority: 'secondary',
      },
      {
        id: 'anchored',
        kind: 'count',
        header: t('uniqueAnchorHolders.anchored'),
        // The API's count of NFTs anchored right now: anchors minus releases.
        value: (row) => row.TotalTokensStaked,
        sortable: true,
      },
      {
        id: 'imprinted',
        kind: 'count',
        header: t('uniqueAnchorHolders.imprinted'),
        value: (row) => row.TotalTokensMinted,
        sortable: true,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.rwlkAnchorHolders')}
      getRowKey={(row) => row.StakerAid}
      emptyTitle={t('empty.anchorHolders')}
      initialSort={{ id: 'anchored', direction: 'desc' }}
      // The ledgers above it keep their links quiet: one calm register for the page.
      links="quiet"
      {...state}
    />
  );
};

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
 * Every wallet that has anchored a Random Walk NFT: its anchor and release
 * actions and tokens. Headers carry the full column names; phone records use
 * the short ones.
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
        header: t('columns.anchorHolderAddress'),
        label: t('columns.holder'),
        help: t('statisticsTooltips.anchorHolderAddress'),
        value: (row) => row.StakerAddr,
      },
      {
        id: 'anchors',
        kind: 'count',
        header: t('uniqueAnchorHolders.numAnchorActions'),
        label: t('uniqueAnchorHolders.anchors'),
        help: t('statisticsTooltips.numAnchorActions'),
        value: (row) => row.NumStakeActions,
        sortable: true,
      },
      {
        id: 'releases',
        kind: 'count',
        header: t('uniqueAnchorHolders.numReleaseActions'),
        label: t('uniqueAnchorHolders.releases'),
        help: t('statisticsTooltips.numReleaseActions'),
        value: (row) => row.NumUnstakeActions,
        sortable: true,
      },
      {
        id: 'anchored',
        kind: 'count',
        header: t('uniqueAnchorHolders.totalAnchoredTokens'),
        label: t('uniqueAnchorHolders.anchored'),
        help: t('statisticsTooltips.totalAnchoredTokens'),
        value: (row) => row.TotalTokensStaked,
        sortable: true,
      },
      {
        id: 'imprinted',
        kind: 'count',
        header: t('uniqueAnchorHolders.totalImprintedTokens'),
        label: t('uniqueAnchorHolders.imprinted'),
        help: t('statisticsTooltips.totalImprintedTokens'),
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
      tableClassName="sm:min-w-[45rem] xl:min-w-0"
      {...state}
    />
  );
};

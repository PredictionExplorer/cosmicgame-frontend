'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { UniqueAnchorHolderCST } from '@/services/api/types';

export type { UniqueAnchorHolderCST };

interface UniqueAnchorHoldersCSTTableProps extends LedgerStateProps {
  list: UniqueAnchorHolderCST[];
}

/**
 * Every wallet that has anchored a Cosmic Signature NFT: its anchor and
 * release actions, tokens, and Anchor Distribution received and unretrieved.
 * Headers carry the full column names; phone records use the short ones.
 */
export const UniqueAnchorHoldersCSTTable = ({
  list,
  ...state
}: UniqueAnchorHoldersCSTTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<UniqueAnchorHolderCST>[]>(
    () => [
      {
        id: 'holder',
        kind: 'address',
        header: t('columns.anchorHolderAddress'),
        label: t('columns.holder'),
        value: (row) => row.StakerAddr,
      },
      {
        id: 'anchors',
        kind: 'count',
        header: t('uniqueAnchorHolders.numAnchorActions'),
        label: t('uniqueAnchorHolders.anchors'),
        value: (row) => row.NumStakeActions,
        sortable: true,
      },
      {
        id: 'releases',
        kind: 'count',
        header: t('uniqueAnchorHolders.numReleaseActions'),
        label: t('uniqueAnchorHolders.releases'),
        value: (row) => row.NumUnstakeActions,
        sortable: true,
      },
      {
        id: 'imprinted',
        kind: 'count',
        header: t('uniqueAnchorHolders.totalImprintedTokens'),
        label: t('uniqueAnchorHolders.imprinted'),
        help: t('statisticsTooltips.totalImprintedTokens'),
        // The CST endpoint omits this field; the column is dropped rather
        // than filled with confident zeros.
        value: (row) => row.TotalTokensMinted,
        hideWhenEmpty: true,
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
        id: 'distributed',
        kind: 'amount',
        header: t('uniqueAnchorHolders.totalDistributionEth'),
        label: t('uniqueAnchorHolders.distributed'),
        help: t('statisticsTooltips.totalDistributionEth'),
        value: (row) => row.TotalRewardEth,
        showUnit: false,
        sortable: true,
      },
      {
        id: 'unretrieved',
        kind: 'amount',
        header: t('uniqueAnchorHolders.unretrievedDistributionEth'),
        label: t('uniqueAnchorHolders.unretrieved'),
        help: t('statisticsTooltips.unretrievedDistributionEth'),
        value: (row) => row.UnclaimedRewardEth,
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
      ariaLabel={t('names.cstAnchorHolders')}
      getRowKey={(row) => row.StakerAid}
      emptyTitle={t('empty.anchorHolders')}
      tableClassName="sm:min-w-[52rem] xl:min-w-0"
      {...state}
    />
  );
};

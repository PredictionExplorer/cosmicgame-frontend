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
 * Every wallet that has anchored a Cosmic Signature NFT, most anchored now
 * first: its anchor and release actions, the NFTs it keeps anchored, and
 * the Anchor Distribution it has received and not yet retrieved. Each
 * column has one short name, the header on a wide screen and the label in
 * a phone record, and the ETH columns say "(ETH)" in both.
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
        header: t('columns.anchorHolder'),
        value: (row) => row.StakerAddr,
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
        id: 'imprinted',
        kind: 'count',
        header: t('uniqueAnchorHolders.imprinted'),
        // The CST endpoint omits this field; the column is dropped rather
        // than filled with confident zeros.
        value: (row) => row.TotalTokensMinted,
        hideWhenEmpty: true,
        sortable: true,
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
        id: 'distributed',
        kind: 'amount',
        header: t('uniqueAnchorHolders.distributedEth'),
        value: (row) => row.TotalRewardEth,
        showUnit: false,
        sortable: true,
      },
      {
        id: 'unretrieved',
        kind: 'amount',
        header: t('uniqueAnchorHolders.unretrievedEth'),
        value: (row) => row.UnclaimedRewardEth,
        showUnit: false,
        sortable: true,
        priority: 'secondary',
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
      initialSort={{ id: 'anchored', direction: 'desc' }}
      tableClassName="sm:min-w-[44rem] xl:min-w-0"
      // The ledgers above it keep their links quiet: one calm register for the page.
      links="quiet"
      {...state}
    />
  );
};

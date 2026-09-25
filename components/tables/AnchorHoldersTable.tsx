'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { AnchorCollection } from '@/components/anchoring/anchorLinks';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { UniqueAnchorHolderCST, UniqueAnchorHolderRWLK } from '@/services/api/types';

/** What the two collections' anchor-holder rows have in common, and what only one of them has. */
interface AnchorHolderRow {
  StakerAid: string | number;
  StakerAddr: string;
  NumStakeActions: number;
  NumUnstakeActions: number;
  TotalTokensStaked: number;
  /** Random Walk only: Cosmic Signature NFTs imprinted for the holder. */
  TotalTokensMinted?: number;
  /** Cosmic Signature only: the Anchor Distribution received, and what is still to retrieve. */
  TotalRewardEth?: number;
  UnclaimedRewardEth?: number;
}

export type AnchorHoldersTableProps = LedgerStateProps &
  (
    | { collection: Extract<AnchorCollection, 'cosmicSignature'>; list: UniqueAnchorHolderCST[] }
    | { collection: Extract<AnchorCollection, 'randomWalk'>; list: UniqueAnchorHolderRWLK[] }
  );

const TABLE_NAME: Record<AnchorCollection, 'cstAnchorHolders' | 'rwlkAnchorHolders'> = {
  cosmicSignature: 'cstAnchorHolders',
  randomWalk: 'rwlkAnchorHolders',
};

/**
 * Every wallet that has anchored an NFT of one collection, most anchored now
 * first: its anchor and release actions and the NFTs it keeps anchored.
 * A Cosmic Signature holder adds the Anchor Distribution it has received and
 * not yet retrieved (the ETH columns say "(ETH)" in their header and phone
 * label alike); a Random Walk holder adds the Cosmic Signature NFTs the
 * Anchored-NFT Stellar Selection imprinted for it.
 *
 * On a phone a record reads the holder, what it has anchored now and, for
 * Cosmic Signature, what it has received: the action counts and the amount
 * still to retrieve, mostly zeros, stay on wider screens.
 */
export function AnchorHoldersTable({ collection, list, ...state }: AnchorHoldersTableProps) {
  const t = useTranslations('tables');
  const cosmicSignature = collection === 'cosmicSignature';

  const columns = useMemo<DataTableColumn<AnchorHolderRow>[]>(() => {
    const shared: DataTableColumn<AnchorHolderRow>[] = [
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
    ];
    if (!cosmicSignature) {
      return [
        ...shared,
        {
          id: 'imprinted',
          kind: 'count',
          header: t('uniqueAnchorHolders.imprinted'),
          value: (row) => row.TotalTokensMinted,
          sortable: true,
        },
      ];
    }
    return [
      ...shared,
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
    ];
  }, [cosmicSignature, t]);

  return (
    <DataTable<AnchorHolderRow>
      data={list}
      columns={columns}
      ariaLabel={t(`names.${TABLE_NAME[collection]}`)}
      getRowKey={(row) => row.StakerAid}
      emptyTitle={t('empty.anchorHolders')}
      initialSort={{ id: 'anchored', direction: 'desc' }}
      // Six columns need a ledger's width; the scroll container takes over below it.
      tableClassName={cosmicSignature ? 'sm:min-w-[44rem] xl:min-w-0' : undefined}
      // The ledgers above it keep their links quiet: one calm register for the page.
      links="quiet"
      {...state}
    />
  );
}

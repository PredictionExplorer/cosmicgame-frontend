'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { AnchorDistributionImprint } from '@/services/api';

import { TokenCell } from './TokenCell';
import type { AnchoringLedgerProps } from './ledgerProps';
import { useSignatureSeeds } from './useSignatureSeeds';

interface RwalkAnchorDistributionImprintsTableProps extends AnchoringLedgerProps {
  list: AnchorDistributionImprint[];
  /** Hide the recipient column on a page about one address. */
  showRecipient?: boolean;
  /** An explicit empty-state title (the default speaks of the whole protocol). */
  emptyTitle?: string;
}

/**
 * Anchored-NFT Stellar Selection imprints: each row is a Cosmic Signature NFT
 * imprinted to the anchor-holder of a selected Random Walk NFT, shown by its
 * artwork, with the recipient, the cycle and the transaction.
 */
export const RwalkAnchorDistributionImprintsTable = ({
  list,
  showRecipient = true,
  emptyTitle,
  headingLevel = 3,
  ...state
}: RwalkAnchorDistributionImprintsTableProps) => {
  const t = useTranslations('anchoring');
  // The rows carry no seed: one collection read serves every thumbnail.
  const { pending: seedsPending, seedFor } = useSignatureSeeds(list.length > 0);

  const columns = useMemo<DataTableColumn<AnchorDistributionImprint>[]>(
    () =>
      [
        {
          id: 'token',
          kind: 'link',
          header: t('tables.randomWalkImprints.columns.tokenId'),
          value: (row) => row.TokenId,
          cell: (row) => (
            <TokenCell
              collection="cosmicSignature"
              tokenId={row.TokenId}
              seed={seedFor(row.TokenId)}
              seedPending={seedsPending}
              thumbnail
            />
          ),
        } satisfies DataTableColumn<AnchorDistributionImprint>,
        showRecipient
          ? ({
              id: 'recipient',
              kind: 'address',
              header: t('tables.randomWalkImprints.columns.recipient'),
              value: (row) => row.WinnerAddr,
            } satisfies DataTableColumn<AnchorDistributionImprint>)
          : null,
        {
          id: 'cycle',
          kind: 'link',
          header: t('tables.randomWalkImprints.columns.cycle'),
          value: (row) => row.RoundNum,
          href: (row) => `/allocation/${row.RoundNum}`,
        } satisfies DataTableColumn<AnchorDistributionImprint>,
        {
          id: 'datetime',
          kind: 'datetime',
          header: t('tables.randomWalkImprints.columns.datetime'),
          value: (row) => row.TimeStamp,
          txHash: (row) => row.TxHash,
        } satisfies DataTableColumn<AnchorDistributionImprint>,
      ].filter((column) => column !== null),
    [seedFor, seedsPending, showRecipient, t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.randomWalkImprints.label')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={emptyTitle ?? t('common.empty.imprints.title')}
      emptyDescription={t('common.empty.imprints.description')}
      headingLevel={headingLevel}
      {...state}
    />
  );
};

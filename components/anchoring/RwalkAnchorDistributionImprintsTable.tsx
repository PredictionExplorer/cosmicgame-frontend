'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  DataTable,
  TableLink,
  TxProofLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
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
 * artwork, with the recipient, the cycle and the transaction. On a phone each
 * record is one media object: the art at the start, its number and a caption
 * line ("Cycle #1 · Aug 11") beside it, then the recipient.
 */
export const RwalkAnchorDistributionImprintsTable = ({
  list,
  showRecipient = true,
  emptyTitle,
  headingLevel = 3,
  ...state
}: RwalkAnchorDistributionImprintsTableProps) => {
  const t = useTranslations('anchoring');
  const tCommon = useTranslations('common');
  // The rows carry no seed: one collection read serves every thumbnail.
  const { pending: seedsPending, seedFor } = useSignatureSeeds(list.length > 0);

  const columns = useMemo<DataTableColumn<AnchorDistributionImprint>[]>(() => {
    const cycleLink = (row: AnchorDistributionImprint) => (
      <TableLink href={`/allocation/${row.RoundNum}`}>
        {tCommon('pageHeader.crumbs.cycle', { cycle: row.RoundNum })}
      </TableLink>
    );
    return [
      {
        id: 'token',
        kind: 'link',
        header: t('tables.randomWalkImprints.columns.tokenId'),
        // The record's media object (the art and its number) heads a phone record unlabelled.
        label: '',
        value: (row) => row.TokenId,
        stack: true,
        cell: (row) => (
          <TokenCell
            collection="cosmicSignature"
            tokenId={row.TokenId}
            seed={seedFor(row.TokenId)}
            seedPending={seedsPending}
            thumbnail
            phoneCaption={
              <>
                {cycleLink(row)}
                {' · '}
                <TxProofLink hash={row.TxHash}>
                  <DateTime timestamp={row.TimeStamp} />
                </TxProofLink>
              </>
            }
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
        // "Cycle #1", not a bare "1": a word-sized link, as every other ledger names a cycle.
        cell: cycleLink,
        nowrap: true,
        // On a phone the token's caption carries the cycle and the date.
        priority: 'secondary',
      } satisfies DataTableColumn<AnchorDistributionImprint>,
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.randomWalkImprints.columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        priority: 'secondary',
      } satisfies DataTableColumn<AnchorDistributionImprint>,
    ].filter((column) => column !== null);
  }, [seedFor, seedsPending, showRecipient, t, tCommon]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.randomWalkImprints.label')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={emptyTitle ?? t('common.empty.imprints.title')}
      emptyDescription={t('common.empty.imprints.description')}
      headingLevel={headingLevel}
      layout="cards"
      {...state}
    />
  );
};

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn, TableLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import type { AnchoredTokenInfo } from '@/services/api';

import { TokenCell } from './TokenCell';
import { anchorActionHref } from './anchorLinks';
import type { AnchoringLedgerProps } from './ledgerProps';

interface GlobalAnchoredTokensTableProps extends AnchoringLedgerProps {
  list: AnchoredTokenInfo[];
  IsRWLK: boolean;
}

/** The token id of an anchored row: flat on Random Walk rows, nested on Cosmic Signature rows. */
function anchoredTokenId(row: AnchoredTokenInfo, isRandomWalk: boolean): number | undefined {
  return isRandomWalk ? row.StakedTokenId : row.TokenInfo?.TokenId;
}

/**
 * Newest anchored first: by the anchor's time, then (for NFTs anchored in one
 * transaction, which share it) by the anchor action, so the ledger reads in
 * the actions ledger's order above it. Ascending; the table flips it.
 */
function byAnchorTime(a: AnchoredTokenInfo, b: AnchoredTokenInfo): number {
  return (
    (a.StakeTimeStamp ?? 0) - (b.StakeTimeStamp ?? 0) ||
    (a.StakeActionId ?? 0) - (b.StakeActionId ?? 0)
  );
}

/**
 * Every NFT anchored right now in one collection, shown by its artwork: when
 * it was anchored, the anchor action and its anchor-holder. Newest anchored
 * first, like the actions ledger above it; the date and the NFT sort from
 * their headers. The columns explain themselves, so no header carries an
 * info button. On a phone each record is one media object: the art, its
 * number and "Aug 11 · Action #34" beside it, then the anchor-holder.
 */
export const GlobalAnchoredTokensTable = ({
  list,
  IsRWLK,
  headingLevel = 3,
  ...state
}: GlobalAnchoredTokensTableProps) => {
  const t = useTranslations('anchoring');
  const collection = IsRWLK ? 'randomWalk' : 'cosmicSignature';

  const columns = useMemo<DataTableColumn<AnchoredTokenInfo>[]>(() => {
    const actionLink = (row: AnchoredTokenInfo) => (
      <TableLink href={anchorActionHref(collection, row.StakeActionId)}>
        {t('anchorActionDetail.breadcrumbs.action', { id: row.StakeActionId })}
      </TableLink>
    );
    return [
      {
        id: 'token',
        kind: 'link',
        header: t('tables.globalAnchoredTokens.headers.tokenId.desktop'),
        // The record's media object (the art and its number) heads a phone record unlabelled.
        label: '',
        value: (row) => anchoredTokenId(row, IsRWLK),
        sortable: true,
        stack: true,
        cell: (row) => {
          const tokenId = anchoredTokenId(row, IsRWLK);
          return tokenId === undefined ? null : (
            <TokenCell
              collection={collection}
              tokenId={tokenId}
              seed={IsRWLK ? undefined : (row.TokenInfo?.Seed ?? null)}
              thumbnail
              phoneCaption={
                <>
                  <DateTime timestamp={row.StakeTimeStamp} />
                  {' · '}
                  {actionLink(row)}
                </>
              }
            />
          );
        },
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.globalAnchoredTokens.headers.anchorDatetime.desktop'),
        label: t('tables.globalAnchoredTokens.headers.anchorDatetime.mobile'),
        value: (row) => row.StakeTimeStamp,
        compare: byAnchorTime,
        sortable: true,
        // On a phone the token's caption carries the date and the action.
        priority: 'secondary',
      },
      {
        id: 'action',
        kind: 'link',
        header: t('tables.globalAnchoredTokens.headers.actionId.desktop'),
        label: t('tables.globalAnchoredTokens.headers.actionId.mobile'),
        value: (row) => row.StakeActionId,
        cell: actionLink,
        priority: 'secondary',
      },
      {
        id: 'holder',
        kind: 'address',
        header: t('tables.globalAnchoredTokens.headers.holderAddress.desktop'),
        label: t('tables.globalAnchoredTokens.headers.holderAddress.mobile'),
        value: (row) => row.UserAddr,
      },
    ];
  }, [IsRWLK, collection, t]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.globalAnchoredTokens.label')}
      getRowKey={(row) => row.StakeEvtLogId ?? row.StakeActionId}
      initialSort={{ id: 'datetime', direction: 'desc' }}
      emptyTitle={t('common.empty.tokens.title')}
      emptyDescription={t('common.empty.tokens.description')}
      tableClassName="sm:min-w-[40rem] lg:min-w-0"
      headingLevel={headingLevel}
      layout="cards"
      // Three links a row (the NFT, the action and the holder): ink until hover.
      links="quiet"
      {...state}
    />
  );
};

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn, TableLink } from '@/components/ui/data-table';
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
 * Every NFT anchored right now in one collection, shown by its artwork: when
 * it was anchored, the anchor action and its anchor-holder.
 */
export const GlobalAnchoredTokensTable = ({
  list,
  IsRWLK,
  headingLevel = 3,
  ...state
}: GlobalAnchoredTokensTableProps) => {
  const t = useTranslations('anchoring');
  const collection = IsRWLK ? 'randomWalk' : 'cosmicSignature';

  const columns = useMemo<DataTableColumn<AnchoredTokenInfo>[]>(
    () => [
      {
        id: 'token',
        kind: 'link',
        header: t('tables.globalAnchoredTokens.headers.tokenId.desktop'),
        label: t('tables.globalAnchoredTokens.headers.tokenId.mobile'),
        help: t('tables.globalAnchoredTokens.headers.tokenId.tooltip'),
        value: (row) => anchoredTokenId(row, IsRWLK),
        cell: (row) => {
          const tokenId = anchoredTokenId(row, IsRWLK);
          return tokenId === undefined ? null : (
            <TokenCell
              collection={collection}
              tokenId={tokenId}
              seed={IsRWLK ? undefined : (row.TokenInfo?.Seed ?? null)}
              thumbnail
            />
          );
        },
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.globalAnchoredTokens.headers.anchorDatetime.desktop'),
        label: t('tables.globalAnchoredTokens.headers.anchorDatetime.mobile'),
        help: t('tables.globalAnchoredTokens.headers.anchorDatetime.tooltip'),
        value: (row) => row.StakeTimeStamp,
      },
      {
        id: 'action',
        kind: 'link',
        header: t('tables.globalAnchoredTokens.headers.actionId.desktop'),
        label: t('tables.globalAnchoredTokens.headers.actionId.mobile'),
        help: t('tables.globalAnchoredTokens.headers.actionId.tooltip'),
        value: (row) => row.StakeActionId,
        cell: (row) => (
          <TableLink href={anchorActionHref(collection, row.StakeActionId)}>
            {t('anchorActionDetail.breadcrumbs.action', { id: row.StakeActionId })}
          </TableLink>
        ),
      },
      {
        id: 'holder',
        kind: 'address',
        header: t('tables.globalAnchoredTokens.headers.holderAddress.desktop'),
        label: t('tables.globalAnchoredTokens.headers.holderAddress.mobile'),
        help: t('tables.globalAnchoredTokens.headers.holderAddress.tooltip'),
        value: (row) => row.UserAddr,
      },
    ],
    [IsRWLK, collection, t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.globalAnchoredTokens.label')}
      getRowKey={(row) => row.StakeEvtLogId ?? row.StakeActionId}
      emptyTitle={t('common.empty.tokens.title')}
      emptyDescription={t('common.empty.tokens.description')}
      tableClassName="sm:min-w-[40rem] lg:min-w-0"
      headingLevel={headingLevel}
      {...state}
    />
  );
};

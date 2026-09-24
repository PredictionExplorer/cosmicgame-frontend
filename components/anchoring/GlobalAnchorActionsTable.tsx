'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, TableLink, TableTag, type DataTableColumn } from '@/components/ui/data-table';

import { TokenCell } from './TokenCell';
import { anchorActionHref } from './anchorLinks';
import type { AnchoringLedgerProps } from './ledgerProps';

interface GlobalAnchorAction {
  EvtLogId: string | number;
  ActionId: number;
  TimeStamp: number;
  TxHash?: string;
  ActionType: number;
  TokenId: number;
  StakerAddr: string;
  NumStakedNFTs: number;
}

interface GlobalAnchorActionsTableProps extends AnchoringLedgerProps {
  list: GlobalAnchorAction[];
  IsRWLK: boolean;
}

/**
 * Every anchor and release across all anchor-holders for one collection. The
 * links say where they go, as in the anchored-NFT ledger below it: "Action
 * #34" (tagged Anchor or Release) opens the action's record, and the date,
 * with its up-right arrow, is the transaction's proof on the explorer. Only
 * the one non-obvious column, the running total, carries a definition.
 */
export const GlobalAnchorActionsTable = ({
  list,
  IsRWLK,
  headingLevel = 3,
  ...state
}: GlobalAnchorActionsTableProps) => {
  const t = useTranslations('anchoring');
  const collection = IsRWLK ? 'randomWalk' : 'cosmicSignature';

  const columns = useMemo<DataTableColumn<GlobalAnchorAction>[]>(
    () => [
      {
        id: 'action',
        kind: 'link',
        header: t('tables.globalAnchorActions.headers.actionType.desktop'),
        label: t('tables.globalAnchorActions.headers.actionType.desktop'),
        value: (row) => row.ActionId,
        cell: (row) => (
          <span className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:justify-start">
            <TableLink href={anchorActionHref(collection, row.ActionId)}>
              {t('anchorActionDetail.breadcrumbs.action', { id: row.ActionId })}
            </TableLink>
            <TableTag>{row.ActionType === 1 ? t('common.release') : t('common.anchor')}</TableTag>
          </span>
        ),
        nowrap: true,
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.globalAnchorActions.headers.anchorDatetime.desktop'),
        label: t('tables.globalAnchorActions.headers.anchorDatetime.mobile'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
      },
      {
        id: 'token',
        kind: 'link',
        header: t('tables.globalAnchorActions.headers.tokenId.desktop'),
        label: t('tables.globalAnchorActions.headers.tokenId.mobile'),
        value: (row) => row.TokenId,
        cell: (row) => <TokenCell collection={collection} tokenId={row.TokenId} />,
      },
      {
        id: 'holder',
        kind: 'address',
        header: t('tables.globalAnchorActions.headers.holderAddress.desktop'),
        label: t('tables.globalAnchorActions.headers.holderAddress.mobile'),
        value: (row) => row.StakerAddr,
      },
      {
        id: 'nfts',
        kind: 'count',
        header: t('tables.globalAnchorActions.headers.nftCount.desktop'),
        label: t('tables.globalAnchorActions.headers.nftCount.mobile'),
        help: t('tables.globalAnchorActions.headers.nftCount.tooltip'),
        value: (row) => row.NumStakedNFTs,
        // A running total: the record's action, date, token and holder come first on a phone.
        priority: 'secondary',
      },
    ],
    [collection, t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.globalAnchorActions.label')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('common.empty.actions.title')}
      emptyDescription={t('common.empty.actions.description')}
      tableClassName="sm:min-w-[44rem] lg:min-w-0"
      headingLevel={headingLevel}
      {...state}
    />
  );
};

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import { TokenCell } from './TokenCell';
import { anchorActionHref } from './anchorLinks';
import type { AnchoringLedgerProps } from './ledgerProps';

interface GlobalAnchorAction {
  EvtLogId: string | number;
  ActionId: number;
  TimeStamp: number;
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
 * Every anchor and release across all anchor-holders for one collection.
 * Headers carry the full column names with a definition; phone records use
 * the short names. Each row leads to the action's record.
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
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.globalAnchorActions.headers.anchorDatetime.desktop'),
        label: t('tables.globalAnchorActions.headers.anchorDatetime.mobile'),
        help: t('tables.globalAnchorActions.headers.anchorDatetime.tooltip'),
        value: (row) => row.TimeStamp,
      },
      {
        id: 'type',
        kind: 'text',
        header: t('tables.globalAnchorActions.headers.actionType.desktop'),
        label: t('tables.globalAnchorActions.headers.actionType.mobile'),
        help: t('tables.globalAnchorActions.headers.actionType.tooltip'),
        value: (row) => (row.ActionType === 1 ? t('common.release') : t('common.anchor')),
        nowrap: true,
      },
      {
        id: 'token',
        kind: 'link',
        header: t('tables.globalAnchorActions.headers.tokenId.desktop'),
        label: t('tables.globalAnchorActions.headers.tokenId.mobile'),
        help: t('tables.globalAnchorActions.headers.tokenId.tooltip'),
        value: (row) => row.TokenId,
        cell: (row) => <TokenCell collection={collection} tokenId={row.TokenId} />,
      },
      {
        id: 'holder',
        kind: 'address',
        header: t('tables.globalAnchorActions.headers.holderAddress.desktop'),
        label: t('tables.globalAnchorActions.headers.holderAddress.mobile'),
        help: t('tables.globalAnchorActions.headers.holderAddress.tooltip'),
        value: (row) => row.StakerAddr,
      },
      {
        id: 'nfts',
        kind: 'count',
        header: t('tables.globalAnchorActions.headers.nftCount.desktop'),
        label: t('tables.globalAnchorActions.headers.nftCount.mobile'),
        help: t('tables.globalAnchorActions.headers.nftCount.tooltip'),
        value: (row) => row.NumStakedNFTs,
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
      getRowHref={(row) => anchorActionHref(collection, row.ActionId)}
      getRowLabel={(row) => t('anchorActionDetail.breadcrumbs.action', { id: row.ActionId })}
      emptyTitle={t('common.empty.actions.title')}
      emptyDescription={t('common.empty.actions.description')}
      tableClassName="sm:min-w-[44rem] lg:min-w-0"
      headingLevel={headingLevel}
      {...state}
    />
  );
};

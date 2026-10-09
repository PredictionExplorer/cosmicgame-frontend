'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { AnchorAction } from '@/services/api';

import { TokenCell } from './TokenCell';
import { anchorActionHref } from './anchorLinks';
import type { AnchoringLedgerProps } from './ledgerProps';

interface AnchorActionsTableProps extends AnchoringLedgerProps {
  list: AnchorAction[];
  IsRwalk: boolean;
}

/**
 * One wallet's anchor and release actions for one collection, newest first.
 * Each row leads to the action's record.
 */
const AnchorActionsTable = ({
  list,
  IsRwalk,
  headingLevel = 3,
  ...state
}: AnchorActionsTableProps) => {
  const t = useTranslations('anchoring');
  const collection = IsRwalk ? 'randomWalk' : 'cosmicSignature';

  const columns = useMemo<DataTableColumn<AnchorAction>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.anchorActions.columns.datetime'),
        value: (row) => row.TimeStamp as number | undefined,
      },
      {
        id: 'type',
        kind: 'text',
        header: t('tables.anchorActions.columns.type'),
        value: (row) => (row.ActionType === 1 ? t('common.release') : t('common.anchor')),
        nowrap: true,
      },
      {
        id: 'token',
        kind: 'link',
        header: t('tables.anchorActions.columns.tokenId'),
        value: (row) => row.TokenId,
        cell: (row) => <TokenCell collection={collection} tokenId={row.TokenId} />,
      },
      {
        id: 'nfts',
        kind: 'count',
        header: t('tables.anchorActions.columns.nftCount'),
        value: (row) => row.NumStakedNFTs,
      },
    ],
    [collection, t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.anchorActions.label')}
      getRowKey={(row) => row.EvtLogId ?? row.ActionId}
      getRowHref={(row) => anchorActionHref(collection, row.ActionId)}
      getRowLabel={(row) => t('anchorActionDetail.breadcrumbs.action', { id: row.ActionId })}
      emptyTitle={t('common.empty.actions.title')}
      emptyDescription={t('common.empty.actions.description')}
      headingLevel={headingLevel}
      {...state}
    />
  );
};

export default AnchorActionsTable;

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { RewardsByToken } from '@/services/api';

import { tokenDistributionsHref } from './anchorLinks';
import type { AnchoringLedgerProps } from './ledgerProps';

interface AnchorDistribution extends RewardsByToken {
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
}

interface AnchorDistributionsTableProps extends AnchoringLedgerProps {
  list: AnchorDistribution[];
  /** The anchor-holder, for each NFT's distribution record. */
  address: string;
}

/**
 * ETH Anchor Distributions per anchored Cosmic Signature NFT: what each has
 * retrieved and what it has left to retrieve. Each row leads to the NFT's
 * deposit-by-deposit record.
 */
export const AnchorDistributionsTable = ({
  list,
  address,
  headingLevel = 3,
  ...state
}: AnchorDistributionsTableProps) => {
  const t = useTranslations('anchoring');

  const columns = useMemo<DataTableColumn<AnchorDistribution>[]>(
    () => [
      {
        id: 'token',
        kind: 'link',
        header: t('tables.tokenDistributions.columns.tokenId'),
        value: (row) => row.TokenId,
        cell: (row) => <span className="font-mono tabular-nums">{formatId(row.TokenId)}</span>,
      },
      {
        id: 'retrieved',
        kind: 'amount',
        header: t('tables.tokenDistributions.columns.retrievedEth'),
        value: (row) => row.RewardCollectedEth,
        showUnit: false,
        sortable: true,
      },
      {
        id: 'retrievable',
        kind: 'amount',
        header: t('tables.tokenDistributions.columns.retrievableEth'),
        value: (row) => row.RewardToCollectEth,
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
      ariaLabel={t('tables.tokenDistributions.label')}
      getRowKey={(row) => row.TokenId}
      getRowHref={(row) => tokenDistributionsHref(address, row.TokenId)}
      getRowLabel={(row) => t('distributionsByToken.title', { tokenId: row.TokenId })}
      emptyTitle={t('common.empty.distributions.title')}
      emptyDescription={t('common.empty.distributions.description')}
      headingLevel={headingLevel}
      {...state}
    />
  );
};

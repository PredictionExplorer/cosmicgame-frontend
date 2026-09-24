'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';

interface TokenDistribution {
  OwnerAddr: string;
  OwnerAid: string | number;
  NumTokens: number;
}

interface CSTokenDistributionTableProps extends LedgerStateProps {
  list: TokenDistribution[];
  /** Rows per page. Default: the shared ledger size, 20 (10 on a phone). */
  perPage?: number;
  /** Names the table; defaults to the statistics section it sits in. */
  ariaLabel?: string;
}

/**
 * Who holds the Cosmic Signature NFTs: each holder (linked to their
 * profile) and how many they hold, most first, on the shared ledger with
 * its phone layout, paging and empty state.
 */
export function CSTokenDistributionTable({
  list,
  perPage,
  ariaLabel,
  ...state
}: CSTokenDistributionTableProps) {
  const t = useTranslations('tables');
  const tStatistics = useTranslations('statistics');

  const columns = useMemo<DataTableColumn<TokenDistribution>[]>(
    () => [
      {
        id: 'owner',
        kind: 'address',
        header: t('statisticsColumns.ownerAddress'),
        value: (row) => row.OwnerAddr,
      },
      {
        id: 'tokens',
        kind: 'count',
        header: t('statisticsColumns.numberOfTokensOwned'),
        value: (row) => row.NumTokens,
        sortable: true,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={ariaLabel ?? tStatistics('tokens.sections.nftDistribution')}
      getRowKey={(row) => row.OwnerAid}
      pageSize={perPage}
      initialSort={{ id: 'tokens', direction: 'desc' }}
      emptyTitle={t('empty.tokens')}
      {...state}
    />
  );
}

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import type { NftHolder } from './nftOwnership';

/**
 * Who owns the Cosmic Signature NFTs: each address with the NFTs in its
 * wallet, the ones it has anchored, and both together, most first. Anchored
 * NFTs count with their anchor-holder, as on the address's profile; the
 * Anchoring Wallet that holds them is custody, not a holder, and the section
 * says how many it holds in a line above the ledger.
 */
export function NftHoldersLedger({ holders }: { holders: readonly NftHolder[] }) {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');

  const columns = useMemo<DataTableColumn<NftHolder>[]>(
    () => [
      {
        id: 'owner',
        kind: 'address',
        header: tTables('statisticsColumns.ownerAddress'),
        value: (row) => row.address,
      },
      {
        id: 'held',
        kind: 'count',
        header: t('tokens.nftHolders.inWallet'),
        value: (row) => row.held,
        sortable: true,
      },
      {
        id: 'anchored',
        kind: 'count',
        header: t('tokens.nftHolders.anchored'),
        value: (row) => row.anchored,
        sortable: true,
        priority: 'secondary',
      },
      {
        id: 'total',
        kind: 'count',
        header: t('tokens.nftHolders.total'),
        value: (row) => row.total,
        sortable: true,
      },
    ],
    [t, tTables],
  );

  return (
    <DataTable
      data={holders}
      columns={columns}
      ariaLabel={t('tokens.sections.nftDistribution')}
      getRowKey={(row) => row.address}
      initialSort={{ id: 'total', direction: 'desc' }}
    />
  );
}

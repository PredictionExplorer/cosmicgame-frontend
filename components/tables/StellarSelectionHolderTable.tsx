'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { sameAddress } from '@/utils/format';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useActiveWeb3React } from '@/hooks/web3';
import type { GestureInfo } from '@/services/api';

interface Holder {
  userAddr: string;
  count: number;
  ethProbability: number;
  NFTProbability: number;
}

interface StellarSelectionHolderTableProps extends LedgerStateProps {
  list: GestureInfo[];
  numRaffleEthWinner?: number;
  numRaffleNFTWinner?: number;
}

/**
 * Stellar Selection entries per participant this cycle (one per gesture),
 * most first, with the chance of at least one ETH or NFT selection given the
 * cycle's number of selections.
 */
function holdersFrom(
  list: readonly GestureInfo[],
  ethSelections: number,
  nftSelections: number,
): Holder[] {
  const counts = new Map<string, { userAddr: string; count: number }>();
  for (const gesture of list) {
    const key = gesture.BidderAddr.toLowerCase();
    const entry = counts.get(key) ?? { userAddr: gesture.BidderAddr, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  const total = list.length;
  return [...counts.values()]
    .map(({ userAddr, count }) => ({
      userAddr,
      count,
      ethProbability: 1 - Math.pow((total - count) / total, ethSelections),
      NFTProbability: 1 - Math.pow((total - count) / total, nftSelections),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * The cycle's Stellar Selection entries by participant. The connected
 * wallet's row stays at its true position, marked "You", with its position
 * above the table; it is never lifted to the top.
 */
const StellarSelectionHolderTable = ({
  list,
  numRaffleEthWinner,
  numRaffleNFTWinner,
  ...state
}: StellarSelectionHolderTableProps) => {
  const t = useTranslations('tables');
  const { account } = useActiveWeb3React();
  const ready = Boolean(numRaffleEthWinner && numRaffleNFTWinner);

  const holders = useMemo(
    () =>
      ready && list.length > 0
        ? holdersFrom(list, numRaffleEthWinner ?? 1, numRaffleNFTWinner ?? 1)
        : [],
    [ready, list, numRaffleEthWinner, numRaffleNFTWinner],
  );

  const columns = useMemo<DataTableColumn<Holder>[]>(
    () => [
      {
        id: 'holder',
        kind: 'address',
        header: t('columns.holder'),
        value: (row) => row.userAddr,
      },
      {
        id: 'entries',
        kind: 'count',
        header: t('columns.numberOfStellarEntries'),
        value: (row) => row.count,
      },
      {
        id: 'ethProbability',
        kind: 'percent',
        header: t('columns.ethSelectionProbability'),
        value: (row) => row.ethProbability,
        percentScale: 'ratio',
      },
      {
        id: 'nftProbability',
        kind: 'percent',
        header: t('columns.nftSelectionProbability'),
        value: (row) => row.NFTProbability,
        percentScale: 'ratio',
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={holders}
      columns={columns}
      ariaLabel={t('names.stellarSelectionEntries')}
      getRowKey={(row) => row.userAddr}
      isCurrentRow={(row) => sameAddress(row.userAddr, account)}
      emptyTitle={t('empty.stellarEntries')}
      {...state}
      // The chances need the cycle's selection counts; until they arrive the
      // rows are placeholders rather than an empty table.
      loading={state.loading || (list.length > 0 && !ready)}
    />
  );
};

export default StellarSelectionHolderTable;

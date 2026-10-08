'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount, sameAddress } from '@/utils/format';
import { getSelectionShare } from '@/lib/selectionStanding';
import { poolShareOf, type SelectionPool } from '@/lib/selectionWeights';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useActiveWeb3React } from '@/hooks/web3';
import type { GestureInfo } from '@/services/api';

interface PoolEntry {
  userAddr: string;
  /** The participant's gestures this cycle: their entries in the pool. */
  gestures: number;
  /** Their part of the pool, from 0 to 1 (lib/selectionStanding). */
  share: number;
}

interface StellarSelectionHolderTableProps extends LedgerStateProps {
  list: GestureInfo[];
  /** ETH Stellar Selections drawn at finalization, when the dashboard carries them. */
  stellarEthSelections?: number;
  /** NFT Stellar Selections drawn at finalization. */
  stellarNftSelections?: number;
  /**
   * The cycle's weighted pool from the V3 contract (hooks/useSelectionPool);
   * null or absent keeps the V1/V2 count-based share.
   */
  selectionPool?: SelectionPool | null;
}

/**
 * Each participant's entries in this cycle's Stellar Selection pool, most
 * first, with their share of the pool. On V1/V2 cycles the share is the
 * count it comes from divided by every gesture of the cycle; on V3 cycles
 * the ETH pool's share is weighted by each gesture's ETH cost, read from the
 * contract (lib/selectionWeights). It is never compounded into a chance of
 * "at least one" selection, which climbs toward 100% with every paid entry.
 */
function poolEntriesFrom(
  list: readonly GestureInfo[],
  selectionPool?: SelectionPool | null,
): PoolEntry[] {
  const counts = new Map<string, { userAddr: string; gestures: number }>();
  for (const gesture of list) {
    const key = gesture.BidderAddr.toLowerCase();
    const entry = counts.get(key) ?? { userAddr: gesture.BidderAddr, gestures: 0 };
    entry.gestures += 1;
    counts.set(key, entry);
  }
  return [...counts.values()]
    .map(({ userAddr, gestures }) => ({
      userAddr,
      gestures,
      share: selectionPool
        ? poolShareOf(selectionPool, userAddr)
        : (getSelectionShare({ totalGestures: list.length, myGestures: gestures })?.share ?? 0),
    }))
    .sort((a, b) => (b.share !== a.share ? b.share - a.share : b.gestures - a.gestures));
}

/**
 * The cycle's Stellar Selection pool by participant: three short columns, so
 * it stays a real table on a phone. The connected wallet's row stays at its
 * true position, marked "You", with its position above the table. Under the
 * table, how many selections finalization draws from the pool; the tab's note
 * says how they are drawn (with replacement), so the caption only counts.
 */
const StellarSelectionHolderTable = ({
  list,
  stellarEthSelections,
  stellarNftSelections,
  selectionPool = null,
  ...state
}: StellarSelectionHolderTableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const { account } = useActiveWeb3React();

  const entries = useMemo(() => poolEntriesFrom(list, selectionPool), [list, selectionPool]);

  const columns = useMemo<DataTableColumn<PoolEntry>[]>(
    () => [
      {
        id: 'participant',
        kind: 'address',
        header: t('columns.participant'),
        value: (row) => row.userAddr,
        phone: 'title',
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('columns.gesturesThisCycle'),
        value: (row) => row.gestures,
      },
      {
        id: 'share',
        kind: 'percent',
        header: t('columns.shareOfPool'),
        value: (row) => row.share,
        percentScale: 'ratio',
      },
    ],
    [t],
  );

  const drawsKnown =
    typeof stellarEthSelections === 'number' &&
    stellarEthSelections > 0 &&
    typeof stellarNftSelections === 'number' &&
    stellarNftSelections > 0;

  const captionParts = [
    drawsKnown
      ? t('stellarSelection.draws', {
          eth: formatCount(stellarEthSelections, locale),
          nft: formatCount(stellarNftSelections, locale),
        })
      : null,
    selectionPool ? t('stellarSelection.weightedNote') : null,
  ].filter((part): part is string => part !== null);

  return (
    <DataTable
      data={entries}
      columns={columns}
      ariaLabel={t('names.stellarSelectionEntries')}
      getRowKey={(row) => row.userAddr}
      isCurrentRow={(row) => sameAddress(row.userAddr, account)}
      emptyTitle={t('empty.stellarEntries')}
      caption={captionParts.length > 0 ? captionParts.join(' ') : undefined}
      {...state}
    />
  );
};

export default StellarSelectionHolderTable;

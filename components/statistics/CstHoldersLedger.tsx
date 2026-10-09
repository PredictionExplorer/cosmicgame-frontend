'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { arbitrum } from 'viem/chains';

import { activeChain } from '@/config/chains';
import { UNISWAP_V4_POOL_MANAGER_ARBITRUM } from '@/config/uniswap';
import { useFormat } from '@/hooks/useFormat';
import type { CTBalanceDistribution } from '@/services/api/types';
import { sameAddress } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

interface HolderRow extends CTBalanceDistribution {
  /** Share of the supply, 0 to 1; null when the supply is unknown. */
  share: number | null;
}

/** The Uniswap v4 pool liquidity's holder: its balance is liquidity, not a participant's. */
export function isUniswapLiquidity(
  address: string | null | undefined,
  chainId: number = activeChain.id,
): boolean {
  return chainId === arbitrum.id && sameAddress(address, UNISWAP_V4_POOL_MANAGER_ARBITRUM);
}

/**
 * Every CST holder with the share of the supply each holds, drawn as a bar in
 * the row: the concentration the old bar chart meant to show, in one list
 * with the balances instead of a chart and a table repeating each other.
 * Largest first; 20 rows a page, so the count in the header matches the
 * list. The Outreach Reserve wallet reads by its name (AddressChip), and so
 * does Uniswap's pool liquidity, the largest balance, which is no one's
 * holding.
 */
export function CstHoldersLedger({
  list,
  supply,
}: {
  list: readonly CTBalanceDistribution[];
  /** CST total supply; the balances' sum stands in while it is unknown. */
  supply: number | null;
}) {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');
  const format = useFormat();

  const rows = useMemo<HolderRow[]>(() => {
    const total =
      supply && supply > 0 ? supply : list.reduce((sum, row) => sum + (row.BalanceFloat || 0), 0);
    return [...list]
      .sort((a, b) => b.BalanceFloat - a.BalanceFloat)
      .map((row) => ({ ...row, share: total > 0 ? row.BalanceFloat / total : null }));
  }, [list, supply]);

  const columns = useMemo<DataTableColumn<HolderRow>[]>(
    () => [
      {
        id: 'owner',
        kind: 'address',
        header: tTables('statisticsColumns.ownerAddress'),
        value: (row) => row.OwnerAddr,
        cell: (row) => (
          <AddressChip
            address={row.OwnerAddr}
            variant="plain"
            showCopy={false}
            label={
              isUniswapLiquidity(row.OwnerAddr) ? t('tokens.holders.uniswapLiquidity') : undefined
            }
          />
        ),
      },
      {
        id: 'balance',
        kind: 'amount',
        unit: 'CST',
        showUnit: false,
        header: tTables('statisticsColumns.cstBalance'),
        value: (row) => row.BalanceFloat,
        sortable: true,
      },
      {
        id: 'share',
        kind: 'percent',
        percentScale: 'ratio',
        header: t('tokens.holders.share'),
        help: t('tokens.holders.shareHelp'),
        value: (row) => row.share,
        cell: (row) =>
          row.share === null ? null : (
            <span className="inline-flex items-center justify-end gap-3">
              <span
                aria-hidden
                className="hidden h-1.5 w-20 overflow-hidden rounded-pill bg-rule sm:block"
              >
                <span
                  className="block h-full rounded-pill bg-data-1"
                  style={{ width: `${Math.max(1, Math.min(100, row.share * 100))}%` }}
                />
              </span>
              {/* A fixed slot (the widest share, "100.0 %", fits), so every bar starts at one x. */}
              <span className="min-w-[7ch] text-right tabular-nums">
                {format.percent(row.share, {
                  scale: 'ratio',
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
            </span>
          ),
      },
    ],
    [format, t, tTables],
  );

  return (
    <DataTable
      data={rows}
      columns={columns}
      ariaLabel={t('tokens.sections.cstDistribution')}
      getRowKey={(row) => row.OwnerAid}
      initialSort={{ id: 'balance', direction: 'desc' }}
    />
  );
}

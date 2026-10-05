'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { sameAddress } from '@/utils/format';
import { Amount } from '@/components/ui/amount';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useActiveWeb3React } from '@/hooks/web3';

interface GestureEvent {
  BidderAddr: string;
  EthPriceEth: number;
}

interface SpenderInfo {
  bidderAddr: string;
  amount: number;
}

interface ETHSpentTableProps extends LedgerStateProps {
  list: GestureEvent[];
}

/**
 * ETH each participant has spent on gestures this cycle, largest first. A
 * CST gesture carries a negative ETH sentinel and counts as no ETH, so a
 * participant who only gestured with CST is not listed.
 */
function totalsBySpender(list: readonly GestureEvent[]): SpenderInfo[] {
  const totals = new Map<string, SpenderInfo>();
  for (const gesture of list) {
    const key = gesture.BidderAddr.toLowerCase();
    const entry = totals.get(key) ?? { bidderAddr: gesture.BidderAddr, amount: 0 };
    entry.amount += Math.max(0, gesture.EthPriceEth || 0);
    totals.set(key, entry);
  }
  return [...totals.values()]
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/**
 * ETH spent per participant. The connected wallet's row stays in its place
 * in the order, marked "You", with its position above the table.
 */
const ETHSpentTable = ({ list, ...state }: ETHSpentTableProps) => {
  const t = useTranslations('tables');
  const { account } = useActiveWeb3React();
  const spenders = useMemo(() => totalsBySpender(list), [list]);

  const columns = useMemo<DataTableColumn<SpenderInfo>[]>(
    () => [
      {
        id: 'participant',
        kind: 'address',
        header: t('columns.userAddress'),
        label: t('columns.participant'),
        value: (row) => row.bidderAddr,
      },
      {
        id: 'spent',
        kind: 'amount',
        header: t('columns.spentAmountEth'),
        value: (row) => row.amount,
        showUnit: false,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={spenders}
      columns={columns}
      ariaLabel={t('names.ethSpent')}
      getRowKey={(row) => row.bidderAddr}
      isCurrentRow={(row) => sameAddress(row.bidderAddr, account)}
      currentRowSummary={(row) => <Amount value={row.amount} unit="ETH" context="table" />}
      emptyTitle={t('empty.spenders')}
      {...state}
    />
  );
};

export default ETHSpentTable;

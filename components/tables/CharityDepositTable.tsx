'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, TableLink, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import { useCycleHref } from '@/components/tables/useCycleHref';

export interface PublicGoodsContributionEntry {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
}

interface CharityDepositTableProps extends LedgerStateProps {
  list: PublicGoodsContributionEntry[];
  /**
   * Show who contributed. The protocol's own ledger hides it: every row
   * there is the protocol forwarding a cycle's share, which the section
   * already says, and a column repeating it adds a line to every phone
   * record. Default `true`.
   */
  showContributor?: boolean;
}

/**
 * ETH that reached the Public Goods Vault. Each date links to its
 * transaction, and the protocol's own contract reads by name. Voluntary
 * contributions carry no cycle, so that column appears only when a row has one.
 */
export const CharityDepositTable = ({
  list,
  showContributor = true,
  ...state
}: CharityDepositTableProps) => {
  const t = useTranslations('tables');
  const cycleHref = useCycleHref();

  const columns = useMemo<DataTableColumn<PublicGoodsContributionEntry>[]>(() => {
    const all: (DataTableColumn<PublicGoodsContributionEntry> | false)[] = [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
        phone: 'title',
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('columns.cycle'),
        value: (row) => (row.RoundNum >= 0 ? row.RoundNum : null),
        // "Cycle 2", not a bare "2": a word-wide target that says where it leads.
        cell: (row) =>
          row.RoundNum >= 0 ? (
            <TableLink href={cycleHref(row.RoundNum)}>
              {t('allocation.cycle', { cycle: row.RoundNum })}
            </TableLink>
          ) : null,
        nowrap: true,
        hideWhenEmpty: true,
      },
      showContributor && {
        id: 'contributor',
        kind: 'address',
        // The header names who, not the form: a protocol contract reads by name.
        header: t('columns.contributor'),
        value: (row) => row.DonorAddr,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amountEth'),
        value: (row) => row.AmountEth,
        showUnit: false,
        sortable: true,
      },
    ];
    return all.filter((column): column is DataTableColumn<PublicGoodsContributionEntry> =>
      Boolean(column),
    );
  }, [t, showContributor, cycleHref]);

  return (
    <DataTable
      data={list}
      columns={columns}
      // The page's own title names it (voluntary and protocol ledgers differ).
      ariaLabel={
        typeof state.title === 'string' ? state.title : t('names.publicGoodsContributions')
      }
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('empty.contributions')}
      {...state}
    />
  );
};

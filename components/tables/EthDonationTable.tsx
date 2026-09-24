'use client';

import { useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { LedgerStateProps } from '@/components/tables/ledger-props';

export interface EthDonation {
  EvtLogId: string | number;
  TxHash: string;
  TimeStamp: number;
  RecordType: number;
  CGRecordId: string | number;
  RoundNum: string | number;
  DonorAddr: string;
  AmountEth: number;
}

interface EthDonationTableProps extends LedgerStateProps {
  list: EthDonation[];
  /** Show whether each contribution carried a note (the Note column). Default `true`. */
  showType?: boolean;
  /** Show the cycle column; a page about one cycle hides it. Default `true`. */
  showCycle?: boolean;
}

/**
 * Direct ETH contributions to the Cycle Reserve, newest first. A
 * contribution with a note says "With note" and leads to its record page;
 * one without shows a dash and links its date to the transaction. The cycle
 * links to that cycle's contribution list.
 */
const EthDonationTable = ({
  list,
  showType = true,
  showCycle = true,
  ...state
}: EthDonationTableProps) => {
  const t = useTranslations('tables');

  // A record has a detail page exactly when it carries a note (type > 0);
  // pages that hide the type column only list records that do.
  const hasDetail = useMemo(
    () => (row: EthDonation) => row.RecordType > 0 || !showType,
    [showType],
  );

  const columns = useMemo<DataTableColumn<EthDonation>[]>(() => {
    const all: (DataTableColumn<EthDonation> | false)[] = [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        // The detail page carries the transaction link for rows that have one;
        // a second link in the same cell would nest inside the row link.
        txHash: (row) => (hasDetail(row) ? null : row.TxHash),
        year: 'always',
        sortable: true,
      },
      showType && {
        id: 'note',
        kind: 'text',
        header: t('columns.note'),
        // One bit per row, in the form's own words: the contract calls a
        // contribution with a note `donateEthWithInfo`.
        value: (row) => (row.RecordType > 0 ? t('ethContribution.withNote') : null),
        cell: (row) =>
          row.RecordType > 0 ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-foreground">
              <MessageSquare aria-hidden className="size-3.5 shrink-0 text-subtle" />
              {t('ethContribution.withNote')}
            </span>
          ) : (
            <UnknownValue label={t('status.none')} />
          ),
      },
      showCycle && {
        id: 'cycle',
        kind: 'link',
        header: t('columns.round'),
        value: (row) => Number(row.RoundNum),
        href: (row) => `/eth-contribution/round/${row.RoundNum}`,
        sortable: true,
      },
      {
        id: 'contributor',
        kind: 'address',
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
    return all.filter((column): column is DataTableColumn<EthDonation> => Boolean(column));
  }, [t, showType, showCycle, hasDetail]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.ethContributions')}
      getRowKey={(row) => row.EvtLogId}
      getRowHref={(row) => (hasDetail(row) ? `/eth-contribution/detail/${row.CGRecordId}` : null)}
      getRowLabel={(row) => t('ethContribution.viewContribution', { id: String(row.CGRecordId) })}
      emptyTitle={t('empty.contributions')}
      initialSort={{ id: 'datetime', direction: 'desc' }}
      {...state}
    />
  );
};

export default EthDonationTable;

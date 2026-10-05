'use client';

import { useCallback, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import {
  DataTable,
  KindValue,
  TableLink,
  type DataTableColumn,
  type PhoneRecordContent,
  type PhoneRecordContext,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
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
 * Direct ETH contributions to the Cycle Reserve, newest first, read as when,
 * which cycle, who and how much. A contribution with a note says "With note"
 * in a last column and leads to its record page; one without leaves that
 * cell blank and links its date to the transaction, and a page where no row
 * has a note shows no Note column at all. The cycle links to that cycle's contribution list. Every row carries
 * several links, so they stay quiet until hovered or focused.
 *
 * On a phone a contribution is a two-line record like a transfer's: the date
 * and the amount on the first line; who contributed, the cycle and the note
 * under it, with no label repeated.
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

  // What a row shows in both layouts: the ledger's cells and its phone record.
  const cycleLink = useCallback(
    (row: EthDonation) => (
      // "Cycle 5", not a bare "5": a word-wide target that says where it leads.
      <TableLink href={`/eth-contribution/round/${row.RoundNum}`}>
        {t('allocation.cycle', { cycle: String(row.RoundNum) })}
      </TableLink>
    ),
    [t],
  );
  const withNote = useMemo(
    () => (
      // Its ink comes from where it stands: the cell's foreground, the record's second tier.
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <MessageSquare aria-hidden className="size-3.5 shrink-0 text-subtle" />
        {t('ethContribution.withNote')}
      </span>
    ),
    [t],
  );

  const phoneRecord = useCallback(
    (row: EthDonation, { linked }: PhoneRecordContext): PhoneRecordContent => ({
      // A contribution with a note leads to its record (the row link wraps
      // the date); one without links its date to the transaction.
      title: linked ? (
        <DateTime timestamp={row.TimeStamp} year="always" />
      ) : (
        <KindValue kind="datetime" value={row.TimeStamp} txHash={row.TxHash} year="always" />
      ),
      titleEnd: (
        <Amount value={row.AmountEth} unit="ETH" context="table" unitClassName="text-subtle" />
      ),
      details: [
        <KindValue key="contributor" kind="address" value={row.DonorAddr} />,
        showCycle ? cycleLink(row) : null,
        showType && row.RecordType > 0 ? withNote : null,
      ],
    }),
    [cycleLink, showCycle, showType, withNote],
  );

  const columns = useMemo<DataTableColumn<EthDonation>[]>(() => {
    // The phone record says all but the date, which opens it.
    const all: (DataTableColumn<EthDonation> | false)[] = [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        // A row with a detail page links its date there instead (DataTable
        // drops a kind's own link inside the row link); the page carries
        // the transaction.
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
        phone: 'title',
      },
      showCycle && {
        id: 'cycle',
        kind: 'link',
        header: t('columns.round'),
        value: (row) => Number(row.RoundNum),
        cell: cycleLink,
        nowrap: true,
        sortable: true,
        phone: 'omit',
      },
      {
        id: 'contributor',
        kind: 'address',
        header: t('columns.contributor'),
        value: (row) => row.DonorAddr,
        phone: 'omit',
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amountEth'),
        value: (row) => row.AmountEth,
        showUnit: false,
        sortable: true,
        phone: 'omit',
      },
      showType && {
        id: 'note',
        kind: 'text',
        header: t('columns.note'),
        // One bit per row, in the form's own words: the contract calls a
        // contribution with a note `donateEthWithInfo`.
        value: (row) => (row.RecordType > 0 ? t('ethContribution.withNote') : null),
        // A blank cell, not a dash, for a contribution without one; no note
        // on the page, no column.
        cell: (row) =>
          row.RecordType > 0 ? <span className="text-foreground">{withNote}</span> : null,
        hideWhenEmpty: true,
        phone: 'omit',
      },
    ];
    return all.filter((column): column is DataTableColumn<EthDonation> => Boolean(column));
  }, [t, showType, showCycle, cycleLink, withNote]);

  return (
    <DataTable
      data={list}
      columns={columns}
      phoneRecord={phoneRecord}
      ariaLabel={t('names.ethContributions')}
      getRowKey={(row) => row.EvtLogId}
      getRowHref={(row) => (hasDetail(row) ? `/eth-contribution/detail/${row.CGRecordId}` : null)}
      getRowLabel={(row) => t('ethContribution.viewContribution', { id: String(row.CGRecordId) })}
      emptyTitle={t('empty.contributions')}
      initialSort={{ id: 'datetime', direction: 'desc' }}
      links="quiet"
      {...state}
    />
  );
};

export default EthDonationTable;

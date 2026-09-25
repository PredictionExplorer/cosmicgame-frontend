'use client';

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { DataTable, TableTag, type DataTableColumn } from '@/components/ui/data-table';
import { useCycleCell } from '@/components/tables/useCycleCell';
import { toFiniteNumber } from '@/utils/finiteNumber';

import { RetrievalDeadline } from './RetrievalDeadline';
import type { RetrievalDeadlines } from './useRetrievalDeadlines';

/** One ETH allocation of a wallet: a Stellar Selection or Chrono-Warrior deposit. */
export interface EthAllocationRow {
  EvtLogId?: number;
  TxHash?: string;
  TimeStamp?: number;
  RoundNum?: number;
  Amount?: number;
  /** 7 Chrono-Warrior ETH, 10 Stellar Selection ETH (utils/allocationRecords). */
  RecordType?: number;
  Claimed?: boolean;
}

type EthSource = 'stellarSelection' | 'chronoWarrior';

const SOURCE_BY_RECORD_TYPE: Readonly<Record<number, EthSource>> = {
  7: 'chronoWarrior',
  10: 'stellarSelection',
  18: 'stellarSelection',
};

export interface EthAllocationsTableProps {
  rows: readonly EthAllocationRow[];
  /** Names the table (and its scroll region). */
  ariaLabel: string;
  /**
   * Each cycle's retrieval deadline: adds a "Retrieve by" column. Only
   * meaningful for ETH that is still waiting.
   */
  deadlines?: RetrievalDeadlines;
  /** Adds whether each allocation was retrieved (a wallet's whole history). */
  showStatus?: boolean;
  /** Where each allocation came from; off where the page already says (Stellar Selection · ETH). */
  showSource?: boolean;
  loading?: boolean;
  /** A failed read: the message under `errorTitle`, with a retry. Never shown as empty. */
  error?: ReactNode;
  errorTitle?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** The concept the empty state is about (the Stellar Selection mark on its own page). */
  emptyIcon?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * A wallet's ETH allocations in one ledger: the cycle, where the ETH came
 * from, when it was allocated (linked to its transaction), the amount and,
 * where it applies, the retrieval deadline or whether it was retrieved.
 * Newest first; sortable by cycle, amount and date.
 */
export function EthAllocationsTable({
  rows,
  ariaLabel,
  deadlines,
  showStatus = false,
  showSource = true,
  ...state
}: EthAllocationsTableProps) {
  const t = useTranslations('myPages');
  const tTables = useTranslations('tables');
  const cycleCell = useCycleCell();

  const columns = useMemo<DataTableColumn<EthAllocationRow>[]>(() => {
    const cycleColumn: DataTableColumn<EthAllocationRow> = {
      id: 'cycle',
      kind: 'link',
      header: t('ethAllocations.columns.cycle'),
      value: (row) => row.RoundNum,
      cell: (row) => (typeof row.RoundNum === 'number' ? cycleCell(row.RoundNum) : null),
      nowrap: true,
      sortable: true,
    };
    const sourceColumn: DataTableColumn<EthAllocationRow> = {
      id: 'source',
      kind: 'text',
      header: t('ethAllocations.columns.source'),
      value: (row) => {
        const source =
          row.RecordType === undefined ? undefined : SOURCE_BY_RECORD_TYPE[row.RecordType];
        return source ? t(`ethAllocations.sources.${source}`) : null;
      },
      cell: (_row, { value }) => <Badge size="sm">{String(value)}</Badge>,
      hideWhenEmpty: true,
    };
    const list: DataTableColumn<EthAllocationRow>[] = [
      cycleColumn,
      ...(showSource ? [sourceColumn] : []),
      {
        id: 'allocated',
        kind: 'datetime',
        header: t('ethAllocations.columns.allocated'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        sortable: true,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('ethAllocations.columns.amount'),
        value: (row) => toFiniteNumber(row.Amount),
        sortable: true,
      },
    ];
    if (deadlines) {
      list.push({
        id: 'deadline',
        kind: 'text',
        header: t('ethAllocations.columns.deadline'),
        help: t('ethAllocations.deadline.help'),
        value: (row) => (typeof row.RoundNum === 'number' ? deadlines[row.RoundNum] : undefined),
        cell: (row) => (
          <RetrievalDeadline
            deadline={typeof row.RoundNum === 'number' ? deadlines[row.RoundNum] : undefined}
          />
        ),
        whenBlank: 'unknown',
      });
    }
    if (showStatus) {
      list.push({
        id: 'status',
        kind: 'text',
        header: t('ethAllocations.columns.status'),
        value: (row) => (row.Claimed === undefined ? null : row.Claimed ? 1 : 0),
        // As every allocation ledger marks it: the row that needs action carries the accent
        // tag; a finished one reads quietly.
        cell: (row) =>
          row.Claimed ? (
            <span className="text-subtle">{tTables('recipientHistory.retrieved')}</span>
          ) : (
            <TableTag tone="accent">{tTables('recipientHistory.readyToRetrieve')}</TableTag>
          ),
        whenBlank: 'unknown',
      });
    }
    return list;
  }, [cycleCell, deadlines, showSource, showStatus, t, tTables]);

  return (
    <DataTable
      data={rows}
      columns={columns}
      ariaLabel={ariaLabel}
      getRowKey={(row, index) => row.EvtLogId ?? `${row.TxHash ?? ''}-${index}`}
      initialSort={{ id: 'allocated', direction: 'desc' }}
      {...state}
    />
  );
}

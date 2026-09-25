'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useCycleCell } from '@/components/tables/useCycleCell';
import type { CSTAnchorDistribution } from '@/services/api';

import type { AnchoringLedgerProps } from './ledgerProps';

interface RetrievedCSTAnchorDistributionsTableProps extends AnchoringLedgerProps {
  list: CSTAnchorDistribution[];
}

/** ETH Anchor Distribution deposits an address has already retrieved, one row per deposit. */
export const RetrievedCSTAnchorDistributionsTable = ({
  list,
  headingLevel = 3,
  ...state
}: RetrievedCSTAnchorDistributionsTableProps) => {
  const t = useTranslations('anchoring');
  const cycleCell = useCycleCell();

  const columns = useMemo<DataTableColumn<CSTAnchorDistribution>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.retrievedDistributions.columns.depositDatetime'),
        value: (row) => row.DepositTimeStamp as number | undefined,
      },
      {
        id: 'deposit',
        kind: 'text',
        header: t('tables.retrievedDistributions.columns.depositId'),
        value: (row) => row.DepositId,
        nowrap: true,
        cellClassName: 'font-mono tabular-nums',
        priority: 'secondary',
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('tables.retrievedDistributions.columns.cycle'),
        value: (row) => row.RoundNum,
        cell: (row) => cycleCell(row.RoundNum),
        nowrap: true,
      },
      {
        id: 'deposited',
        kind: 'amount',
        header: t('tables.retrievedDistributions.columns.depositAmountEth'),
        value: (row) => row.TotalDepositAmountEth as number | undefined,
        showUnit: false,
      },
      {
        id: 'retrieved',
        kind: 'amount',
        header: t('tables.retrievedDistributions.columns.retrievedAmountEth'),
        value: (row) => row.YourCollectedAmountEth,
        showUnit: false,
        sortable: true,
      },
    ],
    [cycleCell, t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.retrievedDistributions.label')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('common.empty.retrieved.title')}
      emptyDescription={t('common.empty.retrieved.description')}
      headingLevel={headingLevel}
      {...state}
    />
  );
};

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { SystemModeChangeEvent } from '@/services/api/types';

type EventRow = SystemModeChangeEvent;
export type { EventRow };

interface SystemModesTableProps extends LedgerStateProps {
  /** Newest first: each activation ends when the one before it in the list began. */
  list: EventRow[];
}

/**
 * Cycle activations: when each cycle (or the deployment) became active and
 * when the next one replaced it. Each row leads to that window's
 * configuration changes.
 */
export const SystemModesTable = ({ list, ...state }: SystemModesTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<EventRow>[]>(
    () => [
      {
        id: 'cycle',
        kind: 'text',
        header: t('columns.round'),
        value: (row) => row.RoundNum,
        cell: (row) =>
          row.RoundNum ? t('allocation.cycle', { cycle: row.RoundNum }) : t('status.deployment'),
        nowrap: true,
      },
      {
        id: 'started',
        kind: 'datetime',
        header: t('columns.started'),
        value: (row) => row.TimeStamp,
      },
      {
        id: 'ended',
        kind: 'datetime',
        header: t('columns.ended'),
        value: (row) => row.TimeStamp,
        cell: (_row, { index }) => {
          const next = index > 0 ? list[index - 1] : undefined;
          return next ? (
            <DateTime timestamp={next.TimeStamp} />
          ) : (
            <span className="text-foreground">{t('status.currentlyActive')}</span>
          );
        },
      },
    ],
    [t, list],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.cycleActivations')}
      getRowKey={(row) => row.EvtLogId}
      getRowHref={(row) => `/system-event/${row.RoundNum}/${row.EvtLogId}/${row.NextEvtLogId}`}
      getRowLabel={() => t('systemModes.viewEvent')}
      emptyTitle={t('empty.modeChanges')}
      {...state}
    />
  );
};

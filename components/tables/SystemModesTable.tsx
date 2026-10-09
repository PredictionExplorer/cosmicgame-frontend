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
  /** Cycle activations, in any order. */
  list: EventRow[];
}

/**
 * When each activation ended, by `EvtLogId`: when the next one in time
 * began, or `null` for the one still active. Worked out from the list in
 * time order rather than from a row's position, which a sort would change.
 */
export function activationEnds(
  list: readonly Pick<EventRow, 'EvtLogId' | 'TimeStamp'>[],
): Map<EventRow['EvtLogId'], number | null> {
  const inTime = [...list].sort(
    (a, b) => a.TimeStamp - b.TimeStamp || Number(a.EvtLogId) - Number(b.EvtLogId),
  );
  return new Map(
    inTime.map((row, index) => [row.EvtLogId, inTime[index + 1]?.TimeStamp ?? null] as const),
  );
}

/**
 * Cycle activations: when each cycle (or the deployment) became active and
 * when the next one replaced it. Each row leads to that window's
 * configuration changes.
 */
export const SystemModesTable = ({ list, ...state }: SystemModesTableProps) => {
  const t = useTranslations('tables');
  const ends = useMemo(() => activationEnds(list), [list]);

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
        phone: 'title',
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
        value: (row) => ends.get(row.EvtLogId) ?? null,
        cell: (_row, { value }) =>
          typeof value === 'number' ? (
            <DateTime timestamp={value} />
          ) : (
            <span className="text-foreground">{t('status.currentlyActive')}</span>
          ),
      },
    ],
    [t, ends],
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

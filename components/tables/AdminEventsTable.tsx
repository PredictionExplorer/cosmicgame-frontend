'use client';

import { useMemo, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { formatCount, formatPercent } from '@/utils/format';
import { ADMIN_EVENTS } from '@/config/misc';
import { AddressChip } from '@/components/ui/address-chip';
import { DataTable, ExternalTableLink, type DataTableColumn } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { AdminEventRow } from '@/services/api/types';

export type { AdminEventRow };

const MICROSECONDS_PER_SECOND = 1_000_000;

type AdminEvent = (typeof ADMIN_EVENTS)[number] & { type?: string };

const WEB_URL = /^(?:https?|ipfs):\/\//i;

interface AdminEventsTableProps extends LedgerStateProps {
  list: AdminEventRow[];
  /**
   * Changes from before the list (a window's earlier history), so the first
   * change of a parameter in the list can still say what it replaced.
   */
  history?: readonly AdminEventRow[];
}

/**
 * For each change, the change to the same parameter just before it in the
 * list (by event order), so a row can say what the value was. The first
 * change of a parameter in the list has none.
 */
export function previousChanges(list: readonly AdminEventRow[]): Map<string, AdminEventRow> {
  const byOrder = [...list].sort((a, b) => Number(a.EvtLogId) - Number(b.EvtLogId));
  const latest = new Map<number, AdminEventRow>();
  const previous = new Map<string, AdminEventRow>();
  for (const row of byOrder) {
    const before = latest.get(row.RecordType);
    if (before) previous.set(String(row.EvtLogId), before);
    latest.set(row.RecordType, row);
  }
  return previous;
}

/**
 * Configuration changes recorded on chain, newest first: which parameter
 * changed (the name explains itself on hover, focus or tap), when (linked to
 * its transaction), and its new value next to the value it replaced,
 * formatted by what the parameter measures (a duration, a percentage, an
 * address, a date).
 */
export const AdminEventsTable = ({
  list,
  history,
  emptyTitle,
  ...state
}: AdminEventsTableProps) => {
  const t = useTranslations('tables');
  const tCoordination = useTranslations('coordination');
  const tStatistics = useTranslations('statistics');
  const locale = useLocale();

  const previous = useMemo(
    () => previousChanges(history ? [...history, ...list] : list),
    [history, list],
  );

  const columns = useMemo<DataTableColumn<AdminEventRow>[]>(() => {
    const eventOf = (row: AdminEventRow): AdminEvent | undefined =>
      ADMIN_EVENTS[row.RecordType] as AdminEvent | undefined;
    const nameOf = (row: AdminEventRow) => {
      const event = eventOf(row);
      return event?.messageKey ? tCoordination(`events.${event.messageKey}`) : t('status.unknown');
    };

    const valueOf = (row: AdminEventRow): ReactNode => {
      const event = eventOf(row);
      if (row.RecordType === 0) return <UnknownValue label={t('status.unavailable')} />;
      switch (event?.type) {
        case 'timestamp':
          return <DateTime timestamp={row.IntegerValue} year="always" />;
        case 'percentage':
          return formatPercent(row.IntegerValue, locale);
        case 'number':
          return formatCount(row.IntegerValue, locale);
        case 'time':
          return <Duration seconds={row.IntegerValue} />;
        case 'microseconds':
          return <Duration seconds={row.IntegerValue / MICROSECONDS_PER_SECOND} />;
        case 'address':
          return row.AddressValue ? (
            <AddressChip address={row.AddressValue} variant="plain" />
          ) : (
            <UnknownValue label={t('status.unavailable')} />
          );
        default: {
          const value = row.StringValue?.trim();
          if (!value) return <UnknownValue label={t('status.unavailable')} />;
          return WEB_URL.test(value) ? (
            <ExternalTableLink href={value} className="break-all">
              {value}
            </ExternalTableLink>
          ) : (
            <span className="break-all">{value}</span>
          );
        }
      }
    };

    return [
      {
        id: 'event',
        kind: 'text',
        header: t('columns.event'),
        value: nameOf,
        cell: (row) => {
          const event = eventOf(row);
          const name = nameOf(row);
          const explanation = event?.messageKey
            ? tStatistics(`systemEvent.adminEvents.${event.messageKey}`)
            : event?.description;
          // The name explains itself (a dotted underline, one tab stop)
          // rather than carrying an info button after it on every row. On a
          // phone a transparent pad gives the word a 44px target without
          // making the row taller.
          return explanation ? (
            <ExplainedTerm
              definition={explanation}
              data-touch-target="extended"
              className={cn(TOUCH_TARGET_EXTENDED_CLASS, 'text-foreground')}
            >
              {name}
            </ExplainedTerm>
          ) : (
            <span className="text-foreground">{name}</span>
          );
        },
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        // Changes made in one transaction share a timestamp; the event
        // order keeps them in the order they were applied.
        compare: (a, b) => a.TimeStamp - b.TimeStamp || Number(a.EvtLogId) - Number(b.EvtLogId),
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
      },
      {
        id: 'newValue',
        kind: 'text',
        header: t('columns.newValue'),
        value: (row) => row.RecordType,
        cell: valueOf,
      },
      {
        id: 'previousValue',
        kind: 'text',
        header: t('columns.previousValue'),
        value: (row) => (previous.has(String(row.EvtLogId)) ? row.RecordType : null),
        cell: (row) => {
          const before = previous.get(String(row.EvtLogId));
          return before ? <span className="text-subtle">{valueOf(before)}</span> : null;
        },
        hideWhenEmpty: true,
        priority: 'secondary',
      },
    ];
  }, [t, tCoordination, tStatistics, locale, previous]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.parameterChanges')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={emptyTitle ?? t('adminEvents.empty')}
      initialSort={{ id: 'datetime', direction: 'desc' }}
      layout="cards"
      {...state}
    />
  );
};

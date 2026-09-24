'use client';

import { useMemo, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount, formatPercent } from '@/utils/format';
import { ADMIN_EVENTS } from '@/config/misc';
import { AddressChip } from '@/components/ui/address-chip';
import { DataTable, ExternalTableLink, type DataTableColumn } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { AdminEventRow } from '@/services/api/types';

export type { AdminEventRow };

const MICROSECONDS_PER_SECOND = 1_000_000;

type AdminEvent = (typeof ADMIN_EVENTS)[number] & { type?: string };

const WEB_URL = /^(?:https?|ipfs):\/\//i;

interface AdminEventsTableProps extends LedgerStateProps {
  list: AdminEventRow[];
}

/**
 * Configuration changes recorded on chain: which parameter changed, when
 * (linked to its transaction) and its new value, formatted by what the
 * parameter measures (a duration, a percentage, an address, a date).
 */
export const AdminEventsTable = ({ list, ...state }: AdminEventsTableProps) => {
  const t = useTranslations('tables');
  const tCoordination = useTranslations('coordination');
  const tStatistics = useTranslations('statistics');
  const locale = useLocale();

  const columns = useMemo<DataTableColumn<AdminEventRow>[]>(() => {
    const eventOf = (row: AdminEventRow): AdminEvent | undefined =>
      ADMIN_EVENTS[row.RecordType] as AdminEvent | undefined;
    const nameOf = (row: AdminEventRow) => {
      const event = eventOf(row);
      return event?.messageKey ? tCoordination(`events.${event.messageKey}`) : t('status.unknown');
    };

    const newValue = (row: AdminEventRow): ReactNode => {
      const event = eventOf(row);
      if (row.RecordType === 0) return t('status.undefined');
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
          return (
            <span className="inline-flex max-w-full items-center gap-1.5 text-foreground">
              <span>{name}</span>
              {explanation ? (
                <InfoTooltip
                  content={explanation}
                  ariaLabel={tStatistics('systemEvent.explainEvent', { event: name })}
                  iconClassName="size-3.5"
                />
              ) : null}
            </span>
          );
        },
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
      },
      {
        id: 'newValue',
        kind: 'text',
        header: t('columns.newValue'),
        value: (row) => row.RecordType,
        cell: newValue,
      },
    ];
  }, [t, tCoordination, tStatistics, locale]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.parameterChanges')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('adminEvents.empty')}
      layout="cards"
      {...state}
    />
  );
};

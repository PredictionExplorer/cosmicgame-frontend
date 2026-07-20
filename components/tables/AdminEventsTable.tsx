'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, formatSeconds } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { ADMIN_EVENTS } from '@/config/misc';
import { CustomPagination } from '@/components/common/CustomPagination';
import { cn } from '@/lib/utils';
import type { AdminEventRow } from '@/services/api/types';

export type { AdminEventRow };

const AdminEventsRow = ({ row }: { row?: AdminEventRow }) => {
  const t = useTranslations('tables');
  const tCoordination = useTranslations('coordination');
  const tStatistics = useTranslations('statistics');
  const locale = useLocale();

  if (!row) {
    return <TablePrimaryRow />;
  }
  const event = ADMIN_EVENTS[row.RecordType];
  const eventName = event?.messageKey
    ? tCoordination(`events.${event.messageKey}`)
    : t('status.unknown');

  return (
    <TablePrimaryRow className={cn(row.TransferType > 0 && 'bg-white/[0.06]')}>
      <TablePrimaryCell>
        {eventName}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={tStatistics('systemEvent.explainEvent', {
                event: eventName,
              })}
              className="ml-2 inline-flex align-middle"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {event?.messageKey
              ? tStatistics(`systemEvent.adminEvents.${event.messageKey}`)
              : event?.description}
          </TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {row.RecordType === 0 ? (
          t('status.undefined')
        ) : event?.type === 'timestamp' ? (
          <HydrationSafeDateTime timestamp={row.IntegerValue} locale={locale} />
        ) : event?.type === 'percentage' ? (
          `${row.IntegerValue}%`
        ) : event?.type === 'number' ? (
          row.IntegerValue
        ) : event?.type === 'time' ? (
          formatSeconds(row.IntegerValue, locale)
        ) : event?.type === 'address' ? (
          <span className="font-mono">{row.AddressValue}</span>
        ) : (
          <a href={row.StringValue} target="_blank" rel="noopener noreferrer">
            {row.StringValue}
          </a>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const AdminEventsTable = ({ list }: { list: AdminEventRow[] }) => {
  const t = useTranslations('tables');
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-lg font-semibold">{t('empty.events')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup className="max-sm:hidden">
            <col width="40%" />
            <col width="15%" />
            <col width="45%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.event')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.newValue')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <AdminEventsRow row={row} key={row.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

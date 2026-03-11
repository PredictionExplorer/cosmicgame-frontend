'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, formatSeconds } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow className={cn(row.TransferType > 0 && 'bg-white/[0.06]')}>
      <TablePrimaryCell>
        {ADMIN_EVENTS[row.RecordType]?.name}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-2 inline-flex align-middle">
                <AlertCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{ADMIN_EVENTS[row.RecordType]?.description}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {row.RecordType === 0 ? (
          'Undefined'
        ) : ADMIN_EVENTS[row.RecordType]?.type === 'timestamp' ? (
          convertTimestampToDateTime(row.IntegerValue)
        ) : ADMIN_EVENTS[row.RecordType]?.type === 'percentage' ? (
          `${row.IntegerValue}%`
        ) : ADMIN_EVENTS[row.RecordType]?.type === 'number' ? (
          row.IntegerValue
        ) : ADMIN_EVENTS[row.RecordType]?.type === 'time' ? (
          formatSeconds(row.IntegerValue)
        ) : ADMIN_EVENTS[row.RecordType]?.type === 'address' ? (
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
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-lg font-semibold">No events yet.</p>;
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
              <TablePrimaryHeadCell align="left">Event</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">New Value</TablePrimaryHeadCell>
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

'use client';

import { useState } from 'react';
import { Link, TableBody, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { getExplorerUrl, convertTimestampToDateTime, formatSeconds } from '@/utils';
import { ADMIN_EVENTS } from '@/config/misc';
import { CustomPagination } from '@/components/common/CustomPagination';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

export interface AdminEventRow {
  EvtLogId: string;
  RecordType: number;
  TransferType: number;
  TimeStamp: number;
  TxHash: string;
  IntegerValue: number;
  AddressValue: string;
  StringValue: string;
}

const AdminEventsRow = ({ row }: { row?: AdminEventRow }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow sx={row.TransferType > 0 && { background: 'rgba(255, 255, 255, 0.06)' }}>
      <TablePrimaryCell>
        {ADMIN_EVENTS[row.RecordType]?.name}
        <Tooltip
          title={<Typography>{ADMIN_EVENTS[row.RecordType]?.description}</Typography>}
          sx={{ ml: 1 }}
        >
          <ErrorOutlineIcon fontSize="inherit" />
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
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
          <Typography fontFamily="monospace">{row.AddressValue}</Typography>
        ) : (
          <Link href={row.StringValue} target="_blank" rel="noopener noreferrer">
            {row.StringValue}
          </Link>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const AdminEventsTable = ({ list }: { list: AdminEventRow[] }) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <Typography variant="h6">No events yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobileView && (
            <colgroup>
              <col width="40%" />
              <col width="15%" />
              <col width="45%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Event</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">New Value</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <AdminEventsRow row={row} key={row.EvtLogId} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

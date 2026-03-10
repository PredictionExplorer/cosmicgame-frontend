/**
 * System Events Page - Displays administrative events within a specified time range
 * This page shows a paginated table of system events with their types, timestamps, and values
 */

import React, { useEffect, useState } from 'react';
import { Link, TableBody, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { GetServerSidePropsContext } from 'next';
import { Tr } from 'react-super-responsive-table';

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '../../../../components/styled';
import api from '../../../../services/api';
import { getExplorerUrl, convertTimestampToDateTime, formatSeconds } from '../../../../utils';
import { createOpenGraphProps } from '../../../../utils/seo';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { ADMIN_EVENTS } from '../../../../config/misc';
import { CustomPagination } from '../../../../components/common/CustomPagination';

/**
 * Renders a single row in the admin events table
 * @param row - The event data to display
 */
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

/**
 * Renders the paginated table of admin events
 * @param list - Array of admin events to display
 */
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

/**
 * Main component for the admin events page
 * Fetches and displays system events within the specified time range
 * @param start - Start timestamp for event range
 * @param end - End timestamp for event range
 */
interface AdminEventProps {
  start: number;
  end: number;
  round: number;
}

const AdminEvent = ({ start, end, round }: AdminEventProps) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AdminEventRow[]>([]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const sys_events = await api.get_system_events(start, end);
        setEvents(sys_events as AdminEventRow[]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  return (
    <MainWrapper>
      {round > 0 ? (
        <Typography variant="h4" color="primary" textAlign="center" mb={4} letterSpacing="1px">
          System Configuration Made Before Round {round}
        </Typography>
      ) : (
        <Typography variant="h4" color="primary" textAlign="center" mb={4} letterSpacing="1px">
          System Configuration Made Before Deployment
        </Typography>
      )}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <AdminEventsTable list={events} />
      )}
    </MainWrapper>
  );
};

/**
 * Generates server-side props for the admin events page
 * Handles URL parameters and sets up SEO metadata
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  let start = context.params!.start;
  let end = context.params!.end;
  let round = context.params!.round;
  start = Array.isArray(start) ? start[0] : start;
  end = Array.isArray(end) ? end[0] : end;
  round = Array.isArray(round) ? round[0] : round;
  const title = `Admin Events | Cosmic Signature`;
  const description = `Admin Events`;

  return {
    props: {
      ...createOpenGraphProps(title, description),
      start,
      end,
      round,
    },
  };
}

export default AdminEvent;

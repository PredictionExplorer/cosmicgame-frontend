import { useState, useCallback } from 'react';
import { Link, TableBody, Typography } from '@mui/material';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { convertTimestampToDateTime } from '@/utils';

import { useRouter } from 'next/navigation';

import { CustomPagination } from '@/components/common/CustomPagination';

// Define types for props
export interface EventRow {
  RoundNum: number;
  EvtLogId: string | number;
  NextEvtLogId: string | number;
  TimeStamp: number;
}

interface SystemModesRowProps {
  row: EventRow;
  prevRow: EventRow | null;
}

interface SystemModesTableProps {
  list: EventRow[];
}

// Component to render each row in the system modes table
const SystemModesRow = ({ row, prevRow }: SystemModesRowProps) => {
  const router = useRouter();

  if (!row) return <TablePrimaryRow />;

  const handleRowClick = () => {
    router.push(`/system-event/${row.RoundNum}/${row.EvtLogId}/${row.NextEvtLogId}`);
  };

  return (
    <TablePrimaryRow style={{ cursor: 'pointer' }} onClick={handleRowClick}>
      <TablePrimaryCell align="center">
        {row.RoundNum ? row.RoundNum : 'Deployment'}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prevRow ? convertTimestampToDateTime(prevRow.TimeStamp) : 'Currently Active'}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

// Main system modes table component
export const SystemModesTable = ({ list }: SystemModesTableProps) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);

  // Show fallback text when no rows are available
  if (list.length === 0) {
    return <Typography>No mode changes yet.</Typography>;
  }

  // Paginate rows
  const paginatedList = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="25%" />
            <col width="33%" />
            <col width="33%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="center">Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Started</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Ended</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {paginatedList.map((row, i) => {
              const globalIndex = (page - 1) * perPage + i;
              const prevRow = globalIndex > 0 ? (list[globalIndex - 1] ?? null) : null;

              return <SystemModesRow key={row.EvtLogId} row={row} prevRow={prevRow} />;
            })}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination controls */}
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

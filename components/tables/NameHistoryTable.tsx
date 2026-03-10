import React, { useState } from 'react';
import { Link, TableBody } from '@mui/material';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '../styled';
import { getExplorerUrl, convertTimestampToDateTime } from '../../utils';
import { CustomPagination } from '../common/CustomPagination';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import type { NameHistoryRecord } from '../../services/api';

// Component to render each row in the name history table
const NameHistoryRow = ({ record }: { record: NameHistoryRecord }) => {
  if (!record) {
    return <TablePrimaryRow />;
  }

  const txUrl = getExplorerUrl('tx', record.TxHash);
  const displayName = record.TokenName || 'Token name was removed.';

  return (
    <TablePrimaryRow>
      {/* Transaction Date and Link */}
      <TablePrimaryCell>
        <Link href={txUrl} color="inherit" target="_blank">
          {convertTimestampToDateTime(record.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Token Name */}
      <TablePrimaryCell>{displayName}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

// Main table component for displaying name history with pagination
const NameHistoryTable = ({ list }: { list: NameHistoryRecord[] }) => {
  const perPage = 5; // Number of items per page
  const [page, setPage] = useState(1); // Current pagination state

  // Slice the list to show only the items for the current page
  const currentItems = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Token Name</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body - Mapping through current page items */}
          <TableBody>
            {currentItems.map((record) => (
              <NameHistoryRow key={record.EvtLogId} record={record} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Component */}
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default NameHistoryTable;

import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { NameHistoryRecord } from '@/services/api';

const NameHistoryRow = ({ record }: { record: NameHistoryRecord }) => {
  if (!record) {
    return <TablePrimaryRow />;
  }

  const txUrl = getExplorerUrl('tx', record.TxHash);
  const displayName = record.TokenName || 'Token name was removed.';

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a href={txUrl} className="text-inherit" target="_blank">
          {convertTimestampToDateTime(record.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>{displayName}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NameHistoryTable = ({ list }: { list: NameHistoryRecord[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  const currentItems = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Token Name</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentItems.map((record) => (
              <NameHistoryRow key={record.EvtLogId} record={record} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default NameHistoryTable;

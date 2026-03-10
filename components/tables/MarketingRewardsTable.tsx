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

export interface MarketingReward {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  AmountEth: number;
}

const MarketingRewardsRow = ({ row }: { row: MarketingReward }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  const transactionUrl = getExplorerUrl('tx', row.TxHash);

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a className="text-inherit" href={transactionUrl} target="_blank">
          {convertTimestampToDateTime(row.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>{row.AmountEth.toFixed(2)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const MarketingRewardsTable = ({ list }: { list: MarketingReward[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No rewards yet.</p>;
  }

  const currentItems = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Amount (CST)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentItems.map((row) => (
              <MarketingRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default MarketingRewardsTable;

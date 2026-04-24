import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import type { Winner } from '@/services/api/types';

export type { Winner };

interface UniqueWinnersRowProps {
  recipient?: Winner;
}

const UniqueWinnersRow = ({ recipient }: UniqueWinnersRowProps) => {
  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={recipient.WinnerAddr} url={`/user/${recipient.WinnerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.PrizesCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.MaxWinAmountEth.toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.PrizesSum.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueWinnersTableProps {
  list: Winner[];
}

export const UniqueWinnersTable = ({ list }: UniqueWinnersTableProps) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No recipients yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Recipient Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Allocations Received</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Max Allocation (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Allocations Sum (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((recipient) => (
              <UniqueWinnersRow recipient={recipient} key={recipient.WinnerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

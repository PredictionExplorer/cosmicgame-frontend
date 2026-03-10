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

export interface Winner {
  WinnerAid: string;
  WinnerAddr: string;
  PrizesCount: number;
  MaxWinAmountEth: number;
  PrizesSum: number;
}

interface UniqueWinnersRowProps {
  winner?: Winner;
}

const UniqueWinnersRow = ({ winner }: UniqueWinnersRowProps) => {
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={winner.WinnerAddr} url={`/user/${winner.WinnerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{winner.PrizesCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">{winner.MaxWinAmountEth.toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="right">{winner.PrizesSum.toFixed(6)}</TablePrimaryCell>
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
    return <p>No winners yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Prizes Taken</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Max Prize (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Prizes Sum (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((winner) => (
              <UniqueWinnersRow winner={winner} key={winner.WinnerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

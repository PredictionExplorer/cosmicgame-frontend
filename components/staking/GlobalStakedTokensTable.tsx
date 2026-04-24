import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState, type FC } from 'react';
import Link from 'next/link';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

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
import type { StakedTokenInfo } from '@/services/api';

interface GlobalStakedTokensRowProps {
  row: StakedTokenInfo;
  IsRWLK: boolean;
}

const GlobalStakedTokensRow: FC<GlobalStakedTokensRowProps> = ({ row, IsRWLK }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>{convertTimestampToDateTime(row.StakeTimeStamp)}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/anchor-action/${IsRWLK ? 1 : 0}/${row.StakeActionId}`}
          className="text-inherit"
        >
          {row.StakeActionId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {IsRWLK ? (
          <a
            href={`https://randomwalknft.com/detail/${row.StakedTokenId}`}
            className="text-inherit"
          >
            {row.StakedTokenId}
          </a>
        ) : (
          <Link href={`/detail/${row.TokenInfo?.TokenId}`} className="text-inherit">
            {row.TokenInfo?.TokenId}
          </Link>
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <AddressLink address={row.UserAddr ?? ''} url={`/user/${row.UserAddr}`} />
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface GlobalStakedTokensTableProps {
  list: StakedTokenInfo[];
  IsRWLK: boolean;
}

export const GlobalStakedTokensTable: FC<GlobalStakedTokensTableProps> = ({ list, IsRWLK }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">No tokens yet.</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Anchor Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Anchor-holder Address</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {visibleRows.map((row) => (
              <GlobalStakedTokensRow key={row.StakeEvtLogId} row={row} IsRWLK={IsRWLK} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

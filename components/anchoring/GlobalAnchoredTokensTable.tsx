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
  TableResponsiveHeaderLabel,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import type { AnchoredTokenInfo } from '@/services/api';

const responsiveHeaders = [
  { desktop: 'Anchor Datetime', mobile: 'Datetime', align: 'left' as const },
  { desktop: 'Action ID', mobile: 'Action' },
  { desktop: 'Token ID', mobile: 'Token' },
  { desktop: 'Anchor-holder Address', mobile: 'Holder' },
];

interface GlobalAnchoredTokensRowProps {
  row: AnchoredTokenInfo;
  IsRWLK: boolean;
}

const GlobalAnchoredTokensRow: FC<GlobalAnchoredTokensRowProps> = ({ row, IsRWLK }) => {
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

interface GlobalAnchoredTokensTableProps {
  list: AnchoredTokenInfo[];
  IsRWLK: boolean;
}

export const GlobalAnchoredTokensTable: FC<GlobalAnchoredTokensTableProps> = ({ list, IsRWLK }) => {
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
        <TablePrimary className="sm:min-w-[640px] lg:min-w-0">
          <TablePrimaryHead>
            <Tr>
              {responsiveHeaders.map((header) => (
                <TablePrimaryHeadCell key={header.desktop} align={header.align}>
                  <TableResponsiveHeaderLabel desktop={header.desktop} mobile={header.mobile} />
                </TablePrimaryHeadCell>
              ))}
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {visibleRows.map((row) => (
              <GlobalAnchoredTokensRow key={row.StakeEvtLogId} row={row} IsRWLK={IsRWLK} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

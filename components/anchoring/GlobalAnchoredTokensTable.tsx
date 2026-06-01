import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState, type FC } from 'react';
import Link from 'next/link';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';
import { statisticsCopy } from '@/content/statistics-copy';

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
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';
import type { AnchoredTokenInfo } from '@/services/api';

const responsiveHeaders = [
  {
    desktop: 'Anchor Datetime',
    mobile: 'Datetime',
    align: 'left' as const,
    tooltip: 'Timestamp when the token was anchored.',
  },
  { desktop: 'Action ID', mobile: 'Action', tooltip: 'Anchor action record linked to this token.' },
  { desktop: 'Token ID', mobile: 'Token', tooltip: 'Anchored token identifier.' },
  {
    desktop: 'Anchor-holder Address',
    mobile: 'Holder',
    tooltip: statisticsCopy.tables.anchorHolderAddress,
  },
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
                  <TableHeaderHelp
                    desktop={header.desktop}
                    mobile={header.mobile}
                    tooltip={header.tooltip}
                  />
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

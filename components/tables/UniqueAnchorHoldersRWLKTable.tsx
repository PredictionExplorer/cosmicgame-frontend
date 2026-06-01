import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
import type { UniqueAnchorHolderRWLK } from '@/services/api/types';

export type { UniqueAnchorHolderRWLK };

const responsiveHeaders = [
  {
    desktop: 'Anchor-holder Address',
    mobile: 'Holder',
    align: 'left' as const,
    tooltip: statisticsCopy.tables.anchorHolderAddress,
  },
  {
    desktop: 'Num Anchor Actions',
    mobile: 'Anchors',
    tooltip: statisticsCopy.tables.numAnchorActions,
  },
  {
    desktop: 'Num Release Actions',
    mobile: 'Releases',
    tooltip: statisticsCopy.tables.numReleaseActions,
  },
  {
    desktop: 'Total Anchored Tokens',
    mobile: 'Anchored',
    tooltip: statisticsCopy.tables.totalAnchoredTokens,
  },
  {
    desktop: 'Total Imprinted Tokens',
    mobile: 'Imprinted',
    tooltip: statisticsCopy.tables.totalImprintedTokens,
  },
];

const UniqueAnchorHoldersRWLKRow = ({ row }: { row: UniqueAnchorHolderRWLK }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  const {
    StakerAddr = '',
    NumStakeActions = 0,
    NumUnstakeActions = 0,
    TotalTokensStaked = 0,
    TotalTokensMinted = 0,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={StakerAddr} url={`/user/${StakerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{NumStakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">{NumUnstakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">{TotalTokensStaked}</TablePrimaryCell>
      <TablePrimaryCell align="center">{TotalTokensMinted}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueAnchorHoldersRWLKTable = ({ list }: { list: UniqueAnchorHolderRWLK[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No anchor-holders yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary className="sm:min-w-[720px] xl:min-w-0">
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
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueAnchorHoldersRWLKRow row={row} key={row.StakerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

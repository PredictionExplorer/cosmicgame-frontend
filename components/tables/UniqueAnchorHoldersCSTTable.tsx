import { useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { formatTableAmount, shortenHex } from '@/utils';
import { statisticsCopy } from '@/content/statistics-copy';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';
import type { UniqueAnchorHolderCST } from '@/services/api/types';

export type { UniqueAnchorHolderCST };

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
    desktop: 'Total Imprinted Tokens',
    mobile: 'Imprinted',
    tooltip: statisticsCopy.tables.totalImprintedTokens,
  },
  {
    desktop: 'Total Anchored Tokens',
    mobile: 'Anchored',
    tooltip: statisticsCopy.tables.totalAnchoredTokens,
  },
  {
    desktop: 'Total Distribution (ETH)',
    mobile: 'Distributed',
    align: 'right' as const,
    tooltip: statisticsCopy.tables.totalDistributionEth,
  },
  {
    desktop: 'Unretrieved Distribution (ETH)',
    mobile: 'Unretrieved',
    align: 'right' as const,
    tooltip: statisticsCopy.tables.unretrievedDistributionEth,
  },
];

const UniqueAnchorHoldersCSTRow = ({ row }: { row: UniqueAnchorHolderCST }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  const {
    StakerAddr = '',
    NumStakeActions = 0,
    NumUnstakeActions = 0,
    TotalTokensMinted = 0,
    TotalTokensStaked = 0,
    TotalRewardEth = 0,
    UnclaimedRewardEth = 0,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${StakerAddr}`} className="text-inherit font-mono">
              {shortenHex(StakerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{StakerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{NumStakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">{NumUnstakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">{TotalTokensMinted}</TablePrimaryCell>
      <TablePrimaryCell align="center">{TotalTokensStaked}</TablePrimaryCell>
      <TablePrimaryCell align="right">{formatTableAmount(TotalRewardEth)}</TablePrimaryCell>
      <TablePrimaryCell align="right">{formatTableAmount(UnclaimedRewardEth)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueAnchorHoldersCSTTable = ({ list }: { list: UniqueAnchorHolderCST[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No anchor-holders yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary className="sm:min-w-[860px] xl:min-w-0">
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
              <UniqueAnchorHoldersCSTRow row={row} key={row.StakerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

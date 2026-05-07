import { useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { shortenHex } from '@/utils';

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
import type { UniqueAnchorHolderCST } from '@/services/api/types';

export type { UniqueAnchorHolderCST };

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
      <TablePrimaryCell align="right">{TotalRewardEth.toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="right">{UnclaimedRewardEth.toFixed(6)}</TablePrimaryCell>
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
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Anchor-holder Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Anchor Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Release Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Imprinted Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Anchored Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Total Distribution (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Unretrieved Distribution (ETH)
              </TablePrimaryHeadCell>
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

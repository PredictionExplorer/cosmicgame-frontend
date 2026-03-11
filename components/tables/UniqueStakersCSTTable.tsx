import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { UniqueStakerCST } from '@/services/api/types';

export type { UniqueStakerCST };

const UniqueStakersCSTRow = ({ row }: { row: UniqueStakerCST }) => {
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={`/user/${StakerAddr}`} className="text-inherit font-mono">
                {shortenHex(StakerAddr, 6)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{StakerAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
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

export const UniqueStakersCSTTable = ({ list }: { list: UniqueStakerCST[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No stakers yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Staker Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Stake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Unstake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Minted Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Total Reward (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Unclaimed Reward (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueStakersCSTRow row={row} key={row.StakerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

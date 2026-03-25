import { useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { StakingCSTReward } from '@/services/api';

const WinnerRow = ({ winner }: { winner: StakingCSTReward }) => {
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', winner.TxHash ?? '')}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(winner.TimeStamp ?? 0)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="left">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/user/${winner.StakerAddr}`} className="text-inherit font-mono">
                {shortenHex(winner.StakerAddr ?? '', 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{winner.StakerAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{winner.StakerNumStakedNFTs}</TablePrimaryCell>
      <TablePrimaryCell align="right">{(winner.StakerAmountEth ?? 0).toFixed(4)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const StakingWinnerTable = ({ list }: { list: StakingCSTReward[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return (
      <p>
        There were no staked tokens at the time the round ended. The deposit amount was sent to the
        charity address.
      </p>
    );
  }

  const displayedWinners = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Reward Amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {displayedWinners.map((winner) => (
              <WinnerRow key={winner.StakerAddr} winner={winner} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default StakingWinnerTable;

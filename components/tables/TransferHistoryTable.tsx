import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { ZERO_ADDRESS } from '@/config/misc';
import { STAKING_WALLET_CST_ADDRESS, STAKING_WALLET_RWLK_ADDRESS } from '@/config/networks';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { CSTTransferRecord } from '@/services/api';

const TransferHistoryRow = ({ record }: { record: CSTTransferRecord }) => {
  if (!record || record.FromAddr === ZERO_ADDRESS) {
    return null;
  }

  const { TxHash, TimeStamp, FromAddr, ToAddr } = record;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={`/user/${FromAddr}`} className="text-inherit font-mono">
                {FromAddr === STAKING_WALLET_CST_ADDRESS
                  ? 'StakingWallet CST'
                  : FromAddr === STAKING_WALLET_RWLK_ADDRESS
                    ? 'StakingWallet RandomWalk'
                    : shortenHex(FromAddr ?? '', 6)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{FromAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={`/user/${ToAddr}`} className="text-inherit font-mono">
                {ToAddr === STAKING_WALLET_CST_ADDRESS
                  ? 'StakingWallet CST'
                  : ToAddr === STAKING_WALLET_RWLK_ADDRESS
                    ? 'StakingWallet RandomWalk'
                    : shortenHex(ToAddr ?? '', 6)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{ToAddr ?? ''}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const TransferHistoryTable = ({ list }: { list: CSTTransferRecord[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">To</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((record) => (
              <TransferHistoryRow record={record} key={record.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

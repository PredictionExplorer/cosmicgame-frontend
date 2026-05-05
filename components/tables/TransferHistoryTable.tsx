import { useState } from 'react';
import Link from 'next/link';
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
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { CSTTransferRecord } from '@/services/api';

function addrEq(a: string | undefined, b: string): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

const TransferHistoryRow = ({ record }: { record: CSTTransferRecord }) => {
  const { stakingCst, stakingRwalk } = useContractAddresses();
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
              <Link href={`/user/${FromAddr}`} className="text-inherit font-mono">
                {addrEq(FromAddr, stakingCst)
                  ? 'StakingWallet CST'
                  : addrEq(FromAddr, stakingRwalk)
                    ? 'StakingWallet RandomWalk'
                    : shortenHex(FromAddr ?? '', 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{FromAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/user/${ToAddr}`} className="text-inherit font-mono">
                {addrEq(ToAddr, stakingCst)
                  ? 'StakingWallet CST'
                  : addrEq(ToAddr, stakingRwalk)
                    ? 'StakingWallet RandomWalk'
                    : shortenHex(ToAddr ?? '', 6)}
              </Link>
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

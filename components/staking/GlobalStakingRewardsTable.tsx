import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tbody, Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useStakingCSTRewardsByRound } from '@/hooks/useApiQuery';
import { CustomPagination } from '@/components/common/CustomPagination';
import StakingWinnerTable from '@/components/tables/StakingWinnerTable';
import type { StakingCSTReward } from '@/services/api';

const GlobalStakingRewardsRow = ({ row }: { row: StakingCSTReward }) => {
  const [open, setOpen] = useState(false);

  const { data: list = [] } = useStakingCSTRewardsByRound(row?.RoundNum);

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      <TablePrimaryRow className="border-b-0">
        <TablePrimaryCell className="p-0">
          <button
            aria-label="expand row"
            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </TablePrimaryCell>

        <TablePrimaryCell>
          <a
            href={getExplorerUrl('tx', row.TxHash ?? '')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit"
          >
            {convertTimestampToDateTime(row.TimeStamp ?? 0)}
          </a>
        </TablePrimaryCell>

        <TablePrimaryCell align="center">
          <Link href={`/allocation/${row.RoundNum}`} className="text-inherit">
            {row.RoundNum}
          </Link>
        </TablePrimaryCell>

        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>

        <TablePrimaryCell align="center">
          {(row.TotalDepositAmountEth ?? 0).toFixed(6)}
        </TablePrimaryCell>

        <TablePrimaryCell align="center">{row.FullyClaimed ? 'Yes' : 'No'}</TablePrimaryCell>

        <TablePrimaryCell align="right">
          {(row.PendingToCollectEth ?? 0).toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>

      <TablePrimaryRow className="border-t-0">
        <TablePrimaryCell className="py-0" colSpan={8}>
          {open && (
            <div className="m-2 mb-8">
              <h3 className="text-base font-medium mb-2">
                CST Staking Rewards for Round {row.RoundNum}
              </h3>
              <StakingWinnerTable list={list} />
            </div>
          )}
        </TablePrimaryCell>
      </TablePrimaryRow>
    </>
  );
};

export const GlobalStakingRewardsTable = ({ list }: { list: StakingCSTReward[] }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">No distributions yet.</p>;
  }

  const displayedRows = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell className="p-0" />
              <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Anchored Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposited (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Retrieved?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Pending to Retrieve (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {displayedRows.map((row, index) => (
              <GlobalStakingRewardsRow row={row} key={(page - 1) * perPage + index} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

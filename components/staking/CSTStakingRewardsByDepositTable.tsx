import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import Link from 'next/link';
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
import { CustomPagination } from '@/components/common/CustomPagination';

export interface CSTStakingRewardByDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  DepositRoundNum: number;
  DepositId: number;
  DepositAmountEth: number;
  ClaimedAmountEth: number;
  YourClaimableAmountEth: number;
  FullyClaimed: boolean;
  NumStakedNFTs: number;
  NumTokensCollected: number;
  YourTokensStaked: number;
}

const CSTStakingRewardsByDepositRow = ({ row }: { row: CSTStakingRewardByDeposit }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow className="border-b-0">
      <TablePrimaryCell>
        <a
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/prize/${row.DepositRoundNum}`} className="text-inherit">
          {row.DepositRoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.DepositAmountEth.toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.ClaimedAmountEth.toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.YourClaimableAmountEth.toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.FullyClaimed ? 'Yes' : 'No'}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumTokensCollected}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.YourTokensStaked}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CSTStakingRewardsByDepositTable = ({
  list,
}: {
  list: CSTStakingRewardByDeposit[];
}) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">No rewards yet.</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposit Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Claimed Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Claimable Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Collected Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Staked Tokens</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <CSTStakingRewardsByDepositRow row={row} key={row.EvtLogId} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

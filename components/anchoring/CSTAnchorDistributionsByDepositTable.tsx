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

export interface CSTAnchorDistributionByDeposit {
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

const CSTAnchorDistributionsByDepositRow = ({ row }: { row: CSTAnchorDistributionByDeposit }) => {
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
        <Link href={`/allocation/${row.DepositRoundNum}`} className="text-inherit">
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

export const CSTAnchorDistributionsByDepositTable = ({
  list,
}: {
  list: CSTAnchorDistributionByDeposit[];
}) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">No distributions yet.</p>;
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
              <TablePrimaryHeadCell>Deposit Cycle</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposit Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Retrieved Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Retrievable Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Retrieved?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Anchored NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Retrieved Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Anchored Tokens</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <CSTAnchorDistributionsByDepositRow row={row} key={row.EvtLogId} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

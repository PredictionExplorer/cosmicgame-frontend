import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import Link from 'next/link';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { StakingCSTReward } from '@/services/api';

const CollectedRewardsRow = ({ row }: { row: StakingCSTReward }) => {
  if (!row) return null;

  const {
    DepositTimeStamp = 0,
    DepositId,
    RoundNum,
    TotalDepositAmountEth,
    YourCollectedAmountEth,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>{convertTimestampToDateTime(DepositTimeStamp)}</TablePrimaryCell>

      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/prize/${RoundNum}`} className="text-inherit">
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{(TotalDepositAmountEth ?? 0).toFixed(6)}</TablePrimaryCell>

      <TablePrimaryCell align="center">{(YourCollectedAmountEth ?? 0).toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CollectedCSTStakingRewardsTable = ({ list }: { list: StakingCSTReward[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  if (!list || list.length === 0) {
    return <p className="text-muted-foreground">No rewards yet.</p>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Collected Amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <CollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};

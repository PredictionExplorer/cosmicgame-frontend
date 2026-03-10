import React, { useState } from 'react';
import { Box, Collapse, IconButton, Link, TableBody, Typography } from '@mui/material';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '../styled';
import { getExplorerUrl, convertTimestampToDateTime } from '../../utils';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Tr } from 'react-super-responsive-table';

import { useStakingCSTRewardsByRound } from '../../hooks/useApiQuery';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { CustomPagination } from '../common/CustomPagination';
import StakingWinnerTable from '../tables/StakingWinnerTable';

interface GlobalStakingReward {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  NumStakedNFTs: number;
  TotalDepositAmountEth: number;
  FullyClaimed: boolean;
  PendingToCollectEth: number;
}

interface StakingWinner {
  TxHash: string;
  TimeStamp: number;
  StakerAddr: string;
  StakerNumStakedNFTs: number;
  StakerAmountEth: number;
}

const GlobalStakingRewardsRow = ({ row }: { row: GlobalStakingReward }) => {
  const [open, setOpen] = useState(false);

  const { data: list = [] } = useStakingCSTRewardsByRound(row?.RoundNum);

  // If row is undefined or null, return an empty row
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      {/* Main table row (collapsible) */}
      <TablePrimaryRow sx={{ borderBottom: 0 }}>
        <TablePrimaryCell sx={{ p: 0 }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TablePrimaryCell>

        {/* Deposit Datetime (linked to Arbiscan) */}
        <TablePrimaryCell>
          <Link
            color="inherit"
            fontSize="inherit"
            href={getExplorerUrl('tx', row.TxHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {convertTimestampToDateTime(row.TimeStamp)}
          </Link>
        </TablePrimaryCell>

        {/* Round Number (linked to /prize page) */}
        <TablePrimaryCell align="center">
          <Link href={`/prize/${row.RoundNum}`} style={{ color: 'inherit', fontSize: 'inherit' }}>
            {row.RoundNum}
          </Link>
        </TablePrimaryCell>

        {/* Total Staked Tokens */}
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>

        {/* Total Deposited (ETH) */}
        <TablePrimaryCell align="center">
          {(row.TotalDepositAmountEth ?? 0).toFixed(6)}
        </TablePrimaryCell>

        {/* Fully Claimed? */}
        <TablePrimaryCell align="center">{row.FullyClaimed ? 'Yes' : 'No'}</TablePrimaryCell>

        {/* Pending to Collect (ETH) */}
        <TablePrimaryCell align="right">
          {(row.PendingToCollectEth ?? 0).toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>

      {/* Expanded content (winner details) */}
      <TablePrimaryRow sx={{ borderTop: 0 }}>
        <TablePrimaryCell sx={{ py: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, marginBottom: 4 }}>
              <Typography variant="subtitle1" gutterBottom component="div">
                CST Staking Rewards for Round {row.RoundNum}
              </Typography>
              <StakingWinnerTable list={list as StakingWinner[]} />
            </Box>
          </Collapse>
        </TablePrimaryCell>
      </TablePrimaryRow>
    </>
  );
};

/**
 * Renders a paginated table showing all Global Staking Rewards.
 */
export const GlobalStakingRewardsTable = ({ list }: { list: GlobalStakingReward[] }) => {
  // Number of rows to display per page
  const perPage = 5;

  // State for the current page number
  const [page, setPage] = useState(1);

  // If there are no records, show a message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Calculate the subset of the data for the current page
  const displayedRows = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell sx={{ p: 0 }} />
              <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposited (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Pending to Collect (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table body: Render rows for the current page */}
          <TableBody>
            {displayedRows.map((row, index) => (
              <GlobalStakingRewardsRow row={row} key={(page - 1) * perPage + index} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Controls */}
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

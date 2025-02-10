import React, { useState } from "react";
import { IconButton, Link, TableBody, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { CustomPagination } from "./CustomPagination";

const CSTStakingRewardsByDepositRow = ({ row }) => {
  const [open, setOpen] = useState(false);

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      <TablePrimaryRow sx={{ borderBottom: 0 }}>
        {/* <TablePrimaryCell sx={{ p: 0 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TablePrimaryCell> */}
        <TablePrimaryCell>
          <Link
            color="inherit"
            fontSize="inherit"
            href={`https://arbiscan.io/tx/${row.TxHash}`}
            target="__blank"
          >
            {convertTimestampToDateTime(row.TimeStamp)}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          <Link
            href={`/prize/${row.DepositRoundNum}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
            }}
          >
            {row.DepositRoundNum}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.DepositAmountEth.toFixed(4)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.ClaimedAmountEth.toFixed(4)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.YourClaimableAmountEth.toFixed(4)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.FullyClaimed ? "Yes" : "No"}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.NumTokensCollected}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.YourTokensStaked}
        </TablePrimaryCell>
      </TablePrimaryRow>
      {/* TODO: Add a table here to show the rewards for each deposit */}
    </>
  );
};

export const CSTStakingRewardsByDepositTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              {/* <TablePrimaryHeadCell sx={{ p: 0 }} /> */}
              <TablePrimaryHeadCell align="left">
                Deposit Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposit Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Claimed Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Claimable Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Total Collected Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Staked Tokens</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <CSTStakingRewardsByDepositRow row={row} key={row.EvtLogId} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

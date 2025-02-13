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
import { CustomPagination } from "./CustomPagination";

/**
 * Renders a single row in the "CST Staking Rewards by Deposit" table.
 * Each row displays information about a specific deposit, including:
 * - Deposit date & time (linked to Arbiscan)
 * - Deposit round (linked to the prize page)
 * - Deposit ID and amount
 * - Claimed vs claimable amounts
 * - Whether the deposit is fully claimed
 * - Number of staked NFTs
 * - User's staked tokens
 */
const CSTStakingRewardsByDepositRow = ({ row }) => {
  // Track whether to show/hide additional details (expandable row)
  const [open, setOpen] = useState(false);

  // If no row data, return an empty row
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      {/* Main row containing the deposit info */}
      <TablePrimaryRow sx={{ borderBottom: 0 }}>
        {/* Uncomment below if you want to add an expand/collapse icon
        <TablePrimaryCell sx={{ p: 0 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TablePrimaryCell>
        */}

        {/* Deposit datetime (linked to Arbiscan using the transaction hash) */}
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

        {/* Deposit Round (links to a "prize" page showing deposit round details) */}
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

        {/* Unique deposit identifier */}
        <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>

        {/* Total deposit amount (ETH) */}
        <TablePrimaryCell align="center">
          {row.DepositAmountEth.toFixed(4)}
        </TablePrimaryCell>

        {/* Total amount already claimed from this deposit (ETH) */}
        <TablePrimaryCell align="center">
          {row.ClaimedAmountEth.toFixed(4)}
        </TablePrimaryCell>

        {/* Amount the user can still claim (ETH) */}
        <TablePrimaryCell align="center">
          {row.YourClaimableAmountEth.toFixed(4)}
        </TablePrimaryCell>

        {/* Whether the deposit is fully claimed */}
        <TablePrimaryCell align="center">
          {row.FullyClaimed ? "Yes" : "No"}
        </TablePrimaryCell>

        {/* Number of staked NFTs in this deposit */}
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>

        {/* Total collected tokens for this deposit (i.e., how many tokens have been claimed) */}
        <TablePrimaryCell align="center">
          {row.NumTokensCollected}
        </TablePrimaryCell>

        {/* The number of tokens the user staked in this deposit */}
        <TablePrimaryCell align="center">
          {row.YourTokensStaked}
        </TablePrimaryCell>
      </TablePrimaryRow>

      {/* If you want to display a sub-table or extra details when expanded, place it here. 
          For example:
      
      {open && (
        <TablePrimaryRow>
          <TablePrimaryCell colSpan={10}>
            Additional details...
          </TablePrimaryCell>
        </TablePrimaryRow>
      )}
      
      */}
    </>
  );
};

/**
 * This table displays a paginated list of CST staking rewards information,
 * grouped by specific deposits. Each row shows:
 * - Date/time and transaction hash link
 * - Deposit round/ID
 * - Total deposit amount, claimed amount, claimable amount
 * - Whether the deposit is fully claimed
 * - Number of staked NFTs, total collected tokens, and user's staked tokens
 * @param list - An array of deposit data objects
 */
export const CSTStakingRewardsByDepositTable = ({ list }) => {
  // Number of rows to display per page
  const perPage = 5;

  // Track the current page in pagination
  const [page, setPage] = useState(1);

  // If no data, show a fallback message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Calculate the slice of data for the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              {/* Uncomment below if you want to add an expand/collapse column
              <TablePrimaryHeadCell sx={{ p: 0 }} />
              */}
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
            {currentData.map((row) => (
              <CSTStakingRewardsByDepositRow row={row} key={row.EvtLogId} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Component */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

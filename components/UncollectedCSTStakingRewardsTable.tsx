import React, { useState } from "react";
import { TableBody, Typography } from "@mui/material";
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
import { isMobile } from "react-device-detect";

/* ------------------------------------------------------------------
  Sub-Component: UncollectedRewardsRow
  Renders a single row in the rewards table with the provided data.
------------------------------------------------------------------ */
const UncollectedRewardsRow = ({ row }) => {
  // Early return if no row data to avoid errors.
  if (!row) return <TablePrimaryRow />;

  // Destructure row for clarity and fallback values if needed.
  const {
    DepositTimeStamp,
    DepositId,
    YourTokensStaked,
    NumStakedNFTs,
    NumUnclaimedTokens,
    DepositAmountEth,
    YourRewardAmountEth,
    PendingToClaimEth,
    // EvtLogId,  <-- Usually used as a key, so not needed here
  } = row;

  return (
    <TablePrimaryRow>
      {/* Convert the timestamp to a readable date/time format */}
      <TablePrimaryCell>
        {convertTimestampToDateTime(DepositTimeStamp)}
      </TablePrimaryCell>

      {/* Simple text display of the deposit's unique identifier */}
      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>

      {/* Show how many tokens you have staked out of total staked */}
      <TablePrimaryCell align="center">
        {`${YourTokensStaked} / ${NumStakedNFTs}`}
      </TablePrimaryCell>

      {/* Total unclaimed tokens for this deposit */}
      <TablePrimaryCell align="center">{NumUnclaimedTokens}</TablePrimaryCell>

      {/* The ETH amount originally deposited, formatted to 6 decimal places */}
      <TablePrimaryCell align="center">
        {DepositAmountEth.toFixed(6)}
      </TablePrimaryCell>

      {/* Your reward in ETH so far, formatted to 6 decimals */}
      <TablePrimaryCell align="center">
        {YourRewardAmountEth.toFixed(6)}
      </TablePrimaryCell>

      {/* Pending reward in ETH that hasn't been collected yet */}
      <TablePrimaryCell align="center">
        {PendingToClaimEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: UncollectedCSTStakingRewardsTable
  Displays a paginated list of uncollected CST staking rewards.
------------------------------------------------------------------ */
export const UncollectedCSTStakingRewardsTable = ({ list }) => {
  // Current page in the pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Number of rows to display per page
  const PER_PAGE = 5;

  // If there is no data to display, show a fallback message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Calculate slice indices for the current page
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;

  // Extract the portion of the list corresponding to the current page
  const currentPageData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* 
            Conditionally render a colgroup for desktop screens
            to control column widths. This is optional on mobile.
          */}
          {!isMobile && (
            <colgroup>
              <col width="15%" />
              <col width="10%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="25%" />
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Deposit Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Staked Tokens (You / Total)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Unclaimed Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Reward Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Uncollected Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {/* Map over the current page of data to render each row */}
            {currentPageData.map((row) => (
              <UncollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Controls */}
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};


// Todo: add buttons for claim rewards to table

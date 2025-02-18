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
  Renders a single row in the rewards table.
------------------------------------------------------------------ */
const UncollectedRewardsRow = ({ row }) => {
  // Early return if no row data
  if (!row) return <TablePrimaryRow />;

  const {
    DepositTimeStamp,
    DepositId,
    YourTokensStaked,
    NumStakedNFTs,
    NumUnclaimedTokens,
    DepositAmountEth,
    YourRewardAmountEth,
    PendingToClaimEth,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(DepositTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {`${YourTokensStaked} / ${NumStakedNFTs}`}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{NumUnclaimedTokens}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {DepositAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {YourRewardAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {PendingToClaimEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: UncollectedCSTStakingRewardsTable
  Displays a paginated list of uncollected staking rewards.
------------------------------------------------------------------ */
export const UncollectedCSTStakingRewardsTable = ({ list }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Number of rows to display per page
  const PER_PAGE = 5;

  // Early return if no data
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Compute start and end indices for the current page
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentPageData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Optional column widths for non-mobile views */}
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
            {currentPageData.map((row) => (
              <UncollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination */}
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};

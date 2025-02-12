import React, { useState } from "react";
import { Link, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { Tbody, Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { isMobile } from "react-device-detect";
import { useRouter } from "next/router";

import { convertTimestampToDateTime } from "../utils";
import { CustomPagination } from "./CustomPagination";

/** 
 * A single row in the Staking Actions table. 
 * Clicking the row redirects the user to a detailed view of the staking action.
 * @param row - The data for one staking action
 * @param IsRwalk - A boolean to indicate if this is RWLK-based staking (vs. CST-based)
 */
const StakingActionsRow = ({ row, IsRwalk }) => {
  const router = useRouter();

  // If no row data is provided, return an empty row
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Handle navigation on row click
  const handleRowClick = () => {
    // Navigate to the staking action detail page
    // The route differentiates RWLK actions (1) vs CST actions (0)
    router.push(`/staking-action/${IsRwalk ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow sx={{ cursor: "pointer" }} onClick={handleRowClick}>
      {/* Datetime of the stake/unstake action */}
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>

      {/* Action type: 1 = Unstake, otherwise = Stake */}
      <TablePrimaryCell align="center">
        {row.ActionType === 1 ? "Unstake" : "Stake"}
      </TablePrimaryCell>

      {/* Token ID with a link to detail page (or external site for RWLK) */}
      <TablePrimaryCell align="center">
        <Link
          href={
            IsRwalk
              ? `https://randomwalknft.com/detail/${row.TokenId}`
              : `/detail/${row.TokenId}`
          }
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>

      {/* The total number of NFTs staked/un-staked in this action */}
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * A table that displays the user's staking actions (stake/unstake).
 * Supports pagination and is responsive.
 * @param list - An array of staking actions
 * @param IsRwalk - A boolean indicating whether these actions are for Random Walk (RWLK) or CST
 */
const StakingActionsTable = ({ list, IsRwalk }) => {
  // The number of rows to display per page
  const perPage = 5;

  // Current page in pagination
  const [page, setPage] = useState(1);

  // If the list is empty, show a fallback message
  if (list.length === 0) {
    return <Typography>No actions yet.</Typography>;
  }

  // Compute the slice of data to display for the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      {/* Table container for responsive design */}
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Only define a colgroup if not on mobile (for better layout) */}
          {!isMobile && (
            <colgroup>
              <col width="25%" />
              <col width="25%" />
              <col width="25%" />
              <col width="25%" />
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <Tbody>
            {currentData.map((row) => (
              <StakingActionsRow
                key={row.EvtLogId}
                row={row}
                IsRwalk={IsRwalk}
              />
            ))}
          </Tbody>
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

export default StakingActionsTable;

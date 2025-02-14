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

import { convertTimestampToDateTime } from "../utils";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

/**
 * Renders a single row for the StakingRewardMintsTable.
 * Each row displays:
 * - Datetime of mint (linked to Arbiscan)
 * - Winner's address (links to user info page)
 * - Round number (links to a prize page)
 * - Token ID (links to RandomWalk's detail page)
 */
const StakingRewardMintsRow = ({ row }) => {
  // If there is no row data, return an empty row placeholder
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Datetime (links to Arbiscan transaction) */}
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

      {/* Winner's address (links to user info page) */}
      <TablePrimaryCell align="center">
        <AddressLink address={row.WinnerAddr} url={`/user/${row.WinnerAddr}`} />
      </TablePrimaryCell>

      {/* Round number (links to a "prize" page for more info) */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${row.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Token ID (links to RandomWalk's detail page) */}
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * StakingRewardMintsTable displays a paginated list of staking reward mints.
 * Each row includes details such as:
 * - The mint's date/time and transaction link
 * - The winner's address
 * - The round number in which it was minted
 * - The minted Token ID with a link to its details
 *
 * @param list - An array of mint event objects containing TxHash, TimeStamp, WinnerAddr, RoundNum, and TokenId
 */
export const StakingRewardMintsTable = ({ list }) => {
  // Number of rows to display per page
  const perPage = 5;

  // Current page for pagination
  const [page, setPage] = useState(1);

  // If there are no records, show a fallback message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Calculate which records to show for the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table header defining the columns */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table body rendering each row of mint info */}
          <Tbody>
            {currentData.map((row) => (
              <StakingRewardMintsRow key={row.EvtLogId} row={row} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination component for navigating through multiple pages */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

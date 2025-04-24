import React, { useState } from "react";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
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

import { CustomPagination } from "./CustomPagination";

/**
 * Renders a single row in the staking rewards table.
 * Clicking on the row navigates the user to a detailed view
 * of rewards for the specified token.
 * @param row - The reward data for this row
 * @param address - The user's address (used for routing)
 */
const StakingRewardsRow = ({ row, address }) => {
  const router = useRouter();

  // If there's no row data, return an empty row placeholder
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Navigate to the rewards-by-token detail page on row click
  const handleRowClick = () => {
    router.push(`/rewards-by-token/${address}/${row.TokenId}`);
  };

  return (
    <TablePrimaryRow sx={{ cursor: "pointer" }} onClick={handleRowClick}>
      <TablePrimaryCell align="center">{row.TokenId}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.RewardCollectedEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.RewardToCollectEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Displays a table of staking rewards for a set of tokens.
 * Each row shows the token ID, collected rewards, and rewards to collect.
 * The table includes pagination for ease of navigation.
 * @param list - An array of objects containing reward information
 * @param address - The user's wallet address
 */
export const StakingRewardsTable = ({ list, address }) => {
  // Number of rows to display per page
  const perPage = 5;

  // The current page in pagination
  const [page, setPage] = useState(1);

  // If there are no rewards, show a fallback message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Calculate the slice of data to display for the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      {/* Table container with a responsive table */}
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Collected Rewards (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Rewards to Collect (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <Tbody>
            {currentData.map((row) => (
              <StakingRewardsRow
                key={row.TokenId}
                row={row}
                address={address}
              />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Controls */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

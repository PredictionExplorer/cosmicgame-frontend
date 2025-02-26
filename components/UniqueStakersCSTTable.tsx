import React, { useState } from "react";
import { Link, TableBody, Tooltip, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { shortenHex } from "../utils";
import { CustomPagination } from "./CustomPagination";

/**
 * Table row component for displaying individual staker data.
 *
 * @param {Object} props
 * @param {Object} props.row - The staker data object.
 */
const UniqueStakersCSTRow = ({ row }) => {
  // Handle case if row is undefined or null.
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Destructure the row object with default values to avoid undefined issues.
  const {
    StakerAddr = "",
    NumStakeActions = 0,
    NumUnstakeActions = 0,
    TotalTokensMinted = 0,
    TotalTokensStaked = 0,
    // Using optional chaining with default value to ensure .toFixed won't error out.
    TotalRewardEth = 0,
    UnclaimedRewardEth = 0,
  } = row;

  return (
    <TablePrimaryRow>
      {/* Staker Address column with tooltip and link */}
      <TablePrimaryCell>
        <Tooltip title={StakerAddr}>
          <Link
            href={`/user/${StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(StakerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      {/* Number of stake actions column */}
      <TablePrimaryCell align="center">{NumStakeActions}</TablePrimaryCell>

      {/* Number of unstake actions column */}
      <TablePrimaryCell align="center">{NumUnstakeActions}</TablePrimaryCell>

      {/* Total minted tokens column */}
      <TablePrimaryCell align="center">{TotalTokensMinted}</TablePrimaryCell>

      {/* Total staked tokens column */}
      <TablePrimaryCell align="center">{TotalTokensStaked}</TablePrimaryCell>

      {/* Total reward in ETH column, formatted to 6 decimal places */}
      <TablePrimaryCell align="right">
        {TotalRewardEth.toFixed(6)}
      </TablePrimaryCell>

      {/* Unclaimed reward in ETH column, formatted to 6 decimal places */}
      <TablePrimaryCell align="right">
        {UnclaimedRewardEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Main table component that displays a list of stakers with pagination controls.
 *
 * @param {Object} props
 * @param {Array} props.list - The array of staker data objects.
 */
export const UniqueStakersCSTTable = ({ list }) => {
  // Number of rows to show per page.
  const perPage = 5;

  // Current page state.
  const [page, setPage] = useState(1);

  // If list is empty, display a "No stakers yet." message.
  if (list.length === 0) {
    return <Typography>No stakers yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Staker Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Stake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Unstake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Minted Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Total Reward (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Unclaimed Reward (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {/* 
              Slice the list based on current page and items per page,
              then render each row using UniqueStakersCSTRow.
            */}
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              // Use a unique key, here we assume 'StakerAid' is a unique identifier.
              <UniqueStakersCSTRow row={row} key={row.StakerAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* 
        Pagination component allowing navigation between pages.
        Pass down page state and setter, plus totalLength and perPage 
        to calculate total pages.
      */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

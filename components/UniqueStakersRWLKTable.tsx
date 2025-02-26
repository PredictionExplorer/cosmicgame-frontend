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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

/**
 * Renders a single table row with staker information.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.row - Individual row data for a staker.
 * @returns {JSX.Element} A table row containing staker information.
 */
const UniqueStakersRWLKRow = ({ row }) => {
  // If row is not available, return an empty table row to avoid errors.
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Destructure row values safely.
  // You can also provide default values to avoid potential 'undefined' errors.
  const {
    StakerAddr = "",
    NumStakeActions = 0,
    NumUnstakeActions = 0,
    TotalTokensStaked = 0,
    TotalTokensMinted = 0,
  } = row;

  return (
    <TablePrimaryRow>
      {/* 
        AddressLink is a custom component that likely displays a shortened address
        and links to a details page. 
      */}
      <TablePrimaryCell>
        <AddressLink address={StakerAddr} url={`/user/${StakerAddr}`} />
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{NumStakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">{NumUnstakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">{TotalTokensStaked}</TablePrimaryCell>
      <TablePrimaryCell align="center">{TotalTokensMinted}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Renders a paginated table of unique stakers with relevant staking data.
 *
 * @param {Object} props - Component props.
 * @param {Array} props.list - Array of staker objects to display.
 * @returns {JSX.Element} A table component containing staker data.
 */
export const UniqueStakersRWLKTable = ({ list }) => {
  // Number of rows to display per page.
  const perPage = 5;

  // Current page state, starts at page 1.
  const [page, setPage] = useState(1);

  // If no data exists, display a message instead of the table.
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
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Minted Tokens</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {/*
              Slice the list based on the current page and the number of items per page.
              Then map each item to a <UniqueStakersRWLKRow />.
            */}
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              // Use a unique key for each row. Here, we assume 'StakerAid' is unique.
              <UniqueStakersRWLKRow row={row} key={row.StakerAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/*
        CustomPagination is a separate component handling pagination controls.
        We pass:
          - 'page' for the current page,
          - 'setPage' to update the current page,
          - 'totalLength' to know total items for page calculation,
          - 'perPage' to know how many rows are displayed on each page.
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

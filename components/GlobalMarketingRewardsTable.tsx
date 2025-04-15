import React, { useState } from "react";
import { Link, TableBody, Typography } from "@mui/material";
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
import { AddressLink } from "./AddressLink";

// Component to display a single row in the marketing rewards table
const GlobalMarketingRewardsRow = ({ row }: { row: any }) => {
  // If no row is passed, return an empty row
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {/* Link to the transaction on Arbiscan */}
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.TxHash}`}
          target="__blank"
        >
          {/* Display formatted timestamp */}
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {/* AddressLink component to display the marketer's address */}
        <AddressLink
          address={row.MarketerAddr}
          url={`/marketing/${row.MarketerAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {/* Display the reward amount with 2 decimal places */}
        {row.AmountEth.toFixed(2)} CST
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

// Main table component to display marketing rewards with pagination
export const GlobalMarketingRewardsTable = ({ list }: { list: any[] }) => {
  const perPage = 5; // Number of items to display per page
  const [page, setPage] = useState(1); // Current page state

  // If the list is empty, display a message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  return (
    <>
      {/* Table Container */}
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            {/* Table Head with column names */}
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Marketer</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {/* Map through the list and display a row for each item, with pagination */}
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <GlobalMarketingRewardsRow row={row} key={row.EvtLogId} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Custom Pagination Component */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

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
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

// Row component for marketing rewards table
const MarketingRewardsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  const transactionUrl = `https://arbiscan.io/tx/${row.TxHash}`;

  return (
    <TablePrimaryRow>
      {/* Date and transaction link */}
      <TablePrimaryCell>
        <Link color="inherit" href={transactionUrl} target="_blank">
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Reward amount in CST, formatted to 2 decimal places */}
      <TablePrimaryCell>{row.AmountEth.toFixed(2)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

// Main component for displaying the marketing rewards table with pagination
const MarketingRewardsTable = ({ list }) => {
  const perPage = 5; // Number of items per page
  const [page, setPage] = useState(1); // Pagination state

  // Handle empty reward list
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Items for the current page
  const currentItems = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Amount (CST)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table body rendering rows */}
          <TableBody>
            {currentItems.map((row) => (
              <MarketingRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination controls */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

export default MarketingRewardsTable;

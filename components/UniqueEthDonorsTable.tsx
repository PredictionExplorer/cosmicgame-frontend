import React, { useState } from "react";
import { Box, TableBody, Typography } from "@mui/material";
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

// Component to display a single row for a donor in the table
const UniqueEthDonorsRow = ({ row }: { row: any }) => {
  // If no row is passed, return an empty row
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Display donor address with a clickable link */}
      <TablePrimaryCell>
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      {/* Display number of donations */}
      <TablePrimaryCell align="center">{row.CountDonations}</TablePrimaryCell>
      {/* Display total donated amount with 2 decimal places */}
      <TablePrimaryCell align="right">
        {row.TotalDonatedEth.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

// Main table component to display the unique ETH donors with pagination
export const UniqueEthDonorsTable = ({ list }: { list: any[] }) => {
  const perPage = 5; // Number of items per page
  const [page, setPage] = useState(1); // State to keep track of current page

  // If there are no donors in the list, display a message
  if (!list || list.length === 0) {
    return <Typography>No donors yet.</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Table container */}
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            {/* Table Header */}
            <Tr>
              <TablePrimaryHeadCell align="left">
                Donor Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of Donations</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Total Donated Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {/* Map through the list of donors and display each donor's data with pagination */}
            {list.slice((page - 1) * perPage, page * perPage).map((donor) => (
              <UniqueEthDonorsRow row={donor} key={donor.DonorAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      {/* Pagination component */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </Box>
  );
};

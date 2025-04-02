// CharityDepositTable.tsx
// This file contains:
// 1. DonationRow: A component for rendering an individual donation entry.
// 2. CharityDepositTable: A component that displays donations in a paginated table.
//
// Usage:
// <CharityDepositTable list={donationsList} />
//
// Dependencies:
// - Material UI for styling (Link, Typography, etc.).
// - React Super Responsive Table for responsive table layout.
// - CustomPagination for paginated displays.
// - AddressLink for linking to donor addresses.

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

//------------------------------------------------------------------------------
// TypeScript Interfaces
//------------------------------------------------------------------------------

/**
 * Represents a single donation record.
 */
interface Donation {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
}

/**
 * Props for the DonationRow component.
 */
interface DonationRowProps {
  donation: Donation;
}

/**
 * Props for the CharityDepositTable component.
 */
interface CharityDepositTableProps {
  list: Donation[];
}

//------------------------------------------------------------------------------
// Components
//------------------------------------------------------------------------------

/**
 * DonationRow
 * Renders a single row in the donation table, including links to block explorers
 * and user profiles.
 */
const DonationRow: React.FC<DonationRowProps> = ({ donation }) => {
  // Fallback for undefined donation objects
  if (!donation) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Date & Tx Hash Link */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${donation.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(donation.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Round Number (conditionally linked) */}
      <TablePrimaryCell align="center">
        {donation.RoundNum < 0 ? (
          " " // If RoundNum is negative, display a blank space
        ) : (
          <Link
            color="inherit"
            fontSize="inherit"
            href={`/prize/${donation.RoundNum}`}
            target="__blank"
          >
            {donation.RoundNum}
          </Link>
        )}
      </TablePrimaryCell>

      {/* Donor Address */}
      <TablePrimaryCell align="center">
        <AddressLink
          address={donation.DonorAddr}
          url={`/user/${donation.DonorAddr}`}
        />
      </TablePrimaryCell>

      {/* Donation Amount in ETH */}
      <TablePrimaryCell align="right">
        {donation.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * CharityDepositTable
 * Displays a paginated list of donation records.
 *
 * @param list An array of Donation objects to be displayed in the table.
 */
export const CharityDepositTable: React.FC<CharityDepositTableProps> = ({
  list,
}) => {
  // Number of records to display per page.
  const perPage = 10;
  // Current page for pagination.
  const [page, setPage] = useState(1);

  // If no records exist, display a fallback message.
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }

  // Calculate the slice of data to display for the current page.
  const currentData = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round Num</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Donor Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Donation amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentData.map((donation) => (
              <DonationRow donation={donation} key={donation.EvtLogId} />
            ))}
          </TableBody>
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

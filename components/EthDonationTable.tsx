import React, { FC, useState } from "react";
import { Link, TableBody, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { convertTimestampToDateTime } from "../utils";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";
import router from "next/router";
import { isMobile } from "react-device-detect";

/**
 * Data shape for each donation record.
 * Update this interface based on your actual data fields.
 */
interface EthDonation {
  EvtLogId: string | number; // Unique identifier for donation event
  TxHash: string; // Transaction hash (Arbitrum)
  TimeStamp: number; // Unix timestamp of donation
  RecordType: number; // 0: simple donation, > 0: donation with info
  CGRecordId: string | number; // ID used to navigate to /eth-donation/detail
  RoundNum: string | number; // Round number
  DonorAddr: string; // Ethereum address of the donor
  AmountEth: number; // Amount donated in ETH
}

/**
 * Props for a single EthDonationRow component
 * @property row     - The donation record to display
 * @property showType - Whether to show the "Type" column in the table
 */
interface EthDonationRowProps {
  row: EthDonation;
  showType: boolean;
}

/**
 * Renders a single row in the Ethereum Donation table.
 * Clicking on a row (when applicable) navigates to the donation detail page.
 */
const EthDonationRow: FC<EthDonationRowProps> = ({ row, showType }) => {
  if (!row) {
    // If no row data is provided, return an empty table row (optional case).
    return <TablePrimaryRow />;
  }

  // Only make the row clickable if RecordType > 0 or showType is false.
  const clickable = row.RecordType > 0 || !showType;

  const handleRowClick = () => {
    if (clickable) {
      router.push(`/eth-donation/detail/${row.CGRecordId}`);
    }
  };

  return (
    <TablePrimaryRow
      sx={clickable ? { cursor: "pointer" } : undefined}
      onClick={clickable ? handleRowClick : undefined}
    >
      {/* 
        Datetime is converted from a Unix timestamp to a human-readable format. 
        Links to Arbiscan for transaction details. 
      */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Optionally display "Type" column based on showType prop. */}
      {showType && (
        <TablePrimaryCell align="center">
          {row.RecordType ? "Donation with info" : "Simple donation"}
        </TablePrimaryCell>
      )}

      {/* 
        Round number is displayed as a link to the corresponding prize page. 
        Note: If `/prize/[RoundNum]` is not the intended route, adjust as needed. 
      */}
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/prize/${row.RoundNum}`}
          target="_blank"
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Donor address is rendered via AddressLink component. */}
      <TablePrimaryCell align="center">
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>

      {/* Amount (ETH) formatted to two decimals. */}
      <TablePrimaryCell align="right">
        {row.AmountEth.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Props for the EthDonationTable component.
 * @property list    - Array of donations to display
 * @property showType - Whether to display the "Type" column
 */
interface EthDonationTableProps {
  list: EthDonation[];
  showType?: boolean;
}

/**
 * Table component to display a paginated list of Ethereum donations.
 */
const EthDonationTable: FC<EthDonationTableProps> = ({
  list,
  showType = true,
}) => {
  // Number of rows to display per page.
  const perPage = 5;

  // Current page state.
  const [page, setPage] = useState(1);

  // If there are no donations, display a friendly message.
  if (list.length === 0) {
    return <Typography>No donations yet.</Typography>;
  }

  // Determine which rows to render on the current page.
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Define column widths for larger screens only. */}
          {!isMobile && (
            <colgroup>
              <col width="20%" />
              {showType && <col width="20%" />}
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              {showType && <TablePrimaryHeadCell>Type</TablePrimaryHeadCell>}
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Donor</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {visibleRows.map((row) => (
              <EthDonationRow
                key={row.EvtLogId}
                row={row}
                showType={showType}
              />
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

export default EthDonationTable;

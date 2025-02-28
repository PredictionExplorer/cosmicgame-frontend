import React, { useState, useMemo } from "react";
import { TableBody, Tooltip, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { useRouter } from "next/router";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";

/* ------------------------------------------------------------------
  Sub-Component: PrizeRow
  Renders a single row in the Prize table. Each row shows:
    - Round number
    - Datetime
    - Winner address (shortened)
    - Various stats (ETH amounts, # of bids, # of donated NFTs, etc.)
  Clicking on a row navigates to the '/prize/:PrizeNum' page.
------------------------------------------------------------------ */
const PrizeRow = ({ prize }) => {
  const router = useRouter();

  // If there's no prize data, render an empty table row to avoid errors.
  if (!prize) return <TablePrimaryRow />;

  // Handle row click to navigate to a detail page for this specific prize.
  const handleRowClick = () => {
    router.push(`/prize/${prize.PrizeNum}`);
  };

  return (
    <TablePrimaryRow sx={{ cursor: "pointer" }} onClick={handleRowClick}>
      {/* Round Number */}
      <TablePrimaryCell align="center">{prize.PrizeNum}</TablePrimaryCell>

      {/* Datetime (converted from timestamp) */}
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(prize.TimeStamp)}
      </TablePrimaryCell>

      {/* Winner Address, shortened + Tooltip for full address */}
      <TablePrimaryCell>
        <Tooltip title={prize.WinnerAddr}>
          <Typography
            sx={{ fontSize: "inherit !important", fontFamily: "monospace" }}
          >
            {shortenHex(prize.WinnerAddr, 6)}
          </Typography>
        </Tooltip>
      </TablePrimaryCell>

      {/* Prize Amount (in ETH), formatted to 4 decimals */}
      <TablePrimaryCell align="center">
        {prize.AmountEth.toFixed(4)}
      </TablePrimaryCell>

      {/* Number of Bids */}
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalBids}
      </TablePrimaryCell>

      {/* Donated NFTs count */}
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalDonatedNFTs}
      </TablePrimaryCell>

      {/* Raffle Deposits (in ETH), formatted to 4 decimals */}
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalRaffleEthDepositsEth.toFixed(4)}
      </TablePrimaryCell>

      {/* Staking Deposit (in ETH), formatted to 4 decimals */}
      <TablePrimaryCell align="center">
        {prize.StakingDepositAmountEth.toFixed(4)}
      </TablePrimaryCell>

      {/* Number of Raffle NFTs */}
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalRaffleNFTs}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: PrizeTable
  Displays a paginated table of prizes. Each item in `list` corresponds 
  to a prize record with metadata (round, timestamps, stats, etc.).

  Props:
    - list: An array of prize objects.
    - loading: A boolean indicating if the data is being fetched.
------------------------------------------------------------------ */
export const PrizeTable = ({ list, loading }) => {
  // Number of rows to display per page.
  const perPage = 10;

  // Current page in the pagination.
  const [page, setPage] = useState(1);

  /**
   * Generate a slice of the list for the current page.
   * This is memoized to avoid unnecessary re-slicing when dependencies
   * (page, perPage, list) have not changed.
   */
  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    return list.slice(startIndex, endIndex);
  }, [page, perPage, list]);

  // If data is still loading, display a loading message.
  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  // If there's no data, display a fallback message.
  if (!list.length) {
    return <Typography variant="h6">No winners yet.</Typography>;
  }

  // Define columns for the table header.
  const tableHeaders = [
    { label: "Round", width: "5%" },
    { label: "Datetime", width: "20%" },
    { label: "Winner", width: "7%" },
    { label: "Prize Amount", width: "15%", align: "center" },
    { label: "Bids", width: "5%" },
    { label: "Donated NFTs", width: "12%" },
    { label: "Raffle Deposits", width: "12%", align: "center" },
    { label: "Staking Deposit", width: "11%", align: "center" },
    { label: "Raffle NFTs", width: "13%" },
  ];

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* 
            On non-mobile devices, add a <colgroup> for column sizing.
            This helps keep columns at fixed widths for better readability.
          */}
          {!isMobile && (
            <colgroup>
              {tableHeaders.map((header, index) => (
                <col key={index} style={{ width: header.width }} />
              ))}
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              {tableHeaders.map((header, index) => (
                <TablePrimaryHeadCell
                  key={index}
                  align={header.align || "center"}
                >
                  {header.label}
                </TablePrimaryHeadCell>
              ))}
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {/* Render each prize row in the current page slice */}
            {paginatedList.map((prize) => (
              <PrizeRow prize={prize} key={prize.EvtLogId} />
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

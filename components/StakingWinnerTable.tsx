import React, { useState } from "react";
import { TableBody, Link, Typography, Tooltip } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";

/**
 * WinnerRow
 *
 * Renders a single row of data for a winner in the staking round.
 *
 * @param winner An object containing winner details
 */
const WinnerRow = ({ winner }: { winner: any }) => {
  // If there's no valid winner object, return an empty row to keep table structure
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Datetime (linked to Arbiscan) */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${winner.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(winner.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Staker Address (tooltip with full address, link to /user) */}
      <TablePrimaryCell align="left">
        <Tooltip title={winner.StakerAddr}>
          <Link
            href={`/user/${winner.StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(winner.StakerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      {/* Number of Staked NFTs */}
      <TablePrimaryCell align="center">
        {winner.StakerNumStakedNFTs}
      </TablePrimaryCell>

      {/* Reward Amount (ETH) */}
      <TablePrimaryCell align="right">
        {winner.StakerAmountEth.toFixed(4)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * StakingWinnerTable
 *
 * Displays a paginated table of winners for a particular staking round.
 *
 * @param list An array of objects representing staking winners
 */
const StakingWinnerTable = ({ list }: { list: any[] }) => {
  // Number of rows to display per page
  const perPage = 5;

  // Current page number
  const [page, setPage] = useState(1);

  // If there are no winners, show a message
  if (list.length === 0) {
    return (
      <Typography>
        There were no staked tokens at the time the round ended. The deposit
        amount was sent to the charity address.
      </Typography>
    );
  }

  // Compute the subset of winners for the current page
  const displayedWinners = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {displayedWinners.map((winner) => (
              <WinnerRow key={winner.StakerAddr} winner={winner} />
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

export default StakingWinnerTable;

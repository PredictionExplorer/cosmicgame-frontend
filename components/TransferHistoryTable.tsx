import React, { useState } from "react";
import { Link, TableBody, Tooltip } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { ZERO_ADDRESS } from "../config/misc";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from "../config/app";
import { CustomPagination } from "./CustomPagination";

/* ------------------------------------------------------------------
  Sub-Component: TransferHistoryRow
  Renders a single row in the transfer history table, displaying 
  the transaction date/time and the "From" / "To" addresses.

  If the record is null or the 'FromAddr' is the zero address, 
  it returns null, effectively skipping the row.
------------------------------------------------------------------ */
const TransferHistoryRow = ({ record }) => {
  // If there's no record or 'FromAddr' is zero, skip rendering this row.
  if (!record || record.FromAddr === ZERO_ADDRESS) {
    return null;
  }

  // Destructure record fields for clarity.
  const { TxHash, TimeStamp, FromAddr, ToAddr } = record;

  return (
    <TablePrimaryRow>
      {/* Date/Time cell linking to Arbiscan for transaction details */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* "From" Address cell with tooltip and optional staking wallet labels */}
      <TablePrimaryCell>
        <Tooltip title={FromAddr}>
          <Link
            href={`/user/${FromAddr}`}
            sx={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {FromAddr === STAKING_WALLET_CST_ADDRESS
              ? "StakingWallet CST"
              : FromAddr === STAKING_WALLET_RWLK_ADDRESS
              ? "StakingWallet RandomWalk"
              : shortenHex(FromAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      {/* "To" Address cell with tooltip and optional staking wallet labels */}
      <TablePrimaryCell>
        <Tooltip title={ToAddr}>
          <Link
            href={`/user/${ToAddr}`}
            sx={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {ToAddr === STAKING_WALLET_CST_ADDRESS
              ? "StakingWallet CST"
              : ToAddr === STAKING_WALLET_RWLK_ADDRESS
              ? "StakingWallet RandomWalk"
              : shortenHex(ToAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: TransferHistoryTable
  Renders a paginated table of transfer records. Each page displays 
  'perPage' items, and a custom pagination component lets users 
  navigate between pages.
------------------------------------------------------------------ */
export const TransferHistoryTable = ({ list }) => {
  // Number of rows per page
  const perPage = 5;
  // Track current page in state
  const [page, setPage] = useState(1);

  return (
    <>
      {/* Table Container and the Table itself */}
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">To</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {list
              // Slice the list to only show the current page items
              .slice((page - 1) * perPage, page * perPage)
              .map((record) => (
                // Use 'EvtLogId' as the key, ensuring it's unique
                <TransferHistoryRow record={record} key={record.EvtLogId} />
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

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
import { isMobile } from "react-device-detect";

/* ------------------------------------------------------------------
  Sub-Component: CollectedRewardsRow
  Renders a single "collected staking reward" record.
------------------------------------------------------------------ */
const CollectedRewardsRow = ({ row }) => {
  if (!row) return null;

  const {
    DepositTimeStamp,
    DepositId,
    RoundNum,
    TotalDepositAmountEth,
    YourCollectedAmountEth,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(DepositTimeStamp)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {TotalDepositAmountEth.toFixed(6)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {YourCollectedAmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: CollectedCSTStakingRewardsTable
  Displays a paginated list of previously collected staking rewards.
------------------------------------------------------------------ */
export const CollectedCSTStakingRewardsTable = ({ list }) => {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  // Early return if no data
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Slice data for the current page
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Optional: Column widths for non-mobile views */}
          {!isMobile && (
            <colgroup>
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Deposit Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Collected Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {currentData.map((row) => (
              <CollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination */}
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};

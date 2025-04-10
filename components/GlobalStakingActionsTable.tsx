import React, { useState, FC } from "react";
import { Link, TableBody, Tooltip, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { useRouter } from "next/router";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";

/**
 * Interface representing the structure of each row's data.
 * Adjust fields as necessary to match your actual data model.
 */
interface RowData {
  EvtLogId: string | number;
  ActionId: string | number;
  TimeStamp: number;
  ActionType: number;
  TokenId: string | number;
  StakerAddr: string;
  NumStakedNFTs: number;
}

/**
 * Props for the GlobalStakingActionsRow component.
 * @property row - The row data to display.
 * @property IsRWLK - Whether the data is from RWLK (affects certain URLs).
 */
interface GlobalStakingActionsRowProps {
  row: RowData;
  IsRWLK: boolean;
}

/**
 * Renders a single row of staking action data.
 * Navigates to a detailed page on row click.
 */
const GlobalStakingActionsRow: FC<GlobalStakingActionsRowProps> = ({
  row,
  IsRWLK,
}) => {
  const router = useRouter();

  // If no row data is provided, return an empty row.
  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    // Navigate to the staking-action details page with either RWLK = 1 or 0
    router.push(`/staking-action/${IsRWLK ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow sx={{ cursor: "pointer" }} onClick={handleRowClick}>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {row.ActionType === 0 ? "Stake" : "Unstake"}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {/* Link to details page for the token (conditional URL for RWLK) */}
        <Link
          href={
            IsRWLK
              ? `https://randomwalknft.com/detail/${row.TokenId}`
              : `/detail/${row.TokenId}`
          }
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {/* Show the full staker address on hover, short version by default */}
        <Tooltip title={row.StakerAddr}>
          <Link
            href={`/user/${row.StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(row.StakerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Props for the GlobalStakingActionsTable component.
 * @property list - Array of staking action data to render in the table.
 * @property IsRWLK - Whether the data is from RWLK (affects certain URLs).
 */
interface GlobalStakingActionsTableProps {
  list: RowData[];
  IsRWLK: boolean;
}

/**
 * Renders a responsive table listing all global staking actions.
 * Uses pagination to display the data in pages of `perPage` rows each.
 */
export const GlobalStakingActionsTable: FC<GlobalStakingActionsTableProps> = ({
  list,
  IsRWLK,
}) => {
  // Number of rows displayed per page
  const perPage = 5;

  // Current page number
  const [page, setPage] = useState(1);

  // If there is no data, display a friendly message
  if (!list || list.length === 0) {
    return <Typography>No actions yet.</Typography>;
  }

  // Calculate the rows to display for the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* For non-mobile devices, set column widths explicitly */}
          {!isMobile && (
            <colgroup>
              <col width="25%" />
              <col width="15%" />
              <col width="15%" />
              <col width="25%" />
              <col width="15%" />
            </colgroup>
          )}

          {/* Table header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table body: map visible rows to <GlobalStakingActionsRow /> */}
          <TableBody>
            {visibleRows.map((row) => (
              <GlobalStakingActionsRow
                key={row.EvtLogId}
                row={row}
                IsRWLK={IsRWLK}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination control */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

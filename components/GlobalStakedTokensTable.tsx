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
import { convertTimestampToDateTime } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

/**
 * Describes the shape of each token row in the table.
 * Adjust properties to match your actual data model.
 */
interface GlobalStakedToken {
  StakeEvtLogId: string | number;
  StakeTimeStamp: number; // Unix timestamp of the stake action
  StakeActionId: string | number;
  StakedTokenId?: string | number; // Used if IsRWLK = true
  UserAddr: string;
  TokenInfo?: {
    TokenId: string | number; // Used if IsRWLK = false
  };
}

/**
 * Props for the GlobalStakedTokensRow component.
 * @property row - A single staked token record.
 * @property IsRWLK - Determines which URL pattern to use for details.
 */
interface GlobalStakedTokensRowProps {
  row: GlobalStakedToken;
  IsRWLK: boolean;
}

/**
 * Renders a single table row for a staked token.
 */
const GlobalStakedTokensRow: FC<GlobalStakedTokensRowProps> = ({
  row,
  IsRWLK,
}) => {
  // Return an empty row if data is missing (this check is optional).
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Display stake timestamp as a readable datetime */}
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.StakeTimeStamp)}
      </TablePrimaryCell>

      {/* Link to the staking action details page */}
      <TablePrimaryCell align="center">
        <Link
          href={`/staking-action/${IsRWLK ? 1 : 0}/${row.StakeActionId}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {row.StakeActionId}
        </Link>
      </TablePrimaryCell>

      {/* Link to the token details page, switching URL based on IsRWLK */}
      <TablePrimaryCell align="center">
        <Link
          href={
            IsRWLK
              ? `https://randomwalknft.com/detail/${row.StakedTokenId}`
              : `/detail/${row.TokenInfo?.TokenId}`
          }
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {IsRWLK ? row.StakedTokenId : row.TokenInfo?.TokenId}
        </Link>
      </TablePrimaryCell>

      {/* Staker address, rendered via an AddressLink component */}
      <TablePrimaryCell align="center">
        <AddressLink address={row.UserAddr} url={`/user/${row.UserAddr}`} />
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Props for the GlobalStakedTokensTable component.
 * @property list - The full array of staked tokens to display.
 * @property IsRWLK - Determines which URL pattern is used within table rows.
 */
interface GlobalStakedTokensTableProps {
  list: GlobalStakedToken[];
  IsRWLK: boolean;
}

/**
 * Renders a table of globally staked tokens with pagination.
 */
export const GlobalStakedTokensTable: FC<GlobalStakedTokensTableProps> = ({
  list,
  IsRWLK,
}) => {
  // Number of rows to display per page
  const perPage = 5;

  // Current page state
  const [page, setPage] = useState(1);

  // If there are no records, display a friendly message
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }

  // Calculate which rows to show on the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker Address</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {visibleRows.map((row) => (
              <GlobalStakedTokensRow
                key={row.StakeEvtLogId}
                row={row}
                IsRWLK={IsRWLK}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination controls for navigating rows */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

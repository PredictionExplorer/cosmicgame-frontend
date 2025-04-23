import React, { FC, useMemo, useState } from "react";
import { TableBody, Typography } from "@mui/material";
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
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

/** -----------------------------------------------------------------------
 * Type Definitions
 * ------------------------------------------------------------------------*/

/**
 * A record representing the CST balance of a single owner.
 */
export interface BalanceRow {
  /** Account address of the token owner */
  OwnerAddr: string;
  /** Unique identifier for the owner — used as React key */
  OwnerAid: string | number;
  /** Token balance as a floating‑point number */
  BalanceFloat: number;
}

/** -----------------------------------------------------------------------
 * Row Component
 * ------------------------------------------------------------------------*/

/**
 * Renders a single row inside {@link CTBalanceDistributionTable}.
 * Extracted into its own.memoised component to avoid unnecessary rerenders
 * when pagination switches pages.
 */
const CTBalanceDistributionRow: FC<{ row?: BalanceRow }> = React.memo(
  ({ row }) => {
    // When `row` is undefined (e.g. while loading), render an empty <tr>
    if (!row) return <TablePrimaryRow />;

    return (
      <TablePrimaryRow>
        <TablePrimaryCell>
          {/* Clickable link to the owner's detail page */}
          <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
        </TablePrimaryCell>

        <TablePrimaryCell align="right">
          {/* Display balance with 6‑decimal precision for consistency */}
          {row.BalanceFloat.toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>
    );
  }
);
CTBalanceDistributionRow.displayName = "CTBalanceDistributionRow";

/** -----------------------------------------------------------------------
 * Table Component
 * ------------------------------------------------------------------------*/

interface TableProps {
  /** Full dataset of balances to show */
  list: BalanceRow[];
}

/**
 * Paginated table showing CST balance distribution across owners.
 */
export const CTBalanceDistributionTable: FC<TableProps> = ({ list }) => {
  /** Number of rows to show on each page */
  const PER_PAGE = 5;

  /** Controlled pagination state (1‑based index) */
  const [page, setPage] = useState(1);

  /** Derived total number of pages (memoised for perf) */
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(list.length / PER_PAGE)),
    [list.length]
  );

  /** Slice only the rows required for the current page */
  const currentRows = useMemo(
    () => list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [list, page]
  );

  /* -------------------------------------------------------------------- */

  // Guard: render a friendly message when the dataset is empty
  if (list.length === 0) return <Typography>No tokens yet.</Typography>;

  return (
    <>
      {/* Main table ----------------------------------------------------- */}
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Owner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Balance (CST)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {currentRows.map((row) => (
              <CTBalanceDistributionRow key={row.OwnerAid} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination ------------------------------------------------------ */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};

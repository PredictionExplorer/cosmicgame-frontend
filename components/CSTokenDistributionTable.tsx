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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

/**
 * Shape of a single token‑distribution record returned by the API.
 */
interface TokenDistribution {
  /** EVM‑compatible wallet address that owns the tokens */
  OwnerAddr: string;
  /** Unique id for React key – usually the same as `OwnerAddr` but could be a DB id */
  OwnerAid: string | number;
  /** Number of tokens the address currently holds */
  NumTokens: number;
}

/** Props for `<CSTokenDistributionRow>` */
interface CSTokenDistributionRowProps {
  row?: TokenDistribution; // Row is optional so we can render an empty placeholder if nothing is passed
}

/**
 * Single table row that displays an owner address and the amount of tokens they hold.
 * Extracted so we keep the parent component lean and to enable potential memoization later.
 */
const CSTokenDistributionRow: FC<CSTokenDistributionRowProps> = ({ row }) => {
  // Render an empty row when data is not yet available (keeps table height consistent during loading)
  if (!row) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {/* Clicking the hash navigates to that owner's detail page */}
        <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
      </TablePrimaryCell>

      {/* Right‑align numbers for clarity */}
      <TablePrimaryCell align="right">{row.NumTokens}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/** Props for the main table */
interface CSTokenDistributionTableProps {
  /** Full list of owners and balances */
  list: TokenDistribution[];
  /** Items per page – optional, defaults to 5 */
  perPage?: number;
}

/**
 * Renders a paginated table of token distribution among owners.
 *
 * @example
 * <CSTokenDistributionTable list={dataFromApi} />
 */
export const CSTokenDistributionTable: FC<CSTokenDistributionTableProps> = ({
  list,
  perPage = 5,
}) => {
  // Current page index – starts at 1 for UX friendliness
  const [page, setPage] = useState(1);

  // Only recompute the slice when list, page, or perPage changes
  const paginatedData = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page, perPage]
  );

  // Early‑exit when there is nothing to show
  if (list.length === 0) return <Typography>No tokens yet.</Typography>;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* ======= Table Header ======= */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Owner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Number of Tokens Owned
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* ======= Table Body ======= */}
          <TableBody>
            {paginatedData.map((row) => (
              <CSTokenDistributionRow row={row} key={row.OwnerAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* ======= Pagination Controls ======= */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

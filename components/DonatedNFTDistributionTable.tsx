import React, { FC, memo, useMemo, useState } from "react";
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

/** Number of rows to display per page */
const PER_PAGE = 5;

/* -------------------------------------------------------------------------- */
/*                                Type Helpers                                */
/* -------------------------------------------------------------------------- */

/**
 * Shape of each individual data record.
 */
export interface NFTDistributionRowData {
  /** ERC‑721 / ERC‑1155 contract address */
  ContractAddr: string;
  /** Quantity of NFTs donated for this contract */
  NumDonatedTokens: number;
}

interface NFTDistributionRowProps {
  rowData: NFTDistributionRowData;
}

interface NFTDistributionTableProps {
  /**
   * Complete list of distribution rows. Empty array ⇒ no donations yet.
   */
  list: NFTDistributionRowData[];
}

/* -------------------------------------------------------------------------- */
/*                               Row Component                                */
/* -------------------------------------------------------------------------- */

/**
 * Render a single data row. Using `memo` so it re‑renders only if `rowData` changes.
 */
const DonatedNFTDistributionRow: FC<NFTDistributionRowProps> = memo(
  ({ rowData }) => {
    // Guard: Defensive check — shouldn't happen if parent validates data
    if (!rowData) {
      return <TablePrimaryRow />;
    }

    return (
      <TablePrimaryRow>
        <TablePrimaryCell>
          {/* Use monospaced font for fixed‑width contract addresses */}
          <Typography fontFamily="monospace">{rowData.ContractAddr}</Typography>
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {rowData.NumDonatedTokens}
        </TablePrimaryCell>
      </TablePrimaryRow>
    );
  }
);
DonatedNFTDistributionRow.displayName = "DonatedNFTDistributionRow";

/* -------------------------------------------------------------------------- */
/*                              Table Component                               */
/* -------------------------------------------------------------------------- */

const DonatedNFTDistributionTable: FC<NFTDistributionTableProps> = ({
  list,
}) => {
  /* ------------------------------- State -------------------------------- */
  const [page, setPage] = useState(1);

  /* ----------------------------- Memoized Data -------------------------- */
  const paginatedData = useMemo(
    () => list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [list, page]
  );

  /* ------------------------------ Render -------------------------------- */
  if (list.length === 0) {
    return <Typography>No donated tokens yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* ---------------------- Table Header ----------------------- */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Contract Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Number of NFTs
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* ----------------------- Table Body ------------------------ */}
          <TableBody>
            {paginatedData.map((row) => (
              <DonatedNFTDistributionRow key={row.ContractAddr} rowData={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* ------------------------ Pagination ------------------------- */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};

export default DonatedNFTDistributionTable;

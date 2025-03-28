import React, { useState, useMemo } from "react";
import { Box, TableBody, Typography } from "@mui/material";
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

// Types for bidder information
interface Bidder {
  BidderAid: string;
  BidderAddr: string;
  NumBids: number;
  MaxBidAmountEth: number;
}

interface UniqueBiddersRowProps {
  bidder?: Bidder;
}

// Component rendering a single row for a bidder
const UniqueBiddersRow: React.FC<UniqueBiddersRowProps> = ({ bidder }) => {
  if (!bidder) {
    // Return empty row if no bidder data
    return <TablePrimaryRow />;
  }

  const { BidderAddr, NumBids, MaxBidAmountEth } = bidder;

  // Render bidder row
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={BidderAddr} url={`/user/${BidderAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{NumBids}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {MaxBidAmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueBiddersTableProps {
  list: Bidder[];
}

// Main component displaying paginated table of unique bidders
export const UniqueBiddersTable: React.FC<UniqueBiddersTableProps> = ({
  list,
}) => {
  const perPage = 5; // Bidders displayed per page
  const [page, setPage] = useState(1); // Current pagination page

  // Memoized calculation for paginated data to optimize rendering
  const paginatedList = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page]
  );

  // Render message when no bidders exist
  if (list.length === 0) {
    return <Typography>No bidders yet.</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Bidder Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Number of Bids
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Max Bid (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {paginatedList.map((bidder) => (
              <UniqueBiddersRow bidder={bidder} key={bidder.BidderAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination component for navigation */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </Box>
  );
};

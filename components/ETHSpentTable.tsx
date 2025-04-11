import React, { FC, useEffect, useState } from "react";
import { TableBody, Typography } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from "./styled";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";
import { isMobile } from "react-device-detect";
import { useActiveWeb3React } from "../hooks/web3";

/**
 * Represents a single bid event record in the original list.
 * Update properties as needed to match your actual data structure.
 */
interface BidEvent {
  BidderAddr: string; // Ethereum address of the bidder
  BidPriceEth: number; // ETH amount used in the bid
}

/**
 * Represents the aggregated spending per user after the grouping logic.
 */
interface SpenderInfo {
  bidderAddr: string; // User's Ethereum address
  amount: number; // Total ETH spent by this user
}

/**
 * Props for the row component that displays a single spender's information.
 * @property row - A single SpenderInfo object
 */
interface ETHSpentRowProps {
  row: SpenderInfo;
}

/**
 * Renders a single table row showing a user's total spent ETH.
 * If the user is the currently connected account, highlight the row.
 */
const ETHSpentRow: FC<ETHSpentRowProps> = ({ row }) => {
  const { account } = useActiveWeb3React();

  // If no row data is provided, we can return an empty row. This check is optional.
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Apply a background color if the row's address is the connected user's address.
  return (
    <TablePrimaryRow
      sx={
        account === row.bidderAddr
          ? { backgroundColor: "rgba(255, 255, 255, 0.06)" }
          : undefined
      }
    >
      {/* Display user address via AddressLink. Tag with "(You)" if it matches current account. */}
      <TablePrimaryCell align="left">
        <AddressLink address={row.bidderAddr} url={`/user/${row.bidderAddr}`} />
        &nbsp;
        {account === row.bidderAddr && "(You)"}
      </TablePrimaryCell>

      {/* Display the total ETH spent by this user, formatted to 4 decimals. */}
      <TablePrimaryCell align="center">
        {row.amount.toFixed(4)} ETH
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Props for the ETHSpentTable component.
 * @property list - Original array of BidEvent objects
 */
interface ETHSpentTableProps {
  list: BidEvent[];
}

/**
 * Renders a table of aggregated ETH spending by users, sorted in descending order.
 * If the current user is in the list, that user is displayed at the top.
 */
const ETHSpentTable: FC<ETHSpentTableProps> = ({ list }) => {
  // Number of records to display per page.
  const perPage = 5;

  // Current page state.
  const [page, setPage] = useState(1);

  // Spender list after grouping and sorting by total spent.
  const [spenderList, setSpenderList] = useState<SpenderInfo[] | null>(null);

  // Access connected wallet account (if any).
  const { account } = useActiveWeb3React();

  /**
   * Group the list by bidder address, accumulate total spending for each user.
   * Sort in descending order by total spent. If the connected user is present,
   * move them to the top of the list.
   */
  useEffect(() => {
    const groupAndCountByBidderAddr = (): SpenderInfo[] => {
      const result: Record<string, number> = {};

      // Sum up the total spending for each bidder address
      list.forEach((event) => {
        if (result[event.BidderAddr]) {
          result[event.BidderAddr] += event.BidPriceEth;
        } else {
          result[event.BidderAddr] = event.BidPriceEth;
        }
      });

      // Convert the aggregated result to an array of objects
      const sortedResults: SpenderInfo[] = Object.entries(result)
        .map(([bidderAddr, amount]) => ({ bidderAddr, amount }))
        .sort((a, b) => b.amount - a.amount); // Sort descending by amount

      // If the connected user is present, move them to the top
      if (account) {
        const userIndex = sortedResults.findIndex(
          (item) => item.bidderAddr === account
        );
        if (userIndex !== -1) {
          const [userItem] = sortedResults.splice(userIndex, 1);
          sortedResults.unshift(userItem);
        }
      }

      return sortedResults;
    };

    // Group, sort, and store the results in state
    const spender = groupAndCountByBidderAddr();
    setSpenderList(spender);
  }, [list, account]);

  // If there are no events in the list, display a friendly message
  if (list.length === 0) {
    return <Typography>No spenders yet.</Typography>;
  }

  // If spenderList is not yet computed, display loading
  if (spenderList === null) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  // Calculate which rows to show on the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = spenderList.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* On larger screens, define column widths explicitly */}
          {!isMobile && (
            <colgroup>
              <col width="50%" />
              <col width="50%" />
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                User Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Spent Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {visibleRows.map((row) => (
              <ETHSpentRow key={row.bidderAddr} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Component for controlling pages */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={spenderList.length}
        perPage={perPage}
      />
    </>
  );
};

export default ETHSpentTable;

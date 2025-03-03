import React, { useEffect, useState } from "react";
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

/* ------------------------------------------------------------------
  Sub-Component: HolderRow
  Renders a single row for a raffle holder. Highlights the row if 
  the current user's address matches the holder's address.
------------------------------------------------------------------ */
const HolderRow = ({ holder }) => {
  // Destructure the active account from context (e.g., Metamask).
  const { account } = useActiveWeb3React();

  // Inline style to highlight the row if this holder is the current user.
  const highlightStyle =
    account === holder.userAddr
      ? { backgroundColor: "rgba(255, 255, 255, 0.06)" }
      : {};

  // If there's no holder data, render an empty row (prevents errors).
  if (!holder) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow sx={highlightStyle}>
      {/* AddressLink is a custom component linking to a user detail page */}
      <TablePrimaryCell align="left">
        <AddressLink
          address={holder.userAddr}
          url={`/user/${holder.userAddr}`}
        />
        &nbsp;
        {/* If this row's address matches current user, display "(You)" */}
        {account === holder.userAddr && "(You)"}
      </TablePrimaryCell>

      {/* Number of raffle tickets held by this user */}
      <TablePrimaryCell align="center">{holder.count}</TablePrimaryCell>

      {/* Probability of winning ETH, as a percentage with 2 decimals */}
      <TablePrimaryCell align="center">
        {(holder.ethProbability * 100).toFixed(2)}%
      </TablePrimaryCell>

      {/* Probability of winning an NFT, as a percentage with 2 decimals */}
      <TablePrimaryCell align="center">
        {(holder.NFTProbability * 100).toFixed(2)}%
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: RaffleHolderTable
  Displays a paginated table of holders, with their raffle ticket 
  counts and probabilities of winning ETH or an NFT.

  Props:
    - list: an array of raffle entries, each with { BidderAddr }
    - numRaffleEthWinner: number of ETH winners in the raffle
    - numRaffleNFTWinner: number of NFT winners in the raffle
------------------------------------------------------------------ */
const RaffleHolderTable = ({
  list,
  numRaffleEthWinner,
  numRaffleNFTWinner,
}) => {
  // Number of rows to display per page.
  const perPage = 5;
  // Current page in pagination.
  const [page, setPage] = useState(1);
  // Final processed list of holders. Includes counts and probabilities.
  const [holderList, setHolderList] = useState(null);

  // Get the current user's account from context (e.g., Metamask).
  const { account } = useActiveWeb3React();

  /**
   * Groups the raw 'list' by bidder address, calculating how many
   * entries (tickets) each address has. Then computes probabilities
   * of winning ETH or NFT based on those counts.
   *
   * Finally, sorts the resulting array in descending order by 'count'.
   * If the current user has an entry, moves them to the top of the list.
   */
  useEffect(() => {
    const groupAndCountByBidderAddr = () => {
      // Temporary object to count tickets per address
      const result: { [key: string]: number } = {};

      // Count how many times each address appears in 'list'
      list.forEach((event) => {
        if (result[event.BidderAddr]) {
          result[event.BidderAddr]++;
        } else {
          result[event.BidderAddr] = 1;
        }
      });

      // Convert that object into an array of holder objects
      const sortedResults = Object.entries(result)
        .map(([bidderAddr, count]) => {
          // Probability of winning (1 - losing all times):
          // e.g. losing once is (list.length - count) / list.length
          // losing n times is ((list.length - count) / list.length)^n
          return {
            userAddr: bidderAddr,
            count,
            ethProbability:
              1 -
              Math.pow((list.length - count) / list.length, numRaffleEthWinner),
            NFTProbability:
              1 -
              Math.pow((list.length - count) / list.length, numRaffleNFTWinner),
          };
        })
        // Sort by ticket count descending
        .sort((a, b) => b.count - a.count);

      // If the current user has entries, move them to the top
      const userIndex = sortedResults.findIndex(
        (item) => item.userAddr === account
      );
      if (userIndex !== -1) {
        const userItem = sortedResults.splice(userIndex, 1)[0];
        sortedResults.unshift(userItem);
      }

      return sortedResults;
    };

    // Only compute when both numRaffleEthWinner and numRaffleNFTWinner are valid
    if (numRaffleEthWinner && numRaffleNFTWinner) {
      const holders = groupAndCountByBidderAddr();
      setHolderList(holders);
    }
  }, [list, numRaffleEthWinner, numRaffleNFTWinner, account]);

  // If the raw list is empty, there are no holders to display.
  if (list.length === 0) {
    return <Typography>No holders yet.</Typography>;
  }

  return (
    <>
      {/* If holderList hasn't been computed yet, display "Loading..." */}
      {holderList === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              {/* On desktop, define column widths to maintain a consistent layout */}
              {!isMobile && (
                <colgroup>
                  <col width="40%" />
                  <col width="20%" />
                  <col width="20%" />
                  <col width="20%" />
                </colgroup>
              )}

              {/* Table Header */}
              <TablePrimaryHead>
                <Tr>
                  <TablePrimaryHeadCell align="left">
                    Holder
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Number of Raffle Tickets
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Probability of Winning ETH
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Probability of Winning NFT
                  </TablePrimaryHeadCell>
                </Tr>
              </TablePrimaryHead>

              {/* Table Body */}
              <TableBody>
                {/* Show only items for the current page */}
                {holderList
                  .slice((page - 1) * perPage, page * perPage)
                  .map((holder) => (
                    <HolderRow key={holder.userAddr} holder={holder} />
                  ))}
              </TableBody>
            </TablePrimary>
          </TablePrimaryContainer>

          {/* Pagination controls to navigate pages */}
          <CustomPagination
            page={page}
            setPage={setPage}
            totalLength={holderList.length}
            perPage={perPage}
          />
        </>
      )}
    </>
  );
};

export default RaffleHolderTable;

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

const HolderRow = ({ holder }) => {
  const { account } = useActiveWeb3React();
  if (!holder) {
    return <TablePrimaryRow />;
  }
  return (
    <TablePrimaryRow
      sx={
        account === holder.userAddr && {
          backgroundColor: "rgba(255, 255, 255, 0.06)",
        }
      }
    >
      <TablePrimaryCell align="left">
        <AddressLink
          address={holder.userAddr}
          url={`/user/${holder.userAddr}`}
        />
        &nbsp;
        {account === holder.userAddr && "(You)"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{holder.count}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {(holder.ethProbability * 100).toFixed(2)}%
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {(holder.NFTProbability * 100).toFixed(2)}%
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleHolderTable = ({
  list,
  numRaffleEthWinner,
  numRaffleNFTWinner,
}) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [holderList, setHolderList] = useState(null);
  const { account } = useActiveWeb3React();

  useEffect(() => {
    const groupAndCountByBidderAddr = () => {
      const result: { [key: string]: number } = {};

      list.forEach((event) => {
        if (result[event.BidderAddr]) {
          result[event.BidderAddr]++;
        } else {
          result[event.BidderAddr] = 1;
        }
      });

      const sortedResults = Object.entries(result)
        .map(([bidderAddr, data]) => ({
          userAddr: bidderAddr,
          count: data,
          ethProbability:
            1 -
            Math.pow((list.length - data) / list.length, numRaffleEthWinner),
          NFTProbability:
            1 -
            Math.pow((list.length - data) / list.length, numRaffleNFTWinner),
        }))
        .sort((a, b) => b.count - a.count);

      const userIndex = sortedResults.findIndex(
        (item) => item.userAddr === account
      );

      if (userIndex !== -1) {
        const userItem = sortedResults.splice(userIndex, 1)[0];
        sortedResults.unshift(userItem);
      }

      return sortedResults;
    };
    if (numRaffleEthWinner && numRaffleNFTWinner) {
      const holders = groupAndCountByBidderAddr();
      setHolderList(holders);
    }
  }, [list, numRaffleEthWinner, numRaffleNFTWinner, account]);

  if (list.length === 0) {
    return <Typography>No holders yet.</Typography>;
  }
  return (
    <>
      {holderList === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              {!isMobile && (
                <colgroup>
                  <col width="40%" />
                  <col width="20%" />
                  <col width="20%" />
                  <col width="20%" />
                </colgroup>
              )}
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
              <TableBody>
                {holderList
                  .slice((page - 1) * perPage, page * perPage)
                  .map((holder) => (
                    <HolderRow key={holder.userAddr} holder={holder} />
                  ))}
              </TableBody>
            </TablePrimary>
          </TablePrimaryContainer>
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

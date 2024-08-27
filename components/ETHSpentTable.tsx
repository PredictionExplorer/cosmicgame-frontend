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

const ETHSpentRow = ({ row }) => {
  const { account } = useActiveWeb3React();
  if (!row) {
    return <TablePrimaryRow />;
  }
  return (
    <TablePrimaryRow
      sx={
        account === row.bidderAddr && {
          backgroundColor: "rgba(255, 255, 255, 0.06)",
        }
      }
    >
      <TablePrimaryCell align="left">
        <AddressLink address={row.bidderAddr} url={`/user/${row.bidderAddr}`} />
        &nbsp;
        {account === row.bidderAddr && "(You)"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.amount.toFixed(4)} ETH
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const ETHSpentTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [spenderList, setSpenderList] = useState(null);
  const { account } = useActiveWeb3React();

  useEffect(() => {
    const groupAndCountByBidderAddr = () => {
      const result: { [key: string]: number } = {};

      list.forEach((event) => {
        if (result[event.BidderAddr]) {
          result[event.BidderAddr] += event.BidPriceEth;
        } else {
          result[event.BidderAddr] = event.BidPriceEth;
        }
      });

      const sortedResults = Object.entries(result)
        .map(([bidderAddr, data]) => ({
          bidderAddr,
          amount: data,
        }))
        .sort((a, b) => b.amount - a.amount);

      const userIndex = sortedResults.findIndex(
        (item) => item.bidderAddr === account
      );

      if (userIndex !== -1) {
        const userItem = sortedResults.splice(userIndex, 1)[0];
        sortedResults.unshift(userItem);
      }

      return sortedResults;
    };
    const spender = groupAndCountByBidderAddr();
    setSpenderList(spender);
  }, [list, account]);

  if (list.length === 0) {
    return <Typography>No spenders yet.</Typography>;
  }
  return (
    <>
      {spenderList === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              {!isMobile && (
                <colgroup>
                  <col width="50%" />
                  <col width="50%" />
                </colgroup>
              )}
              <TablePrimaryHead>
                <Tr>
                  <TablePrimaryHeadCell align="left">
                    User Address
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Spent Amount ETH
                  </TablePrimaryHeadCell>
                </Tr>
              </TablePrimaryHead>
              <TableBody>
                {spenderList
                  .slice((page - 1) * perPage, page * perPage)
                  .map((row) => (
                    <ETHSpentRow key={row.bidderAddr} row={row} />
                  ))}
              </TableBody>
            </TablePrimary>
          </TablePrimaryContainer>
          <CustomPagination
            page={page}
            setPage={setPage}
            totalLength={spenderList.length}
            perPage={perPage}
          />
        </>
      )}
    </>
  );
};

export default ETHSpentTable;

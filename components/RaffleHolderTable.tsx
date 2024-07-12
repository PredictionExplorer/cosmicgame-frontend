import React, { useEffect, useState } from "react";
import { TableBody, Link, Typography } from "@mui/material";
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

const HolderRow = ({ holder }) => {
  if (!holder) {
    return <TablePrimaryRow />;
  }
  return (
    <TablePrimaryRow>
      <TablePrimaryCell align="left">
        <AddressLink
          address={holder.userAddr}
          url={`/user/${holder.userAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${holder.roundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {holder.roundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{holder.count}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {holder.probability.toFixed(2)}%
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleHolderTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [holderList, setHolderList] = useState([]);

  useEffect(() => {
    const groupAndCountByBidderAddr = (events) => {
      const result: { [key: string]: { count: number; roundNum: number } } = {};

      events.forEach((event) => {
        if (result[event.BidderAddr]) {
          result[event.BidderAddr].count++;
        } else {
          result[event.BidderAddr] = { count: 1, roundNum: event.RoundNum };
        }
      });

      return Object.entries(result)
        .map(([bidderAddr, data]) => ({
          userAddr: bidderAddr,
          count: data.count,
          roundNum: data.roundNum,
          probability: data.count / list.length,
        }))
        .sort((a, b) => b.count - a.count);
    };
    const holders = groupAndCountByBidderAddr(list);
    setHolderList(holders);
  }, [list]);

  if (list.length === 0) {
    return <Typography>No holders yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="25%" />
              <col width="25%" />
              <col width="25%" />
              <col width="25%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Holder</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Round #
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Number of Raffle Tickets
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Probability of Winning
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
  );
};

export default RaffleHolderTable;

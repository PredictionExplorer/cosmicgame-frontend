import React, { useState } from "react";
import { Link, TableBody, Typography } from "@mui/material";
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

const UniqueBiddersRow = ({ bidder }) => {
  if (!bidder) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          href={`/user/${bidder.BidderAddr}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {bidder.BidderAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{bidder.NumBids}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {bidder.MaxBidAmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueBiddersTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No bidders yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Bidder Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Bids</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Max Bid (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((bidder) => (
              <UniqueBiddersRow bidder={bidder} key={bidder.BidderAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

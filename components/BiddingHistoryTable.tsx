import React, { useState } from "react";
import { Box, TableBody, Link, Typography, Tooltip } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import Pagination from "@mui/material/Pagination";
import { shortenHex, convertTimestampToDateTime } from "../utils";
import router from "next/router";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const HistoryRow = ({ history }) => {
  if (!history) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      sx={{
        cursor: "pointer",
        background:
          history.BidType === 2
            ? "rgba(0,128,128, 0.1)"
            : history.BidType === 1
            ? "rgba(128,128,128, 0.1)"
            : "rgba(0,0,0, 0.1)",
      }}
      onClick={() => {
        router.push(`/bid/${history.EvtLogId}`);
      }}
    >
      <TablePrimaryCell sx={{ whiteSpace: "nowrap" }}>
        {convertTimestampToDateTime(history.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={history.BidderAddr}>
          <Typography
            sx={{ fontSize: "inherit !important", fontFamily: "monospace" }}
          >
            {shortenHex(history.BidderAddr, 6)}
          </Typography>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="right">
        {history.BidType === 2
          ? `${
              history.NumCSTTokensEth && history.NumCSTTokensEth < 1
                ? history.NumCSTTokensEth?.toFixed(7)
                : history.NumCSTTokensEth?.toFixed(2)
            } CST`
          : `${
              history.BidPriceEth && history.BidPriceEth < 1
                ? history.BidPriceEth?.toFixed(7)
                : history.BidPriceEth?.toFixed(2)
            } ETH`}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.BidType === 2
          ? "CST Bid"
          : history.BidType === 1
          ? "RWLK Token Bid"
          : "ETH Bid"}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {history.BidType === 1 &&
          `Bid was made using RandomWalk Token(id = ${history.RWalkNFTId})`}
        {!!history.NFTDonationTokenAddr &&
          history.BidType === 2 &&
          "Bid was made using Cosmic Tokens"}
        {!!history.NFTDonationTokenAddr &&
          history.BidType === 0 &&
          "Bid was made using ETH"}
        {!!history.NFTDonationTokenAddr &&
          ` and a token(${shortenHex(
            history.NFTDonationTokenAddr,
            6
          )}) with ID ${history.NFTDonationTokenId} was donated`}{" "}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          sx={{ textDecoration: "none", color: "inherit", fontSize: "inherit" }}
        >
          <Tooltip title={history.Message}>
            <Typography
              sx={{
                fontSize: "inherit !important",
                maxWidth: "180px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "inline-block",
                textOverflow: "ellipsis",
                lineHeight: 1,
              }}
              component="span"
            >
              {history.Message}
            </Typography>
          </Tooltip>
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({ biddingHistory, perPage, curPage }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bidder</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Price</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bid Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bid Info</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {biddingHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history, i) => (
              <HistoryRow history={history} key={i} />
            ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const BiddingHistoryTable = ({ biddingHistory }) => {
  const perPage = 5;
  const [curPage, setCurrentPage] = useState(1);

  return (
    <Box mt={2}>
      {biddingHistory.length > 0 ? (
        <>
          <HistoryTable
            biddingHistory={biddingHistory}
            perPage={perPage}
            curPage={curPage}
          />
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              color="primary"
              page={curPage}
              onChange={(e, page) => setCurrentPage(page)}
              count={Math.ceil(biddingHistory.length / perPage)}
              hideNextButton
              hidePrevButton
              shape="rounded"
            />
          </Box>
        </>
      ) : (
        <Typography>No bid history yet.</Typography>
      )}
    </Box>
  );
};

export default BiddingHistoryTable;

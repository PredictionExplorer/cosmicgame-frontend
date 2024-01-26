import React, { useState } from "react";
import {
  Box,
  Table,
  TableRow,
  TableBody,
  Link,
  TableCell,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import Pagination from "@mui/material/Pagination";
import { shortenHex, convertTimestampToDateTime } from "../utils";
import router from "next/router";

const HistoryRow = ({ history }) => {
  if (!history) {
    return <TablePrimaryRow></TablePrimaryRow>;
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

      <TablePrimaryCell>
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
            } Ξ`}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{history.RoundNum + 1}</TablePrimaryCell>
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
          "Bid was made using Cosmic Signature Tokens"}
        {!!history.NFTDonationTokenAddr &&
          history.BidType === 0 &&
          "Bid was made using ETH"}
        {!!history.NFTDonationTokenAddr &&
          ` and a token(${shortenHex(
            history.NFTDonationTokenAddr,
            6
          )}) with ID ${history.NFTDonationTokenId} was donated`}
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
      <Table>
        <colgroup>
          <col width="11%" />
          <col width="14%" />
          <col width="11%" />
          <col width="9%" />
          <col width="12%" />
          <col width="24%" />
          <col width="19%" />
        </colgroup>
        <TablePrimaryHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Bidder</TableCell>
            <TableCell>Price</TableCell>
            <TableCell align="center">Round #</TableCell>
            <TableCell align="center">Bid Type</TableCell>
            <TableCell>Bid Info</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TablePrimaryHead>
        <TableBody>
          {biddingHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history, i) => (
              <HistoryRow history={history} key={i} />
            ))}
        </TableBody>
      </Table>
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

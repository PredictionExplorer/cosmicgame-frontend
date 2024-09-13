import React, { useEffect, useState } from "react";
import { Box, TableBody, Typography, Tooltip } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import { shortenHex, convertTimestampToDateTime } from "../utils";
import router from "next/router";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import api from "../services/api";
import { isMobile } from "react-device-detect";

const HistoryRow = ({ history, isBanned, showRound }) => {
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
        {convertTimestampToDateTime(history.TimeStamp, true)}
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
                : history.NumCSTTokensEth?.toFixed(4)
            } CST`
          : `${
              history.BidPriceEth && history.BidPriceEth < 1
                ? history.BidPriceEth?.toFixed(7)
                : history.BidPriceEth?.toFixed(4)
            } ETH`}
      </TablePrimaryCell>
      {showRound && (
        <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>
      )}
      <TablePrimaryCell align="center">
        {history.BidType === 2
          ? "CST Bid"
          : history.BidType === 1
          ? "RWLK Token Bid"
          : "ETH Bid"}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Typography sx={{ wordBreak: "break-all" }}>
          {history.BidType === 1 && (
            <>
              {`Bid was made using RandomWalk Token(id = ${history.RWalkNFTId})`}
              <img
                src={`https://randomwalknft.s3.us-east-2.amazonaws.com/${history.RWalkNFTId.toString().padStart(
                  6,
                  "0"
                )}_black_thumb.jpg`}
                width="32px"
                style={{ verticalAlign: "middle" }}
              />
            </>
          )}
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
        </Typography>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {!isBanned && (
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
            >
              {history.Message}
            </Typography>
          </Tooltip>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({ biddingHistory, perPage, curPage, showRound }) => {
  const [bannedList, setBannedList] = useState([]);
  const getBannedList = async () => {
    const bids = await api.get_banned_bids();
    setBannedList(bids.map((x) => x.bid_id));
  };
  useEffect(() => {
    getBannedList();
  }, []);
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        {!isMobile && (
          <colgroup>
            <col width="16%" />
            <col width="17%" />
            <col width="15%" />
            {showRound && <col width="8%" />}
            <col width="9%" />
            <col width="15%" />
            <col width="20%" />
          </colgroup>
        )}
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bidder</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Price</TablePrimaryHeadCell>
            {showRound && <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell>Bid Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bid Info</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {biddingHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history, i) => (
              <HistoryRow
                history={history}
                key={history.EvtLogId}
                isBanned={bannedList.includes(history.EvtLogId)}
                showRound={showRound}
              />
            ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const BiddingHistoryTable = ({ biddingHistory, showRound = true }) => {
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
            showRound={showRound}
          />
          <CustomPagination
            page={curPage}
            setPage={setCurrentPage}
            totalLength={biddingHistory.length}
            perPage={perPage}
          />
        </>
      ) : (
        <Typography>No bid history yet.</Typography>
      )}
    </Box>
  );
};

export default BiddingHistoryTable;

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
import {
  shortenHex,
  convertTimestampToDateTime,
  formatSeconds,
  getAssetsUrl,
} from "../utils";
import router from "next/router";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import api from "../services/api";
import { isMobile } from "react-device-detect";

const bidTypeStyles = {
  2: "rgba(0,128,128, 0.1)", // CST Bid
  1: "rgba(128,128,128, 0.1)", // RWLK Token Bid
  0: "rgba(0,0,0, 0.1)", // ETH Bid
};

const bidTypeLabels = {
  2: "CST Bid",
  1: "RWLK Token Bid",
  0: "ETH Bid",
};

const HistoryRow = ({ history, isBanned, showRound, bidDuration }) => {
  if (!history) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/bid/${history.EvtLogId}`);
  };

  const backgroundStyle = bidTypeStyles[history.BidType] || "rgba(0,0,0,0.1)";
  const bidTypeLabel = bidTypeLabels[history.BidType] || "Unknown Bid";

  const price =
    history.BidType === 2
      ? `${
          (history.NumCSTTokensEth || 0) < 1
            ? (history.NumCSTTokensEth || 0).toFixed(7)
            : (history.NumCSTTokensEth || 0).toFixed(4)
        } CST`
      : `${
          (history.BidPriceEth || 0) < 1
            ? (history.BidPriceEth || 0).toFixed(7)
            : (history.BidPriceEth || 0).toFixed(4)
        } ETH`;

  return (
    <TablePrimaryRow
      sx={{
        cursor: "pointer",
        background: backgroundStyle,
      }}
      onClick={handleRowClick}
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
      <TablePrimaryCell align="right">{price}</TablePrimaryCell>
      {showRound && (
        <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>
      )}
      <TablePrimaryCell align="center">{bidTypeLabel}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {formatSeconds(bidDuration)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Typography sx={{ wordBreak: "break-all" }}>
          {history.BidType === 1 && history.RWalkNFTId && (
            <>
              {`Bid was made using RandomWalk Token (ID = ${history.RWalkNFTId})`}
              <img
                src={getAssetsUrl(
                  `randomwalk/${history.RWalkNFTId.toString().padStart(
                    6,
                    "0"
                  )}_black_thumb.jpg`
                )}
                width="32px"
                style={{ verticalAlign: "middle" }}
                alt="RWLK Token"
              />
            </>
          )}
          {!!history.NFTDonationTokenAddr && (
            <>
              {history.BidType === 2 && "Bid was made using Cosmic Tokens"}
              {history.BidType === 0 && "Bid was made using ETH"}
              {` and a token (${shortenHex(
                history.NFTDonationTokenAddr,
                6
              )}) with ID ${history.NFTDonationTokenId} was donated`}
            </>
          )}
        </Typography>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {!isBanned && history.Message && (
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

  useEffect(() => {
    const getBannedList = async () => {
      try {
        const bids = await api.get_banned_bids();
        setBannedList(bids.map((x) => x.bid_id));
      } catch (error) {
        console.error("Error fetching banned bids:", error);
      }
    };
    getBannedList();
  }, []);

  const displayedBids = biddingHistory.slice(
    (curPage - 1) * perPage,
    curPage * perPage
  );

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        {!isMobile && (
          <colgroup>
            <col width="10%" />
            <col width="15%" />
            <col width="14%" />
            {showRound && <col width="8%" />}
            <col width="9%" />
            <col width="15%" />
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
            <TablePrimaryHeadCell align="center">
              Bid Duration
            </TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bid Info</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {displayedBids.map((history, index) => (
            <HistoryRow
              history={history}
              key={history.EvtLogId}
              isBanned={bannedList.includes(history.EvtLogId)}
              showRound={showRound}
              bidDuration={
                (curPage - 1) * perPage + index === 0
                  ? new Date().getTime() / 1000 - history.TimeStamp
                  : biddingHistory[(curPage - 1) * perPage + index - 1]
                      .TimeStamp - history.TimeStamp
              }
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

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
      sx={{ cursor: "pointer" }}
      onClick={() => {
        router.push(`/bid/${history.EvtLogId}`);
      }}
    >
      <TablePrimaryCell sx={{ whiteSpace: "nowrap" }}>
        {convertTimestampToDateTime(history.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={history.BidderAddr}>
          <Typography sx={{ fontSize: "inherit !important" }}>
            {shortenHex(history.BidderAddr, 6)}
          </Typography>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell>
        {history.BidPriceEth && history.BidPriceEth < 1
          ? history.BidPriceEth?.toFixed(7)
          : history.BidPriceEth?.toFixed(2)}
        Ξ
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell>
        {history.RWalkNFTId < 0 ? "" : history.RWalkNFTId}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {history.NFTDonationTokenAddr ? (
          <Tooltip title={history.NFTDonationTokenAddr}>
            <Typography sx={{ fontSize: "inherit !important" }}>
              {shortenHex(history.NFTDonationTokenAddr, 6)}
            </Typography>
          </Tooltip>
        ) : (
          ""
        )}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {history.NFTDonationTokenId < 0 ? "" : history.NFTDonationTokenId}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          sx={{ textDecoration: "none", color: "rgba(255, 255, 255, 0.68)" }}
        >
          <Typography
            sx={{
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
          <col width="16%" />
          <col width="10%" />
          <col width="10%" />
          <col width="10%" />
          <col width="15%" />
          <col width="9%" />
          <col width="19%" />
        </colgroup>
        <TablePrimaryHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Bidder</TableCell>
            <TableCell>Price</TableCell>
            <TableCell align="center">Round #</TableCell>
            <TableCell>RWLK ID</TableCell>
            <TableCell>Donated NFT Address</TableCell>
            <TableCell>Donated NFT ID</TableCell>
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

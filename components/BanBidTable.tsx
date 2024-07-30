import React, { useEffect, useState } from "react";
import {
  Box,
  TableBody,
  Link,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";
import { useNotification } from "../contexts/NotificationContext";
import getErrorMessage from "../utils/alert";

const HistoryRow = ({ history, isBanned, updateBannedList }) => {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();
  const handleBan = async () => {
    try {
      const res = await api.ban_bid(history.EvtLogId, account);
      console.log(res);
      updateBannedList();
      setNotification({
        visible: true,
        type: "success",
        text: "Bid was banned successfully!",
      });
    } catch (e) {
      if (e?.data?.message) {
        const msg = getErrorMessage(e?.data?.message);
        setNotification({
          visible: true,
          text: msg,
          type: "error",
        });
      }
      console.error(e);
    }
  };

  const handleUnban = async () => {
    try {
      const res = await api.unban_bid(history.EvtLogId);
      console.log(res);
      updateBannedList();
      setNotification({
        visible: true,
        type: "success",
        text: "Bid was unbanned successfully!",
      });
    } catch (e) {
      if (e?.data?.message) {
        const msg = getErrorMessage(e?.data?.message);
        setNotification({
          visible: true,
          text: msg,
          type: "error",
        });
      }
      console.error(e);
    }
  };

  if (!history) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      sx={{
        background:
          history.BidType === 2
            ? "rgba(0,128,128, 0.1)"
            : history.BidType === 1
            ? "rgba(128,128,128, 0.1)"
            : "rgba(0,0,0, 0.1)",
      }}
    >
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${history.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(history.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink
          address={history.BidderAddr}
          url={`/user/${history.BidderAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/prize/${history.RoundNum}`}
          target="__blank"
        >
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.BidType === 2
          ? "CST Bid"
          : history.BidType === 1
          ? "RWLK Token Bid"
          : "ETH Bid"}
      </TablePrimaryCell>
      <TablePrimaryCell>
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
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {isBanned ? (
          <Button size="small" onClick={handleUnban}>
            Unban
          </Button>
        ) : (
          <Button size="small" onClick={handleBan}>
            Ban
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({ biddingHistory, perPage, curPage }) => {
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
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bidder</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bid Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
            <TablePrimaryHeadCell />
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {biddingHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history) => (
              <HistoryRow
                history={history}
                key={history.EvtLogId}
                isBanned={bannedList.includes(history.EvtLogId)}
                updateBannedList={getBannedList}
              />
            ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const BanBidTable = ({ biddingHistory }) => {
  const perPage = 200;
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

export default BanBidTable;

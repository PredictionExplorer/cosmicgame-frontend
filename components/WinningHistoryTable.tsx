import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import TokenIcon from "@mui/icons-material/Token";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import Pagination from "@mui/material/Pagination";
import { shortenHex } from "../utils";
import axios from "axios";

const convertTimestampToDateTime = (timestamp: any) => {
  var date_ob = new Date(timestamp * 1000);
  var year = date_ob.getFullYear();
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var date = ("0" + date_ob.getDate()).slice(-2);
  var hours = ("0" + date_ob.getHours()).slice(-2);
  var minutes = ("0" + date_ob.getMinutes()).slice(-2);
  var seconds = ("0" + date_ob.getSeconds()).slice(-2);
  var result = `${month}/${date}/${year} ${hours}:${minutes}:${seconds}`;
  return result;
};

const HistoryRow = ({ history, showClaimedStatus }) => {
  const [tokenURI, setTokenURI] = useState(null);
  useEffect(() => {
    const fetchTokenURI = async () => {
      const { data } = await axios.get(history.TokenURI);
      setTokenURI(data);
    };
    fetchTokenURI();
  }, [history]);

  if (!history) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }
  return (
    <TablePrimaryRow
      sx={
        !history.Claimed &&
        showClaimedStatus && { background: "rgba(255, 255, 255, 0.06)" }
      }
    >
      <TablePrimaryCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {history.RecordType === 0 ? (
            <>
              <ConfirmationNumberIcon />
              &nbsp;<span>ETH Deposit</span>
            </>
          ) : history.RecordType === 1 ? (
            <>
              <TokenIcon />
              &nbsp;<span>Cosmic Signature Token</span>
            </>
          ) : history.RecordType === 2 ? (
            <>
              <VolunteerActivismIcon />
              &nbsp;<span>Donated NFT</span>
            </>
          ) : (
            <>
              <EmojiEventsIcon />
              &nbsp;<span>Main Prize</span>
            </>
          )}
          &nbsp;
          {!history.Claimed && showClaimedStatus && (
            <Tooltip title="This winning is unclaimed, go to Pending Winnings page and claim it.">
              <IconButton size="small" sx={{ fontSize: "16px" }}>
                <PriorityHighIcon fontSize="inherit" color="error" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {convertTimestampToDateTime(history.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {history.AmountEth.toFixed(4)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={history.TokenAddress}>
          <Link
            href={`https://arbiscan.io/address/${history.TokenAddress}`}
            sx={{
              fontSize: "inherit",
              color: "inherit",
            }}
            target="_blank"
          >
            {shortenHex(history.TokenAddress.toString(), 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {history.TokenId >= 0 &&
          (history.RecordType === 1 || history.RecordType === 3 ? (
            <Link
              href={`/detail/${history.TokenId}`}
              sx={{
                fontSize: "inherit",
                color: "inherit",
              }}
              target="_blank"
            >
              {history.TokenId}
            </Link>
          ) : (
            <Link
              href={tokenURI?.external_url}
              sx={{
                fontSize: "inherit",
                color: "inherit",
              }}
              target="_blank"
            >
              {history.TokenId}
            </Link>
          ))}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {history.WinnerIndex >= 0 && history.WinnerIndex}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({
  winningHistory,
  perPage,
  curPage,
  showClaimedStatus,
}) => {
  return (
    <TablePrimaryContainer>
      <Table>
        <colgroup>
          <col width="20%" />
          <col width="16%" />
          <col width="9%" />
          <col width="15%" />
          <col width="15%" />
          <col width="15%" />
          <col width="10%" />
        </colgroup>
        <TablePrimaryHead>
          <TableRow>
            <TableCell>Record Type</TableCell>
            <TableCell>Datetime</TableCell>
            <TableCell align="center">Round</TableCell>
            <TableCell align="right">Amount (ETH)</TableCell>
            <TableCell>Token Address</TableCell>
            <TableCell align="right">Token ID</TableCell>
            <TableCell align="right">Position</TableCell>
          </TableRow>
        </TablePrimaryHead>
        <TableBody>
          {winningHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history, i) => (
              <HistoryRow
                history={history}
                key={i}
                showClaimedStatus={showClaimedStatus}
              />
            ))}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  );
};

const WinningHistoryTable = ({ winningHistory, showClaimedStatus = false }) => {
  const perPage = 5;
  const [curPage, setCurrentPage] = useState(1);
  if (winningHistory.length === 0) {
    return <Typography>No history yet.</Typography>;
  }
  return (
    <Box mt={2}>
      <HistoryTable
        winningHistory={winningHistory}
        showClaimedStatus={showClaimedStatus}
        perPage={perPage}
        curPage={curPage}
      />
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={curPage}
          onChange={(e, page) => setCurrentPage(page)}
          count={Math.ceil(winningHistory.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </Box>
  );
};

export default WinningHistoryTable;

import React, { useEffect, useState } from "react";
import {
  Box,
  TableBody,
  Typography,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LayersIcon from "@mui/icons-material/Layers";
import TokenIcon from "@mui/icons-material/Token";
import { COSMIC_SIGNATURE_TOKEN_ADDRESS } from "../config/app";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import Pagination from "@mui/material/Pagination";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import axios from "axios";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

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
    return <TablePrimaryRow />;
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
          ) : history.RecordType === 3 ? (
            <>
              <EmojiEventsIcon />
              &nbsp;<span>Main Prize</span>
            </>
          ) : (
            <>
              <LayersIcon />
              &nbsp;<span>Staking Deposit / Reward</span>
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
        <Link
          href={`/prize/${history.RoundNum}`}
          sx={{
            fontSize: "inherit",
            color: "inherit",
          }}
          target="_blank"
        >
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {history.RecordType === 1 ? " " : history.AmountEth.toFixed(4)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.RecordType === 0 ? (
          " "
        ) : history.RecordType === 1 ? (
          <Tooltip
            title={
              <Typography fontFamily="monospace">
                {COSMIC_SIGNATURE_TOKEN_ADDRESS}
              </Typography>
            }
          >
            <Link
              href={`https://arbiscan.io/address/${COSMIC_SIGNATURE_TOKEN_ADDRESS}`}
              sx={{
                fontSize: "inherit",
                color: "inherit",
                fontFamily: "monospace",
              }}
              target="_blank"
            >
              {shortenHex(COSMIC_SIGNATURE_TOKEN_ADDRESS.toString(), 6)}
            </Link>
          </Tooltip>
        ) : history.TokenAddress !== "" ? (
          <Tooltip
            title={
              <Typography fontFamily="monospace">
                {history.TokenAddress}
              </Typography>
            }
          >
            <Link
              href={`https://arbiscan.io/address/${history.TokenAddress}`}
              sx={{
                fontSize: "inherit",
                color: "inherit",
                fontFamily: "monospace",
              }}
              target="_blank"
            >
              {shortenHex(history.TokenAddress.toString(), 6)}
            </Link>
          </Tooltip>
        ) : (
          " "
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.TokenId >= 0 ? (
          history.RecordType === 1 || history.RecordType === 3 ? (
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
          )
        ) : (
          " "
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {history.WinnerIndex >= 0 ? history.WinnerIndex : " "}
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
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">
              Record Type
            </TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">
              Amount (ETH)
            </TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Address</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Position</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {winningHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history, index) => (
              <HistoryRow
                history={history}
                key={(curPage - 1) * perPage + index}
                showClaimedStatus={showClaimedStatus}
              />
            ))}
        </TableBody>
      </TablePrimary>
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

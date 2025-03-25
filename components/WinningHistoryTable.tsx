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

import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";

import { convertTimestampToDateTime, shortenHex } from "../utils";
import axios from "axios";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import { COSMIC_SIGNATURE_TOKEN_ADDRESS } from "../config/app";

/* ------------------------------------------------------------------
  Constants / Mappings
------------------------------------------------------------------ */
const RECORD_TYPE_MAP = {
  0: { icon: <ConfirmationNumberIcon />, text: "ETH Deposit" },
  1: { icon: <TokenIcon />, text: "Cosmic Signature Token" },
  2: { icon: <VolunteerActivismIcon />, text: "Donated NFT" },
  3: { icon: <EmojiEventsIcon />, text: "Main Prize" },
  4: {
    icon: <ConfirmationNumberIcon />,
    text: "Cosmic Signature Staking ETH Deposit",
  },
  5: { icon: <LayersIcon />, text: "Random Walk Staking Raffle Token" },
  6: { icon: <LayersIcon />, text: "Cosmic Signature Staking Raffle Token" },
  7: { icon: <EmojiEventsIcon />, text: "Endurance Champion NFT Winner" },
  8: { icon: <EmojiEventsIcon />, text: "Endurance Champion ERC20 winner" },
};

/* ------------------------------------------------------------------
  Sub-Component: WinningHistoryRow
  Renders a single row of the history table.
------------------------------------------------------------------ */
function WinningHistoryRow({
  history,
  showClaimedStatus,
  showWinnerAddr,
}: {
  history: any;
  showClaimedStatus: boolean;
  showWinnerAddr: boolean;
}) {
  const [tokenURI, setTokenURI] = useState<any>(null);

  useEffect(() => {
    // Fetch tokenURI if needed for certain record types
    if (
      history &&
      history.TokenId >= 0 &&
      ![1, 3, 5, 6].includes(history.RecordType)
    ) {
      const fetchTokenURI = async () => {
        try {
          const { data } = await axios.get(history.TokenURI);
          setTokenURI(data);
        } catch (err) {
          console.error("Failed to fetch token URI:", err);
        }
      };
      fetchTokenURI();
    }
  }, [history]);

  if (!history) {
    return <TablePrimaryRow />;
  }

  const recordType = RECORD_TYPE_MAP[history.RecordType] || {
    icon: null,
    text: " ",
  };

  return (
    <TablePrimaryRow
      sx={
        !history.Claimed &&
        showClaimedStatus && { background: "rgba(255, 255, 255, 0.06)" }
      }
    >
      {/* Record Type */}
      <TablePrimaryCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {recordType.icon}
          &nbsp;
          <span>{recordType.text}</span>
          &nbsp;
          {/* Show icon if not claimed */}
          {!history.Claimed && showClaimedStatus && (
            <Tooltip title="This winning is unclaimed, go to Pending Winnings page and claim it.">
              <IconButton size="small" sx={{ fontSize: "16px" }}>
                <PriorityHighIcon fontSize="inherit" color="error" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TablePrimaryCell>

      {/* Datetime */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${history.TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(history.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Winner Address (optional) */}
      {showWinnerAddr && (
        <TablePrimaryCell align="center">
          {history.WinnerAddr === "" ? (
            " "
          ) : (
            <Tooltip title={history.WinnerAddr}>
              <Link
                color="inherit"
                fontSize="inherit"
                fontFamily="monospace"
                href={`/user/${history.WinnerAddr}`}
                target="_blank"
              >
                {shortenHex(history.WinnerAddr, 6)}
              </Link>
            </Tooltip>
          )}
        </TablePrimaryCell>
      )}

      {/* Round Number */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${history.RoundNum}`}
          sx={{ fontSize: "inherit", color: "inherit" }}
          target="_blank"
        >
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Amount in ETH */}
      <TablePrimaryCell align="right">
        {[1, 5, 6].includes(history.RecordType)
          ? "N/A"
          : history.AmountEth.toFixed(4)}
      </TablePrimaryCell>

      {/* Token Address */}
      <TablePrimaryCell align="center">
        {history.RecordType === 1 ? (
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
              {shortenHex(COSMIC_SIGNATURE_TOKEN_ADDRESS, 6)}
            </Link>
          </Tooltip>
        ) : history.TokenAddress ? (
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
              {shortenHex(history.TokenAddress, 6)}
            </Link>
          </Tooltip>
        ) : (
          " "
        )}
      </TablePrimaryCell>

      {/* Token ID */}
      <TablePrimaryCell align="center">
        {history.TokenId >= 0
          ? (() => {
              if ([1, 3].includes(history.RecordType)) {
                // Link to "detail/:TokenId" (CST main)
                return (
                  <Link
                    href={`/detail/${history.TokenId}`}
                    sx={{ fontSize: "inherit", color: "inherit" }}
                    target="_blank"
                  >
                    {history.TokenId}
                  </Link>
                );
              } else if ([5, 6].includes(history.RecordType)) {
                // Link to "randomwalknft.com/detail/:TokenId"
                return (
                  <Link
                    href={`https://randomwalknft.com/detail/${history.TokenId}`}
                    sx={{ fontSize: "inherit", color: "inherit" }}
                    target="_blank"
                  >
                    {history.TokenId}
                  </Link>
                );
              } else {
                // Possibly a direct link from tokenURI
                return (
                  <Link
                    href={tokenURI?.external_url}
                    sx={{ fontSize: "inherit", color: "inherit" }}
                    target="_blank"
                  >
                    {history.TokenId}
                  </Link>
                );
              }
            })()
          : " "}
      </TablePrimaryCell>

      {/* Position (WinnerIndex) */}
      <TablePrimaryCell align="right">
        {history.WinnerIndex >= 0 ? history.WinnerIndex : " "}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: WinningHistorySubTable
  Renders the entire table (without pagination).
------------------------------------------------------------------ */
function WinningHistorySubTable({
  winningHistory,
  perPage,
  curPage,
  showClaimedStatus,
  showWinnerAddr,
}: {
  winningHistory: any[];
  perPage: number;
  curPage: number;
  showClaimedStatus: boolean;
  showWinnerAddr: boolean;
}) {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        {/* Optional column widths for non-mobile */}
        {!isMobile && (
          <colgroup>
            <col width="20%" />
            <col width="14%" />
            {showWinnerAddr && <col width="17%" />}
            <col width="7%" />
            <col width="11%" />
            <col width="17%" />
            <col width="8%" />
            <col width="7%" />
          </colgroup>
        )}

        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">
              Record Type
            </TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            {showWinnerAddr && (
              <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
            )}
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
              <WinningHistoryRow
                key={`${curPage}-${index}-${history.TxHash}`}
                history={history}
                showClaimedStatus={showClaimedStatus}
                showWinnerAddr={showWinnerAddr}
              />
            ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
}

/* ------------------------------------------------------------------
  Main Exported Component: WinningHistoryTable
  Handles pagination and orchestrates sub-components.
------------------------------------------------------------------ */
export default function WinningHistoryTable({
  winningHistory,
  showClaimedStatus = false,
  showWinnerAddr = true,
}: {
  winningHistory: any[];
  showClaimedStatus?: boolean;
  showWinnerAddr?: boolean;
}) {
  const PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  if (!winningHistory || winningHistory.length === 0) {
    return <Typography>No history yet.</Typography>;
  }

  return (
    <Box mt={2}>
      <WinningHistorySubTable
        winningHistory={winningHistory}
        showClaimedStatus={showClaimedStatus}
        showWinnerAddr={showWinnerAddr}
        perPage={PER_PAGE}
        curPage={currentPage}
      />

      {/* Pagination */}
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={winningHistory.length}
        perPage={PER_PAGE}
      />
    </Box>
  );
}

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
import axios from "axios";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import { COSMIC_SIGNATURE_TOKEN_ADDRESS } from "../config/app";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";

// Map record types to their corresponding icons and descriptive texts
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

// Row component representing each winning history entry
const WinningHistoryRow = ({ history, showClaimedStatus, showWinnerAddr }) => {
  const [tokenURI, setTokenURI] = useState(null);

  useEffect(() => {
    // Fetch TokenURI only if applicable
    if (history?.TokenId >= 0 && ![1, 3, 5, 6].includes(history.RecordType)) {
      axios
        .get(history.TokenURI)
        .then(({ data }) => setTokenURI(data))
        .catch((err) => console.error("Failed to fetch token URI:", err));
    }
  }, [history]);

  if (!history) return <TablePrimaryRow />;

  const recordType = RECORD_TYPE_MAP[history.RecordType] || {
    icon: null,
    text: " ",
  };

  return (
    <TablePrimaryRow
      sx={
        !history.Claimed &&
        showClaimedStatus && { background: "rgba(255,255,255,0.06)" }
      }
    >
      {/* Record type with icon */}
      <TablePrimaryCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {recordType.icon}&nbsp;<span>{recordType.text}</span>&nbsp;
          {!history.Claimed && showClaimedStatus && (
            <Tooltip title="Unclaimed, go to Pending Winnings to claim.">
              <IconButton size="small">
                <PriorityHighIcon color="error" fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TablePrimaryCell>

      {/* Datetime with transaction link */}
      <TablePrimaryCell>
        <Link href={`https://arbiscan.io/tx/${history.TxHash}`} target="_blank">
          {convertTimestampToDateTime(history.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Winner Address if enabled */}
      {showWinnerAddr && (
        <TablePrimaryCell align="center">
          {history.WinnerAddr ? (
            <Tooltip title={history.WinnerAddr}>
              <Link
                href={`/user/${history.WinnerAddr}`}
                target="_blank"
                fontFamily="monospace"
              >
                {shortenHex(history.WinnerAddr, 6)}
              </Link>
            </Tooltip>
          ) : (
            " "
          )}
        </TablePrimaryCell>
      )}

      {/* Round number linking to prize details */}
      <TablePrimaryCell align="center">
        <Link href={`/prize/${history.RoundNum}`} target="_blank">
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Amount ETH or N/A based on record type */}
      <TablePrimaryCell align="right">
        {[1, 5, 6].includes(history.RecordType)
          ? "N/A"
          : history.AmountEth.toFixed(4)}
      </TablePrimaryCell>

      {/* Token Address */}
      <TablePrimaryCell align="center">
        {history.RecordType === 1 ? (
          <Link
            href={`https://arbiscan.io/address/${COSMIC_SIGNATURE_TOKEN_ADDRESS}`}
            target="_blank"
          >
            {shortenHex(COSMIC_SIGNATURE_TOKEN_ADDRESS, 6)}
          </Link>
        ) : (
          history.TokenAddress && (
            <Link
              href={`https://arbiscan.io/address/${history.TokenAddress}`}
              target="_blank"
            >
              {shortenHex(history.TokenAddress, 6)}
            </Link>
          )
        )}
      </TablePrimaryCell>

      {/* Token ID links */}
      <TablePrimaryCell align="center">
        {history.TokenId >= 0 ? (
          <Link
            href={
              [1, 3].includes(history.RecordType)
                ? `/detail/${history.TokenId}`
                : [5, 6].includes(history.RecordType)
                ? `https://randomwalknft.com/detail/${history.TokenId}`
                : tokenURI?.external_url
            }
            target="_blank"
          >
            {history.TokenId}
          </Link>
        ) : (
          " "
        )}
      </TablePrimaryCell>

      {/* Winner position */}
      <TablePrimaryCell align="right">
        {history.WinnerIndex >= 0 ? history.WinnerIndex : " "}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

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

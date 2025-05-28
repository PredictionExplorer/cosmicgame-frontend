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
  0: { icon: <ConfirmationNumberIcon />, text: "Raffle ETH Deposit" },
  1: { icon: <TokenIcon />, text: "Cosmic Signature NFT Token" },
  2: { icon: <VolunteerActivismIcon />, text: "Donated NFT" },
  3: { icon: <EmojiEventsIcon />, text: "Main Prize" },
  4: {
    icon: <ConfirmationNumberIcon />,
    text: "Cosmic Signature Staking ETH Deposit",
  },
  5: { icon: <LayersIcon />, text: "Random Walk Staking Raffle Token" },
  6: {
    icon: <LayersIcon />,
    text: "Cosmic Signature Token Staking Raffle Token",
  },
  7: { icon: <EmojiEventsIcon />, text: "Endurance Champion NFT Prize" },
  8: { icon: <EmojiEventsIcon />, text: "Last CST Bidder NFT Prize" },
  9: { icon: <EmojiEventsIcon />, text: "Endurance Champion ERC20 Prize" },
  10: { icon: <EmojiEventsIcon />, text: "Last CST Bidder ERC20 Prize" },
  11: { icon: <EmojiEventsIcon />, text: "Donated ERC20 Token" },
  12: { icon: <ConfirmationNumberIcon />, text: "Chrono Warrior Prize" },
};

// Row component representing each winning history entry
const WinningHistoryRow = ({ history, showClaimedStatus, showWinnerAddr }) => {
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
        <Link
          href={`https://arbiscan.io/tx/${history.TxHash}`}
          target="_blank"
          color="inherit"
        >
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
                color="inherit"
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
        <Link
          href={`/prize/${history.RoundNum}`}
          target="_blank"
          color="inherit"
        >
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Amount ETH or N/A based on record type */}
      <TablePrimaryCell align="right">
        {[9, 10, 11].includes(history.RecordType)
          ? `${history.Amount} CST`
          : [1, 2, 5, 7, 8].includes(history.RecordType)
          ? "N/A"
          : `${history.AmountEth.toFixed(4)} ETH`}
      </TablePrimaryCell>

      {/* Token Address */}
      <TablePrimaryCell align="center">
        {history.RecordType === 1 ? (
          <Tooltip title={COSMIC_SIGNATURE_TOKEN_ADDRESS}>
            <Link
              href={`https://arbiscan.io/address/${COSMIC_SIGNATURE_TOKEN_ADDRESS}`}
              target="_blank"
              color="inherit"
            >
              {shortenHex(COSMIC_SIGNATURE_TOKEN_ADDRESS, 6)}
            </Link>
          </Tooltip>
        ) : (
          history.TokenAddress && (
            <Tooltip title={history.TokenAddress}>
              <Link
                href={`https://arbiscan.io/address/${history.TokenAddress}`}
                target="_blank"
                color="inherit"
              >
                {shortenHex(history.TokenAddress, 6)}
              </Link>
            </Tooltip>
          )
        )}
      </TablePrimaryCell>

      {/* Token ID links */}
      <TablePrimaryCell align="center">
        {history.TokenId >= 0 ? (
          <Link
            href={`/detail/${history.TokenId}`}
            target="_blank"
            color="inherit"
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
            <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
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

import React, { useState } from "react";
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
  0: { icon: <ConfirmationNumberIcon />, text: "Main Prize ETH" },
  1: { icon: <TokenIcon />, text: "Main Prize CST (ERC20)" },
  2: { icon: <VolunteerActivismIcon />, text: "Main Prize CS NFT" },
  3: { icon: <EmojiEventsIcon />, text: "Raffle ETH (for bidders)" },
  4: {
    icon: <ConfirmationNumberIcon />,
    text: "Raffle CST (for bidders)",
  },
  5: { icon: <LayersIcon />, text: "Raffle CS NFT (for bidders)" },
  6: {
    icon: <LayersIcon />,
    text: "Raffle CST (for RandomWalk stakers)",
  },
  7: {
    icon: <EmojiEventsIcon />,
    text: "Raffle CS NFT (for RandomWalk stakers)",
  },
  8: { icon: <EmojiEventsIcon />, text: "Endurance Champion CS NFT" },
  9: { icon: <EmojiEventsIcon />, text: "Endurance Champion ERC20 (CST)" },
  10: { icon: <EmojiEventsIcon />, text: "Chrono Warrior ETH" },
  11: { icon: <EmojiEventsIcon />, text: "Chrono Warrior CST (ERC20)" },
  12: { icon: <ConfirmationNumberIcon />, text: "Chrono Warrior CS NFT" },
  13: {
    icon: <ConfirmationNumberIcon />,
    text: "Staking Deposit ETH (for CS NFT stakers)",
  },
  14: {
    icon: <ConfirmationNumberIcon />,
    text: "Last CST Bidder CS NFT (ERC721)",
  },
  15: { icon: <ConfirmationNumberIcon />, text: "Last CST Bidder ERC20 (CST)" },
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
        {[0, 3, 10, 13].includes(history.RecordType)
          ? `${history.AmountEth.toFixed(4)} ETH`
          : [2, 5, 7, 8, 12, 15].includes(history.RecordType)
          ? "N/A"
          : `${history.AmountEth.toFixed(2)} CST`}
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
        ) : history.TokenAddress ? (
          <Tooltip title={history.TokenAddress}>
            <Link
              href={`https://arbiscan.io/address/${history.TokenAddress}`}
              target="_blank"
              color="inherit"
            >
              {shortenHex(history.TokenAddress, 6)}
            </Link>
          </Tooltip>
        ) : (
          " "
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

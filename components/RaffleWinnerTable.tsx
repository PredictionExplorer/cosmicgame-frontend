import React, { useEffect, useState } from "react";
import { TableBody, Link, Typography, Tooltip } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { isMobile } from "react-device-detect";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";

/**
 * Displays a single row in the table with winner information.
 *
 * @param {Object} props
 * @param {Object} props.winner - Data object containing details about a raffle winner.
 */
const WinnerRow = ({ winner }) => {
  // Destructure the winner object with default values or optional chaining
  // to guard against missing fields.
  const {
    TxHash = "",
    TimeStamp = 0,
    WinnerAddr = "",
    RoundNum = 0,
    Amount = 0,
    IsStaker = false,
    IsRwalk = false,
    TokenId = null,
  } = winner;
  const [
    roundTimeoutTimesToWithdrawPrizes,
    setRoundTimeoutTimesToWithdrawPrizes,
  ] = useState(0);
  const raffleWalletContract = useRaffleWalletContract();

  useEffect(() => {
    const fetchRoundTimeoutTimesToWithdrawPrizes = async () => {
      const roundTimeoutTimesToWithdrawPrizes = await raffleWalletContract.roundTimeoutTimesToWithdrawPrizes(
        RoundNum
      );
      setRoundTimeoutTimesToWithdrawPrizes(
        Number(roundTimeoutTimesToWithdrawPrizes)
      );
    };

    if (raffleWalletContract) {
      fetchRoundTimeoutTimesToWithdrawPrizes();
    }
  }, [raffleWalletContract]);

  // If there is no winner data, return an empty table row to prevent errors.
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Datetime Column - links to Arbiscan for the transaction */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Winner Address Column */}
      <TablePrimaryCell>
        <Tooltip title={WinnerAddr}>
          <Link
            href={`/user/${WinnerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      {/* Round Number Column */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Type Column - different text based on whether the user is a staker, is Rwalk, etc. */}
      <TablePrimaryCell>
        {Amount
          ? "ETH Deposit"
          : IsStaker && IsRwalk
          ? "Random Walk Staking Raffle Token"
          : IsStaker && !IsRwalk
          ? "Cosmic Signature Staking Raffle Token"
          : "Cosmic Signature Token"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(roundTimeoutTimesToWithdrawPrizes)}
      </TablePrimaryCell>
      {/* Amount Column (in ETH) - shown only if Amount is truthy */}
      <TablePrimaryCell align="right">
        {Amount ? `${Amount.toFixed(4)} ETH` : " "}
      </TablePrimaryCell>

      {/* Token ID Column - Link to detail page if TokenId exists */}
      <TablePrimaryCell align="center">
        {TokenId ? (
          <Link
            href={`/detail/${TokenId}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            {TokenId}
          </Link>
        ) : (
          " "
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Renders a table of raffle winners (both ETH deposits and NFT winners).
 * Paginated to show a limited number of rows per page.
 *
 * @param {Object} props
 * @param {Array} props.RaffleETHDeposits - List of raffle winners who won ETH deposits.
 * @param {Array} props.RaffleNFTWinners  - List of raffle winners who won NFTs or tokens.
 */
const RaffleWinnerTable = ({ RaffleETHDeposits, RaffleNFTWinners }) => {
  // Combine both arrays into a single list of winners.
  const depositsExcludingLast = RaffleETHDeposits.slice(0, -1);
  const list = [...depositsExcludingLast, ...RaffleNFTWinners];

  // Number of rows to display per page.
  const perPage = 5;

  // Tracks the current page in the pagination.
  const [page, setPage] = useState(1);

  // If there are no winners to display, show a message and return early.
  if (list.length === 0) {
    return <Typography>No winners yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* 
            Conditionally render a column width setup (colgroup) if not on mobile.
            This helps control column sizing on larger screens.
          */}
          {!isMobile && (
            <colgroup>
              <col width="12%" />
              <col width="15%" />
              <col width="9%" />
              <col width="16%" />
              <col width="15%" />
              <col width="13%" />
              <col width="10%" />
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Round #
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Expiration Date
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Token ID
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {/* 
              Slice the list for pagination and map through each winner.
              Using a unique key combination to identify each row.
            */}
            {list.slice((page - 1) * perPage, page * perPage).map((winner, index) => (
              <WinnerRow key={winner.RecordId ?? `${winner.EvtLogId}-${index}`} winner={winner} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* 
        CustomPagination controls allow page navigation.
        Pass page, setPage, totalLength of the list, and perPage to the pagination component.
      */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

export default RaffleWinnerTable;

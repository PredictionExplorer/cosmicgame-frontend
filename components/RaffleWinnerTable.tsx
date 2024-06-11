import React, { useState } from "react";
import {
  TableBody,
  Box,
  Pagination,
  Link,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";

const WinnerRow = ({ winner }) => {
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${winner.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(winner.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={winner.WinnerAddr}>
          <Link
            href={`/user/${winner.WinnerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(winner.WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${winner.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {winner.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {winner.Amount
          ? "ETH Deposit"
          : winner.IsStaker && winner.IsRwalk
          ? "Random Walk Staking Raffle Token"
          : winner.IsStaker && !winner.IsRwalk
          ? "Cosmic Signature Staking Raffle Token"
          : "Cosmic Signature Token"}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.Amount ? `${winner.Amount.toFixed(4)} ETH` : " "}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {winner.TokenId ? (
          <Link
            href={`/detail/${winner.TokenId}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            {winner.TokenId}
          </Link>
        ) : (
          " "
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleWinnerTable = ({ RaffleETHDeposits, RaffleNFTWinners }) => {
  const perPage = 5;
  const list = [...RaffleETHDeposits, ...RaffleNFTWinners];
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No winners yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Round #
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Token ID
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((winner) => (
              <WinnerRow key={winner.EvtLogId} winner={winner} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

export default RaffleWinnerTable;

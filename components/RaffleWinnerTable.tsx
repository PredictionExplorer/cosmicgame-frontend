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

const WinnerRow = ({ winner, type }) => {
  if (!winner) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(winner.TimeStamp)}
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
      <TablePrimaryCell>{type}</TablePrimaryCell>
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
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((winner, i) => (
                <WinnerRow
                  key={winner.EvtLogId}
                  winner={winner}
                  type={
                    winner.Amount ? "ETH Deposit" : "Cosmic Signature Token"
                  }
                />
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

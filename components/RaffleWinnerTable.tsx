import React, { useState } from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
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
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";

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
            style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: 14 }}
          >
            {shortenHex(winner.WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${winner.RoundNum}`}
          style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: 14 }}
        >
          {winner.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>{type}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.Amount ? `${winner.Amount.toFixed(4)}Ξ` : ""}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${winner.TokenId}`}
          style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: 14 }}
        >
          {winner.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleWinnerTable = ({ RaffleETHDeposits, RaffleNFTWinners }) => {
  const perPage = 5;
  const list = [...RaffleETHDeposits, ...RaffleNFTWinners];
  console.log(list);
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No winners yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="15%" />
            <col width="20%" />
            <col width="15%" />
            <col width="20%" />
            <col width="15%" />
            <col width="15%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell>Winner</TableCell>
              <TableCell align="center">Round #</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Token ID</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((winner, i) => (
                <WinnerRow
                  key={winner.EvtLogId}
                  winner={winner}
                  type={winner.Amount ? "ETH Deposit" : "CosmicSignature Token"}
                />
              ))}
          </TableBody>
        </Table>
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

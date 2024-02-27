import React, { useState } from "react";
import {
  Box,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { useRouter } from "next/router";

const PrizeRow = ({ prize }) => {
  const router = useRouter();
  if (!prize) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow
      sx={{ cursor: "pointer" }}
      onClick={() => {
        router.push(`/prize/${prize.PrizeNum}`);
      }}
    >
      <TablePrimaryCell align="center">{prize.PrizeNum}</TablePrimaryCell>
      <TablePrimaryCell>
        {convertTimestampToDateTime(prize.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={prize.WinnerAddr}>
          <Typography
            sx={{ fontSize: "inherit !important", fontFamily: "monospace" }}
          >
            {shortenHex(prize.WinnerAddr, 6)}
          </Typography>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {prize.AmountEth.toFixed(4)} ETH
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalBids}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalDonatedNFTs}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {prize.RoundStats.TotalRaffleEthDepositsEth.toFixed(4)} ETH
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {prize.StakingDepositAmountEth.toFixed(4)} ETH
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalRaffleNFTs}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const PrizeTable = ({ list, loading }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }
  if (list.length === 0) {
    return <Typography variant="h6">No winners yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="4%" />
            <col width="16%" />
            <col width="14%" />
            <col width="13%" />
            <col width="5%" />
            <col width="10%" />
            <col width="15%" />
            <col width="13%" />
            <col width="10%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell align="center">Round</TableCell>
              <TableCell align="center">Datetime</TableCell>
              <TableCell align="center">Winner</TableCell>
              <TableCell align="right">Prize Amount</TableCell>
              <TableCell align="center">Bids</TableCell>
              <TableCell align="center">Donated NFTs</TableCell>
              <TableCell align="right">Raffle Deposits</TableCell>
              <TableCell align="right">Staking Deposit</TableCell>
              <TableCell align="center">Raffle NFTs</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((prize) => (
              <PrizeRow prize={prize} key={prize.EvtLogId} />
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

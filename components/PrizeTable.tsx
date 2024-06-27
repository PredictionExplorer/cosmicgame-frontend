import React, { useState } from "react";
import { TableBody, Tooltip, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { useRouter } from "next/router";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";

const PrizeRow = ({ prize }) => {
  const router = useRouter();
  if (!prize) {
    return <TablePrimaryRow />;
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
  const perPage = 10;
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
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prize Amount
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Bids</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Donated NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Raffle Deposits
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Staking Deposit
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Raffle NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((prize) => (
              <PrizeRow prize={prize} key={prize.EvtLogId} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

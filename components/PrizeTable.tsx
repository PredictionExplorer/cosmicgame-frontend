import React, { useState, useMemo } from "react";
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
import { isMobile } from "react-device-detect";

const PrizeRow = ({ prize }) => {
  const router = useRouter();

  if (!prize) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow
      sx={{ cursor: "pointer" }}
      onClick={() => router.push(`/prize/${prize.PrizeNum}`)}
    >
      <TablePrimaryCell align="center">{prize.PrizeNum}</TablePrimaryCell>
      <TablePrimaryCell align="center">
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
      <TablePrimaryCell align="center">
        {prize.AmountEth.toFixed(4)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalBids}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalDonatedNFTs}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.RoundStats.TotalRaffleEthDepositsEth.toFixed(4)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prize.StakingDepositAmountEth.toFixed(4)}
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

  const paginatedList = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [page, perPage, list]
  );

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (!list.length)
    return <Typography variant="h6">No winners yet.</Typography>;

  const tableHeaders = [
    { label: "Round", width: "5%" },
    { label: "Datetime", width: "20%" },
    { label: "Winner", width: "7%" },
    { label: "Prize Amount", width: "15%", align: "center" },
    { label: "Bids", width: "5%" },
    { label: "Donated NFTs", width: "12%" },
    { label: "Raffle Deposits", width: "12%", align: "center" },
    { label: "Staking Deposit", width: "11%", align: "center" },
    { label: "Raffle NFTs", width: "13%" },
  ];

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              {tableHeaders.map((header, index) => (
                <col key={index} style={{ width: header.width }} />
              ))}
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              {tableHeaders.map((header, index) => (
                <TablePrimaryHeadCell
                  key={index}
                  align={header.align || "center"}
                >
                  {header.label}
                </TablePrimaryHeadCell>
              ))}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {paginatedList.map((prize) => (
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

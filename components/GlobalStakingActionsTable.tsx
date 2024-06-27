import React, { useState } from "react";
import { Link, TableBody, Tooltip, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { useRouter } from "next/router";
import { CustomPagination } from "./CustomPagination";

const GlobalStakingActionsRow = ({ row, IsRWLK }) => {
  const router = useRouter();
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      sx={{ cursor: "pointer" }}
      onClick={() => {
        router.push(`/staking-action/${IsRWLK ? 1 : 0}/${row.ActionId}`);
      }}
    >
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.ActionType === 0 ? "Stake" : "Unstake"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={
            IsRWLK
              ? `https://randomwalknft.com/detail/${row.TokenId}`
              : `/detail/${row.TokenId}`
          }
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {row.ActionType === 0
          ? convertTimestampToDateTime(row.UnstakeTimeStamp)
          : " "}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Tooltip title={row.StakerAddr}>
          <Link
            href={`/user/${row.StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(row.StakerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const GlobalStakingActionsTable = ({ list, IsRWLK }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No actions yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Unstake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <GlobalStakingActionsRow
                row={row}
                IsRWLK={IsRWLK}
                key={row.EvtLogId}
              />
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

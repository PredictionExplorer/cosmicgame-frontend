import React, { useState } from "react";
import { Link, TableBody, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";

const GlobalStakedTokensRow = ({ row, IsRWLK }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.StakeTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {row.UnstakeTimeStamp !== 0
          ? convertTimestampToDateTime(row.UnstakeTimeStamp)
          : " "}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/staking-action/${IsRWLK ? 1 : 0}/${row.StakeActionId}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {row.StakeActionId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={
            IsRWLK
              ? `https://randomwalknft.com/detail/${row.StakedTokenId}`
              : `/detail/${row.TokenInfo.TokenId}`
          }
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {IsRWLK ? row.StakedTokenId : row.TokenInfo.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${row.UserAddr}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {row.UserAddr}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const GlobalStakedTokensTable = ({ list, IsRWLK }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
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
              <TablePrimaryHeadCell align="left">
                Unstake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker Address</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <GlobalStakedTokensRow
                key={row.StakeEvtLogId}
                row={row}
                IsRWLK={IsRWLK}
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

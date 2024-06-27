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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { shortenHex } from "../utils";
import { CustomPagination } from "./CustomPagination";

const UniqueStakersCSTRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
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
      <TablePrimaryCell align="center">{row.NumStakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.NumUnstakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TotalTokensMinted}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TotalTokensStaked}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.TotalRewardEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.UnclaimedRewardEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueStakersCSTTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No stakers yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Staker Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Stake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Unstake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Minted Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Total Reward (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Unclaimed Reward (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueStakersCSTRow row={row} key={row.StakerAid} />
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

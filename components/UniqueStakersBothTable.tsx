import React, { useState } from "react";
import {
  Box,
  Link,
  Pagination,
  TableBody,
  Tooltip,
  Typography,
} from "@mui/material";
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

const UniqueStakersBothRow = ({ row }) => {
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
      <TablePrimaryCell align="center">
        {row.TotalStakedTokensBoth}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.CSTStats.NumStakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.CSTStats.NumUnstakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.CSTStats.TotalTokensStaked}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.CSTStats.TotalRewardEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.CSTStats.UnclaimedRewardEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.CSTStats.TotalTokensMinted}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.RWalkStats.NumStakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.RWalkStats.NumUnstakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.RWalkStats.TotalTokensStaked}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.RWalkStats.TotalTokensMinted}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueStakersBothTable = ({ list }) => {
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
              <TablePrimaryHeadCell>
                Total Staked Tokens Both
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Num Stake Actions (CST)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Num Unstake Actions (CST)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked CSTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Total Reward CST (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Unclaimed Reward CST (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Total Reward Mints CST
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Num Stake Actions (RWalk)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Num Unstake Actions (RWalk)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Total Staked RWLK Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Total Reward Mints RWalk
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueStakersBothRow row={row} key={row.StakerAid} />
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

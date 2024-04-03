import React, { useState } from "react";
import { Box, Link, Pagination, TableBody, Typography } from "@mui/material";
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

const CollectedStakingRewardsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${row.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TotalDepositAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.YourAmountToClaimEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.YourTokensStaked}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.NumTokensCollected}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.YourCollectedAmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CollectedStakingRewardsTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposited</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Reward on Your Stake</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Collected Staked Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Amount of Stake Collected
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <CollectedStakingRewardsRow row={row} key={index} />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="end" mt={1}>
        <Typography mr={1}>Total Rewards:</Typography>
        <Typography>
          {list
            .reduce((a, b) => {
              return a + b.YourCollectedAmountEth;
            }, 0)
            .toFixed(6)}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

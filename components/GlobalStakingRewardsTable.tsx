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

const GlobalStakingRewardsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${row.StakerAddr}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {row.StakerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.FullyClaimed ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.YourAmountToClaimEth.toFixed(6)} ETH
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const GlobalStakingRewardsTable = ({ list }) => {
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
              <TablePrimaryHeadCell align="left">
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Reward Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Amount to Claim
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <GlobalStakingRewardsRow
                  row={row}
                  key={(page - 1) * perPage + index}
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
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
      <Typography mt={4}>
        To participate in Staking go to{" "}
        <Link href="/my-staking" sx={{ color: "inherit" }}>
          &quot;MY STAKING&quot;
        </Link>
        . (option available from the Account menu)
      </Typography>
    </>
  );
};

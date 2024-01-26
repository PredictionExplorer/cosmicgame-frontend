import React, { useState } from "react";
import {
  Box,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";

const UniqueStakersRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
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

export const UniqueStakersTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No stakers yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Staker Address</TableCell>
              <TableCell align="center">Num Stake Actions</TableCell>
              <TableCell align="right">Total Reward (ETH)</TableCell>
              <TableCell align="right">Unclaimed Reward (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueStakersRow row={row} key={row.StakerAid} />
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

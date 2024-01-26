import React, { useState } from "react";
import {
  Box,
  Button,
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
import { convertTimestampToDateTime } from "../utils";
import useStakingWalletContract from "../hooks/useStakingWalletContract";

const GlobalStakedTokensRow = ({ row, handleStake, handleUnstake }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.StakeTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {row.UnstakeTimeStamp !== 0 &&
          convertTimestampToDateTime(row.UnstakeTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenInfo.TokenId}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {row.TokenInfo.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${row.TokenInfo.CurOwnerAddr}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {row.TokenInfo.CurOwnerAddr}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const GlobalStakedTokensTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const stakingContract = useStakingWalletContract();
  const handleStake = async (tokenId) => {
    const res = await stakingContract.stake(tokenId).then((tx) => tx.wait());
    console.log(res);
  };
  const handleUnstake = async (tokenId) => {
    const res = await stakingContract.unstake(tokenId).then((tx) => tx.wait());
    console.log(res);
  };
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="40%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Stake Datetime</TableCell>
              <TableCell>Unstake Datetime</TableCell>
              <TableCell align="center">Token ID</TableCell>
              <TableCell align="center">Staker Address</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <GlobalStakedTokensRow
                  key={index}
                  row={row}
                  handleStake={handleStake}
                  handleUnstake={handleUnstake}
                />
              ))}
          </TableBody>
        </Table>
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
    </>
  );
};

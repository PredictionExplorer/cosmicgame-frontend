import React, { useState } from "react";
import { Box, Link, Pagination, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { Tbody, Tr } from "react-super-responsive-table";
import { convertTimestampToDateTime } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { useRouter } from "next/router";

const StakingActionsRow = ({ row }) => {
  const router = useRouter();
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      sx={{ cursor: "pointer" }}
      onClick={() => {
        router.push(`/staking-action/${row.ActionId}`);
      }}
    >
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.ActionType === 1 ? "Unstake" : "Stake"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={
            row.IsRandomWalk
              ? `https://randomwalknft.com/detail/${row.TokenId}`
              : `/detail/${row.TokenId}`
          }
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.IsRandomWalk ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {row.ActionType === 0
          ? convertTimestampToDateTime(row.UnstakeTimeStamp)
          : " "}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const StakingActionsTable = ({ list }) => {
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
              <TablePrimaryHeadCell>Is RandomWalk NFT?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Unstake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <Tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <StakingActionsRow row={row} key={row.EvtLogId} />
            ))}
          </Tbody>
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
    </>
  );
};

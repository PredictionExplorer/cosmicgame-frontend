import React, { useState } from "react";
import { Link, Typography } from "@mui/material";
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
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

const StakingRewardMintsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
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
        <AddressLink address={row.WinnerAddr} url={`/user/${row.WinnerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${row.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const StakingRewardMintsTable = ({ list }) => {
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
              <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <Tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <StakingRewardMintsRow row={row} key={row.EvtLogId} />
            ))}
          </Tbody>
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

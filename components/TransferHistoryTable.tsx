import React, { useState } from "react";
import { Box, Link, Pagination, TableBody } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import { ZERO_ADDRESS } from "../config/misc";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from "../config/app";

const TransferHistoryRow = ({ record }) => {
  if (!record || record.FromAddr === ZERO_ADDRESS) {
    return;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(record.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/user/${record.FromAddr}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {record.FromAddr === STAKING_WALLET_CST_ADDRESS
            ? "StakingWallet CST"
            : record.FromAddr === STAKING_WALLET_RWLK_ADDRESS
            ? "StakingWallet RandomWalk"
            : record.FromAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/user/${record.ToAddr}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {record.ToAddr === STAKING_WALLET_CST_ADDRESS
            ? "StakingWallet CST"
            : record.ToAddr === STAKING_WALLET_RWLK_ADDRESS
            ? "StakingWallet RandomWalk"
            : record.ToAddr}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const TransferHistoryTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">To</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((record) => (
              <TransferHistoryRow record={record} key={record.EvtLogId} />
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

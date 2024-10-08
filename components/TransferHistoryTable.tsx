import React, { useState } from "react";
import { Link, TableBody, Tooltip } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { ZERO_ADDRESS } from "../config/misc";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from "../config/app";
import { CustomPagination } from "./CustomPagination";

const TransferHistoryRow = ({ record }) => {
  if (!record || record.FromAddr === ZERO_ADDRESS) {
    return;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${record.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(record.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={record.FromAddr}>
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
              : shortenHex(record.FromAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={record.ToAddr}>
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
              : shortenHex(record.ToAddr, 6)}
          </Link>
        </Tooltip>
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
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

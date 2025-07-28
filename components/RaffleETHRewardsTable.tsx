import React, { useState } from "react";
import { TableBody, Link, Typography, Tooltip } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { isMobile } from "react-device-detect";

const RewardRow = ({ reward }) => {
  if (!reward) {
    return <TablePrimaryRow />;
  }

  const {
    TxHash = "",
    TimeStamp = 0,
    WinnerAddr = "",
    RoundNum = 0,
    Amount = 0,
  } = reward;

  return (
    <TablePrimaryRow>
      {/* Datetime Column - links to Arbiscan for the transaction */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>
      {/* Winner Address Column */}
      <TablePrimaryCell>
        <Tooltip title={WinnerAddr}>
          <Link
            href={`/user/${WinnerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      {/* Round Number Column */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      {/* Amount Column (in ETH) - shown only if Amount is truthy */}
      <TablePrimaryCell align="right">
        {Amount ? `${Amount.toFixed(4)} ETH` : " "}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleETHRewardsTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Round #
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((reward) => (
              <RewardRow key={reward.EvtLogId} reward={reward} />
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

export default RaffleETHRewardsTable;

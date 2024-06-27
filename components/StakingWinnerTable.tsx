import React, { useState } from "react";
import { TableBody, Link, Typography, Tooltip } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";

const WinnerRow = ({ winner }) => {
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${winner.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(winner.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="left">
        <Tooltip title={winner.StakerAddr}>
          <Link
            href={`/user/${winner.StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(winner.StakerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {winner.StakerNumStakedNFTs}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.StakerAmountEth.toFixed(4)} ETH
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const StakingWinnerTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return (
      <Typography>
        There were no staked tokens at the time round ended, the deposit amount
        was sent to charity address.
      </Typography>
    );
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((winner, i) => (
                <WinnerRow key={winner.StakerAddr} winner={winner} />
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

export default StakingWinnerTable;

import React, { useState } from "react";
import { TableBody, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

const UniqueWinnersRow = ({ winner }) => {
  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink
          address={winner.WinnerAddr}
          url={`/user/${winner.WinnerAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{winner.PrizesCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.MaxWinAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.PrizesSum.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueWinnersTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No winners yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Winner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prizes Taken
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Max Prize (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prizes Sum (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((winner) => (
              <UniqueWinnersRow winner={winner} key={winner.WinnerAid} />
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

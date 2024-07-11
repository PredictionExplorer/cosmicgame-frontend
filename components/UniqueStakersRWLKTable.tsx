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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

const UniqueStakersRWLKRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={row.StakerAddr} url={`/user/${row.StakerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakeActions}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.NumUnstakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TotalTokensStaked}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TotalTokensMinted}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueStakersRWLKTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No stakers yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Staker Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Stake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Num Unstake Actions</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Minted Tokens</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueStakersRWLKRow row={row} key={row.StakerAid} />
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

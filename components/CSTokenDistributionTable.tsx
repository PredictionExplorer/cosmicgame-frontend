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

const CSTokenDistributionRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{row.NumTokens}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const CSTokenDistributionTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Owner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Number of Tokens Owned
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <CSTokenDistributionRow row={row} key={row.OwnerAid} />
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

export default CSTokenDistributionTable;

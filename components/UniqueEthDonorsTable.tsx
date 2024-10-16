import React, { useState } from "react";
import { Box, TableBody, Typography } from "@mui/material";
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

const UniqueEthDonorsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.CountDonations}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.TotalDonatedEth.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueEthDonorsTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (!list || list.length === 0) {
    return <Typography>No donors yet.</Typography>;
  }
  return (
    <Box sx={{ width: "100%" }}>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Donor Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of Donations</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Total Donated Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((donor) => (
              <UniqueEthDonorsRow row={donor} key={donor.DonorAid} />
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
    </Box>
  );
};

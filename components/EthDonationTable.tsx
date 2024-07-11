import React, { useState } from "react";
import { Link, TableBody, Typography } from "@mui/material";
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
import { convertTimestampToDateTime } from "../utils";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

const EthDonationRow = ({ row }) => {
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
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.AmountEth.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const EthDonationTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No donations yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Donor</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <EthDonationRow row={row} key={row.EvtLogId} />
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

export default EthDonationTable;

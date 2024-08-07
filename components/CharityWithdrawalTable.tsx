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
import { convertTimestampToDateTime } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

const WithdrawalRow = ({ withdrawal }) => {
  if (!withdrawal) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${withdrawal.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(withdrawal.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink
          address={withdrawal.DestinationAddr}
          url={`/user/${withdrawal.DestinationAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {withdrawal.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const CharityWithdrawalTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Destination Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Withdrawal amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((withdrawal) => (
                <WithdrawalRow
                  withdrawal={withdrawal}
                  key={withdrawal.EvtLogId}
                />
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

export default CharityWithdrawalTable;

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

const DonationRow = ({ donation }) => {
  if (!donation) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${donation.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(donation.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {donation.RoundNum < 0 ? (
          " "
        ) : (
          <Link
            color="inherit"
            fontSize="inherit"
            href={`/prize/${donation.RoundNum}`}
            target="__blank"
          >
            {donation.RoundNum}
          </Link>
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink
          address={donation.DonorAddr}
          url={`/user/${donation.DonorAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {donation.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CharityDepositTable = ({ list }) => {
  const perPage = 10;
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
              <TablePrimaryHeadCell>Round Num</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Donor Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Donation amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((donation) => (
                <DonationRow donation={donation} key={donation.EvtLogId} />
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

import React, { FC, useState } from "react";
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

/**
 * Describes the shape of a single withdrawal object.
 */
interface Withdrawal {
  TxHash: string;
  TimeStamp: number;
  DestinationAddr: string;
  AmountEth: number;
  EvtLogId: string;
}

/**
 * Props for the WithdrawalRow component.
 * If `withdrawal` is undefined, we return an empty row to keep structure consistent.
 */
interface WithdrawalRowProps {
  withdrawal?: Withdrawal;
}

/**
 * Renders a single row representing a withdrawal.
 */
const WithdrawalRow: FC<WithdrawalRowProps> = ({ withdrawal }) => {
  // If there's no withdrawal data, return a blank row.
  if (!withdrawal) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Datetime (timestamp) cell */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${withdrawal.TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(withdrawal.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Destination address cell */}
      <TablePrimaryCell align="center">
        <AddressLink
          address={withdrawal.DestinationAddr}
          url={`/user/${withdrawal.DestinationAddr}`}
        />
      </TablePrimaryCell>

      {/* Amount withdrawn cell */}
      <TablePrimaryCell align="right">
        {withdrawal.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Props for the CharityWithdrawalTable component.
 */
interface CharityWithdrawalTableProps {
  list: Withdrawal[];
}

/**
 * Renders a table of withdrawals, paginated with a custom pagination component.
 */
const CharityWithdrawalTable: FC<CharityWithdrawalTableProps> = ({ list }) => {
  // Number of rows to show per page
  const ITEMS_PER_PAGE = 5;

  // Current page state
  const [page, setPage] = useState<number>(1);

  // If there is no data, display a helpful message
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }

  // Calculate start and end indices for the current page
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

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
            {list.slice(startIndex, endIndex).map((withdrawal) => (
              <WithdrawalRow
                withdrawal={withdrawal}
                key={withdrawal.EvtLogId}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Custom pagination control */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={ITEMS_PER_PAGE}
      />
    </>
  );
};

export default CharityWithdrawalTable;

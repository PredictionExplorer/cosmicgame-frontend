import React, { useState } from "react";
import {
  Box,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";

const WithdrawalRow = ({ withdrawal }) => {
  if (!withdrawal) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(withdrawal.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/user/${withdrawal.destinationAddr}`}
        >
          {withdrawal.DestinationAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {withdrawal.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CharityWithdrawalTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="25%" />
            <col width="50%" />
            <col width="25%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell align="center">Destination Address</TableCell>
              <TableCell align="right">Withdrawal amount (ETH)</TableCell>
            </TableRow>
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
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

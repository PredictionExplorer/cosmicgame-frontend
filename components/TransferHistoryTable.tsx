import React, { useState } from "react";
import {
  Box,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import { ZERO_ADDRESS } from "../config/misc";

const TransferHistoryRow = ({ record }) => {
  if (!record || record.FromAddr === ZERO_ADDRESS) {
    return;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(record.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/user/${record.FromAddr}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {record.FromAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/user/${record.ToAddr}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {record.ToAddr}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const TransferHistoryTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>DateTime</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((record) => (
              <TransferHistoryRow record={record} key={record.EvtLogId} />
            ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

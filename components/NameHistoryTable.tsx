import React, { useState } from "react";
import { TableBody } from "@mui/material";
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

const NameHistoryRow = ({ record }) => {
  if (!record) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(record.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        {record.TokenName ? record.TokenName : "Token name was removed."}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NameHistoryTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Token Name
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((record) => (
              <NameHistoryRow record={record} key={record.EvtLogId} />
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

export default NameHistoryTable;

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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { convertTimestampToDateTime } from "../utils";
import router from "next/router";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";

const SystemModesRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      style={{ cursor: "pointer" }}
      onClick={() => {
        router.push(
          `/system-event/${row.RoundNum}/${row.EvtLogId}/${row.NextEvtLogId}`
        );
      }}
    >
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.EvtLogId}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NextEvtLogId}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const SystemModesTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No mode changes yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="25%" />
              <col width="25%" />
              <col width="25%" />
              <col width="25%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Event Id From
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                Event Id To
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <SystemModesRow row={row} key={row.EvtLogId} />
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

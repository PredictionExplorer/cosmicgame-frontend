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

const UniqueWinnersRow = ({ winner }) => {
  if (!winner) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          href={`/user/${winner.WinnerAddr}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {winner.WinnerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{winner.PrizesCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.MaxWinAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.PrizesSum.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueWinnersTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No bidders yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="55%" />
            <col width="15%" />
            <col width="15%" />
            <col width="15%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Winner Address</TableCell>
              <TableCell align="right">Prizes Taken</TableCell>
              <TableCell align="right">Max Prize</TableCell>
              <TableCell align="right">Prizes Sum (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((winner) => (
              <UniqueWinnersRow winner={winner} key={winner.WinnerAid} />
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

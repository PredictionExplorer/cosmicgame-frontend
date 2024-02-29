import React, { useState } from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  Box,
  Pagination,
  Link,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";

const WinnerRow = ({ winner }) => {
  if (!winner) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(winner.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={winner.StakerAddr}>
          <Link
            href={`/user/${winner.StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(winner.StakerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {winner.StakerNumStakedNFTs}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.StakerAmountEth.toFixed(4)} ETH
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const StakingWinnerTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="25%" />
            <col width="25%" />
            <col width="25%" />
            <col width="25%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell>Staker</TableCell>
              <TableCell align="center">Number of NFTs</TableCell>
              <TableCell align="right">Reward Amount (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((winner, i) => (
                <WinnerRow key={winner.StakerAddr} winner={winner} />
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

export default StakingWinnerTable;

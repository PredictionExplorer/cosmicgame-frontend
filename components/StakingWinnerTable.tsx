import React, { useState } from "react";
import {
  TableBody,
  Box,
  Pagination,
  Link,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const WinnerRow = ({ winner }) => {
  if (!winner) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(winner.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="left">
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
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((winner, i) => (
                <WinnerRow key={winner.StakerAddr} winner={winner} />
              ))}
          </TableBody>
        </TablePrimary>
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

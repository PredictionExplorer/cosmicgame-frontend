import React, { useState } from "react";
import {
  Box,
  IconButton,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";

const GlobalStakingRewardsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${row.StakerAddr}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {row.StakerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.FullyClaimed ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.YourAmountToClaimEth.toFixed(6)} ETH
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const GlobalStakingRewardsTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Stake Datetime</TableCell>
              <TableCell align="center">Staker</TableCell>
              <TableCell align="center">Reward Claimed?</TableCell>
              <TableCell align="right">Amount to Claim</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <GlobalStakingRewardsRow
                  row={row}
                  key={(page - 1) * perPage + index}
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
      <Typography mt={4}>
        {`To participate in Staking go to "MY STAKING" (option available from the Account menu)`}
      </Typography>
    </>
  );
};

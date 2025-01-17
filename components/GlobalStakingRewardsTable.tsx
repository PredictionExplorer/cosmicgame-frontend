import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Link,
  TableBody,
  Typography,
} from "@mui/material";
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
import api from "../services/api";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { CustomPagination } from "./CustomPagination";
import StakingWinnerTable from "./StakingWinnerTable";

const GlobalStakingRewardsRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get_staking_cst_rewards_by_round(row.RoundNum);
      setList(response);
    };
    fetchData();
  }, []);

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      <TablePrimaryRow sx={{ borderBottom: 0 }}>
        <TablePrimaryCell sx={{ p: 0 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TablePrimaryCell>
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
            href={`/prize/${row.RoundNum}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
            }}
          >
            {row.RoundNum}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.TotalDepositAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.FullyClaimed ? "Yes" : "No"}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {(row.TotalDepositAmountEth - row.AmountCollectedEth).toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>
      <TablePrimaryRow sx={{ borderTop: 0 }}>
        <TablePrimaryCell sx={{ py: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, marginBottom: 4 }}>
              <Typography variant="subtitle1" gutterBottom component="div">
                CST Staking Rewards for Round {row.RoundNum}
              </Typography>
              <StakingWinnerTable list={list} />
            </Box>
          </Collapse>
        </TablePrimaryCell>
      </TablePrimaryRow>
    </>
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
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell sx={{ p: 0 }} />
              <TablePrimaryHeadCell align="left">
                Deposit Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposited (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Pending to Collect (ETH)
              </TablePrimaryHeadCell>
            </Tr>
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
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
      <Typography mt={4}>
        To participate in Staking go to{" "}
        <Link href="/my-staking" sx={{ color: "inherit" }}>
          &quot;MY STAKING&quot;
        </Link>
        . (option available from the Account menu)
      </Typography>
    </>
  );
};

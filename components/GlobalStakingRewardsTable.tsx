import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Link,
  Pagination,
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
import { convertTimestampToDateTime, shortenHex } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import api from "../services/api";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const DetailRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow sx={{ borderBottom: 0 }}>
      <TablePrimaryCell align="left">
        {convertTimestampToDateTime(
          row.StakeActionTimeStamp + row.TimeStampDiff
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="left">
        {convertTimestampToDateTime(
          row.UnstakeEligibleTimeStamp + row.TimeStampDiff
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/staking-action/${row.StakeActionId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.StakeActionId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.IsRandomWalk ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.Claimed ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const DetailTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left" sx={{ py: 1 }}>
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left" sx={{ py: 1 }}>
                Unstake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ py: 1 }}>
                Action Id
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ py: 1 }}>
                Token Id
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ py: 1 }}>
                Is RandomWalk NFT?
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ py: 1 }}>
                Claimed?
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right" sx={{ py: 1 }}>
                Reward
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <DetailRow row={row} key={row.RecordId} />
            ))}
          </TableBody>
        </TablePrimary>
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

const GlobalStakingRewardsRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get_action_ids_by_deposit_id(
        row.StakerAddr,
        row.DepositId
      );
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
        <TablePrimaryCell>
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
            href={`/user/${row.StakerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(row.StakerAddr)}
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
          {row.YourTokensStaked}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.FullyClaimed ? "Yes" : "No"}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.YourCollectedAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.YourAmountToClaimEth.toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>
      <TablePrimaryRow sx={{ borderTop: 0 }}>
        <TablePrimaryCell sx={{ py: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, marginBottom: 4 }}>
              <Typography variant="subtitle1" gutterBottom component="div">
                Detail
              </Typography>
              <DetailTable list={list} />
            </Box>
          </Collapse>
        </TablePrimaryCell>
      </TablePrimaryRow>
    </>
  );
};

export const GlobalStakingRewardsTable = ({ list }) => {
  const perPage = 10;
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
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left" sx={{ minWidth: "165px" }}>
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ minWidth: "120px" }}>
                Total Staked Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposited</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Collected Amount
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Amount to Claim
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
        To participate in Staking go to{" "}
        <Link href="/my-staking" sx={{ color: "inherit" }}>
          &quot;MY STAKING&quot;
        </Link>
        . (option available from the Account menu)
      </Typography>
    </>
  );
};

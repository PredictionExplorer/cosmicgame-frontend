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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import { CustomPagination } from "./CustomPagination";

const DetailRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow sx={{ borderBottom: 0 }}>
      <TablePrimaryCell align="left">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.ClaimTxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(row.ClaimTimeStamp)}
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
        <Link
          href={`/staking-action/0/${row.StakeActionId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.StakeActionId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.ClaimRewardAmountEth.toFixed(6)}
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
                Claim Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ py: 1 }}>
                Token Id
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell sx={{ py: 1 }}>
                Action Id
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
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

const CollectedStakingRewardsRow = ({ row, owner }) => {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get_cst_action_ids_by_deposit_with_claim_info(
        owner,
        row.DepositId
      );
      setList(res);
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
          {list.length > 1 && (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
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
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            {row.RoundNum}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.TotalDepositAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.YourAmountToClaimEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.YourTokensStaked}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.NumTokensCollected}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.YourCollectedAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.FullyClaimed ? "Yes" : "No"}
        </TablePrimaryCell>
      </TablePrimaryRow>
      {list.length > 1 && (
        <TablePrimaryRow sx={{ borderTop: 0 }}>
          <TablePrimaryCell sx={{ py: 0 }} colSpan={11}>
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
      )}
    </>
  );
};

export const CollectedStakingRewardsTable = ({ list, owner }) => {
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
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left" sx={{ minWidth: "145px" }}>
                Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Deposited</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Your Stake Rewards</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Collected Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Collected Rewards</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Fully Claimed?</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <CollectedStakingRewardsRow
                row={row}
                owner={owner}
                key={row.EvtLogId}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="end" mt={1}>
        <Typography mr={1}>Total Rewards:</Typography>
        <Typography>
          {list
            .reduce((a, b) => {
              return a + b.YourCollectedAmountEth;
            }, 0)
            .toFixed(6)}
        </Typography>
      </Box>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

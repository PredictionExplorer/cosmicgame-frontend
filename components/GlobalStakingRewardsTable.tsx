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

/**
 * Renders a single row in the Global Staking Rewards table.
 * Clicking the expand button reveals the list of winners for that particular round.
 */
const GlobalStakingRewardsRow = ({ row }: { row: any }) => {
  // State to control the expansion of the row
  const [open, setOpen] = useState(false);

  // State to store the list of winners for this round
  const [list, setList] = useState<any[]>([]);

  /**
   * Fetch winner data for the round when this component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get_staking_cst_rewards_by_round(
          row.RoundNum
        );
        setList(response);
      } catch (error) {
        console.error("Error fetching CST rewards by round:", error);
      }
    };

    if (row?.RoundNum) {
      fetchData();
    }
  }, [row]);

  // If row is undefined or null, return an empty row
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      {/* Main table row (collapsible) */}
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

        {/* Deposit Datetime (linked to Arbiscan) */}
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

        {/* Round Number (linked to /prize page) */}
        <TablePrimaryCell align="center">
          <Link
            href={`/prize/${row.RoundNum}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            {row.RoundNum}
          </Link>
        </TablePrimaryCell>

        {/* Total Staked Tokens */}
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>

        {/* Total Deposited (ETH) */}
        <TablePrimaryCell align="center">
          {row.TotalDepositAmountEth.toFixed(6)}
        </TablePrimaryCell>

        {/* Fully Claimed? */}
        <TablePrimaryCell align="center">
          {row.FullyClaimed ? "Yes" : "No"}
        </TablePrimaryCell>

        {/* Pending to Collect (ETH) */}
        <TablePrimaryCell align="right">
          {row.PendingToCollectEth.toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>

      {/* Expanded content (winner details) */}
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

/**
 * Renders a paginated table showing all Global Staking Rewards.
 */
export const GlobalStakingRewardsTable = ({ list }: { list: any[] }) => {
  // Number of rows to display per page
  const perPage = 5;

  // State for the current page number
  const [page, setPage] = useState(1);

  // If there are no records, show a message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Calculate the subset of the data for the current page
  const displayedRows = list.slice((page - 1) * perPage, page * perPage);

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

          {/* Table body: Render rows for the current page */}
          <TableBody>
            {displayedRows.map((row, index) => (
              <GlobalStakingRewardsRow
                row={row}
                key={(page - 1) * perPage + index}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination Controls */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

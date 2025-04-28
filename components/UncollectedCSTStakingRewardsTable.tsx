import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import { useNotification } from "../contexts/NotificationContext";

/* ------------------------------------------------------------------
  Sub-Component: UncollectedRewardsRow
  Renders a single row in the rewards table with the provided data.
------------------------------------------------------------------ */
const UncollectedRewardsRow = ({ row }) => {
  // Early return if no row data to avoid errors.
  if (!row) return <TablePrimaryRow />;

  // Destructure row for clarity and fallback values if needed.
  const {
    DepositTimeStamp,
    DepositId,
    YourTokensStaked,
    NumStakedNFTs,
    NumUnclaimedTokens,
    DepositAmountEth,
    YourRewardAmountEth,
    PendingToClaimEth,
    // EvtLogId,  <-- Usually used as a key, so not needed here
  } = row;

  return (
    <TablePrimaryRow>
      {/* Convert the timestamp to a readable date/time format */}
      <TablePrimaryCell>
        {convertTimestampToDateTime(DepositTimeStamp)}
      </TablePrimaryCell>

      {/* Simple text display of the deposit's unique identifier */}
      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>

      {/* Show how many tokens you have staked out of total staked */}
      <TablePrimaryCell align="center">
        {`${YourTokensStaked} / ${NumStakedNFTs}`}
      </TablePrimaryCell>

      {/* Total unclaimed tokens for this deposit */}
      <TablePrimaryCell align="center">{NumUnclaimedTokens}</TablePrimaryCell>

      {/* The ETH amount originally deposited, formatted to 6 decimal places */}
      <TablePrimaryCell align="center">
        {DepositAmountEth.toFixed(6)}
      </TablePrimaryCell>

      {/* Your reward in ETH so far, formatted to 6 decimals */}
      <TablePrimaryCell align="center">
        {YourRewardAmountEth.toFixed(6)}
      </TablePrimaryCell>

      {/* Pending reward in ETH that hasn't been collected yet */}
      <TablePrimaryCell align="center">
        {PendingToClaimEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: UncollectedCSTStakingRewardsTable
  Displays a paginated list of uncollected CST staking rewards.
------------------------------------------------------------------ */
export const UncollectedCSTStakingRewardsTable = ({ user }) => {
  const { account } = useActiveWeb3React();
  const [status, setStatus] = useState(null);
  // Current page in the pagination
  const [list, setList] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [cstWithRewards, setCstWithRewards] = useState([]);
  const cstStakingContract = useStakingWalletCSTContract();
  const { setNotification } = useNotification();

  // Number of rows to display per page
  const PER_PAGE = 5;

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Calculate slice indices for the current page
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;

  const fetchStatusData = async () => {
    try {
      const res = await api.notify_red_box(user);
      setStatus(res);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchCstWithRewards = async () => {
    try {
      const res = await api.get_staking_cst_by_user_by_deposit_rewards(user);
      const actions = res[res.length - 1].Actions.filter((x) => !x.Claimed);
      const actionIds = actions.map((x) => x.Stake.ActionId);
      setCstWithRewards(actionIds);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchUncollectedCstStakingRewards = async () => {
    try {
      const res = await api.get_staking_cst_rewards_to_claim_by_user(user);
      setList(res);
    } catch (err) {
      console.log(err);
    }
  };

  const unstakeAllCST = async () => {
    handleClose();
    setIsUnstaking(true);
    try {
      const res = await cstStakingContract
        .unstakeMany(cstWithRewards)
        .then((tx: any) => tx.wait());
      // Success notification
      if (!res.code) {
        setNotification({
          visible: true,
          text: "The selected tokens were unstaked successfully!",
          type: "success",
        });
      }
      setTimeout(() => {
        fetchStatusData();
        fetchUncollectedCstStakingRewards();
      }, 4000);
    } catch (err) {
      console.log(err);
      setIsUnstaking(false);
    }
  };

  useEffect(() => {
    fetchUncollectedCstStakingRewards();
    fetchStatusData();
    fetchCstWithRewards();
  }, [user]);

  if (list === null) {
    return <Typography>Loading...</Typography>;
  }

  // If there is no data to display, show a fallback message
  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  // Extract the portion of the list corresponding to the current page
  const currentPageData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* 
            Conditionally render a colgroup for desktop screens
            to control column widths. This is optional on mobile.
          */}
          {!isMobile && (
            <colgroup>
              <col width="15%" />
              <col width="10%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="25%" />
            </colgroup>
          )}

          {/* Table Header */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Deposit Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Staked Tokens (You / Total)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Unclaimed Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Reward Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Uncollected Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {/* Map over the current page of data to render each row */}
            {currentPageData.map((row) => (
              <UncollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {user === account && status?.UnclaimedStakingReward > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography mr={2}>
            Your claimable rewards are{" "}
            {`${status.UnclaimedStakingReward.toFixed(6)} ETH`}
          </Typography>
          <Button
            onClick={handleOpen}
            variant="contained"
            disabled={isUnstaking}
          >
            Claim All
          </Button>
        </Box>
      )}

      {/* Pagination Controls */}
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Claim all staking rewards</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to claim all staking rewards? If you unstake the tokens,
            then you can stake those tokens again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={unstakeAllCST} variant="contained">
            Ok
          </Button>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

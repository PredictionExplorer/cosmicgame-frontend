import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableBody,
  Typography,
  Alert,
} from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, formatSeconds } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import { useNotification } from "../contexts/NotificationContext";
import { useApiData } from "../contexts/ApiDataContext";
import getErrorMessage from "../utils/alert";

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
        {(DepositAmountEth ?? 0).toFixed(6)}
      </TablePrimaryCell>

      {/* Your reward in ETH so far, formatted to 6 decimals */}
      <TablePrimaryCell align="center">
        {(YourRewardAmountEth ?? 0).toFixed(6)}
      </TablePrimaryCell>

      {/* Pending reward in ETH that hasn't been collected yet */}
      <TablePrimaryCell align="center">
        {(PendingToClaimEth ?? 0).toFixed(6)}
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
  const { apiData: status, fetchData: refetchApiData, unclaimedRewards: contextRewards } = useApiData();

  // Use context rewards when viewing own account — avoids a duplicate API call.
  // Fall back to independent fetch only when viewing another user's profile.
  const isOwnAccount = user?.toLowerCase() === account?.toLowerCase();

  const [localList, setLocalList] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [cstWithRewards, setCstWithRewards] = useState([]);
  const cstStakingContract = useStakingWalletCSTContract();
  const { setNotification } = useNotification();

  const PER_PAGE = 5;
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;

  const fetchCstWithRewards = async () => {
    try {
      const res = await api.get_staking_cst_by_user_by_deposit_rewards(user);
      const lastEntry = res?.[res.length - 1];
      const actions = lastEntry?.Actions?.filter((x: any) => !x.Claimed) ?? [];
      const actionIds = actions.map((x: any) => x.Stake.ActionId);
      setCstWithRewards(actionIds);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUncollectedCstStakingRewards = async () => {
    try {
      const res = await api.get_staking_cst_rewards_to_claim_by_user(user);
      setLocalList(res);
    } catch (err) {
      console.error(err);
    }
  };

  const unstakeAllCST = async () => {
    handleClose();
    setIsUnstaking(true);
    try {
      const res = await cstStakingContract
        .unstakeMany(cstWithRewards)
        .then((tx: any) => tx.wait());
      if (!res.code) {
        setNotification({
          visible: true,
          text: "The selected tokens were unstaked successfully!",
          type: "success",
        });
      }
      setTimeout(() => {
        if (isOwnAccount) {
          // Context refetch updates both context rewards and status in one request
          refetchApiData();
        } else {
          fetchUncollectedCstStakingRewards();
        }
        fetchCstWithRewards();
      }, 4000);
    } catch (err) {
      if (err?.code !== 4001) {
        console.error(err);
        if (err?.data?.message) {
          const msg = getErrorMessage(err?.data?.message);
          setNotification({ visible: true, type: "error", text: msg });
        }
      }
    } finally {
      setIsUnstaking(false);
    }
  };

  useEffect(() => {
    // Only fetch independently when viewing another user's profile.
    // Own account data comes from ApiDataContext.
    if (!isOwnAccount) {
      fetchUncollectedCstStakingRewards();
    }
    fetchCstWithRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Decide which list to display
  const list = isOwnAccount ? contextRewards : localList;

  if (list === null) {
    return <Typography>Loading...</Typography>;
  }

  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

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

      {isOwnAccount && (status?.UnclaimedStakingReward ?? 0) > 0 && (
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
            {`${(status?.UnclaimedStakingReward ?? 0).toFixed(6)} ETH`}
          </Typography>
          <Button
            onClick={handleOpen}
            variant="contained"
            disabled={isUnstaking}
          >
            {isUnstaking ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                Processing...
              </Box>
            ) : "Unstake & Claim All"}
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Unstake Tokens &amp; Claim Rewards</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            This will <strong>unstake all your CST tokens</strong> and pay out{" "}
            <strong>
              {(status?.UnclaimedStakingReward ?? 0).toFixed(6)} ETH
            </strong>{" "}
            in accumulated rewards to your wallet.
          </DialogContentText>
          <Alert severity="warning" variant="outlined">
            <strong>Permanent action:</strong> Once unstaked, these tokens
            cannot be staked again. Only proceed if you want to exit staking
            entirely.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={unstakeAllCST}
            variant="contained"
            color="error"
            disabled={isUnstaking}
          >
            {isUnstaking ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                Processing...
              </Box>
            ) : "Unstake & Claim"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

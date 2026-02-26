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
import { convertTimestampToDateTime, formatSeconds } from "../utils";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import { useNotification } from "../contexts/NotificationContext";
import getErrorMessage from "../utils/alert";

/* ------------------------------------------------------------------
  Sub-Component: UncollectedRewardsRow
  Renders a single row in the rewards table with the provided data.
------------------------------------------------------------------ */
const UncollectedRewardsRow = ({
  row,
  isOwner,
  claimableActionIds,
  isClaiming,
  onClaim,
}: {
  row: any;
  isOwner: boolean;
  claimableActionIds: number[];
  isClaiming: boolean;
  onClaim: (depositId: number) => void;
}) => {
  // Early return if no row data to avoid errors.
  if (!row) return <TablePrimaryRow />;

  const {
    DepositTimeStamp,
    DepositId,
    YourTokensStaked,
    NumStakedNFTs,
    NumUnclaimedTokens,
    DepositAmountEth,
    YourRewardAmountEth,
    PendingToClaimEth,
  } = row;

  const hasClaimable = claimableActionIds.length > 0 && PendingToClaimEth > 0;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(DepositTimeStamp)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        {`${YourTokensStaked} / ${NumStakedNFTs}`}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{NumUnclaimedTokens}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        {DepositAmountEth.toFixed(6)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {YourRewardAmountEth.toFixed(6)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {PendingToClaimEth.toFixed(6)}
      </TablePrimaryCell>

      {/* Per-row Claim button — only visible to the owner */}
      <TablePrimaryCell align="center">
        {isOwner && hasClaimable ? (
          <Button
            size="small"
            variant="contained"
            disabled={isClaiming}
            onClick={() => onClaim(DepositId)}
          >
            {isClaiming ? "Claiming..." : "Claim"}
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )}
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
  const [list, setList] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Track global "Claim All" in-flight state
  const [isUnstaking, setIsUnstaking] = useState(false);

  // Track which deposit is currently being claimed individually (null = none)
  const [claimingDepositId, setClaimingDepositId] = useState<number | null>(null);

  // All unclaimed action IDs across every deposit (for Claim All)
  const [cstWithRewards, setCstWithRewards] = useState<number[]>([]);

  // Map of DepositId -> unclaimed action IDs (for per-row Claim)
  const [depositActionMap, setDepositActionMap] = useState<Record<number, number[]>>({});

  const cstStakingContract = useStakingWalletCSTContract();
  const { setNotification } = useNotification();

  const PER_PAGE = 5;
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;

  const isOwner = user === account;

  /* ----------------------------------------------------------------
    Data fetching helpers
  ---------------------------------------------------------------- */

  const fetchStatusData = async () => {
    try {
      const res = await api.notify_red_box(user);
      setStatus(res);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Fetch ALL unclaimed action IDs across EVERY deposit.
   *
   * Bug fix: the previous version used `res[res.length - 1]` which only
   * read the last deposit, missing claimable actions from earlier deposits.
   * We now flatMap over the entire array.
   */
  const fetchCstWithRewards = async () => {
    try {
      const res = await api.get_staking_cst_by_user_by_deposit_rewards(user);

      if (!res || !Array.isArray(res) || res.length === 0) {
        setCstWithRewards([]);
        setDepositActionMap({});
        return;
      }

      // Build per-deposit map and global list in a single pass
      const depositMap: Record<number, number[]> = {};
      const allActionIds: number[] = [];

      res.forEach((deposit) => {
        const unclaimedActions = (deposit.Actions ?? []).filter(
          (x: any) => !x.Claimed
        );
        const actionIds = unclaimedActions.map((x: any) => x.Stake.ActionId);

        if (actionIds.length > 0) {
          depositMap[deposit.DepositId] = actionIds;
          allActionIds.push(...actionIds);
        }
      });

      setDepositActionMap(depositMap);
      setCstWithRewards(allActionIds);
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

  const refreshAll = () => {
    setTimeout(() => {
      fetchStatusData();
      fetchUncollectedCstStakingRewards();
      fetchCstWithRewards();
    }, 4000);
  };

  /* ----------------------------------------------------------------
    Contract interaction helpers
  ---------------------------------------------------------------- */

  /**
   * Internal helper that calls unstakeMany with the given action IDs.
   * Returns true on success, false on failure.
   */
  const executeUnstakeMany = async (actionIds: number[]): Promise<boolean> => {
    try {
      const res = await cstStakingContract
        .unstakeMany(actionIds)
        .then((tx: any) => tx.wait());

      if (!res.code) {
        setNotification({
          visible: true,
          text: "The selected tokens were unstaked and rewards claimed successfully!",
          type: "success",
        });
      }
      refreshAll();
      return true;
    } catch (err: any) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        console.error(err);
        if (err?.data?.message) {
          const msg = getErrorMessage(err?.data?.message);
          setNotification({ visible: true, type: "error", text: msg });
        }
      }
      return false;
    }
  };

  /** "Claim All" — unstakes every token with pending rewards across all deposits. */
  const unstakeAllCST = async () => {
    handleClose();
    setIsUnstaking(true);
    try {
      await executeUnstakeMany(cstWithRewards);
    } finally {
      // Bug fix: always reset the flag so the button becomes clickable again
      setIsUnstaking(false);
    }
  };

  const claimForDeposit = async (depositId: number) => {
    const actionIds = depositActionMap[depositId];
    if (!actionIds || actionIds.length === 0) return;
    setClaimingDepositId(depositId);
    try {
      await executeUnstakeMany(actionIds);
    } catch (err: any) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        console.error(err);
        if (err?.data?.message) {
          const msg = getErrorMessage(err?.data?.message);
          setNotification({ visible: true, type: "error", text: msg });
        }
      }
    } finally {
      setClaimingDepositId(null);
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

  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  const currentPageData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="14%" />
              <col width="9%" />
              <col width="13%" />
              <col width="13%" />
              <col width="12%" />
              <col width="12%" />
              <col width="12%" />
              {isOwner && <col width="15%" />}
            </colgroup>
          )}
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
              {isOwner && <TablePrimaryHeadCell>Action</TablePrimaryHeadCell>}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentPageData.map((row) => (
              <UncollectedRewardsRow
                key={row.EvtLogId}
                row={row}
                isOwner={isOwner}
                claimableActionIds={depositActionMap[row.DepositId] ?? []}
                isClaiming={claimingDepositId === row.DepositId}
                onClaim={claimForDeposit}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {isOwner && status?.UnclaimedStakingReward > 0 && (
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
            disabled={isUnstaking || cstWithRewards.length === 0}
          >
            {isUnstaking ? "Claiming..." : "Claim All"}
          </Button>
        </Box>
      )}

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
            {"Do you want to claim all staking rewards? If you unstake the tokens, you won't be able to stake those tokens again."}
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

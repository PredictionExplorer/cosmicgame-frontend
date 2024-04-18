import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Snackbar,
  TableBody,
  Typography,
} from "@mui/material";
import {
  PrimaryMenuItem,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import useStakingWalletContract from "../hooks/useStakingWalletContract";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";
import { useStakedToken } from "../contexts/StakedTokenContext";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AdvancedClaimDialog from "./AdvancedClaimDialog";

const fetchInfo = async (account, depositId, stakedActionIds) => {
  const response = await api.get_action_ids_by_deposit_id(account, depositId);
  let unstakeableActionIds = [],
    claimableActionIds = [],
    claimableAmount = 0;
  await Promise.all(
    response.map(async (x) => {
      try {
        if (x.UnstakeEligibleTimeStamp < x.CurChainTimeStamp) {
          if (!x.Claimed) {
            claimableActionIds.push({
              DepositId: x.DepositId,
              StakeActionId: x.StakeActionId,
            });
            claimableAmount += x.AmountEth;
          }
          if (stakedActionIds.includes(x.StakeActionId)) {
            unstakeableActionIds.push(x.StakeActionId);
          }
        }
      } catch (error) {
        console.log(error);
      }
    })
  );
  return {
    unstakeableActionIds,
    claimableActionIds,
    claimableAmount,
    actionIds: response.filter(
      (x) => x.UnstakeEligibleTimeStamp < x.CurChainTimeStamp && !x.Claimed
    ),
  };
};

interface stakeStateInterface {
  TokenId: number;
  DepositId: number;
  StakeActionId: number;
  unstake: boolean;
  claim: boolean;
  restake: boolean;
}

const UnclaimedStakingRewardsRow = ({
  row,
  owner,
  fetchData,
  setNotification,
  offset,
}) => {
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletContract();
  const [unstakeableActionIds, setUnstakeableActionIds] = useState([]);
  const [claimableActionIds, setClaimableActionIds] = useState([]);
  // const [claimableAmount, setClaimableAmount] = useState(0);
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDlg, setOpenDlg] = useState(false);
  const [stakeState, setStakeState] = useState<stakeStateInterface[]>([]);

  const fetchRowData = async () => {
    const res = await fetchInfo(account, row.DepositId, stakedActionIds);
    setUnstakeableActionIds(res.unstakeableActionIds);
    setClaimableActionIds(res.claimableActionIds);
    // setClaimableAmount(res.claimableAmount);
    setStakeState(
      res.actionIds.map((x) => ({
        ...x,
        unstake: !stakedActionIds.includes(x.StakeActionId),
        claim: false,
        restake: false,
      }))
    );
    return res;
  };
  useEffect(() => {
    fetchRowData();
  }, []);

  const handleUnstakeClaimRestake = async (
    type,
    unstakeActions,
    restakeActions,
    claimActions,
    claimDeposits
  ) => {
    try {
      handleMenuClose();
      const res = await stakingContract
        .unstakeClaimRestakeMany(
          unstakeActions,
          restakeActions,
          claimActions,
          claimDeposits
        )
        .then((tx) => tx.wait());
      console.log(res);
      setTimeout(() => {
        fetchRowData();
      }, 1000);
      fetchData(owner, false);
      setNotification({
        visible: true,
        text: `The tokens were ${type} successfully!`,
        type: "success",
      });
    } catch (e) {
      if (e.code === -32603) {
        fetchData(owner, false);
        const rowData = await fetchRowData();
        if (rowData.claimableActionIds.length > 0) {
          handleUnstakeClaimRestake(
            type,
            unstakeActions,
            restakeActions,
            claimActions,
            claimDeposits
          );
        }
      } else {
        console.error(e);
      }
    }
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      <TablePrimaryRow>
        <TablePrimaryCell>
          {convertTimestampToDateTime(row.TimeStamp - offset)}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.DepositAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.AmountPerTokenEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.YourTokensStaked}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.YourClaimableAmountEth.toFixed(6)}
        </TablePrimaryCell>
        {account === owner && (
          <TablePrimaryCell align="center">
            {claimableActionIds.length > 0 ? (
              row.YourTokensStaked === 1 ? (
                <>
                  <Button
                    size="small"
                    sx={{ textTransform: "none" }}
                    onClick={() =>
                      handleUnstakeClaimRestake(
                        `${unstakeableActionIds.length > 0 &&
                          "unstaked & "}claimed`,
                        unstakeableActionIds,
                        [],
                        claimableActionIds.map((x) => x.StakeActionId),
                        claimableActionIds.map((x) => x.DepositId)
                      )
                    }
                  >
                    {unstakeableActionIds.length > 0
                      ? "Unstake & Claim"
                      : "Claim"}
                  </Button>
                  <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    elevation={0}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    {unstakeableActionIds.length > 0 && (
                      <PrimaryMenuItem
                        onClick={() =>
                          handleUnstakeClaimRestake(
                            "unstaked",
                            unstakeableActionIds,
                            [],
                            [],
                            []
                          )
                        }
                      >
                        <Typography>Unstake Only</Typography>
                      </PrimaryMenuItem>
                    )}
                    {/* <PrimaryMenuItem onClick={handleMenuClose}>
                    <Typography>
                      {`${unstakeableActionIds.length > 0 &&
                        "Unstake &"} Claim`}
                    </Typography>
                  </PrimaryMenuItem> */}
                    <PrimaryMenuItem
                      onClick={() =>
                        handleUnstakeClaimRestake(
                          `${unstakeableActionIds.length > 0 &&
                            "unstaked & "}claimed and restaked`,
                          unstakeableActionIds,
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        )
                      }
                    >
                      <Typography>
                        {`${
                          unstakeableActionIds.length > 0 ? "Unstake &" : ""
                        } Claim & Restake`}
                      </Typography>
                    </PrimaryMenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Box sx={{ display: "flex" }}>
                    <Button
                      size="small"
                      sx={{
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        mr: 1,
                      }}
                      onClick={() =>
                        handleUnstakeClaimRestake(
                          `${unstakeableActionIds.length > 0 &&
                            "unstaked & "}claimed`,
                          unstakeableActionIds,
                          [],
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        )
                      }
                    >
                      {`${
                        unstakeableActionIds.length > 0 ? "Unstake &" : ""
                      } Claim All`}
                    </Button>
                    <IconButton size="small" onClick={handleMenuOpen}>
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Menu
                    elevation={0}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    {unstakeableActionIds.length > 0 && (
                      <PrimaryMenuItem
                        onClick={() =>
                          handleUnstakeClaimRestake(
                            "unstaked",
                            unstakeableActionIds,
                            [],
                            [],
                            []
                          )
                        }
                      >
                        <Typography>Unstake Only</Typography>
                      </PrimaryMenuItem>
                    )}
                    {/* <PrimaryMenuItem onClick={handleMenuClose}>
                    <Typography>
                      {`${unstakeableActionIds.length > 0 &&
                        "Unstake &"} Claim All`}
                    </Typography>
                  </PrimaryMenuItem> */}
                    <PrimaryMenuItem
                      onClick={() =>
                        handleUnstakeClaimRestake(
                          `${unstakeableActionIds.length > 0 &&
                            "unstaked & "}claimed and restaked`,
                          unstakeableActionIds,
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        )
                      }
                    >
                      <Typography>
                        {`${
                          unstakeableActionIds.length > 0 ? "Unstake &" : ""
                        } Claim & Restake All`}
                      </Typography>
                    </PrimaryMenuItem>
                    <PrimaryMenuItem
                      onClick={() => {
                        setOpenDlg(true);
                        handleMenuClose();
                      }}
                    >
                      <Typography>
                        {unstakeableActionIds.length > 0
                          ? "Advanced Claim"
                          : "Advanced Transaction Build"}
                      </Typography>
                    </PrimaryMenuItem>
                  </Menu>
                </>
              )
            ) : (
              " "
            )}
          </TablePrimaryCell>
        )}
      </TablePrimaryRow>
      <AdvancedClaimDialog
        open={openDlg}
        setOpen={setOpenDlg}
        stakeState={stakeState}
        setStakeState={setStakeState}
        handleUnstakeClaimRestake={handleUnstakeClaimRestake}
      />
    </>
  );
};

export const UnclaimedStakingRewardsTable = ({ list, owner, fetchData }) => {
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletContract();
  const perPage = 5;
  const [page, setPage] = useState(1);
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const [offset, setOffset] = useState(undefined);
  const [claimableActionIds, setClaimableActionIds] = useState([]);
  const [unstakableActionIds, setUnstakeableActionIds] = useState([]);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
    visible: boolean;
  }>({
    visible: false,
    text: "",
    type: "success",
  });
  const handleClaimAll = async () => {
    let actionIds = [],
      depositIds = [];
    for (const element of list) {
      const depositId = element.DepositId;
      const response = await api.get_action_ids_by_deposit_id(
        account,
        depositId
      );
      const ids = response
        .filter((x) => !x.Claimed)
        .map((x) => x.StakeActionId);
      actionIds = actionIds.concat(ids);
      depositIds = depositIds.concat(new Array(ids.length).fill(depositId));
    }
    try {
      const res = await stakingContract
        .claimManyRewards(
          claimableActionIds.map((x) => x.StakeActionId),
          claimableActionIds.map((x) => x.DepositId)
        )
        .then((tx) => tx.wait());
      console.log(res);
      fetchData(owner, false);
      setNotification({
        visible: true,
        text: "All rewards were claimed successfully!",
        type: "success",
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const calculateOffset = async () => {
      const current = await api.get_current_time();
      const offset = current - Date.now() / 1000;
      setOffset(offset);
    };
    const fetchActionIds = async () => {
      let cl_actionIds = [],
        us_actionIds = [];
      await Promise.all(
        list.map(async (item) => {
          const depositId = item.DepositId;
          const {
            claimableActionIds: cl,
            unstakeableActionIds: us,
          } = await fetchInfo(account, depositId, stakedActionIds);
          cl_actionIds = cl_actionIds.concat(cl);
          us_actionIds = us_actionIds.concat(us);
        })
      );
      setClaimableActionIds(cl_actionIds);
      setUnstakeableActionIds(us_actionIds);
    };
    fetchActionIds();
    calculateOffset();
  }, [list]);

  if (offset === undefined) return;

  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={10000}
        open={notification.visible}
        onClose={() =>
          setNotification({ text: "", type: "success", visible: false })
        }
      >
        <Alert severity={notification.type} variant="filled">
          {notification.text}
        </Alert>
      </Snackbar>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left" sx={{ minWidth: "165px" }}>
                Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Deposit Amount
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward Per Token
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Your Staked Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Your Claimable Amount
              </TablePrimaryHeadCell>
              {account === owner && (
                <TablePrimaryHeadCell> </TablePrimaryHeadCell>
              )}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UnclaimedStakingRewardsRow
                row={row}
                key={row.EvtLogId}
                owner={owner}
                fetchData={fetchData}
                setNotification={setNotification}
                offset={offset}
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
              return a + b.YourClaimableAmountEth;
            }, 0)
            .toFixed(6)}
        </Typography>
      </Box>
      {account === owner &&
        unstakableActionIds.length === 0 &&
        claimableActionIds.length > 0 && (
          <Box display="flex" justifyContent="end" mt={1}>
            <Button variant="text" onClick={handleClaimAll}>
              Claim All
            </Button>
          </Box>
        )}
      <Box display="flex" justifyContent="end" mt={1}>
        <Typography>
          You can claim your prizes in the case if the unstake date is beyond
          the current date.
        </Typography>
      </Box>
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

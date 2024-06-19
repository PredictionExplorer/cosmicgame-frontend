import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Link,
  Menu,
  Pagination,
  Snackbar,
  TableBody,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { convertTimestampToDateTime, formatSeconds } from "../utils";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";
import { useStakedToken } from "../contexts/StakedTokenContext";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AdvancedClaimDialog from "./AdvancedClaimDialog";
import getErrorMessage from "../utils/alert";
import { useApiData } from "../contexts/ApiDataContext";

const fetchInfo = async (account, depositId, stakedActionIds) => {
  let unstakeableActionIds = [],
    claimableActionIds = [],
    claimableAmounts = {},
    waitingActionIds = [];
  const response = await api.get_cst_action_ids_by_deposit_id(
    account,
    depositId
  );
  const current = await api.get_current_time();
  await Promise.all(
    response.map(async (x) => {
      try {
        if (x.UnstakeEligibleTimeStamp < current) {
          if (!x.Claimed) {
            claimableActionIds.push({
              DepositId: x.DepositId,
              StakeActionId: x.StakeActionId,
            });
          }
          if (stakedActionIds.includes(x.StakeActionId)) {
            unstakeableActionIds.push(x.StakeActionId);
          }
        } else {
          waitingActionIds.push({
            DepositId: x.DepositId,
            StakeActionId: x.StakeActionId,
          });
        }
        if (!x.Claimed) {
          if (x.TimeStampDiff > 0) {
            if (!claimableAmounts[x.TimeStampDiff]) {
              const filtered = Object.keys(claimableAmounts).filter(
                (element) => Math.abs(parseInt(element) - x.TimeStampDiff) < 60
              );
              if (filtered.length > 0) {
                claimableAmounts[filtered[0]] += x.AmountEth;
              } else {
                claimableAmounts[x.TimeStampDiff] = x.AmountEth;
              }
            } else {
              claimableAmounts[x.TimeStampDiff] += x.AmountEth;
            }
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
    claimableAmounts,
    waitingActionIds,
    actionIds: response.filter(
      (x) => x.UnstakeEligibleTimeStamp < current && !x.Claimed
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
  offset,
  handleUnstakeClaimRestake,
  showWaitingTokensColumn,
}) => {
  const { account } = useActiveWeb3React();
  const [unstakeableActionIds, setUnstakeableActionIds] = useState([]);
  const [claimableActionIds, setClaimableActionIds] = useState([]);
  const [waitingActionIds, setWaitingActionIds] = useState([]);
  const [claimableAmounts, setClaimableAmounts] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDlg, setOpenDlg] = useState(false);
  const [stakeState, setStakeState] = useState<stakeStateInterface[]>([]);
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const stakedTokenIds = stakedTokens.map((x) => x.TokenInfo.TokenId);

  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up("sm"));

  const fetchRowData = async () => {
    const res = await fetchInfo(owner, row.DepositId, stakedActionIds);
    setUnstakeableActionIds(res.unstakeableActionIds);
    setClaimableActionIds(res.claimableActionIds);
    setClaimableAmounts(res.claimableAmounts);
    setWaitingActionIds(res.waitingActionIds);
    setStakeState(
      res.actionIds.map((x) => ({
        ...x,
        unstake: !stakedActionIds.includes(x.StakeActionId),
        claim: false,
        restake: false,
      }))
    );
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    fetchRowData();
    const interval = setInterval(() => {
      fetchRowData();
    }, 30000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, [stakedTokens]);

  const handleUnstakeClaimRestakeWrapper = (
    type,
    unstakeActions,
    restakeActions,
    claimActions,
    claimDeposits
  ) => {
    handleMenuClose();
    handleUnstakeClaimRestake(
      type,
      unstakeActions,
      restakeActions,
      claimActions,
      claimDeposits
    );
  };

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      <TablePrimaryRow>
        <TablePrimaryCell>
          <Link
            color="inherit"
            fontSize="inherit"
            href={`https://arbiscan.io/tx/${row.TxHash}`}
            target="__blank"
          >
            {convertTimestampToDateTime(row.TimeStamp - offset)}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
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
        <TablePrimaryCell align="right">
          {claimableActionIds.length}
        </TablePrimaryCell>
        {showWaitingTokensColumn && (
          <TablePrimaryCell align="right">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: sm ? "end" : "start",
              }}
            >
              {waitingActionIds.length}
              {Object.keys(claimableAmounts).length > 0 && (
                <Tooltip
                  title={
                    <Typography>
                      You can claim the reward for&nbsp;
                      {Object.keys(claimableAmounts).map(
                        (key, index, arr) =>
                          `${claimableAmounts[key].toFixed(
                            6
                          )} ETH in ${formatSeconds(parseInt(key))}${
                            index !== arr.length - 1 ? ", " : ""
                          }`
                      )}
                    </Typography>
                  }
                  sx={{ ml: 1 }}
                >
                  <ErrorOutlineIcon fontSize="inherit" />
                </Tooltip>
              )}
            </Box>
          </TablePrimaryCell>
        )}
        {account === owner && (
          <TablePrimaryCell align="center">
            {claimableActionIds.length > 0 ? (
              claimableActionIds.length === 1 ? (
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
                          `${
                            unstakeableActionIds.length > 0 ? "unstaked & " : ""
                          }claimed`,
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
                        onClick={() => {
                          handleMenuClose();
                          handleUnstakeClaimRestake(
                            "unstaked",
                            unstakeableActionIds,
                            [],
                            [],
                            []
                          );
                        }}
                      >
                        <Typography>Unstake Only</Typography>
                      </PrimaryMenuItem>
                    )}
                    <PrimaryMenuItem
                      onClick={() => {
                        handleMenuClose();
                        handleUnstakeClaimRestake(
                          `${
                            unstakeableActionIds.length > 0 ? "unstaked & " : ""
                          }claimed and restaked`,
                          unstakeableActionIds,
                          stakeState
                            .filter(
                              (x) =>
                                stakedActionIds.includes(x.StakeActionId) ||
                                !stakedTokenIds.includes(x.TokenId)
                            )
                            .map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        );
                      }}
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
                          `${
                            unstakeableActionIds.length > 0 ? "unstaked & " : ""
                          }claimed`,
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
                        onClick={() => {
                          handleMenuClose();
                          handleUnstakeClaimRestake(
                            "unstaked",
                            unstakeableActionIds,
                            [],
                            [],
                            []
                          );
                        }}
                      >
                        <Typography>Unstake Only</Typography>
                      </PrimaryMenuItem>
                    )}
                    <PrimaryMenuItem
                      onClick={() => {
                        handleMenuClose();
                        handleUnstakeClaimRestake(
                          `${
                            unstakeableActionIds.length > 0 ? "unstaked & " : ""
                          }claimed and restaked`,
                          unstakeableActionIds,
                          stakeState
                            .filter(
                              (x) =>
                                stakedActionIds.includes(x.StakeActionId) ||
                                !stakedTokenIds.includes(x.TokenId)
                            )
                            .map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        );
                      }}
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
        handleUnstakeClaimRestake={handleUnstakeClaimRestakeWrapper}
      />
    </>
  );
};

export const UnclaimedStakingRewardsTable = ({ list, owner, fetchData }) => {
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletCSTContract();
  const perPage = 5;
  const [page, setPage] = useState(1);
  const { apiData: stakingStatus } = useApiData();
  const [offset, setOffset] = useState(undefined);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
    visible: boolean;
  }>({
    visible: false,
    text: "",
    type: "success",
  });

  const handleUnstakeClaimRestake = async (
    type,
    unstakeActions,
    restakeActions,
    claimActions,
    claimDeposits
  ) => {
    try {
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
        fetchData(owner, false);
      }, 2000);
      setNotification({
        visible: true,
        text: `The tokens were ${type} successfully!`,
        type: "success",
      });
    } catch (e) {
      if (e.code === -32603) {
        fetchData(owner, false);
        const msg = getErrorMessage(e?.data?.message);
        setNotification({
          visible: true,
          text: `${msg}. Please try again.`,
          type: "error",
        });
      } else {
        console.error(e);
      }
    }
  };

  const handleUnstakeClaimAll = async () => {
    try {
      const res = await stakingContract
        .unstakeClaimRestakeMany(
          stakingStatus.unstakeableActionIds,
          [],
          stakingStatus.claimableActionIds.map((x) => x.StakeActionId),
          stakingStatus.claimableActionIds.map((x) => x.DepositId)
        )
        .then((tx) => tx.wait());
      console.log(res);
      setTimeout(() => {
        fetchData(owner, false);
      }, 2000);
      setNotification({
        visible: true,
        text: "All rewards were claimed successfully!",
        type: "success",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, visible: false });
  };

  useEffect(() => {
    const calculateOffset = async () => {
      const current = await api.get_current_time();
      const offset = current - Date.now() / 1000;
      setOffset(offset);
    };
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
        onClose={handleNotificationClose}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          onClose={handleNotificationClose}
        >
          {notification.text}
        </Alert>
      </Snackbar>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left" sx={{ minWidth: "150px" }}>
                Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Deposit Amount
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward Per Token
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Staked Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Claimable Amount
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Claimable Tokens
              </TablePrimaryHeadCell>
              {stakingStatus.waitingActionIds.length > 0 && (
                <TablePrimaryHeadCell align="right">
                  Wait Period Tokens
                </TablePrimaryHeadCell>
              )}
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
                handleUnstakeClaimRestake={handleUnstakeClaimRestake}
                offset={offset}
                showWaitingTokensColumn={
                  stakingStatus.waitingActionIds.length > 0
                }
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
      <Box display="flex" justifyContent="end" mt={1}>
        <Typography>
          You can claim your prizes in the case if the unstake date is beyond
          the current date.
        </Typography>
      </Box>
      {account === owner && stakingStatus.claimableActionIds.length > 0 && (
        <Box display="flex" justifyContent="end" mt={1}>
          <Button
            variant="contained"
            size="small"
            onClick={handleUnstakeClaimAll}
          >
            {stakingStatus.unstakeableActionIds.length > 0
              ? "Unstake & Claim All"
              : "Claim All"}
          </Button>
        </Box>
      )}
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

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Link,
  Menu,
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
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";
import { useStakedToken } from "../contexts/StakedTokenContext";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AdvancedClaimDialog from "./AdvancedClaimDialog";
import getErrorMessage from "../utils/alert";
import { CustomPagination } from "./CustomPagination";
import { useNotification } from "../contexts/NotificationContext";

const fetchInfo = async (account, depositId, stakedActionIds) => {
  let unstakeableActionIds = [],
    claimableActionIds = [];
  const response = await api.get_cst_action_ids_by_deposit_id(
    account,
    depositId
  );
  response.map(async (x) => {
    try {
      if (!x.Claimed) {
        claimableActionIds.push({
          DepositId: x.DepositId,
          StakeActionId: x.StakeActionId,
        });
      }
      if (stakedActionIds.includes(x.StakeActionId)) {
        unstakeableActionIds.push(x.StakeActionId);
      }
    } catch (error) {
      console.log(error);
    }
  });
  return {
    unstakeableActionIds,
    claimableActionIds,
    actionIds: response.filter((x) => !x.Claimed),
  };
};

interface stakeStateInterface {
  TokenId: number;
  DepositId: number;
  StakeActionId: number;
  unstake: boolean;
  claim: boolean;
}

const UnclaimedStakingRewardsRow = ({ row, owner, handleUnstakeClaim }) => {
  const { account } = useActiveWeb3React();
  const [unstakeableActionIds, setUnstakeableActionIds] = useState([]);
  const [claimableActionIds, setClaimableActionIds] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDlg, setOpenDlg] = useState(false);
  const [stakeState, setStakeState] = useState<stakeStateInterface[]>([]);
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);

  const fetchRowData = async () => {
    const res = await fetchInfo(owner, row.DepositId, stakedActionIds);
    setUnstakeableActionIds(res.unstakeableActionIds);
    setClaimableActionIds(res.claimableActionIds);
    setStakeState(
      res.actionIds.map((x) => ({
        ...x,
        unstake: !stakedActionIds.includes(x.StakeActionId),
        claim: false,
      }))
    );
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleUnstakeClaimWrapper = (
    type,
    unstakeActions,
    claimActions,
    claimDeposits
  ) => {
    handleMenuClose();
    handleUnstakeClaim(type, unstakeActions, claimActions, claimDeposits);
  };

  useEffect(() => {
    fetchRowData();
  }, [stakedTokens]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRowData();
    }, 30000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, []);

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
            {convertTimestampToDateTime(row.TimeStamp)}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.DepositAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.AmountPerTokenEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.YourTokensStaked}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.YourClaimableAmountEth.toFixed(6)}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {claimableActionIds.length}
        </TablePrimaryCell>
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
                        handleUnstakeClaim(
                          `${
                            unstakeableActionIds.length > 0 ? "unstaked & " : ""
                          }claimed`,
                          unstakeableActionIds,
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        )
                      }
                    >
                      {unstakeableActionIds.length > 0
                        ? "Unstake & Claim"
                        : "Claim"}
                    </Button>
                    {unstakeableActionIds.length > 0 && (
                      <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreHorizIcon fontSize="small" aria-hidden="false" />
                      </IconButton>
                    )}
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
                          handleUnstakeClaim(
                            "unstaked",
                            unstakeableActionIds,
                            [],
                            []
                          );
                        }}
                      >
                        <Typography>Unstake Only</Typography>
                      </PrimaryMenuItem>
                    )}
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
                        handleUnstakeClaim(
                          `${
                            unstakeableActionIds.length > 0 ? "unstaked & " : ""
                          }claimed`,
                          unstakeableActionIds,
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
                          handleUnstakeClaim(
                            "unstaked",
                            unstakeableActionIds,
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
        handleUnstakeClaim={handleUnstakeClaimWrapper}
      />
    </>
  );
};

export const UnclaimedStakingRewardsTable = ({ list, owner, fetchData }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const [claimableActionIds, setClaimableActionIds] = useState([]);
  const [unstakableActionIds, setUnstakeableActionIds] = useState([]);
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletCSTContract();
  const { setNotification } = useNotification();

  const handleUnstakeClaim = async (
    type,
    unstakeActions,
    claimActions,
    claimDeposits
  ) => {
    try {
      const res = await stakingContract
        .unstakeClaimMany(unstakeActions, claimActions, claimDeposits)
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
          text: msg,
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
        .unstakeClaimMany(
          unstakableActionIds,
          claimableActionIds.map((x) => x.StakeActionId),
          claimableActionIds.map((x) => x.DepositId)
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
      if (e?.data?.message) {
        const msg = getErrorMessage(e?.data?.message);
        setNotification({
          visible: true,
          text: msg,
          type: "error",
        });
      }
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchActionIds = async () => {
      let cl_actionIds = [],
        us_actionIds = [];
      await Promise.all(
        list.map(async (item) => {
          const depositId = item.DepositId;
          const res = await fetchInfo(owner, depositId, stakedActionIds);
          cl_actionIds = cl_actionIds.concat(res.claimableActionIds);
          us_actionIds = us_actionIds.concat(res.unstakeableActionIds);
        })
      );
      setClaimableActionIds(cl_actionIds);
      us_actionIds = us_actionIds.filter((item, index) => {
        return index === us_actionIds.findIndex((o) => o === item);
      });
      setUnstakeableActionIds(us_actionIds);
    };
    fetchActionIds();
  }, [list, stakedTokens]);

  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left" sx={{ minWidth: "150px" }}>
                Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Amount (ETH)</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Total Staked Tokens</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Reward Per Token (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Staked Tokens
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                Claimable Amount (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Claimable Tokens
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
                handleUnstakeClaim={handleUnstakeClaim}
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
            .toFixed(6)}{" "}
          ETH
        </Typography>
      </Box>
      <Box display="flex" justifyContent="end" mt={1}>
        <Typography>
          If you unstake a token, that token can never be staked again!
        </Typography>
      </Box>
      {account === owner && claimableActionIds.length > 0 && (
        <Box display="flex" justifyContent="end" mt={1}>
          <Button
            variant="contained"
            size="small"
            onClick={handleUnstakeClaimAll}
          >
            {unstakableActionIds.length > 0
              ? "Unstake & Claim All"
              : "Claim All"}
          </Button>
        </Box>
      )}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

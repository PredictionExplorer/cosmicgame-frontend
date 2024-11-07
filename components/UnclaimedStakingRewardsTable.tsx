import React, { useEffect, useState, useMemo } from "react";
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
  let unstakeableActionIds = [];
  let claimableActionIds = [];

  const response = await api.get_cst_action_ids_by_deposit_id(
    account,
    depositId
  );

  response.forEach((x) => {
    if (!x.Claimed) {
      claimableActionIds.push({
        DepositId: x.DepositId,
        StakeActionId: x.StakeActionId,
      });
    }
    if (stakedActionIds.includes(x.StakeActionId)) {
      unstakeableActionIds.push(x.StakeActionId);
    }
  });

  return {
    unstakeableActionIds,
    claimableActionIds,
    actionIds: response.filter((x) => !x.Claimed),
  };
};

const UnclaimedStakingRewardsRow = React.memo(
  ({ rowData, owner, handleUnstakeClaim, stakedActionIds, account }: any) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDlg, setOpenDlg] = useState(false);
    const [stakeState, setStakeState] = useState(() =>
      rowData.actionIds.map((x) => ({
        ...x,
        unstake: !stakedActionIds.includes(x.StakeActionId),
        claim: false,
      }))
    );

    useEffect(() => {
      setStakeState(
        rowData.actionIds.map((x) => ({
          ...x,
          unstake: !stakedActionIds.includes(x.StakeActionId),
          claim: false,
        }))
      );
    }, [rowData.actionIds, stakedActionIds]);

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
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

    const { row, unstakeableActionIds, claimableActionIds } = rowData;

    if (!row) {
      return <TablePrimaryRow />;
    }

    const isSingleClaimable = claimableActionIds.length === 1;
    const hasUnstakeable = unstakeableActionIds.length > 0;
    const buttonLabel = hasUnstakeable
      ? isSingleClaimable
        ? "Unstake & Claim"
        : "Unstake & Claim All"
      : isSingleClaimable
      ? "Claim"
      : "Claim All";

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
          <TablePrimaryCell align="center">
            {row.NumStakedNFTs}
          </TablePrimaryCell>
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
                          `${hasUnstakeable ? "unstaked & " : ""}claimed`,
                          unstakeableActionIds,
                          claimableActionIds.map((x) => x.StakeActionId),
                          claimableActionIds.map((x) => x.DepositId)
                        )
                      }
                    >
                      {buttonLabel}
                    </Button>
                    {(hasUnstakeable || !isSingleClaimable) && (
                      <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreHorizIcon fontSize="small" />
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
                    {hasUnstakeable && (
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
                    {!isSingleClaimable && (
                      <PrimaryMenuItem
                        onClick={() => {
                          setOpenDlg(true);
                          handleMenuClose();
                        }}
                      >
                        <Typography>
                          {hasUnstakeable
                            ? "Advanced Claim"
                            : "Advanced Transaction Build"}
                        </Typography>
                      </PrimaryMenuItem>
                    )}
                  </Menu>
                </>
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
  }
);

const UnclaimedStakingRewardsTable = ({ list, owner, fetchData }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = useMemo(
    () => stakedTokens.map((x: any) => x.TokenInfo.StakeActionId),
    [stakedTokens]
  );
  const [claimableActionIds, setClaimableActionIds] = useState([]);
  const [unstakeableActionIds, setUnstakeableActionIds] = useState([]);
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletCSTContract();
  const { setNotification } = useNotification();
  const [rowDataList, setRowDataList] = useState([]);

  const handleUnstakeClaim = async (
    type,
    unstakeActions,
    claimActions,
    claimDeposits
  ) => {
    try {
      const tx = await stakingContract.unstakeClaimMany(
        unstakeActions,
        claimActions,
        claimDeposits
      );
      await tx.wait();
      setTimeout(() => {
        fetchData(owner, false);
      }, 2000);
      setNotification({
        visible: true,
        text: `The tokens were ${type} successfully!`,
        type: "success",
      });
    } catch (e) {
      const msg = getErrorMessage(e?.data?.message || e?.message);
      setNotification({
        visible: true,
        text: msg,
        type: "error",
      });
    }
  };

  const handleUnstakeClaimAll = async () => {
    try {
      const tx = await stakingContract.unstakeClaimMany(
        unstakeableActionIds,
        claimableActionIds.map((x) => x.StakeActionId),
        claimableActionIds.map((x) => x.DepositId)
      );
      await tx.wait();
      setTimeout(() => {
        fetchData(owner, false);
      }, 2000);
      setNotification({
        visible: true,
        text: "All rewards were claimed successfully!",
        type: "success",
      });
    } catch (e) {
      const msg = getErrorMessage(e?.data?.message || e?.message);
      setNotification({
        visible: true,
        text: msg,
        type: "error",
      });
    }
  };

  useEffect(() => {
    const fetchAllRowData = async () => {
      let cl_actionIds = [];
      let us_actionIds = [];
      let newRowDataList = [];

      await Promise.all(
        list.map(async (item: any) => {
          const res = await fetchInfo(owner, item.DepositId, stakedActionIds);
          cl_actionIds = cl_actionIds.concat(res.claimableActionIds);
          us_actionIds = us_actionIds.concat(res.unstakeableActionIds);
          newRowDataList.push({
            row: item,
            unstakeableActionIds: res.unstakeableActionIds,
            claimableActionIds: res.claimableActionIds,
            actionIds: res.actionIds,
          });
        })
      );
      us_actionIds = Array.from(new Set(us_actionIds));
      setClaimableActionIds(cl_actionIds);
      setUnstakeableActionIds(us_actionIds);
      setRowDataList(newRowDataList);
    };

    fetchAllRowData();
    const interval = setInterval(fetchAllRowData, 30000);
    return () => clearInterval(interval);
  }, [list, stakedActionIds, owner]);

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
            {rowDataList
              .slice((page - 1) * perPage, page * perPage)
              .map((rowData) => (
                <UnclaimedStakingRewardsRow
                  rowData={rowData}
                  key={rowData.row.EvtLogId}
                  owner={owner}
                  handleUnstakeClaim={handleUnstakeClaim}
                  stakedActionIds={stakedActionIds}
                  account={account}
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="end" mt={1}>
        <Typography mr={1}>Total Rewards:</Typography>
        <Typography>
          {list.reduce((a, b) => a + b.YourClaimableAmountEth, 0).toFixed(6)}{" "}
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
            {unstakeableActionIds.length > 0
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

export default UnclaimedStakingRewardsTable;

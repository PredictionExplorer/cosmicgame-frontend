import React, { useEffect, useState } from "react";
import { Box, Button, Pagination, TableBody, Typography } from "@mui/material";
import {
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

const UnclaimedStakingRewardsRow = ({ row, owner, fetchData }) => {
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletContract();
  const [unstakeableActionIds, setUnstakeableActionIds] = useState([]);
  const [unclaimedActionIds, setUnclaimedActionIds] = useState([]);
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);

  useEffect(() => {
    const fetchInfo = async () => {
      const response = await api.get_action_ids_by_deposit_id(
        account,
        row.DepositId
      );
      let unstakeableActionIds = [],
        unclaimableActionIds = [];
      await Promise.all(
        response.map(async (x) => {
          try {
            const { Stake } = await api.get_staking_actions_info(
              x.StakeActionId
            );
            if (Stake) {
              if (Stake.UnstakeTimeStamp < Date.now() / 1000) {
                if (!x.Claimed) {
                  unclaimableActionIds.push({
                    DepositId: x.DepositId,
                    StakeActionId: x.StakeActionId,
                  });
                }
                if (stakedActionIds.includes(x.StakeActionId)) {
                  unstakeableActionIds.push(x.StakeActionId);
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        })
      );
      setUnstakeableActionIds(unstakeableActionIds);
      setUnclaimedActionIds(unclaimableActionIds);
    };
    fetchInfo();
  }, []);

  const handleClaim = async () => {
    try {
      if (unstakeableActionIds.length > 0) {
        await stakingContract
          .unstakeMany(unstakeableActionIds)
          .then((tx) => tx.wait());
        fetchData(owner, false);
      }
      if (unclaimedActionIds.length > 0) {
        const res = await stakingContract
          .claimManyRewards(
            unclaimedActionIds.map((x) => x.StakeActionId),
            unclaimedActionIds.map((x) => x.DepositId)
          )
          .then((tx) => tx.wait());
        console.log(res);
        fetchData(owner, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.DepositAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.AmountPerTokenEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{row.YourTokensStaked}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {row.YourClaimableAmountEth.toFixed(6)}
      </TablePrimaryCell>
      {account === owner && (
        <TablePrimaryCell align="center" sx={{ p: "4px 8px !important" }}>
          {unstakeableActionIds.length > 0 || unclaimedActionIds.length > 0 ? (
            <Button size="small" onClick={handleClaim} sx={{ p: 0 }}>
              {(unstakeableActionIds.length === 0 &&
                unclaimedActionIds.length === 0) ||
              unstakeableActionIds.length > 0
                ? "Unstake & Claim"
                : "Claim"}
            </Button>
          ) : (
            " "
          )}
        </TablePrimaryCell>
      )}
    </TablePrimaryRow>
  );
};

export const UnclaimedStakingRewardsTable = ({ list, owner, fetchData }) => {
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletContract();
  const perPage = 5;
  const [page, setPage] = useState(1);
  const { data: stakedTokens } = useStakedToken();

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
        .claimManyRewards(actionIds, depositIds)
        .then((tx) => tx.wait());
      console.log(res);
      fetchData(owner, false);
    } catch (e) {
      console.error(e);
    }
  };

  if (list.length === 0) {
    return <Typography>No rewards yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
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
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <UnclaimedStakingRewardsRow
                  row={row}
                  key={index}
                  owner={owner}
                  fetchData={fetchData}
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
      {account === owner && stakedTokens.length === 0 && list.length > 0 && (
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

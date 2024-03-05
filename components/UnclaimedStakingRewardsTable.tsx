import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import useStakingWalletContract from "../hooks/useStakingWalletContract";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";
import { useStakedToken } from "../contexts/StakedTokenContext";

const UnclaimedStakingRewardsRow = ({
  row,
  handleClaim,
  owner,
  stakedTokens,
}) => {
  const { account } = useActiveWeb3React();
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
        <TablePrimaryCell>
          <Button size="small" onClick={handleClaim}>
            {stakedTokens.length > 0 ? "Unstake & Claim" : "Claim"}
          </Button>
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

  const handleClaim = async (depositId: number) => {
    try {
      const response = await api.get_action_ids_by_deposit_id(
        account,
        depositId
      );
      const actionIds = response.map((x) => x.StakeActionId);
      if (stakedTokens.length > 0) {
        await stakingContract.unstakeMany(actionIds).then((tx) => tx.wait());
        fetchData(owner, false);
      }
      const res = await stakingContract
        .claimManyRewards(
          actionIds,
          new Array(actionIds.length).fill(depositId)
        )
        .then((tx) => tx.wait());
      console.log(res);
      fetchData(owner, false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimAll = async () => {
    let actionIds = [],
      depositIds = [];
    for (const element of list) {
      const depositId = element.DepositId;
      const response = await api.get_action_ids_by_deposit_id(
        account,
        depositId
      );
      const ids = response.map((x) => x.StakeActionId);
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
        <Table>
          <colgroup>
            <col width="15%" />
            <col width="10%" />
            <col width="18%" />
            <col width="12%" />
            <col width="12%" />
            <col width="15%" />
            {account === owner && <col width="16%" />}
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell align="right">Deposit Amount</TableCell>
              <TableCell align="center">
                Total Staked Tokens by all the Users
              </TableCell>
              <TableCell align="right">Reward Per Token</TableCell>
              <TableCell align="right">Your Staked Tokens</TableCell>
              <TableCell align="right">Your Claimable Amount</TableCell>
              {account === owner && <TableCell></TableCell>}
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <UnclaimedStakingRewardsRow
                  row={row}
                  key={index}
                  owner={owner}
                  stakedTokens={stakedTokens}
                  handleClaim={() => handleClaim(row.DepositId)}
                />
              ))}
          </TableBody>
        </Table>
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
      {stakedTokens.length === 0 && list.length > 0 && (
        <Box display="flex" justifyContent="end" mt={1}>
          <Button variant="text" onClick={handleClaimAll}>
            Claim All
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

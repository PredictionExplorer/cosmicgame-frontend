import React, { useState } from "react";
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

const UnclaimedStakingRewardsRow = ({ row, handleClaim }) => {
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
      <TablePrimaryCell>
        <Button size="small" onClick={handleClaim}>
          Claim
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UnclaimedStakingRewardsTable = ({ list }) => {
  const { account } = useActiveWeb3React();
  const stakingContract = useStakingWalletContract();
  const perPage = 5;
  const [page, setPage] = useState(1);

  const handleClaim = async (depositId: number) => {
    try {
      const actionId = await api.get_action_id_by_deposit_id(
        account,
        depositId
      );
      const res = await stakingContract
        .claimReward(actionId, depositId)
        .then((tx) => tx.wait());
      console.log(res);
    } catch (err) {
      console.error(err);
      alert(err.data.message);
    }
  };
  const handleClaimAll = async () => {
    const promiseArray = list.map(async (x) => {
      const actionId = await api.get_action_id_by_deposit_id(
        account,
        x.DepositId
      );
      return actionId;
    });
    const actionIds = await Promise.all(promiseArray);
    const depositIds = list.map((x) => x.DepositId);
    try {
      const res = await stakingContract
        .claimManyRewards(actionIds, depositIds)
        .then((tx) => tx.wait());
      console.log(res);
    } catch (err) {
      console.error(err);
      alert(err.data.message);
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
            <col width="16%" />
            <col width="17%" />
            <col width="20%" />
            <col width="2%" />
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
              <TableCell></TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <UnclaimedStakingRewardsRow
                  row={row}
                  key={index}
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
      <Box display="flex" justifyContent="end" mt={1}>
        <Button size="small" onClick={handleClaimAll}>
          Claim All
        </Button>
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

import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import { UnclaimedStakingRewardsTable } from "../components/UnclaimedStakingRewardsTable";
import { CollectedStakingRewardsTable } from "../components/CollectedStakingRewardsTable";
import { StakingActionsTable } from "../components/StakingActionsTable";
import { CSTokensTable } from "../components/CSTokensTable";
import useStakingWalletContract from "../hooks/useStakingWalletContract";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import { STAKING_WALLET_ADDRESS } from "../config/app";
import { StakedTokensTable } from "../components/StakedTokensTable";

const MyStaking = () => {
  const { account } = useActiveWeb3React();
  const [loading, setLoading] = useState(false);
  const [unclaimedStakingRewards, setUnclaimedStakingRewards] = useState([]);
  const [collectedStakingRewards, setCollectedStakingRewards] = useState([]);
  const [stakingActions, setStakingActions] = useState([]);
  const [CSTokens, setCSTokens] = useState([]);
  const [stakedTokens, setStakedTokens] = useState([]);

  const stakingContract = useStakingWalletContract();
  const cosmicSignatureContract = useCosmicSignatureContract();

  const handleStake = async (tokenId: number) => {
    try {
      const isApprovedForAll = await cosmicSignatureContract.isApprovedForAll(
        account,
        STAKING_WALLET_ADDRESS
      );
      if (!isApprovedForAll) {
        await cosmicSignatureContract
          .setApprovalForAll(STAKING_WALLET_ADDRESS, true)
          .then((tx) => tx.wait());
      }
      const res = await stakingContract.stake(tokenId).then((tx) => tx.wait());
      console.log(res);
      fetchData(account);
    } catch (err) {
      console.error(err);
      if (err.data?.message) {
        alert(err.data.message);
      }
    }
  };
  const handleUnstake = async (actionId: number) => {
    try {
      const res = await stakingContract
        .unstake(actionId)
        .then((tx) => tx.wait());
      console.log(res);
      fetchData(account);
    } catch (err) {
      console.error(err);
      if (err.data?.message) {
        alert(err.data.message);
      }
    }
  };
  const fetchData = async (addr: string) => {
    setLoading(true);
    const unclaimedStakingRewards = await api.get_unclaimed_staking_rewards_by_user(
      addr
    );
    setUnclaimedStakingRewards(unclaimedStakingRewards);
    const collectedStakingRewards = await api.get_collected_staking_rewards_by_user(
      addr
    );
    setCollectedStakingRewards(collectedStakingRewards);
    const stakingActions = await api.get_staking_actions_by_user(addr);
    setStakingActions(stakingActions);
    const CSTokens = await api.get_cst_tokens_by_user(addr);
    setCSTokens(CSTokens);
    const staked = await api.get_staked_tokens_by_user(addr);
    setStakedTokens(staked);
    setLoading(false);
  };
  useEffect(() => {
    if (account) {
      fetchData(account);
    }
  }, [account]);
  return (
    <>
      <Head>
        <title>My Staking | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
          My Staking
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Unclaimed Staking Rewards
              </Typography>
              <UnclaimedStakingRewardsTable list={unclaimedStakingRewards} />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Collected Staking Rewards
              </Typography>
              <CollectedStakingRewardsTable list={collectedStakingRewards} />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Stake / Unstake Actions
              </Typography>
              <StakingActionsTable list={stakingActions} />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Tokens Available for Staking
              </Typography>
              <CSTokensTable list={CSTokens} handleStake={handleStake} />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Staked Tokens
              </Typography>
              <StakedTokensTable
                list={stakedTokens}
                handleUnstake={handleUnstake}
              />
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default MyStaking;

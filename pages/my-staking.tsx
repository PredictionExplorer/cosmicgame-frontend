import React, { useEffect, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
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
import { useStakedToken } from "../contexts/StakedTokenContext";
import { RWLKNFTTable } from "../components/RWLKNFTTable";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MyStaking = () => {
  const { account } = useActiveWeb3React();
  const nftContract = useRWLKNFTContract();
  const [loading, setLoading] = useState(false);
  const [unclaimedStakingRewards, setUnclaimedStakingRewards] = useState([]);
  const [collectedStakingRewards, setCollectedStakingRewards] = useState([]);
  const [stakingActions, setStakingActions] = useState([]);
  const [CSTokens, setCSTokens] = useState([]);
  const [rwlkTokens, setRwlkTokens] = useState([]);
  const [stakingTable, setStakingTable] = useState(0);
  const { data: stakedTokens, fetchData: fetchStakedToken } = useStakedToken();

  const stakingContract = useStakingWalletContract();
  const cosmicSignatureContract = useCosmicSignatureContract();

  const handleStake = async (tokenId: number, isRwalk: boolean) => {
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
      const res = await stakingContract
        .stake(tokenId, isRwalk)
        .then((tx) => tx.wait());
      console.log(res);
      setTimeout(() => {
        fetchData(account, false);
      }, 2000);
      return res;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const handleStakeMany = async (tokenIds: number[], isRwalks: boolean[]) => {
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
      const res = await stakingContract
        .stakeMany(tokenIds, isRwalks)
        .then((tx) => tx.wait());
      setTimeout(() => {
        fetchData(account, false);
      }, 2000);
      return res;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const handleUnstakeMany = async (actionIds: number[]) => {
    try {
      const res = await stakingContract
        .unstakeMany(actionIds)
        .then((tx) => tx.wait());
      setTimeout(() => {
        fetchData(account, false);
      }, 2000);
      return res;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const handleUnstake = async (actionId: number) => {
    try {
      const res = await stakingContract
        .unstake(actionId)
        .then((tx) => tx.wait());

      setTimeout(() => {
        fetchData(account, false);
      }, 2000);
      return res;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const handleTabChange = (_event, newValue) => {
    setStakingTable(newValue);
  };

  const fetchData = async (addr: string, reload: boolean = true) => {
    setLoading(reload);
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
    fetchStakedToken();

    const rwlkStaked = stakedTokens
      .filter((x) => x.IsRandomWalk)
      .map((x) => x.TokenInfo.TokenId);
    if (nftContract) {
      const tokens = await nftContract.walletOfOwner(account);
      const nftIds = tokens
        .map((t) => t.toNumber())
        .reverse()
        .filter((x) => !rwlkStaked.includes(x));
      setRwlkTokens(nftIds);
    }

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
        {!account ? (
          <Typography variant="subtitle1">
            Please login to Metamask to see your staking.
          </Typography>
        ) : loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Earned Staking Rewards
              </Typography>
              <UnclaimedStakingRewardsTable
                list={unclaimedStakingRewards}
                owner={account}
                fetchData={fetchData}
              />
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
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={stakingTable} onChange={handleTabChange}>
                  <Tab label={<Typography>CosmicSignature Token</Typography>} />
                  <Tab label={<Typography>RandomWalk Token</Typography>} />
                </Tabs>
              </Box>
              <CustomTabPanel value={stakingTable} index={0}>
                <CSTokensTable
                  list={CSTokens}
                  handleStake={handleStake}
                  handleStakeMany={handleStakeMany}
                />
              </CustomTabPanel>
              <CustomTabPanel value={stakingTable} index={1}>
                <RWLKNFTTable
                  list={rwlkTokens}
                  handleStake={handleStake}
                  handleStakeMany={handleStakeMany}
                />
              </CustomTabPanel>
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Staked Tokens
              </Typography>
              <StakedTokensTable
                list={stakedTokens}
                handleUnstake={handleUnstake}
                handleUnstakeMany={handleUnstakeMany}
              />
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default MyStaking;

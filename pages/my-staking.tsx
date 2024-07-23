import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import { UnclaimedStakingRewardsTable } from "../components/UnclaimedStakingRewardsTable";
import { CollectedStakingRewardsTable } from "../components/CollectedStakingRewardsTable";
import { StakingActionsTable } from "../components/StakingActionsTable";
import { CSTokensTable } from "../components/CSTokensTable";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import useStakingWalletRWLKContract from "../hooks/useStakingWalletRWLKContract";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from "../config/app";
import { StakedTokensTable } from "../components/StakedTokensTable";
import { useStakedToken } from "../contexts/StakedTokenContext";
import { RWLKNFTTable } from "../components/RWLKNFTTable";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { StakingRewardMintsTable } from "../components/StakingRewardMintsTable";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import { formatSeconds } from "../utils";
import { ethers } from "ethers";
import getErrorMessage from "../utils/alert";
import { useNotification } from "../contexts/NotificationContext";
import { GetServerSideProps } from "next";

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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [unclaimedStakingRewards, setUnclaimedStakingRewards] = useState([]);
  const [collectedStakingRewards, setCollectedStakingRewards] = useState([]);
  const [stakingCSTActions, setStakingCSTActions] = useState([]);
  const [stakingRWLKActions, setStakingRWLKActions] = useState([]);
  const [CSTokens, setCSTokens] = useState([]);
  const [rwlkTokens, setRwlkTokens] = useState([]);
  const [rwlkMints, setRwlkMints] = useState([]);
  const [cstMints, setCSTMints] = useState([]);
  const [stakingPeriod, setStakingPeriod] = useState(0);
  const [rewardPerCST, setRewardPerCST] = useState(0);
  const [stakingTable, setStakingTable] = useState(0);
  const {
    cstokens: stakedCSTokens,
    rwlktokens: stakedRWLKTokens,
    fetchData: fetchStakedTokens,
  } = useStakedToken();
  const cstStakingContract = useStakingWalletCSTContract();
  const rwlkStakingContract = useStakingWalletRWLKContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cosmicGameContract = useCosmicGameContract();
  const { setNotification } = useNotification();

  const handleStake = async (tokenId: number, isRwalk: boolean) => {
    const contract = isRwalk ? rwalkContract : cosmicSignatureContract;
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    const STAKING_WALLET_ADDRESS = isRwalk
      ? STAKING_WALLET_RWLK_ADDRESS
      : STAKING_WALLET_CST_ADDRESS;
    try {
      const isApprovedForAll = await contract.isApprovedForAll(
        account,
        STAKING_WALLET_ADDRESS
      );
      if (!isApprovedForAll) {
        await contract
          .setApprovalForAll(STAKING_WALLET_ADDRESS, true)
          .then((tx) => tx.wait());
      }
      const res = await stakingContract.stake(tokenId).then((tx) => tx.wait());
      console.log(res);
      if (!res.code) {
        setNotification({
          visible: true,
          text: `You have successfully staked token ${tokenId}!`,
          type: "success",
        });
      }
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      console.error(err);
      return err;
    }
  };

  const handleStakeMany = async (tokenIds: number[], isRwalk: boolean) => {
    const contract = isRwalk ? rwalkContract : cosmicSignatureContract;
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    const STAKING_WALLET_ADDRESS = isRwalk
      ? STAKING_WALLET_RWLK_ADDRESS
      : STAKING_WALLET_CST_ADDRESS;
    try {
      const isApprovedForAll = await contract.isApprovedForAll(
        account,
        STAKING_WALLET_ADDRESS
      );
      if (!isApprovedForAll) {
        await contract
          .setApprovalForAll(STAKING_WALLET_ADDRESS, true)
          .then((tx) => tx.wait());
      }
      const res = await stakingContract
        .stakeMany(tokenIds)
        .then((tx) => tx.wait());
      console.log(res);
      if (!res.code) {
        setNotification({
          visible: true,
          text: "The selected tokens were staked successfully!",
          type: "success",
        });
      }
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      console.error(err);
      return err;
    }
  };

  const handleUnstakeMany = async (actionIds: number[], isRwalk: boolean) => {
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    try {
      const res = await stakingContract
        .unstakeMany(actionIds)
        .then((tx) => tx.wait());
      console.log(res);
      if (!res.code) {
        setNotification({
          visible: true,
          text: "The selected tokens were unstaked successfully!",
          type: "success",
        });
      }
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      console.error(err);
      return err;
    }
  };

  const handleUnstake = async (actionId: number, isRwalk: boolean) => {
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    try {
      const res = await stakingContract
        .unstake(actionId)
        .then((tx) => tx.wait());
      console.log(res);
      if (!res.code) {
        setNotification({
          visible: true,
          text: `You have successfully unstaked token!`,
          type: "success",
        });
      }
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      console.error(err);
      return err;
    }
  };

  const handleTabChange = (_event, newValue) => {
    setStakingTable(newValue);
  };

  const fetchData = async () => {
    const data = await api.get_dashboard_info();
    setData(data);
    const activationTime = await cosmicGameContract.activationTime();
    const timestamp = await api.get_current_time();
    setStakingPeriod(timestamp - Number(activationTime));
    const stakingAmount = await cosmicGameContract.stakingAmount();
    setRewardPerCST(
      Number(ethers.utils.formatEther(stakingAmount)) /
        data?.MainStats.StakeStatisticsCST.TotalTokensStaked
    );
  };

  const fetchCSTData = async (addr: string, reload: boolean = true) => {
    setLoading(reload);
    const unclaimedStakingRewards = await api.get_unclaimed_staking_rewards_by_user(
      addr
    );
    setUnclaimedStakingRewards(unclaimedStakingRewards);
    const collectedStakingRewards = await api.get_collected_staking_rewards_by_user(
      addr
    );
    setCollectedStakingRewards(collectedStakingRewards);
    const stakingActions = await api.get_staking_cst_actions_by_user(addr);
    setStakingCSTActions(stakingActions);
    const CSTokens = await api.get_cst_tokens_by_user(addr);
    setCSTokens(CSTokens);
    const mints = await api.get_staking_cst_mints_by_user(addr);
    setCSTMints(mints);
    fetchStakedTokens();
    setLoading(false);
  };

  const fetchRWLKData = async (addr: string) => {
    const stakingActions = await api.get_staking_rwalk_actions_by_user(addr);
    setStakingRWLKActions(stakingActions);
    const mints = await api.get_staking_rwalk_mints_by_user(addr);
    setRwlkMints(mints);
    fetchStakedTokens();
    const rwlkStaked = stakedRWLKTokens.map((x) => x.StakedTokenId);
    const tokens = await nftContract.walletOfOwner(account);
    const nftIds = tokens
      .map((t) => t.toNumber())
      .sort()
      .filter((x) => !rwlkStaked.includes(x));
    setRwlkTokens(nftIds);
  };

  useEffect(() => {
    if (account && nftContract && cosmicGameContract) {
      fetchCSTData(account);
      fetchRWLKData(account);
      fetchData();
    }
  }, [account, nftContract, cosmicGameContract]);

  return (
    <>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
          mb={8}
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
            <Box sx={{ display: "flex" }}>
              <Typography variant="subtitle1" mr={1}>
                Staking period:
              </Typography>
              <Typography variant="subtitle1">
                {formatSeconds(stakingPeriod)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex" }}>
              <Typography variant="subtitle1" mr={1}>
                Number of staked CST tokens:
              </Typography>
              <Typography variant="subtitle1">
                {data?.MainStats.StakeStatisticsCST.TotalTokensStaked}
              </Typography>
            </Box>
            <Box sx={{ display: "flex" }}>
              <Typography variant="subtitle1" mr={1}>
                Number of staked RandomWalk tokens:
              </Typography>
              <Typography variant="subtitle1">
                {data?.MainStats.StakeStatisticsRWalk.TotalTokensStaked}
              </Typography>
            </Box>
            <Box sx={{ display: "flex" }}>
              <Typography variant="subtitle1" mr={1}>
                Reward (as of now) for staking 1 CST token:
              </Typography>
              <Typography variant="subtitle1">
                {rewardPerCST.toFixed(6)}
              </Typography>
            </Box>
            <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                variant="fullWidth"
                value={stakingTable}
                onChange={handleTabChange}
              >
                <Tab
                  label={
                    <Box sx={{ display: "flex" }}>
                      <Image
                        src={"/images/CosmicSignatureNFT.png"}
                        width={60}
                        height={60}
                        alt="cosmic signature nft"
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          whiteSpace: "nowrap",
                          textTransform: "none",
                          ml: 2,
                        }}
                      >
                        Cosmic Signature Staking
                      </Typography>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex" }}>
                      <Image
                        src={"/images/rwalk.jpg"}
                        width={94}
                        height={60}
                        alt="RandomWalk nft"
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          whiteSpace: "nowrap",
                          textTransform: "none",
                          ml: 2,
                        }}
                      >
                        Random Walk Staking
                      </Typography>
                    </Box>
                  }
                />
              </Tabs>
            </Box>
            <CustomTabPanel value={stakingTable} index={0}>
              <Box>
                <Typography variant="h6" lineHeight={1} mb={2}>
                  Earned Staking Rewards
                </Typography>
                <UnclaimedStakingRewardsTable
                  list={unclaimedStakingRewards}
                  owner={account}
                  fetchData={fetchCSTData}
                />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Collected Staking Deposits
                </Typography>
                <CollectedStakingRewardsTable
                  list={collectedStakingRewards}
                  owner={account}
                />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Staking Reward Tokens
                </Typography>
                <StakingRewardMintsTable list={cstMints} />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Stake / Unstake Actions
                </Typography>
                <StakingActionsTable list={stakingCSTActions} IsRwalk={false} />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Tokens Available for Staking
                </Typography>
                <CSTokensTable
                  list={CSTokens}
                  handleStake={handleStake}
                  handleStakeMany={handleStakeMany}
                />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Staked Tokens
                </Typography>
                <StakedTokensTable
                  list={stakedCSTokens}
                  handleUnstake={handleUnstake}
                  handleUnstakeMany={handleUnstakeMany}
                  IsRwalk={false}
                />
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={stakingTable} index={1}>
              <Box>
                <Typography variant="h6" lineHeight={1} mb={2}>
                  Staking Reward Tokens
                </Typography>
                <StakingRewardMintsTable list={rwlkMints} />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Stake / Unstake Actions
                </Typography>
                <StakingActionsTable list={stakingRWLKActions} IsRwalk={true} />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Tokens Available for Staking
                </Typography>
                <RWLKNFTTable
                  list={rwlkTokens}
                  handleStake={handleStake}
                  handleStakeMany={handleStakeMany}
                />
              </Box>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                  Staked Tokens
                </Typography>
                <StakedTokensTable
                  list={stakedRWLKTokens}
                  handleUnstake={handleUnstake}
                  handleUnstakeMany={handleUnstakeMany}
                  IsRwalk={true}
                />
              </Box>
            </CustomTabPanel>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "My Staking | Cosmic Signature";
  const description =
    "Manage your staking with Cosmic Signature. View your staking status, rewards, and history. Maximize your earnings and participate in the growth of our blockchain ecosystem with ease.";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default MyStaking;

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import Head from "next/head";
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
  const [stakingCSTActions, setStakingCSTActions] = useState([]);
  const [stakingRWLKActions, setStakingRWLKActions] = useState([]);
  const [CSTokens, setCSTokens] = useState([]);
  const [rwlkTokens, setRwlkTokens] = useState([]);
  const [rwlkMints, setRwlkMints] = useState([]);
  const [cstMints, setCSTMints] = useState([]);
  const [stakingTable, setStakingTable] = useState(0);
  const {
    cstokens: stakedCSTokens,
    rwlktokens: stakedRWLKTokens,
    fetchData: fetchStakedTokens,
  } = useStakedToken();
  const cstStakingContract = useStakingWalletCSTContract();
  const rwlkStakingContract = useStakingWalletRWLKContract();
  const cosmicSignatureContract = useCosmicSignatureContract();

  const handleStake = async (tokenId: number, isRwalk: boolean) => {
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    const STAKING_WALLET_ADDRESS = isRwalk
      ? STAKING_WALLET_RWLK_ADDRESS
      : STAKING_WALLET_CST_ADDRESS;
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
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const handleStakeMany = async (tokenIds: number[], isRwalk: boolean) => {
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    const STAKING_WALLET_ADDRESS = isRwalk
      ? STAKING_WALLET_RWLK_ADDRESS
      : STAKING_WALLET_CST_ADDRESS;
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
        .stakeMany(tokenIds)
        .then((tx) => tx.wait());
      console.log(res);
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
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
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
      }, 2000);
      return res;
    } catch (err) {
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
      setTimeout(() => {
        if (isRwalk) {
          fetchRWLKData(account);
        } else {
          fetchCSTData(account, false);
        }
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
    if (account && nftContract) {
      fetchCSTData(account);
      fetchRWLKData(account);
    }
  }, [account, nftContract]);

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
                <CollectedStakingRewardsTable list={collectedStakingRewards} />
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

export default MyStaking;

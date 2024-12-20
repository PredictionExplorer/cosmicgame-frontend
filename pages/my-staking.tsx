import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
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
import { ethers } from "ethers";
import getErrorMessage from "../utils/alert";
import { useNotification } from "../contexts/NotificationContext";
import { GetServerSideProps } from "next";
import StakingActionsTable from "../components/StakingActionsTable";
import { StakingRewardsTable } from "../components/StakingRewardsTable";

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
  const [stakingCSTActions, setStakingCSTActions] = useState([]);
  const [stakingRWLKActions, setStakingRWLKActions] = useState([]);
  const [CSTokens, setCSTokens] = useState([]);
  const [rwlkTokens, setRwlkTokens] = useState([]);
  const [rwlkMints, setRwlkMints] = useState([]);
  const [stakingRewards, setStakingRewards] = useState([]);
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

  const approveIfNeeded = async (contract, account, stakingWalletAddress) => {
    const isApprovedForAll = await contract.isApprovedForAll(
      account,
      stakingWalletAddress
    );
    if (!isApprovedForAll) {
      await contract
        .setApprovalForAll(stakingWalletAddress, true)
        .then((tx) => tx.wait());
    }
  };

  const handleError = (err) => {
    if (err?.data?.message) {
      const msg = getErrorMessage(err?.data?.message);
      setNotification({ text: msg, type: "error", visible: true });
    }
    console.error(err);
  };

  const handleStakeAction = async (
    tokenIds: number | number[],
    isRwalk: boolean
  ) => {
    const contract = isRwalk ? rwalkContract : cosmicSignatureContract;
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    const STAKING_WALLET_ADDRESS = isRwalk
      ? STAKING_WALLET_RWLK_ADDRESS
      : STAKING_WALLET_CST_ADDRESS;
    try {
      await approveIfNeeded(contract, account, STAKING_WALLET_ADDRESS);

      const res = Array.isArray(tokenIds)
        ? await stakingContract.stakeMany(tokenIds).then((tx) => tx.wait())
        : await stakingContract.stake(tokenIds).then((tx) => tx.wait());

      if (!res.code) {
        setNotification({
          visible: true,
          text: Array.isArray(tokenIds)
            ? "The selected tokens were staked successfully!"
            : `You have successfully staked token ${tokenIds}!`,
          type: "success",
        });
      }
      if (isRwalk) {
        await fetchRWLKData(account);
      } else {
        await fetchCSTData(account, false);
      }
      return res;
    } catch (err) {
      handleError(err);
      return err;
    }
  };

  async function findMaxLimit(contract, actionIds) {
    let numEthDepositsToEvaluateMaxLimit = 2;
    let limit = 100000; // Arbitrary upper limit, can be adjusted as needed
    // Binary search loop to find the maximum valid numEthDepositsToEvaluateMaxLimit
    while (limit > numEthDepositsToEvaluateMaxLimit) {
      const result = Array.isArray(actionIds)
        ? await contract.callStatic.unstakeMany(
            actionIds,
            numEthDepositsToEvaluateMaxLimit
          )
        : await contract.callStatic.unstake(
            actionIds,
            numEthDepositsToEvaluateMaxLimit
          );

      if (result !== null) {
        return numEthDepositsToEvaluateMaxLimit;
      } else {
        numEthDepositsToEvaluateMaxLimit *= 2;
      }
    }

    console.log("Found max limit:", numEthDepositsToEvaluateMaxLimit);
    return numEthDepositsToEvaluateMaxLimit;
  }

  const handleUnstakeAction = async (
    actionIds: number | number[],
    isRwalk: boolean
  ) => {
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;
    const numEthDepositsToEvaluateMaxLimit = await findMaxLimit(
      stakingContract,
      actionIds
    );

    try {
      const res = Array.isArray(actionIds)
        ? await stakingContract
            .unstakeMany(actionIds, numEthDepositsToEvaluateMaxLimit)
            .then((tx) => tx.wait())
        : await stakingContract
            .unstake(actionIds, numEthDepositsToEvaluateMaxLimit)
            .then((tx) => tx.wait());

      if (!res.code) {
        setNotification({
          visible: true,
          text: Array.isArray(actionIds)
            ? "The selected tokens were unstaked successfully!"
            : `You have successfully unstaked token!`,
          type: "success",
        });
      }
      if (isRwalk) {
        await fetchRWLKData(account);
      } else {
        await fetchCSTData(account, false);
      }
      return res;
    } catch (err) {
      handleError(err);
      return err;
    }
  };

  const handleTabChange = (_event, newValue) => {
    setStakingTable(newValue);
  };

  const fetchData = async () => {
    const data = await api.get_dashboard_info();
    setData(data);
    const stakingAmount = await cosmicGameContract.stakingAmount();
    const totalStakedCST =
      data?.MainStats.StakeStatisticsCST.TotalTokensStaked || 0;
    if (totalStakedCST > 0) {
      setRewardPerCST(
        Number(ethers.utils.formatEther(stakingAmount)) / totalStakedCST
      );
    } else {
      setRewardPerCST(0);
    }
  };

  const fetchCSTData = async (addr: string, reload: boolean = true) => {
    if (reload) setLoading(true);
    const [stakingActions, tokens, stakingRewards] = await Promise.all([
      api.get_staking_cst_actions_by_user(addr),
      api.get_cst_tokens_by_user(addr),
      api.get_staking_rewards_by_user(addr),
    ]);
    setStakingCSTActions(stakingActions);
    setCSTokens(tokens.filter((x) => !x.WasUnstaked));
    setStakingRewards(stakingRewards);
    fetchStakedTokens();
    setLoading(false);
  };

  const fetchRWLKData = async (addr: string) => {
    const [stakingActions, mints] = await Promise.all([
      api.get_staking_rwalk_actions_by_user(addr),
      api.get_staking_rwalk_mints_by_user(addr),
    ]);

    setStakingRWLKActions(stakingActions);
    setRwlkMints(mints);
    fetchStakedTokens();

    const rwlkStaked = stakedRWLKTokens.map((x) => x.StakedTokenId);
    const tokens = await nftContract.walletOfOwner(account);
    const nftIds = tokens
      .map((t) => t.toNumber())
      .sort()
      .filter(
        (x) =>
          !rwlkStaked.includes(x) &&
          !stakingActions.some(
            (action) => action.ActionType !== 1 && action.TokenId === x
          )
      );
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
              Number of globally staked CST tokens:
            </Typography>
            <Typography variant="subtitle1">
              {data?.MainStats.StakeStatisticsCST.TotalTokensStaked}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Typography variant="subtitle1" mr={1}>
              Number of globally staked RandomWalk tokens:
            </Typography>
            <Typography variant="subtitle1">
              {data?.MainStats.StakeStatisticsRWalk.TotalTokensStaked}
            </Typography>
          </Box>
          {rewardPerCST > 0 && (
            <Box sx={{ display: "flex" }}>
              <Typography variant="subtitle1" mr={1}>
                Reward (as of now) for staking 1 CST token:
              </Typography>
              <Typography variant="subtitle1">
                {rewardPerCST.toFixed(6)}
              </Typography>
            </Box>
          )}
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
                Staking Rewards
              </Typography>
              <StakingRewardsTable list={stakingRewards} address={account} />
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
                handleStake={(tokenId) => handleStakeAction(tokenId, false)}
                handleStakeMany={(tokenIds) =>
                  handleStakeAction(tokenIds, false)
                }
              />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Staked Tokens
              </Typography>
              <StakedTokensTable
                list={stakedCSTokens}
                handleUnstake={(actionId) =>
                  handleUnstakeAction(actionId, false)
                }
                handleUnstakeMany={(actionIds) =>
                  handleUnstakeAction(actionIds, false)
                }
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
                handleStake={(tokenId) => handleStakeAction(tokenId, true)}
                handleStakeMany={(tokenIds) =>
                  handleStakeAction(tokenIds, true)
                }
              />
            </Box>
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Staked Tokens
              </Typography>
              <StakedTokensTable
                list={stakedRWLKTokens}
                handleUnstake={(actionId) =>
                  handleUnstakeAction(actionId, true)
                }
                handleUnstakeMany={(actionIds) =>
                  handleUnstakeAction(actionIds, true)
                }
                IsRwalk={true}
              />
            </Box>
          </CustomTabPanel>
        </>
      )}
    </MainWrapper>
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

// Removed unclaimed staking rewards and collected staking rewards tables

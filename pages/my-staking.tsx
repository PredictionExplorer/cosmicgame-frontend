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
import { getAssetsUrl } from "../utils";

// ----------------------------------------------
// Types & Interfaces
// ----------------------------------------------
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ----------------------------------------------
// Components
// ----------------------------------------------

// This component conditionally renders its children only if `value` matches `index`
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

/**
 * The main MyStaking component manages all staking-related data for
 * both CosmicSignature (CST) and RandomWalk (RWLK) tokens.
 * Users can stake, unstake, view staked tokens, and see their rewards.
 */
const MyStaking = () => {
  // ----------------------------------------------
  // Hooks & State
  // ----------------------------------------------
  const { account } = useActiveWeb3React(); // Provides active account
  const { setNotification } = useNotification(); // Manages global notifications

  // Smart contract hooks
  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cstStakingContract = useStakingWalletCSTContract();
  const rwlkStakingContract = useStakingWalletRWLKContract();
  const cosmicGameContract = useCosmicGameContract();

  // Global and user-specific staking data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rewardPerCST, setRewardPerCST] = useState(0);

  // Loading state
  const [loading, setLoading] = useState(true);

  // CST staking
  const [stakingCSTActions, setStakingCSTActions] = useState<any[]>([]);
  const [CSTokens, setCSTokens] = useState<any[]>([]);
  const [stakingRewards, setStakingRewards] = useState<any[]>([]);

  // RWLK staking
  const [stakingRWLKActions, setStakingRWLKActions] = useState<any[]>([]);
  const [rwlkTokens, setRwlkTokens] = useState<any[]>([]);
  const [rwlkMints, setRwlkMints] = useState<any[]>([]);

  // Tab management
  const [stakingTab, setStakingTab] = useState(0);

  // Staked tokens from context
  const {
    cstokens: stakedCSTokens,
    rwlktokens: stakedRWLKTokens,
    fetchData: fetchStakedTokens,
  } = useStakedToken();

  // ----------------------------------------------
  // Helper Functions
  // ----------------------------------------------

  /**
   * If needed, gives approval for the staking contract to manage user's NFTs.
   * This is required only once if the user hasn't previously approved.
   */
  const approveIfNeeded = async (
    contract: any,
    accountAddress: string,
    stakingWalletAddress: string
  ) => {
    const isApprovedForAll = await contract.isApprovedForAll(
      accountAddress,
      stakingWalletAddress
    );
    if (!isApprovedForAll) {
      // Approve the staking contract for all tokens
      const tx = await contract.setApprovalForAll(stakingWalletAddress, true);
      await tx.wait();
    }
  };

  /**
   * Generic error handler that shows a notification with
   * a human-readable error message.
   */
  const handleError = (err: any) => {
    if (err?.data?.message) {
      const msg = getErrorMessage(err?.data?.message);
      setNotification({ text: msg, type: "error", visible: true });
    }
    console.error(err);
  };

  /**
   * Stakes one or multiple tokens (CST or RWLK).
   * Approves the contract if necessary, then calls the staking functions.
   */
  const handleStakeAction = async (
    tokenIds: number | number[],
    isRwalk: boolean
  ) => {
    try {
      // Identify which contracts to use based on isRwalk
      const contract = isRwalk ? rwalkContract : cosmicSignatureContract;
      const stakingContract = isRwalk
        ? rwlkStakingContract
        : cstStakingContract;
      const STAKING_WALLET_ADDRESS = isRwalk
        ? STAKING_WALLET_RWLK_ADDRESS
        : STAKING_WALLET_CST_ADDRESS;

      // Ensure approval before staking
      await approveIfNeeded(contract, account!, STAKING_WALLET_ADDRESS);

      // Stake either a single token or multiple tokens
      let res;
      if (Array.isArray(tokenIds)) {
        res = await stakingContract
          .stakeMany(tokenIds)
          .then((tx: any) => tx.wait());
      } else {
        res = await stakingContract
          .stake(tokenIds)
          .then((tx: any) => tx.wait());
      }

      // If successful, show success notification
      if (!res.code) {
        setNotification({
          visible: true,
          text: Array.isArray(tokenIds)
            ? "The selected tokens were staked successfully!"
            : `You have successfully staked token ${tokenIds}!`,
          type: "success",
        });
      }

      // Refresh data based on type (CST or RWLK)
      if (isRwalk) {
        await fetchRWLKUserData(account!);
      } else {
        await fetchCSTUserData(account!, false);
      }

      return res;
    } catch (err) {
      handleError(err);
      return err;
    }
  };

  /**
   * Attempts to find the maximum limit for numEthDepositsToEvaluateMaxLimit
   * by gradually increasing it until the contract call fails or an upper
   * bound is reached.
   *
   * This helps handle scenarios where unstaking might need to account
   * for multiple deposits with different reward calculations.
   */
  async function findMaxLimit(contract: any, actionIds: number | number[]) {
    let numEthDepositsToEvaluateMaxLimit = 2;
    let limit = 100000; // An arbitrary upper limit

    // Exponential approach: double the threshold until contract call fails or we exceed our limit
    while (limit > numEthDepositsToEvaluateMaxLimit) {
      let result;
      try {
        if (Array.isArray(actionIds)) {
          result = await contract.callStatic.unstakeMany(
            actionIds,
            numEthDepositsToEvaluateMaxLimit
          );
        } else {
          result = await contract.callStatic.unstake(
            actionIds,
            numEthDepositsToEvaluateMaxLimit
          );
        }
      } catch {
        result = null;
      }

      if (result !== null) {
        // If it succeeds, we've found a valid limit
        return numEthDepositsToEvaluateMaxLimit;
      } else {
        // Otherwise, double the limit and try again
        numEthDepositsToEvaluateMaxLimit *= 2;
      }
    }

    console.log("Found max limit:", numEthDepositsToEvaluateMaxLimit);
    return numEthDepositsToEvaluateMaxLimit;
  }

  /**
   * Unstakes one or multiple tokens (CST or RWLK).
   * Dynamically finds an appropriate limit to handle multiple deposits
   * and calls the contract to unstake the tokens.
   */
  const handleUnstakeAction = async (
    actionIds: number | number[],
    isRwalk: boolean
  ) => {
    // Identify which staking contract we should use
    const stakingContract = isRwalk ? rwlkStakingContract : cstStakingContract;

    // Determine the maximum limit for depositing ETH from the stake
    const numEthDepositsToEvaluateMaxLimit = await findMaxLimit(
      stakingContract,
      actionIds
    );

    try {
      // Unstake either a single token or multiple tokens
      let res;
      if (Array.isArray(actionIds)) {
        res = await stakingContract
          .unstakeMany(actionIds, numEthDepositsToEvaluateMaxLimit)
          .then((tx: any) => tx.wait());
      } else {
        res = await stakingContract
          .unstake(actionIds, numEthDepositsToEvaluateMaxLimit)
          .then((tx: any) => tx.wait());
      }

      // If successful, show success notification
      if (!res.code) {
        setNotification({
          visible: true,
          text: Array.isArray(actionIds)
            ? "The selected tokens were unstaked successfully!"
            : `You have successfully unstaked token!`,
          type: "success",
        });
      }

      // Refresh data
      if (isRwalk) {
        await fetchRWLKUserData(account!);
      } else {
        await fetchCSTUserData(account!, false);
      }

      return res;
    } catch (err) {
      handleError(err);
      return err;
    }
  };

  /**
   * Retrieves general dashboard data (e.g., total staked tokens),
   * calculates the reward per staked CST token,
   * and updates state accordingly.
   */
  const fetchDashboardData = async () => {
    const data = await api.get_dashboard_info();
    setDashboardData(data);

    // The total staking reward (ETH) placed into the pool
    const stakingAmount = await cosmicGameContract.stakingAmount();
    const totalStakedCST =
      data?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;

    // If there are any CST tokens staked, compute reward per token
    if (totalStakedCST > 0) {
      const rewardCST =
        Number(ethers.utils.formatEther(stakingAmount)) / totalStakedCST;
      setRewardPerCST(rewardCST);
    } else {
      setRewardPerCST(0);
    }
  };

  /**
   * Fetches CST user-specific data including:
   * - Staking actions (stake/unstake history)
   * - Current CST tokens owned by the user (un-staked)
   * - Staking rewards earned
   */
  const fetchCSTUserData = async (addr: string, reload: boolean = true) => {
    if (reload) setLoading(true);

    // Fetch data in parallel
    const [cstActions, cstUserTokens, cstRewards] = await Promise.all([
      api.get_staking_cst_actions_by_user(addr),
      api.get_cst_tokens_by_user(addr),
      api.get_staking_rewards_by_user(addr),
    ]);

    // Store data in state
    setStakingCSTActions(cstActions);
    setCSTokens(cstUserTokens.filter((x: any) => !x.WasUnstaked));
    setStakingRewards(cstRewards);

    // Refresh staked token context
    fetchStakedTokens();
    setLoading(false);
  };

  /**
   * Fetches RWLK user-specific data including:
   * - Staking actions (stake/unstake history)
   * - RandomWalk NFT tokens owned by the user (un-staked)
   * - Minted reward tokens from staking
   */
  const fetchRWLKUserData = async (addr: string) => {
    // Fetch data in parallel
    const [rwalkActions, rwalkMintEvents] = await Promise.all([
      api.get_staking_rwalk_actions_by_user(addr),
      api.get_staking_rwalk_mints_by_user(addr),
    ]);

    // Set results in local state
    setStakingRWLKActions(rwalkActions);
    setRwlkMints(rwalkMintEvents);

    // Refresh staked token context
    fetchStakedTokens();

    // Identify RWLK tokens the user owns but has not staked yet
    const rwlkStakedIds = stakedRWLKTokens.map((x) => x.StakedTokenId);
    const userOwnedTokenIds = await rwalkContract.walletOfOwner(account!);
    const rawIds = userOwnedTokenIds.map((t: any) => t.toNumber()).sort();

    // Filter out tokens that are already staked or in some unstaked action
    const filteredIds = rawIds.filter(
      (x) =>
        !rwlkStakedIds.includes(x) &&
        !rwalkActions.some(
          (action: any) => action.ActionType !== 1 && action.TokenId === x
        )
    );

    setRwlkTokens(filteredIds);
  };

  /**
   * Handler for changing the staking tab:
   * 0 -> CST Staking, 1 -> RWLK Staking
   */
  const handleTabChange = (_event: any, newValue: number) => {
    setStakingTab(newValue);
  };

  // ----------------------------------------------
  // Lifecycle: Fetch data on component mount
  // ----------------------------------------------
  useEffect(() => {
    if (account && rwalkContract && cosmicGameContract) {
      // Fetch both global (dashboard) and user-specific data
      fetchCSTUserData(account);
      fetchRWLKUserData(account);
      fetchDashboardData();
    }
  }, [account, rwalkContract, cosmicGameContract]);

  // ----------------------------------------------
  // Render
  // ----------------------------------------------
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

      {/* If there's no connected account, prompt user to connect */}
      {!account ? (
        <Typography variant="subtitle1">
          Please login to Metamask to see your staking.
        </Typography>
      ) : loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          {/* Global staking statistics (CST and RWLK) */}
          <Box sx={{ display: "flex" }}>
            <Typography variant="subtitle1" mr={1}>
              Number of globally staked CST tokens:
            </Typography>
            <Typography variant="subtitle1">
              {dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Typography variant="subtitle1" mr={1}>
              Number of globally staked RandomWalk tokens:
            </Typography>
            <Typography variant="subtitle1">
              {
                dashboardData?.MainStats?.StakeStatisticsRWalk
                  ?.TotalTokensStaked
              }
            </Typography>
          </Box>

          {/* Show reward per staked CST token, if available */}
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

          {/* Tabs for switching between CST Staking and Random Walk Staking */}
          <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="fullWidth"
              value={stakingTab}
              onChange={handleTabChange}
            >
              <Tab
                label={
                  <Box sx={{ display: "flex" }}>
                    <Image
                      src={"/images/CosmicSignatureNFT.png"}
                      width={94}
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

          {/* 
            TAB #1: CST (Cosmic Signature) Staking
          */}
          <CustomTabPanel value={stakingTab} index={0}>
            {/* CST Rewards */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mb={2}>
                Staking Rewards by Token
              </Typography>
              <StakingRewardsTable list={stakingRewards} address={account!} />
            </Box>

            {/* CST Staking / Unstaking Action History */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
                Stake / Unstake Actions
              </Typography>
              <StakingActionsTable list={stakingCSTActions} IsRwalk={false} />
            </Box>

            {/* CST Tokens currently owned by user and available for staking */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
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

            {/* CST Tokens already staked by the user */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
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

          {/* 
            TAB #2: RWLK (RandomWalk) Staking
          */}
          <CustomTabPanel value={stakingTab} index={1}>
            {/* RWLK Reward Tokens (minted from staking) */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mb={2}>
                Staking Reward Tokens
              </Typography>
              <StakingRewardMintsTable list={rwlkMints} />
            </Box>

            {/* RWLK Staking / Unstaking Action History */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
                Stake / Unstake Actions
              </Typography>
              <StakingActionsTable list={stakingRWLKActions} IsRwalk={true} />
            </Box>

            {/* RWLK Tokens currently owned by user and available for staking */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
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

            {/* RWLK Tokens already staked by the user */}
            <Box>
              <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
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

// ----------------------------------------------
// getServerSideProps for SEO & Open Graph Data
// ----------------------------------------------
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "My Staking | Cosmic Signature";
  const description =
    "Manage your staking with Cosmic Signature. View your staking status, rewards, and history. Maximize your earnings and participate in the growth of our blockchain ecosystem with ease.";
  const imageUrl = getAssetsUrl("cosmicsignature/logo.png");

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

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import useStakingWalletRWLKContract from "../hooks/useStakingWalletRWLKContract";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from "../config/app";
import { useStakedToken } from "../contexts/StakedTokenContext";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { useNotification } from "../contexts/NotificationContext";
import { GetServerSideProps } from "next";
import StakingActionsTable from "../components/StakingActionsTable";
import { StakingRewardsTable } from "../components/StakingRewardsTable";
import { StakedTokensTable } from "../components/StakedTokensTable";
import { RWLKNFTTable } from "../components/RWLKNFTTable";
import { RwalkStakingRewardMintsTable } from "../components/RwalkStakingRewardMintsTable";
import { CSTokensTable } from "../components/CSTokensTable";
import { logoImgUrl } from "../utils";
import getErrorMessage from "../utils/alert";

// ----------------------------------------------
// Types & Interfaces
// ----------------------------------------------
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ----------------------------------------------
// Sub-Components
// ----------------------------------------------

/** Renders content only if `value` matches `index`. */
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tab-panel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * CSTStakingPanel - Renders the CST-specific staking UI
 * (Rewards table, actions table, tokens available for staking, staked tokens).
 */
function CSTStakingPanel({
  account,
  stakingActions,
  userTokens,
  stakedTokens,
  stakingRewards,
  handleStake,
  handleStakeMany,
  handleUnstake,
  handleUnstakeMany,
}: {
  account: string;
  stakingActions: any[];
  userTokens: any[];
  stakedTokens: any[];
  stakingRewards: any[];
  handleStake: (tokenId: number) => Promise<any>;
  handleStakeMany: (tokenIds: number[]) => Promise<any>;
  handleUnstake: (actionId: number) => Promise<any>;
  handleUnstakeMany: (actionIds: number[]) => Promise<any>;
}) {
  return (
    <>
      {/* CST Rewards */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Staking Rewards by Token
        </Typography>
        <StakingRewardsTable list={stakingRewards} address={account} />
      </Box>

      {/* CST Staking / Unstaking Action History */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </Box>

      {/* CST Tokens Available for Staking */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
          Tokens Available for Staking
        </Typography>
        <CSTokensTable
          list={userTokens}
          handleStake={(tokenId) => handleStake(tokenId)}
          handleStakeMany={(tokenIds) => handleStakeMany(tokenIds)}
        />
      </Box>

      {/* CST Tokens Already Staked */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
          Staked Tokens
        </Typography>
        <StakedTokensTable
          list={stakedTokens}
          handleUnstake={(actionId) => handleUnstake(actionId)}
          handleUnstakeMany={(actionIds) => handleUnstakeMany(actionIds)}
          IsRwalk={false}
        />
      </Box>
    </>
  );
}

/**
 * RWLKStakingPanel - Renders the RWLK-specific staking UI
 * (Reward tokens, actions table, tokens available for staking, staked tokens).
 */
function RWLKStakingPanel({
  stakingActions,
  rwlkMints,
  userTokens,
  stakedTokens,
  handleStake,
  handleStakeMany,
  handleUnstake,
  handleUnstakeMany,
}: {
  stakingActions: any[];
  rwlkMints: any[];
  userTokens: number[]; // array of randomWalk token IDs
  stakedTokens: any[];
  handleStake: (tokenId: number) => Promise<any>;
  handleStakeMany: (tokenIds: number[]) => Promise<any>;
  handleUnstake: (actionId: number) => Promise<any>;
  handleUnstakeMany: (actionIds: number[]) => Promise<any>;
}) {
  return (
    <>
      {/* RWLK Reward Tokens (minted from staking) */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Staking Reward Tokens
        </Typography>
        <RwalkStakingRewardMintsTable list={rwlkMints} />
      </Box>

      {/* RWLK Staking / Unstaking Action History */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
      </Box>

      {/* RWLK Tokens Available for Staking */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
          Tokens Available for Staking
        </Typography>
        <RWLKNFTTable
          list={userTokens}
          handleStake={(tokenId) => handleStake(tokenId)}
          handleStakeMany={(tokenIds) => handleStakeMany(tokenIds)}
        />
      </Box>

      {/* RWLK Tokens Already Staked */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={8} mb={2}>
          Staked Tokens
        </Typography>
        <StakedTokensTable
          list={stakedTokens}
          handleUnstake={(actionId) => handleUnstake(actionId)}
          handleUnstakeMany={(actionIds) => handleUnstakeMany(actionIds)}
          IsRwalk={true}
        />
      </Box>
    </>
  );
}

// ----------------------------------------------
// Main Component
// ----------------------------------------------
const MyStaking = () => {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();

  // Contracts
  const cosmicSignatureContract = useCosmicSignatureContract();
  const rwalkContract = useRWLKNFTContract();
  const cstStakingContract = useStakingWalletCSTContract();
  const rwlkStakingContract = useStakingWalletRWLKContract();

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rewardPerCST, setRewardPerCST] = useState(0);

  // Loading state
  const [loading, setLoading] = useState(true);

  // CST data
  const [stakingCSTActions, setStakingCSTActions] = useState<any[]>([]);
  const [CSTokens, setCSTokens] = useState<any[]>([]);
  const [stakingRewards, setStakingRewards] = useState<any[]>([]);

  // RWLK data
  const [stakingRWLKActions, setStakingRWLKActions] = useState<any[]>([]);
  const [rwlkTokens, setRwlkTokens] = useState<number[]>([]);
  const [rwlkMints, setRwlkMints] = useState<any[]>([]);

  // Tabs
  const [stakingTab, setStakingTab] = useState(0);

  // Context (already-staked tokens)
  const {
    cstokens: stakedCSTokens,
    rwlktokens: stakedRWLKTokens,
    fetchData: fetchStakedTokens,
  } = useStakedToken();

  /* --------------------------------------------------
    Helpers
  -------------------------------------------------- */

  // Displays a user-friendly error notification
  const handleError = useCallback(
    (err: any) => {
      if (err?.data?.message) {
        const msg = getErrorMessage(err.data.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error(err);
        // Handle other errors
      }
    },
    [setNotification]
  );

  // Approves staking contract for all tokens if needed
  const approveIfNeeded = async (nftContract: any, walletAddress: string) => {
    if (!nftContract) {
      throw new Error("Contract not initialized");
    }
    const isApprovedForAll = await nftContract.isApprovedForAll(
      account,
      walletAddress
    );
    if (!isApprovedForAll) {
      const tx = await nftContract.setApprovalForAll(walletAddress, true);
      await tx.wait();
    }
  };

  // Generic stake function for CST or RWLK
  const handleStakeAction = useCallback(
    async (tokenIds: number | number[], isRwalk: boolean) => {
      try {
        const nftContract = isRwalk ? rwalkContract : cosmicSignatureContract;
        const stakingContract = isRwalk
          ? rwlkStakingContract
          : cstStakingContract;
        const STAKING_WALLET_ADDRESS = isRwalk
          ? STAKING_WALLET_RWLK_ADDRESS
          : STAKING_WALLET_CST_ADDRESS;

        // Check if contracts are initialized
        if (!nftContract || !stakingContract) {
          setNotification({
            visible: true,
            text: "Please connect your wallet and ensure you are on the correct network.",
            type: "error",
          });
          return;
        }

        // Approve if needed
        await approveIfNeeded(nftContract, STAKING_WALLET_ADDRESS);

        // Stake single or multiple
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

        setTimeout(async () => {
          // Refresh data
          if (isRwalk) {
            await fetchRWLKData(account!);
          } else {
            await fetchCSTData(account!);
          }
          await fetchDashboardData();

          // Show success notification
          if (!res.code) {
            setNotification({
              visible: true,
              text: Array.isArray(tokenIds)
                ? "The selected tokens were staked successfully!"
                : `You have successfully staked token ${tokenIds}!`,
              type: "success",
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    [
      account,
      handleError,
      rwalkContract,
      cosmicSignatureContract,
      rwlkStakingContract,
      cstStakingContract,
      setNotification,
    ]
  );

  // Generic unstake function for CST or RWLK
  const handleUnstakeAction = useCallback(
    async (actionIds: number | number[], isRwalk: boolean) => {
      try {
        const stakingContract = isRwalk
          ? rwlkStakingContract
          : cstStakingContract;

        // Check if contract is initialized
        if (!stakingContract) {
          setNotification({
            visible: true,
            text: "Please connect your wallet and ensure you are on the correct network.",
            type: "error",
          });
          return;
        }

        // Unstake single or multiple
        let res;
        if (Array.isArray(actionIds)) {
          res = await stakingContract
            .unstakeMany(actionIds)
            .then((tx: any) => tx.wait());
        } else {
          res = await stakingContract
            .unstake(actionIds)
            .then((tx: any) => tx.wait());
        }

        setTimeout(async () => {
          // Refresh data
          if (isRwalk) {
            await fetchRWLKData(account!);
          } else {
            await fetchCSTData(account!);
          }
          await fetchDashboardData();

          // Success notification
          if (!res.code) {
            setNotification({
              visible: true,
              text: Array.isArray(actionIds)
                ? "The selected tokens were unstaked successfully!"
                : "You have successfully unstaked token!",
              type: "success",
            });
          }
        }, 2000);

        return res;
      } catch (err) {
        handleError(err);
        return err;
      }
    },
    [
      account,
      handleError,
      rwlkStakingContract,
      cstStakingContract,
      setNotification,
    ]
  );

  // Fetch dashboard data (global) + compute reward per CST
  const fetchDashboardData = async () => {
    try {
      const data = await api.get_dashboard_info();
      setDashboardData(data);

      const totalStakedCST =
        data?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;

      if (totalStakedCST > 0) {
        const rewardCST = data?.StakingAmountEth / totalStakedCST;
        setRewardPerCST(rewardCST);
      } else {
        setRewardPerCST(0);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  // Fetch CST user data
  const fetchCSTData = async (addr: string, refresh: boolean = false) => {
    setLoading(refresh);
    try {
      const [cstActions, cstUserTokens, cstUserRewards] = await Promise.all([
        api.get_staking_cst_actions_by_user(addr),
        api.get_cst_tokens_by_user(addr),
        api.get_staking_rewards_by_user(addr),
      ]);

      setStakingCSTActions(cstActions);
      setCSTokens(
        cstUserTokens.filter((x: any) => !x.WasUnstaked) // only show tokens that are truly "unstaked"
      );
      setStakingRewards(cstUserRewards);

      // Refresh staked token context
      fetchStakedTokens();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch RWLK user data
  const fetchRWLKData = async (addr: string, refresh: boolean = false) => {
    try {
      setLoading(refresh);

      // Staking Actions + Reward Mints
      const [rwalkActions, rwalkMintEvents] = await Promise.all([
        api.get_staking_rwalk_actions_by_user(addr),
        api.get_staking_rwalk_mints_by_user(addr),
      ]);
      setStakingRWLKActions(rwalkActions);
      setRwlkMints(rwalkMintEvents);

      // Refresh context
      fetchStakedTokens();

      // Filter user-owned token IDs that are not staked
      const stakedIds = stakedRWLKTokens.map((x) => x.StakedTokenId);
      const userOwned = await rwalkContract.walletOfOwner(addr);
      const rawIds = userOwned.map((t: any) => t.toNumber()).sort();

      // Exclude tokens that are staked or in some partial action
      const filteredIds = rawIds.filter(
        (id) =>
          !stakedIds.includes(id) &&
          !rwalkActions.some(
            (action: any) => action.ActionType !== 1 && action.TokenId === id
          )
      );
      setRwlkTokens(filteredIds);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab change handler
  const handleTabChange = (_event: any, newValue: number) => {
    setStakingTab(newValue);
  };

  // On mount / account change
  useEffect(() => {
    if (account && rwalkContract) {
      fetchCSTData(account, true);
      fetchRWLKData(account, true);
      fetchDashboardData();
    }
  }, [account, rwalkContract]);

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

      {!account ? (
        // User is not connected
        <Typography variant="subtitle1">
          Please login to Metamask to see your staking.
        </Typography>
      ) : loading ? (
        // Data is still loading
        <Typography variant="h6">Loading...</Typography>
      ) : (
        // Main Staking UI
        <>
          {/* Global stats */}
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

          {/* Reward per CST token (if any) */}
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

          {/* Tabs */}
          <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="fullWidth"
              value={stakingTab}
              onChange={handleTabChange}
            >
              {/* CST Tab */}
              <Tab
                label={
                  <Box sx={{ display: "flex" }}>
                    <Image
                      src="/images/CosmicSignatureNFT.png"
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
              {/* RWLK Tab */}
              <Tab
                label={
                  <Box sx={{ display: "flex" }}>
                    <Image
                      src="/images/rwalk.jpg"
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

          {/* CST Panel */}
          <CustomTabPanel value={stakingTab} index={0}>
            <CSTStakingPanel
              account={account}
              stakingActions={stakingCSTActions}
              userTokens={CSTokens}
              stakedTokens={stakedCSTokens}
              stakingRewards={stakingRewards}
              handleStake={(tokenId) => handleStakeAction(tokenId, false)}
              handleStakeMany={(tokenIds) => handleStakeAction(tokenIds, false)}
              handleUnstake={(actionId) => handleUnstakeAction(actionId, false)}
              handleUnstakeMany={(actionIds) =>
                handleUnstakeAction(actionIds, false)
              }
            />
          </CustomTabPanel>

          {/* RWLK Panel */}
          <CustomTabPanel value={stakingTab} index={1}>
            <RWLKStakingPanel
              stakingActions={stakingRWLKActions}
              rwlkMints={rwlkMints}
              userTokens={rwlkTokens}
              stakedTokens={stakedRWLKTokens}
              handleStake={(tokenId) => handleStakeAction(tokenId, true)}
              handleStakeMany={(tokenIds) => handleStakeAction(tokenIds, true)}
              handleUnstake={(actionId) => handleUnstakeAction(actionId, true)}
              handleUnstakeMany={(actionIds) =>
                handleUnstakeAction(actionIds, true)
              }
            />
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

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default MyStaking;

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Box, Button, Link, Tab, Tabs, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useActiveWeb3React } from "../../hooks/web3";
import useRaffleWalletContract from "../../hooks/useRaffleWalletContract";
import { CSTTable } from "../my-tokens";
import { useStakedToken } from "../../contexts/StakedTokenContext";
import { useApiData } from "../../contexts/ApiDataContext";
import { useNotification } from "../../contexts/NotificationContext";
import { MainWrapper } from "../../components/styled";
import StakingActionsTable from "../../components/StakingActionsTable";
import MarketingRewardsTable from "../../components/MarketingRewardsTable";
import { StakingRewardsTable } from "../../components/StakingRewardsTable";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import WinningHistoryTable from "../../components/WinningHistoryTable";
import DonatedNFTTable from "../../components/DonatedNFTTable";
import { CollectedCSTStakingRewardsTable } from "../../components/CollectedCSTStakingRewardsTable";
import { UncollectedCSTStakingRewardsTable } from "../../components/UncollectedCSTStakingRewardsTable";
import { CSTStakingRewardsByDepositTable } from "../../components/CSTStakingRewardsByDepositTable";
import { RwalkStakingRewardMintsTable } from "../../components/RwalkStakingRewardMintsTable";
import getErrorMessage from "../../utils/alert";
import { formatEthValue, logoImgUrl } from "../../utils";
import api, { cosmicGameBaseUrl } from "../../services/api";
import { ethers } from "ethers";
import axios from "axios";
import DonatedERC20Table from "../../components/DonatedERC20Table";

/* ------------------------------------------------------------------
   Types & Interfaces
------------------------------------------------------------------ */

/**
 * TabPanelProps: Defines the properties used by CustomTabPanel to
 * manage tabs' rendering based on the current value/index.
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/* ------------------------------------------------------------------
   Helper Components
------------------------------------------------------------------ */

/**
 * CustomTabPanel: Renders its children only if the 'value' matches 'index'.
 * This is used for a simple tab system within this component.
 */
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

/* ------------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */

/**
 * UserInfo component fetches and displays detailed information about a user,
 * including their staking actions, bid history, donated NFTs, and more.
 * @param address - Ethereum wallet address of the user
 */
const UserInfo = ({ address }: { address: string }) => {
  /* ----------------------------------------------
     Hooks & State
  ---------------------------------------------- */

  // Web3 context and notification context
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();

  // Data from other contexts
  const { fetchData: fetchStakedToken } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();

  // Contract interaction hook
  const prizeWalletContract = useRaffleWalletContract();

  // Basic user data and loading states
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invalidAddress, setInvalidAddress] = useState(false);

  // Balances
  const [balance, setBalance] = useState({ CosmicToken: 0, ETH: 0 });

  // Data for Donated NFTs
  const [claimedDonatedNFTs, setClaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [unclaimedDonatedNFTs, setUnclaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);

  // Raffle data
  const [data, setData] = useState<any>(null);
  const [raffleETHProbability, setRaffleETHProbability] = useState(0);
  const [raffleNFTProbability, setRaffleNFTProbability] = useState(0);

  // Bids, Winnings, Marketing Rewards
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [claimHistory, setClaimHistory] = useState<any>(null);
  const [marketingRewards, setMarketingRewards] = useState<any[]>([]);

  // CST tokens user owns
  const [cstList, setCSTList] = useState<any[]>([]);

  // CST & RWLK staking actions
  const [stakingCSTActions, setStakingCSTActions] = useState<any[]>([]);
  const [stakingRWLKActions, setStakingRWLKActions] = useState<any[]>([]);

  // CST staking rewards
  const [cstStakingRewards, setCstStakingRewards] = useState<any[]>([]);
  const [collectedCstStakingRewards, setCollectedCstStakingRewards] = useState<
    any[]
  >([]);
  const [cstStakingRewardsByDeposit, setCstStakingRewardsByDeposit] = useState<
    any[]
  >([]);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState({
    data: [],
    loading: false,
  });

  // RWLK minted rewards
  const [rwlkMints, setRWLKMints] = useState<any[]>([]);

  // Tab management for Staking (0 = CST, 1 = RWLK)
  const [stakingTab, setStakingTab] = useState(0);

  /* ----------------------------------------------
     Data Fetching Functions
  ---------------------------------------------- */

  /**
   * fetchUserData: Fetch user info, staking actions, bid history,
   * balances, and relevant user statistics from the API.
   * @param addr - User address
   * @param reload - Whether to set loading state during fetch
   */
  const fetchUserData = async (addr: string, reload: boolean = true) => {
    setLoading(reload);
    try {
      const [
        history,
        userInfoResponse,
        balanceResponse,
        cstActions,
        rwalkActions,
        mRewards,
        cstTokens,
        stakingRewards,
        cstRewardsCollected,
        cstRewardsByDeposit,
        rwlkMinted,
      ] = await Promise.all([
        api.get_claim_history_by_user(addr),
        api.get_user_info(addr),
        api.get_user_balance(addr),
        api.get_staking_cst_actions_by_user(addr),
        api.get_staking_rwalk_actions_by_user(addr),
        api.get_marketing_rewards_by_user(addr),
        api.get_cst_tokens_by_user(addr),
        api.get_staking_rewards_by_user(addr),
        api.get_staking_cst_rewards_collected_by_user(addr),
        api.get_staking_cst_by_user_by_deposit_rewards(addr),
        api.get_staking_rwalk_mints_by_user(addr),
      ]);

      // Store claim history, user info, and bid history
      setClaimHistory(history);
      const { Bids, UserInfo } = userInfoResponse;
      setBidHistory(Bids);
      setUserInfo(UserInfo);

      // Convert and store user balances
      if (balanceResponse) {
        setBalance({
          CosmicToken: Number(
            ethers.utils.formatEther(balanceResponse.CosmicTokenBalance)
          ),
          ETH: Number(ethers.utils.formatEther(balanceResponse.ETH_Balance)),
        });
      }

      // Store staking actions
      setStakingCSTActions(cstActions);
      setStakingRWLKActions(rwalkActions);

      // Store marketing rewards
      setMarketingRewards(mRewards);

      // Store user-owned Cosmic Signature Tokens
      setCSTList(cstTokens);

      // Store CST staking reward information
      setCstStakingRewards(stakingRewards);
      setCollectedCstStakingRewards(cstRewardsCollected);
      setCstStakingRewardsByDeposit(cstRewardsByDeposit);

      // Store RWLK minted reward data
      setRWLKMints(rwlkMinted);

      // Update additional contexts
      fetchStakedToken();
      fetchStatusData();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * fetchDonatedNFTs: Fetch claimed and unclaimed donated NFTs for this user.
   * @param reload - Whether to set the loading state or not
   */
  const fetchDonatedNFTs = async (reload: boolean = true) => {
    // Set loading states for claimed/unclaimed NFTs
    setClaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));
    setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));

    try {
      const [claimed, unclaimed] = await Promise.all([
        api.get_claimed_donated_nft_by_user(address),
        api.get_unclaimed_donated_nft_by_user(address),
      ]);
      setClaimedDonatedNFTs({ data: claimed, loading: false });
      setUnclaimedDonatedNFTs({ data: unclaimed, loading: false });
    } catch (error) {
      console.error("Error fetching donated NFTs:", error);
    }
  };

  const fetchDonatedERC20Tokens = useCallback(
    async (reload = true) => {
      if (!address) return;
      setDonatedERC20Tokens((prev) => ({ ...prev, loading: reload }));
      try {
        const donatedERC20Tokens = await api.get_donations_erc20_by_user(
          address
        );
        setDonatedERC20Tokens({ data: donatedERC20Tokens, loading: false });
      } catch (err) {
        console.error(err);
        setNotification({
          text: "Failed to fetch donated NFTs",
          type: "error",
          visible: true,
        });
        setDonatedERC20Tokens((prev) => ({ ...prev, loading: false }));
      }
    },
    [address]
  );

  /**
   * calculateProbability: Calculates the probability that the user
   * wins ETH or NFT in the current raffle based on their number of bids.
   */
  const calculateProbability = async () => {
    try {
      const newData = await api.get_dashboard_info();
      setData(newData); // Store the dashboard data locally

      if (newData) {
        // Current round info and total bids
        const round = newData?.CurRoundNum;
        const bidList = await api.get_bid_list_by_round(round, "desc");
        const userBidsThisRound = bidList.filter(
          (bid) => bid.BidderAddr === address
        ).length;

        // Probability of winning ETH in the raffle
        let probability =
          1 -
          Math.pow(
            (bidList.length - userBidsThisRound) / bidList.length,
            newData?.NumRaffleEthWinnersBidding
          );
        setRaffleETHProbability(probability);

        // Probability of winning NFT in the raffle
        probability =
          1 -
          Math.pow(
            (bidList.length - userBidsThisRound) / bidList.length,
            newData?.NumRaffleNFTWinnersBidding
          );
        setRaffleNFTProbability(probability);
      }
    } catch (error) {
      console.error("Error calculating probability:", error);
    }
  };

  /* ----------------------------------------------
     Donated NFT Claiming Functions
  ---------------------------------------------- */

  /**
   * handleDonatedNFTsClaim: Allows user to claim a single donated NFT.
   * @param tokenID - The ID of the NFT to be claimed
   */
  const handleDonatedNFTsClaim = async (tokenID: number) => {
    // Mark this token as "claiming" in state
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    setIsClaiming(true);

    try {
      await prizeWalletContract.claimDonatedNft(tokenID);

      // Refresh data after a small delay
      setTimeout(() => {
        fetchUserData(address, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error(err);
        // If there's an error message from the blockchain, display it
        if (err?.data?.message) {
          const msg = getErrorMessage(err?.data?.message);
          setNotification({ text: msg, type: "error", visible: true });
        }
      }
      setIsClaiming(false);
    } finally {
      // Remove this token from the "claiming" list
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  /**
   * handleAllDonatedNFTsClaim: Allows user to claim all unclaimed donated NFTs at once.
   */
  const handleAllDonatedNFTsClaim = async () => {
    setIsClaiming(true);

    try {
      // Gather all indices of unclaimed donated NFTs
      const indexList = unclaimedDonatedNFTs.data.map(
        (item: any) => item.Index
      );
      await prizeWalletContract.claimManyDonatedNfts(indexList);

      // Refresh data after a small delay
      setTimeout(() => {
        fetchUserData(address, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      // Display any known error message
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      setIsClaiming(false);
    }
  };

  const handleDonatedERC20Claim = async (roundNum, tokenAddr, amount) => {
    try {
      await prizeWalletContract.claimDonatedToken(roundNum, tokenAddr, amount);
      setTimeout(() => {
        fetchDonatedERC20Tokens(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
    }
  };

  const handleAllDonatedERC20Claim = async () => {
    try {
      const donatedTokensToClaim = donatedERC20Tokens.data
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountEth,
        }));
      await prizeWalletContract.claimManyDonatedTokens(donatedTokensToClaim);
      setTimeout(() => {
        fetchDonatedERC20Tokens(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
    }
  };

  /* ----------------------------------------------
     Event Handlers
  ---------------------------------------------- */

  /**
   * handleTabChange: Switch between "Cosmic Signature Staking" (CST) tab
   * and "Random Walk Staking" (RWLK) tab.
   */
  const handleTabChange = (_event: any, newValue: number) => {
    setStakingTab(newValue);
  };

  /* ----------------------------------------------
     Lifecycle: Fetch Data on Mount / Address Change
  ---------------------------------------------- */

  useEffect(() => {
    if (!address) return;

    // Validate the address or mark as invalid
    if (address === "Invalid Address") {
      setInvalidAddress(true);
    } else {
      fetchUserData(address);
      fetchDonatedNFTs();
      fetchDonatedERC20Tokens();
      calculateProbability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  /* ----------------------------------------------
     Render
  ---------------------------------------------- */

  // Render "Invalid Address" message if address is invalid
  if (invalidAddress) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Address</Typography>
      </MainWrapper>
    );
  }

  // Render main user information
  return (
    <MainWrapper>
      {/* Address Title */}
      <Box mb={4}>
        <Typography variant="h6" color="primary" component="span" mr={2}>
          User
        </Typography>
        <Typography
          variant="h6"
          component="span"
          fontFamily="monospace"
          sx={{ wordBreak: "break-all" }}
        >
          {address}
        </Typography>
      </Box>

      {/* Loading or No Data states */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : userInfo === null ? (
        <Typography variant="h6">There is no user information yet.</Typography>
      ) : (
        <>
          {/* Balances */}
          {balance.ETH !== 0 && (
            <Box mb={1}>
              <Typography color="primary" component="span">
                ETH Balance:
              </Typography>
              &nbsp;
              <Typography component="span">
                {balance.ETH.toFixed(6)} ETH
              </Typography>
            </Box>
          )}
          {balance.CosmicToken !== 0 && (
            <Box mb={1}>
              <Typography color="primary" component="span">
                Cosmic Tokens Balance:
              </Typography>
              &nbsp;
              <Typography component="span">
                {balance.CosmicToken.toFixed(2)} CST
              </Typography>
            </Box>
          )}

          {/* Basic user stats */}
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Bids:
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.NumBids}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Cosmic Signature Transfers:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.CosmicSignatureNumTransfers}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Cosmic Token Transfers:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.CosmicTokenNumTransfers}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Maximum Bid Amount:
            </Typography>
            &nbsp;
            <Typography component="span">
              {formatEthValue(userInfo.MaxBidAmount)}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Prizes Taken:
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.NumPrizes}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Maximum Amount Gained (in prize winnings):
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.MaxWinAmount.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Amount of Winnings in ETH raffles:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.SumRaffleEthWinnings.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Amount Withdrawn from ETH raffles:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.SumRaffleEthWithdrawal.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Unclaimed Donated NFTs:
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.UnclaimedNFTs}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Total ETH Won in raffles:
            </Typography>
            &nbsp;
            <Typography component="span">
              <Link
                href={`/user/raffle-eth/${address}`}
                sx={{ color: "inherit", fontSize: "inherit" }}
              >
                {(
                  userInfo.SumRaffleEthWinnings +
                  userInfo.SumRaffleEthWithdrawal
                ).toFixed(6)}{" "}
                ETH
              </Link>
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of (ETH) raffles Participated in:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.NumRaffleEthWinnings}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Raffle NFTs Count (Raffle Mints):
            </Typography>
            &nbsp;
            <Typography component="span">
              <Link
                href={`/user/raffle-nft/${address}`}
                sx={{ color: "inherit", fontSize: "inherit" }}
              >
                {userInfo.RaffleNFTsCount}
              </Link>
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Reward NFTs Count (All Mints):
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.RewardNFTsCount}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Cosmic Signature Tokens Won:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.TotalCSTokensWon}
            </Typography>
          </Box>

          {/* Probabilities of winning raffles (only if round is active) */}
          {!(data?.CurRoundNum > 0 && data?.TsRoundStart === 0) && (
            <>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Probability of Winning ETH:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {(raffleETHProbability * 100).toFixed(2)}%
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Probability of Winning NFT:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {(raffleNFTProbability * 100).toFixed(2)}%
                </Typography>
              </Box>
            </>
          )}

          {/* Links to see all transfers made by this account */}
          <Typography mt={3}>
            This account has {userInfo.CosmicTokenNumTransfers} CosmicToken
            (ERC20) transfers, click{" "}
            <Link href={`/cosmic-token-transfer/${address}`}>here</Link> to see
            all the transfers made by this account.
          </Typography>
          <Typography mt={1}>
            This account has {userInfo.CosmicSignatureNumTransfers}{" "}
            CosmicSignature (ERC721) transfers, click{" "}
            <Link href={`/cosmic-signature-transfer/${address}`}>here</Link> to
            see all the transfers made by this account.
          </Typography>

          {/* Staking Statistics */}
          <Box>
            <Typography variant="h6" lineHeight={1} mt={4}>
              Staking Statistics
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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

            {/* CST Staking Panel */}
            <CustomTabPanel value={stakingTab} index={0}>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Number of Active Stakers:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.NumActiveStakers}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Number of Deposits:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.NumDeposits}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Stake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.CSTStakingInfo
                      .TotalNumStakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Unstake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.CSTStakingInfo
                      .TotalNumUnstakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Rewards:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {formatEthValue(
                    userInfo.StakingStatistics.CSTStakingInfo.TotalRewardEth
                  )}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Unclaimed Rewards:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {formatEthValue(
                    userInfo.StakingStatistics.CSTStakingInfo.UnclaimedRewardEth
                  )}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Minted:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.TotalTokensMinted}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Staked:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.TotalTokensStaked}
                </Typography>
              </Box>

              {/* CST Stake/Unstake Actions */}
              <Box>
                <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
                  Stake / Unstake Actions
                </Typography>
                <StakingActionsTable list={stakingCSTActions} IsRwalk={false} />
              </Box>

              {/* CST Staking Rewards by Token */}
              <Box mt={4}>
                <Typography variant="subtitle1" lineHeight={1} mb={2}>
                  Staking Rewards by Token
                </Typography>
                <StakingRewardsTable
                  list={cstStakingRewards}
                  address={address}
                />
              </Box>

              {/* CST Staking Rewards by Deposit */}
              <Box mt={4}>
                <Typography variant="subtitle1" lineHeight={1} mb={2}>
                  Staking Rewards by Deposit
                </Typography>
                <CSTStakingRewardsByDepositTable
                  list={cstStakingRewardsByDeposit}
                />
              </Box>

              {/* Collected Staking Rewards */}
              <Box mt={4}>
                <Typography variant="subtitle1" lineHeight={1} mb={2}>
                  Collected Staking Rewards
                </Typography>
                <CollectedCSTStakingRewardsTable
                  list={collectedCstStakingRewards}
                />
              </Box>

              {/* Uncollected Staking Rewards */}
              <Box mt={4}>
                <Typography variant="subtitle1" lineHeight={1} mb={2}>
                  Uncollected Staking Rewards
                </Typography>
                <UncollectedCSTStakingRewardsTable user={address} />
              </Box>
            </CustomTabPanel>

            {/* RWLK Staking Panel */}
            <CustomTabPanel value={stakingTab} index={1}>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Number of Active Stakers:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.RWalkStakingInfo.NumActiveStakers}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Stake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalNumStakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Unstake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalNumUnstakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Minted:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalTokensMinted
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Staked:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalTokensStaked
                  }
                </Typography>
              </Box>

              {/* RWLK Stake/Unstake Actions */}
              <Box>
                <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
                  Stake / Unstake Actions
                </Typography>
                <StakingActionsTable list={stakingRWLKActions} IsRwalk={true} />
              </Box>

              {/* RWLK Staking Reward Tokens */}
              <Box>
                <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
                  Staking Reward Tokens
                </Typography>
                <RwalkStakingRewardMintsTable list={rwlkMints} />
              </Box>
            </CustomTabPanel>
          </Box>

          {/* Bid History */}
          <Box mt={8}>
            <Typography variant="h6" lineHeight={1}>
              Bid History
            </Typography>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </Box>

          {/* Cosmic Signature Tokens owned */}
          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              Cosmic Signature Tokens User Own
            </Typography>
            <CSTTable list={cstList} />
          </Box>

          {/* History of Winnings */}
          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              History of Winnings
            </Typography>
            <WinningHistoryTable
              winningHistory={claimHistory}
              showClaimedStatus={true}
              showWinnerAddr={false}
            />
          </Box>

          {/* Marketing Rewards */}
          {marketingRewards.length > 0 && (
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Marketing Rewards
              </Typography>
              <MarketingRewardsTable list={marketingRewards} />
            </Box>
          )}

          {/* Donated NFT Section */}
          <Box mt={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Donated NFTs User Won</Typography>
              {unclaimedDonatedNFTs.data.length > 0 && account === address && (
                <Button
                  onClick={handleAllDonatedNFTsClaim}
                  variant="contained"
                  disabled={isClaiming}
                >
                  Claim All
                </Button>
              )}
            </Box>

            {/* Show a loading label while fetching NFT data */}
            {unclaimedDonatedNFTs.loading || claimedDonatedNFTs.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedNFTTable
                list={[
                  ...unclaimedDonatedNFTs.data,
                  ...claimedDonatedNFTs.data,
                ]}
                handleClaim={
                  account === address ? handleDonatedNFTsClaim : null
                }
                claimingTokens={claimingDonatedNFTs}
              />
            )}
          </Box>

          {/* Donated ERC20 Section */}
          <Box mt={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Donated ERC20 Tokens</Typography>
              {donatedERC20Tokens.data.filter((x) => !x.Claimed).length > 0 &&
                account === address && (
                  <Button
                    onClick={handleAllDonatedERC20Claim}
                    variant="contained"
                  >
                    Claim All
                  </Button>
                )}
            </Box>

            {donatedERC20Tokens.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedERC20Table
                list={donatedERC20Tokens.data}
                handleClaim={
                  account === address ? handleDonatedERC20Claim : null
                }
              />
            )}
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
   getServerSideProps for SEO & Data Validation
------------------------------------------------------------------ */

/**
 * getServerSideProps: Fetches data at request time. Validates the address
 * and prepares SEO metadata for the UserInfo page.
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Extract the address parameter from the URL
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;

  // Validate if it's a proper Ethereum address
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
    try {
      const { data } = await axios.get(
        `${cosmicGameBaseUrl}user/info/${address}`
      );
      if (!data || !data.Bids.length) {
        address = "Invalid Address";
      }
    } catch {
      address = "Invalid Address";
    }
  } else {
    address = "Invalid Address";
  }
  // SEO metadata
  const title = `Information for User ${address} | Cosmic Signature`;
  const description = `Information for User ${address}`;

  // Open Graph data for social media sharing
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  // Return props to the page component
  return {
    props: { title, description, openGraphData, address },
  };
}

export default UserInfo;

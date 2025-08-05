import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Box, Button, Link, Tab, Tabs, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { GetServerSideProps } from "next";
import { ethers } from "ethers";

// Custom hooks and services
import { useActiveWeb3React } from "../hooks/web3";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";
import { useStakedToken } from "../contexts/StakedTokenContext";
import { useApiData } from "../contexts/ApiDataContext";
import { useNotification } from "../contexts/NotificationContext";
import api from "../services/api";

// Utility imports
import { formatEthValue, logoImgUrl } from "../utils";
import getErrorMessage from "../utils/alert";

// Components
import { CSTTable } from "./my-tokens";
import BiddingHistoryTable from "../components/BiddingHistoryTable";
import StakingActionsTable from "../components/StakingActionsTable";
import WinningHistoryTable from "../components/WinningHistoryTable";
import MarketingRewardsTable from "../components/MarketingRewardsTable";
import DonatedNFTTable from "../components/DonatedNFTTable";
import { StakingRewardsTable } from "../components/StakingRewardsTable";
import { CSTStakingRewardsByDepositTable } from "../components/CSTStakingRewardsByDepositTable";
import { CollectedCSTStakingRewardsTable } from "../components/CollectedCSTStakingRewardsTable";
import { UncollectedCSTStakingRewardsTable } from "../components/UncollectedCSTStakingRewardsTable";
import { RwalkStakingRewardMintsTable } from "../components/RwalkStakingRewardMintsTable";
import DonatedERC20Table from "../components/DonatedERC20Table";

/* ------------------------------------------------------------------
   Types & Interfaces
------------------------------------------------------------------ */

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/* ------------------------------------------------------------------
   Sub-Components
------------------------------------------------------------------ */

/**
 * CustomTabPanel conditionally renders its children
 * based on whether `value` matches `index`.
 */
function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
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
 * UserStatsSection: Displays basic user information (balance, bids, prizes, etc.).
 */
function UserStatsSection({
  userInfo,
  balanceETH,
  balanceCST,
  raffleETHProbability,
  raffleNFTProbability,
  data,
}: {
  userInfo: any;
  balanceETH: number;
  balanceCST: number;
  raffleETHProbability: number;
  raffleNFTProbability: number;
  data: any; // Additional dashboard data
}) {
  if (!userInfo) {
    return (
      <Typography variant="h6">There is no user information yet.</Typography>
    );
  }

  return (
    <>
      {/* Balances */}
      {balanceETH !== 0 && (
        <Box mb={1}>
          <Typography color="primary" component="span">
            ETH Balance:
          </Typography>
          &nbsp;
          <Typography component="span">{balanceETH.toFixed(6)} ETH</Typography>
        </Box>
      )}
      {balanceCST !== 0 && (
        <Box mb={1}>
          <Typography color="primary" component="span">
            Cosmic Tokens Balance:
          </Typography>
          &nbsp;
          <Typography component="span">{balanceCST.toFixed(2)} CST</Typography>
        </Box>
      )}

      {/* Basic user info & stats */}
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
            href={`/user/raffle-eth/${userInfo.Address}`}
            sx={{ color: "inherit", fontSize: "inherit" }}
          >
            {(
              userInfo.SumRaffleEthWinnings + userInfo.SumRaffleEthWithdrawal
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
            href={`/user/raffle-nft/${userInfo.Address}`}
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
        <Typography component="span">{userInfo.TotalCSTokensWon}</Typography>
      </Box>

      {/* Raffle Probability */}
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

      {/* Transfer History Links */}
      <Typography mt={3}>
        This account has {userInfo.CosmicTokenNumTransfers} CosmicToken (ERC20).
        Click{" "}
        <Link href={`/cosmic-token-transfer/${userInfo.Address}`}>here</Link> to
        see all the transfers made by this account.
      </Typography>
      <Typography mt={1}>
        This account has {userInfo.CosmicSignatureNumTransfers} CosmicSignature
        (ERC721). Click{" "}
        <Link href={`/cosmic-signature-transfer/${userInfo.Address}`}>
          here
        </Link>{" "}
        to see all the transfers made by this account.
      </Typography>
    </>
  );
}

/**
 * CSTStakingTab: Renders the CST-specific staking data & tables.
 */
function CSTStakingTab({
  userInfo,
  stakingActions,
  cstStakingRewards,
  cstStakingRewardsByDeposit,
  collectedCstStakingRewards,
  account,
}: {
  userInfo: any;
  stakingActions: any[];
  cstStakingRewards: any[];
  cstStakingRewardsByDeposit: any[];
  collectedCstStakingRewards: any[];
  account: string;
}) {
  const { CSTStakingInfo } = userInfo.StakingStatistics || {};

  return (
    <>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Number of Active Stakers:
        </Typography>
        &nbsp;
        <Typography component="span">
          {CSTStakingInfo?.NumActiveStakers}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Number of Deposits:
        </Typography>
        &nbsp;
        <Typography component="span">{CSTStakingInfo?.NumDeposits}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Stake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">
          {CSTStakingInfo?.TotalNumStakeActions}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Unstake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">
          {CSTStakingInfo?.TotalNumUnstakeActions}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Rewards:
        </Typography>
        &nbsp;
        <Typography component="span">
          {formatEthValue(CSTStakingInfo?.TotalRewardEth)}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Unclaimed Rewards:
        </Typography>
        &nbsp;
        <Typography component="span">
          {formatEthValue(CSTStakingInfo?.UnclaimedRewardEth)}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens Minted:
        </Typography>
        &nbsp;
        <Typography component="span">
          {CSTStakingInfo?.TotalTokensMinted}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens Staked:
        </Typography>
        &nbsp;
        <Typography component="span">
          {CSTStakingInfo?.TotalTokensStaked}
        </Typography>
      </Box>

      {/* CST Stake/Unstake Actions */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </Box>

      {/* CST Staking Rewards */}
      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Staking Rewards by Token
        </Typography>
        <StakingRewardsTable list={cstStakingRewards} address={account} />
      </Box>

      {/* CST Staking Rewards by Deposit */}
      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Staking Rewards by Deposit
        </Typography>
        <CSTStakingRewardsByDepositTable list={cstStakingRewardsByDeposit} />
      </Box>

      {/* CST Collected Staking Rewards */}
      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Collected Staking Rewards
        </Typography>
        <CollectedCSTStakingRewardsTable list={collectedCstStakingRewards} />
      </Box>

      {/* CST Uncollected Staking Rewards */}
      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Uncollected Staking Rewards
        </Typography>
        <UncollectedCSTStakingRewardsTable user={account} />
      </Box>
    </>
  );
}

/**
 * RWLKStakingTab: Renders the RandomWalk (RWLK)-specific staking data & tables.
 */
function RWLKStakingTab({
  userInfo,
  stakingActions,
  rwlkMints,
}: {
  userInfo: any;
  stakingActions: any[];
  rwlkMints: any[];
}) {
  const { RWalkStakingInfo } = userInfo.StakingStatistics || {};

  return (
    <>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Number of Active Stakers:
        </Typography>
        &nbsp;
        <Typography component="span">
          {RWalkStakingInfo?.NumActiveStakers}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Stake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">
          {RWalkStakingInfo?.TotalNumStakeActions}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Unstake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">
          {RWalkStakingInfo?.TotalNumUnstakeActions}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens Minted:
        </Typography>
        &nbsp;
        <Typography component="span">
          {RWalkStakingInfo?.TotalTokensMinted}
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens Staked:
        </Typography>
        &nbsp;
        <Typography component="span">
          {RWalkStakingInfo?.TotalTokensStaked}
        </Typography>
      </Box>

      {/* RWLK Stake/Unstake Actions */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
      </Box>

      {/* RWLK Staking Reward Tokens */}
      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
          Staking Reward Tokens
        </Typography>
        <RwalkStakingRewardMintsTable list={rwlkMints} />
      </Box>
    </>
  );
}

/* ------------------------------------------------------------------
   Main Component: MyStatistics
------------------------------------------------------------------ */
const MyStatistics = () => {
  const { account } = useActiveWeb3React(); // active account
  const prizeWalletContract = useRaffleWalletContract();

  // Hooks & Context
  const { fetchData: fetchStakedTokens } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Data states
  const [data, setData] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [balance, setBalance] = useState({ CosmicToken: 0, ETH: 0 });

  // Raffle Probability
  const [raffleETHProbability, setRaffleETHProbability] = useState(0);
  const [raffleNFTProbability, setRaffleNFTProbability] = useState(0);

  // Bids, claims, marketing, staking
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [claimHistory, setClaimHistory] = useState<any>(null);
  const [marketingRewards, setMarketingRewards] = useState<any[]>([]);

  // CST Data
  const [stakingCSTActions, setStakingCSTActions] = useState<any[]>([]);
  const [cstStakingRewards, setCstStakingRewards] = useState<any[]>([]);
  const [collectedCstStakingRewards, setCollectedCstStakingRewards] = useState<
    any[]
  >([]);
  const [cstStakingRewardsByDeposit, setCstStakingRewardsByDeposit] = useState<
    any[]
  >([]);
  const [cstList, setCSTList] = useState<any[]>([]);

  // RWLK Data
  const [stakingRWLKActions, setStakingRWLKActions] = useState<any[]>([]);
  const [rwlkMints, setRWLKMints] = useState<any[]>([]);

  // Donated NFTs
  const [claimedDonatedNFTs, setClaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [unclaimedDonatedNFTs, setUnclaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState({
    data: [],
    loading: false,
  });

  // Staking Tab
  const [stakingTab, setStakingTab] = useState(0);

  /* --------------------------------------------------
    Data Fetching
  -------------------------------------------------- */
  const fetchUserData = useCallback(
    async (addr: string, reload: boolean = true) => {
      if (!addr) return;
      if (reload) setLoading(true);

      try {
        // Parallel API calls
        const [
          claimHist,
          userInfoData,
          balanceData,
          cstActions,
          rwalkActions,
          mRewards,
          userCstList,
          stakingRewards,
          collectedRewards,
          rewardsByDeposit,
          rwalkMinted,
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

        // Bids come from userInfoData
        const { Bids, UserInfo } = userInfoData;

        // Basic user/balance data
        setClaimHistory(claimHist);
        setBidHistory(Bids);
        setUserInfo(UserInfo);
        if (balanceData) {
          setBalance({
            CosmicToken: Number(
              ethers.utils.formatEther(balanceData.CosmicTokenBalance)
            ),
            ETH: Number(ethers.utils.formatEther(balanceData.ETH_Balance)),
          });
        }

        // Staking
        setStakingCSTActions(cstActions);
        setStakingRWLKActions(rwalkActions);

        // Marketing & Tokens
        setMarketingRewards(mRewards);
        setCSTList(userCstList);

        // CST Staking rewards
        setCstStakingRewards(stakingRewards);
        setCollectedCstStakingRewards(collectedRewards);
        setCstStakingRewardsByDeposit(rewardsByDeposit);

        // RWLK minted
        setRWLKMints(rwalkMinted);

        // Refresh other contexts
        fetchStakedTokens();
        fetchStatusData();
      } catch (err) {
        console.error(err);
        setNotification({
          text: "Failed to fetch data",
          type: "error",
          visible: true,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchDonatedNFTs = useCallback(
    async (reload = true) => {
      if (!account) return;
      setClaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));
      setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));

      try {
        const [claimed, unclaimed] = await Promise.all([
          api.get_claimed_donated_nft_by_user(account),
          api.get_unclaimed_donated_nft_by_user(account),
        ]);

        setClaimedDonatedNFTs({ data: claimed, loading: false });
        setUnclaimedDonatedNFTs({ data: unclaimed, loading: false });
      } catch (err) {
        console.error(err);
        setNotification({
          text: "Failed to fetch donated NFTs",
          type: "error",
          visible: true,
        });
        setClaimedDonatedNFTs((prev) => ({ ...prev, loading: false }));
        setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: false }));
      }
    },
    [account]
  );

  const fetchDonatedERC20Tokens = useCallback(
    async (reload = true) => {
      if (!account) return;
      setDonatedERC20Tokens((prev) => ({ ...prev, loading: reload }));
      try {
        const donatedERC20Tokens = await api.get_donations_erc20_by_user(
          account
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
    [account]
  );

  const calculateProbability = useCallback(async () => {
    if (!account) return;
    try {
      const newData = await api.get_dashboard_info();
      setData(newData);

      if (newData) {
        const {
          CurRoundNum,
          NumRaffleEthWinnersBidding,
          NumRaffleNFTWinnersBidding,
        } = newData;
        const bidList = await api.get_bid_list_by_round(CurRoundNum, "desc");
        const totalBids = bidList.length;
        const userBids = bidList.filter(
          (bid: any) => bid.BidderAddr === account
        ).length;

        if (totalBids > 0) {
          // Probability: 1 - ((totalBids - userBids) / totalBids)^NumWinners
          let prob =
            1 -
            Math.pow(
              (totalBids - userBids) / totalBids,
              NumRaffleEthWinnersBidding
            );
          setRaffleETHProbability(prob);

          prob =
            1 -
            Math.pow(
              (totalBids - userBids) / totalBids,
              NumRaffleNFTWinnersBidding
            );
          setRaffleNFTProbability(prob);
        } else {
          setRaffleETHProbability(0);
          setRaffleNFTProbability(0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [account]);

  /* --------------------------------------------------
    Donated NFT Claim
  -------------------------------------------------- */
  const handleDonatedNFTsClaim = async (tokenID: number) => {
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    try {
      await prizeWalletContract.claimDonatedNft(tokenID);
      setTimeout(() => {
        fetchUserData(account!, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
    } finally {
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    if (!unclaimedDonatedNFTs.data.length) return;

    try {
      setIsClaiming(true);
      const indexList = unclaimedDonatedNFTs.data.map(
        (item: any) => item.Index
      );
      await prizeWalletContract.claimManyDonatedNfts(indexList);
      setTimeout(() => {
        fetchUserData(account!, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error(err);
        const msg = err?.data?.message
          ? getErrorMessage(err.data.message)
          : "An error occurred while claiming donated NFTs!";
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

  /* --------------------------------------------------
    Tab Handling
  -------------------------------------------------- */
  const handleTabChange = (_event: any, newValue: number) => {
    setStakingTab(newValue);
  };

  /* --------------------------------------------------
    useEffect
  -------------------------------------------------- */
  useEffect(() => {
    if (account) {
      fetchUserData(account);
      fetchDonatedNFTs();
      fetchDonatedERC20Tokens();
      calculateProbability();
    }
  }, [account, fetchUserData, fetchDonatedNFTs, calculateProbability]);

  /* --------------------------------------------------
    Render
  -------------------------------------------------- */
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" mb={4}>
        My Statistics
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : !userInfo ? (
        <Typography variant="h6">There is no user information yet.</Typography>
      ) : (
        <>
          {/* User Stats Section */}
          <UserStatsSection
            userInfo={userInfo}
            balanceETH={balance.ETH}
            balanceCST={balance.CosmicToken}
            raffleETHProbability={raffleETHProbability}
            raffleNFTProbability={raffleNFTProbability}
            data={data}
          />

          {/* Staking Stats (Tabs) */}
          <Box mt={4}>
            <Typography variant="h6" lineHeight={1} mb={1}>
              Staking Statistics
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
              <CSTStakingTab
                userInfo={userInfo}
                stakingActions={stakingCSTActions}
                cstStakingRewards={cstStakingRewards}
                cstStakingRewardsByDeposit={cstStakingRewardsByDeposit}
                collectedCstStakingRewards={collectedCstStakingRewards}
                account={account!}
              />
            </CustomTabPanel>

            {/* RWLK Panel */}
            <CustomTabPanel value={stakingTab} index={1}>
              <RWLKStakingTab
                userInfo={userInfo}
                stakingActions={stakingRWLKActions}
                rwlkMints={rwlkMints}
              />
            </CustomTabPanel>
          </Box>

          {/* Bidding History */}
          <Box mt={6}>
            <Typography variant="h6" lineHeight={1} mb={2}>
              Bid History
            </Typography>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </Box>

          {/* User CST Tokens */}
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
              {unclaimedDonatedNFTs.data.length > 0 && (
                <Button
                  onClick={handleAllDonatedNFTsClaim}
                  variant="contained"
                  disabled={isClaiming}
                >
                  Claim All
                </Button>
              )}
            </Box>

            {unclaimedDonatedNFTs.loading || claimedDonatedNFTs.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedNFTTable
                list={[
                  ...unclaimedDonatedNFTs.data,
                  ...claimedDonatedNFTs.data,
                ]}
                handleClaim={handleDonatedNFTsClaim}
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
              {donatedERC20Tokens.data.length > 0 && (
                <Button
                  onClick={handleAllDonatedERC20Claim}
                  variant="contained"
                  disabled={isClaiming}
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
                handleClaim={handleDonatedERC20Claim}
              />
            )}
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
   getServerSideProps
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "My Statistics | Cosmic Signature";
  const description =
    "Track your performance with Cosmic Signature's My Statistics page. View detailed bid history, stake status, rewards, and more. Stay informed and optimize your participation in our blockchain ecosystem.";

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

export default MyStatistics;

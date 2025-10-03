import React, { useEffect, useReducer } from "react";
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
   Sub-Components (pure)
------------------------------------------------------------------ */

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

function LabelWithImage({
  src,
  alt,
  text,
}: {
  src: string;
  alt: string;
  text: string;
}) {
  return (
    <Box sx={{ display: "flex" }}>
      <Image src={src} width={94} height={60} alt={alt} />
      <Typography
        variant="h6"
        sx={{ whiteSpace: "nowrap", textTransform: "none", ml: 2 }}
      >
        {text}
      </Typography>
    </Box>
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

  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <Box mb={1}>
      <Typography color="primary" component="span">
        {label}
      </Typography>
      &nbsp;
      <Typography component="span">{children}</Typography>
    </Box>
  );

  return (
    <>
      {balanceETH !== 0 && (
        <Row label="ETH Balance:">{balanceETH.toFixed(6)} ETH</Row>
      )}
      {balanceCST !== 0 && (
        <Row label="Cosmic Signature Tokens Balance:">
          {balanceCST.toFixed(2)} CST
        </Row>
      )}

      <Row label="Number of Bids:">{userInfo.NumBids}</Row>
      <Row label="Number of Cosmic Signature Transfers:">
        {userInfo.CosmicSignatureNumTransfers}
      </Row>
      <Row label="Number of Cosmic Signature Token Transfers:">
        {userInfo.CosmicTokenNumTransfers}
      </Row>
      <Row label="Maximum Bid Amount:">
        {formatEthValue(userInfo.MaxBidAmount)}
      </Row>
      <Row label="Number of Prizes Taken:">{userInfo.NumPrizes}</Row>
      <Row label="Maximum Amount Gained (in prize winnings):">
        {userInfo.MaxWinAmount.toFixed(6)} ETH
      </Row>
      <Row label="Amount of Winnings in ETH raffles:">
        {userInfo.SumRaffleEthWinnings.toFixed(6)} ETH
      </Row>
      <Row label="Amount Withdrawn from ETH raffles:">
        {userInfo.SumRaffleEthWithdrawal.toFixed(6)} ETH
      </Row>
      <Row label="Unclaimed Donated NFTs:">{userInfo.UnclaimedNFTs}</Row>
      <Row label="Total ETH Won in raffles:">
        <Link
          href={`/user/raffle-eth/${userInfo.Address}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {(
            userInfo.SumRaffleEthWinnings + userInfo.SumRaffleEthWithdrawal
          ).toFixed(6)}{" "}
          ETH
        </Link>
      </Row>
      <Row label="Number of (ETH) raffles Participated in:">
        {userInfo.NumRaffleEthWinnings}
      </Row>
      <Row label="Raffle NFTs Count (Raffle Mints):">
        <Link
          href={`/user/raffle-nft/${userInfo.Address}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {userInfo.RaffleNFTsCount}
        </Link>
      </Row>
      <Row label="Reward NFTs Count (All Mints):">
        {userInfo.RewardNFTsCount}
      </Row>
      <Row label="Number of Cosmic Signature Tokens Won:">
        {userInfo.TotalCSTokensWon}
      </Row>

      {!(data?.CurRoundNum > 0 && data?.TsRoundStart === 0) && (
        <>
          <Row label="Probability of Winning ETH:">
            {(raffleETHProbability * 100).toFixed(2)}%
          </Row>
          <Row label="Probability of Winning NFT:">
            {(raffleNFTProbability * 100).toFixed(2)}%
          </Row>
        </>
      )}

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
  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <Box mb={1}>
      <Typography color="primary" component="span">
        {label}
      </Typography>
      &nbsp;
      <Typography component="span">{children}</Typography>
    </Box>
  );

  return (
    <>
      <Row label="Number of Active Stakers:">
        {CSTStakingInfo?.NumActiveStakers}
      </Row>
      <Row label="Number of Deposits:">{CSTStakingInfo?.NumDeposits}</Row>
      <Row label="Total Number of Stake Actions:">
        {CSTStakingInfo?.TotalNumStakeActions}
      </Row>
      <Row label="Total Number of Unstake Actions:">
        {CSTStakingInfo?.TotalNumUnstakeActions}
      </Row>
      <Row label="Total Rewards:">
        {formatEthValue(CSTStakingInfo?.TotalRewardEth)}
      </Row>
      <Row label="Unclaimed Rewards:">
        {formatEthValue(CSTStakingInfo?.UnclaimedRewardEth)}
      </Row>
      <Row label="Total Tokens Minted:">
        {CSTStakingInfo?.TotalTokensMinted}
      </Row>
      <Row label="Total Tokens Staked:">
        {CSTStakingInfo?.TotalTokensStaked}
      </Row>

      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </Box>

      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Staking Rewards by Token
        </Typography>
        <StakingRewardsTable list={cstStakingRewards} address={account} />
      </Box>

      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Staking Rewards by Deposit
        </Typography>
        <CSTStakingRewardsByDepositTable list={cstStakingRewardsByDeposit} />
      </Box>

      <Box mt={4}>
        <Typography variant="subtitle1" lineHeight={1} mb={2}>
          Collected Staking Rewards
        </Typography>
        <CollectedCSTStakingRewardsTable list={collectedCstStakingRewards} />
      </Box>

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
  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <Box mb={1}>
      <Typography color="primary" component="span">
        {label}
      </Typography>
      &nbsp;
      <Typography component="span">{children}</Typography>
    </Box>
  );

  return (
    <>
      <Row label="Number of Active Stakers:">
        {RWalkStakingInfo?.NumActiveStakers}
      </Row>
      <Row label="Total Number of Stake Actions:">
        {RWalkStakingInfo?.TotalNumStakeActions}
      </Row>
      <Row label="Total Number of Unstake Actions:">
        {RWalkStakingInfo?.TotalNumUnstakeActions}
      </Row>
      <Row label="Total Tokens Minted:">
        {RWalkStakingInfo?.TotalTokensMinted}
      </Row>
      <Row label="Total Tokens Staked:">
        {RWalkStakingInfo?.TotalTokensStaked}
      </Row>

      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk />
      </Box>

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
   State management
------------------------------------------------------------------ */

type DonatedNFTState = {
  claimed: any[];
  unclaimed: any[];
  loading: boolean;
  claimingIds: number[];
};

type DonatedERC20State = { data: any[]; loading: boolean };

type State = {
  loading: boolean;
  isClaiming: boolean;
  data: any;
  userInfo: any;
  balance: { CosmicToken: number; ETH: number };
  raffleETHProbability: number;
  raffleNFTProbability: number;
  bidHistory: any[];
  claimHistory: any;
  marketingRewards: any[];
  stakingCSTActions: any[];
  cstStakingRewards: any[];
  collectedCstStakingRewards: any[];
  cstStakingRewardsByDeposit: any[];
  cstList: any[];
  stakingRWLKActions: any[];
  rwlkMints: any[];
  donatedNFTs: DonatedNFTState;
  donatedERC20: DonatedERC20State;
  stakingTab: number;
  combinedDonatedNFTs: any[];
};

const initialState: State = {
  loading: true,
  isClaiming: false,
  data: null,
  userInfo: null,
  balance: { CosmicToken: 0, ETH: 0 },
  raffleETHProbability: 0,
  raffleNFTProbability: 0,
  bidHistory: [],
  claimHistory: null,
  marketingRewards: [],
  stakingCSTActions: [],
  cstStakingRewards: [],
  collectedCstStakingRewards: [],
  cstStakingRewardsByDeposit: [],
  cstList: [],
  stakingRWLKActions: [],
  rwlkMints: [],
  donatedNFTs: { claimed: [], unclaimed: [], loading: false, claimingIds: [] },
  donatedERC20: { data: [], loading: false },
  stakingTab: 0,
  combinedDonatedNFTs: [],
};

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ALL"; payload: Partial<State> }
  | { type: "SET_DONATED_NFT_LOADING"; payload: boolean }
  | {
      type: "SET_DONATED_NFTS";
      payload: { claimed?: any[]; unclaimed?: any[] };
    }
  | { type: "ADD_CLAIMING_NFT"; payload: number }
  | { type: "REMOVE_CLAIMING_NFT"; payload: number }
  | { type: "SET_DONATED_ERC20_LOADING"; payload: boolean }
  | { type: "SET_DONATED_ERC20"; payload: any[] }
  | { type: "SET_STAKING_TAB"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ALL": {
      const next = { ...state, ...action.payload } as State;
      // keep combinedDonatedNFTs in sync when either list changes
      const claimed =
        action.payload.donatedNFTs?.claimed ?? state.donatedNFTs.claimed;
      const unclaimed =
        action.payload.donatedNFTs?.unclaimed ?? state.donatedNFTs.unclaimed;
      if (claimed || unclaimed) {
        next.combinedDonatedNFTs = [...(unclaimed ?? []), ...(claimed ?? [])];
      }
      return next;
    }
    case "SET_DONATED_NFT_LOADING":
      return {
        ...state,
        donatedNFTs: { ...state.donatedNFTs, loading: action.payload },
      };
    case "SET_DONATED_NFTS": {
      const claimed = action.payload.claimed ?? state.donatedNFTs.claimed;
      const unclaimed = action.payload.unclaimed ?? state.donatedNFTs.unclaimed;
      return {
        ...state,
        donatedNFTs: {
          ...state.donatedNFTs,
          claimed,
          unclaimed,
          loading: false,
        },
        combinedDonatedNFTs: [...(unclaimed ?? []), ...(claimed ?? [])],
      };
    }
    case "ADD_CLAIMING_NFT":
      return {
        ...state,
        donatedNFTs: {
          ...state.donatedNFTs,
          claimingIds: [...state.donatedNFTs.claimingIds, action.payload],
        },
      };
    case "REMOVE_CLAIMING_NFT":
      return {
        ...state,
        donatedNFTs: {
          ...state.donatedNFTs,
          claimingIds: state.donatedNFTs.claimingIds.filter(
            (x) => x !== action.payload
          ),
        },
      };
    case "SET_DONATED_ERC20_LOADING":
      return {
        ...state,
        donatedERC20: { ...state.donatedERC20, loading: action.payload },
      };
    case "SET_DONATED_ERC20":
      return {
        ...state,
        donatedERC20: { data: action.payload, loading: false },
      };
    case "SET_STAKING_TAB":
      return { ...state, stakingTab: action.payload };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------
   Main Component: MyStatistics (no useMemo/useCallback/useRef)
------------------------------------------------------------------ */
const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  const prizeWalletContract = useRaffleWalletContract();

  const { fetchData: fetchStakedTokens } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleTabChange = (_event: any, newValue: number) => {
    dispatch({ type: "SET_STAKING_TAB", payload: newValue });
  };

  // --- Data Fetchers (plain functions; no useCallback) ---
  async function fetchUserData(addr: string, reload = true) {
    if (!addr) return;
    if (reload) dispatch({ type: "SET_LOADING", payload: true });

    try {
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
        dashboardInfo,
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
        api.get_dashboard_info(),
      ]);

      const { Bids, UserInfo } = userInfoData;

      // Compute probabilities without extra renders
      let raffleETHProbability = 0;
      let raffleNFTProbability = 0;
      if (dashboardInfo) {
        const {
          CurRoundNum,
          NumRaffleEthWinnersBidding,
          NumRaffleNFTWinnersBidding,
        } = dashboardInfo;
        try {
          const bidList = await api.get_bid_list_by_round(CurRoundNum, "desc");
          const totalBids = bidList.length;
          const userBids = bidList.filter((bid: any) => bid.BidderAddr === addr)
            .length;
          if (totalBids > 0) {
            const othersFrac = (totalBids - userBids) / totalBids;
            raffleETHProbability =
              1 - Math.pow(othersFrac, NumRaffleEthWinnersBidding);
            raffleNFTProbability =
              1 - Math.pow(othersFrac, NumRaffleNFTWinnersBidding);
          }
        } catch (e) {
          console.error("Failed to compute probabilities", e);
        }
      }

      dispatch({
        type: "SET_ALL",
        payload: {
          claimHistory: claimHist,
          bidHistory: Bids,
          userInfo: UserInfo,
          balance: balanceData
            ? {
                CosmicToken: Number(
                  ethers.utils.formatEther(balanceData.CosmicTokenBalance)
                ),
                ETH: Number(ethers.utils.formatEther(balanceData.ETH_Balance)),
              }
            : { CosmicToken: 0, ETH: 0 },
          stakingCSTActions: cstActions,
          stakingRWLKActions: rwalkActions,
          marketingRewards: mRewards,
          cstList: userCstList,
          cstStakingRewards: stakingRewards,
          collectedCstStakingRewards: collectedRewards,
          cstStakingRewardsByDeposit: rewardsByDeposit,
          rwlkMints: rwalkMinted,
          data: dashboardInfo,
          raffleETHProbability,
          raffleNFTProbability,
        },
      });

      // Refresh other contexts (not awaited)
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
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  async function fetchDonatedNFTs(reload = true) {
    if (!account) return;
    if (reload) dispatch({ type: "SET_DONATED_NFT_LOADING", payload: true });
    try {
      const [claimed, unclaimed] = await Promise.all([
        api.get_claimed_donated_nft_by_user(account),
        api.get_unclaimed_donated_nft_by_user(account),
      ]);
      dispatch({
        type: "SET_DONATED_NFTS",
        payload: { claimed, unclaimed },
      });
    } catch (err) {
      console.error(err);
      setNotification({
        text: "Failed to fetch donated NFTs",
        type: "error",
        visible: true,
      });
      dispatch({ type: "SET_DONATED_NFT_LOADING", payload: false });
    }
  }

  async function fetchDonatedERC20Tokens(reload = true) {
    if (!account) return;
    if (reload) dispatch({ type: "SET_DONATED_ERC20_LOADING", payload: true });
    try {
      const donated = await api.get_donations_erc20_by_user(account);
      dispatch({ type: "SET_DONATED_ERC20", payload: donated });
    } catch (err) {
      console.error(err);
      setNotification({
        text: "Failed to fetch donated tokens",
        type: "error",
        visible: true,
      });
      dispatch({ type: "SET_DONATED_ERC20_LOADING", payload: false });
    }
  }

  // --- Claim handlers (await tx receipts instead of setTimeout) ---
  async function handleDonatedNFTsClaim(tokenID: number) {
    dispatch({ type: "ADD_CLAIMING_NFT", payload: tokenID });
    try {
      const tx = await prizeWalletContract.claimDonatedNft(tokenID);
      await tx.wait();
      await Promise.all([
        fetchUserData(account!, false),
        fetchDonatedNFTs(false),
      ]);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
    } finally {
      dispatch({ type: "REMOVE_CLAIMING_NFT", payload: tokenID });
    }
  }

  async function handleAllDonatedNFTsClaim() {
    const list = state.donatedNFTs.unclaimed;
    if (!list.length) return;
    try {
      dispatch({ type: "SET_ALL", payload: { isClaiming: true } });
      const indexList = list.map((item: any) => item.Index);
      const tx = await prizeWalletContract.claimManyDonatedNfts(indexList);
      await tx.wait();
      await Promise.all([
        fetchUserData(account!, false),
        fetchDonatedNFTs(false),
      ]);
    } catch (err) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        console.error(err);
        const msg = err?.data?.message
          ? getErrorMessage(err.data.message)
          : "An error occurred while claiming donated NFTs!";
        setNotification({ text: msg, type: "error", visible: true });
      }
    } finally {
      dispatch({ type: "SET_ALL", payload: { isClaiming: false } });
    }
  }

  async function handleDonatedERC20Claim(
    roundNum: any,
    tokenAddr: string,
    amount: any
  ) {
    try {
      const tx = await prizeWalletContract.claimDonatedToken(
        roundNum,
        tokenAddr,
        amount
      );
      await tx.wait();
      await fetchDonatedERC20Tokens(false);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
    }
  }

  async function handleAllDonatedERC20Claim() {
    try {
      const donatedTokensToClaim = state.donatedERC20.data
        .filter((x: any) => !x.Claimed)
        .map((x: any) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountEth,
        }));
      const tx = await prizeWalletContract.claimManyDonatedTokens(
        donatedTokensToClaim
      );
      await tx.wait();
      await fetchDonatedERC20Tokens(false);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
    }
  }

  /* --------------------------------------------------
    Effects
  -------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!account) return;
      await Promise.all([
        fetchUserData(account),
        fetchDonatedNFTs(),
        fetchDonatedERC20Tokens(),
      ]);
      if (!cancelled) {
        // no-op; state updated inside fetchers
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account]);

  /* --------------------------------------------------
    Render
  -------------------------------------------------- */
  const {
    loading,
    isClaiming,
    data,
    userInfo,
    balance,
    raffleETHProbability,
    raffleNFTProbability,
    bidHistory,
    claimHistory,
    marketingRewards,
    stakingCSTActions,
    cstStakingRewards,
    cstStakingRewardsByDeposit,
    collectedCstStakingRewards,
    cstList,
    stakingRWLKActions,
    rwlkMints,
    stakingTab,
    combinedDonatedNFTs,
    donatedNFTs,
    donatedERC20,
  } = state;

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
          <UserStatsSection
            userInfo={userInfo}
            balanceETH={balance.ETH}
            balanceCST={balance.CosmicToken}
            raffleETHProbability={raffleETHProbability}
            raffleNFTProbability={raffleNFTProbability}
            data={data}
          />

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
                <Tab
                  label={
                    <LabelWithImage
                      src="/images/CosmicSignatureNFT.png"
                      alt="cosmic signature nft"
                      text="Cosmic Signature Staking"
                    />
                  }
                />
                <Tab
                  label={
                    <LabelWithImage
                      src="/images/rwalk.jpg"
                      alt="RandomWalk nft"
                      text="Random Walk Staking"
                    />
                  }
                />
              </Tabs>
            </Box>

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

            <CustomTabPanel value={stakingTab} index={1}>
              <RWLKStakingTab
                userInfo={userInfo}
                stakingActions={stakingRWLKActions}
                rwlkMints={rwlkMints}
              />
            </CustomTabPanel>
          </Box>

          <Box mt={6}>
            <Typography variant="h6" lineHeight={1} mb={2}>
              Bid History
            </Typography>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </Box>

          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              Cosmic Signature Tokens User Own
            </Typography>
            <CSTTable list={cstList} />
          </Box>

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
              {state.donatedNFTs.unclaimed.length > 0 && (
                <Button
                  onClick={handleAllDonatedNFTsClaim}
                  variant="contained"
                  disabled={isClaiming}
                >
                  Claim All
                </Button>
              )}
            </Box>

            {donatedNFTs.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedNFTTable
                list={combinedDonatedNFTs}
                handleClaim={handleDonatedNFTsClaim}
                claimingTokens={donatedNFTs.claimingIds}
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
              {donatedERC20.data.some((x: any) => !x.Claimed) && (
                <Button
                  onClick={handleAllDonatedERC20Claim}
                  variant="contained"
                >
                  Claim All
                </Button>
              )}
            </Box>

            {donatedERC20.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedERC20Table
                list={donatedERC20.data}
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

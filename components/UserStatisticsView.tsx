import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Button, Link, Tab, Tabs, Typography } from '@mui/material';
import { formatEther } from 'viem';

import { useActiveWeb3React } from '../hooks/web3';
import useRaffleWalletContract from '../hooks/useRaffleWalletContract';
import { useStakedToken } from '../contexts/StakedTokenContext';
import { useApiData } from '../contexts/ApiDataContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import type {
  DashboardInfo,
  BidInfo,
  StakingAction,
  StakingRewardMint,
  UserInfo,
} from '../services/api';
import type { CSTToken } from '../pages/my-tokens';
import { formatEthValue } from '../utils';
import getErrorMessage from '../utils/alert';
import { CSTTable } from '../pages/my-tokens';

import type { WinningHistoryEntry } from './tables/WinningHistoryTable';
import type { MarketingReward } from './tables/MarketingRewardsTable';
import type { CSTStakingRewardByDeposit } from './staking/CSTStakingRewardsByDepositTable';
import type { CollectedReward } from './staking/CollectedCSTStakingRewardsTable';
import type { NFTRecord } from './donations/DonatedNFTTable';
import type { DonatedERC20Token } from './donations/DonatedERC20Table';
import BiddingHistoryTable from './tables/BiddingHistoryTable';
import StakingActionsTable from './staking/StakingActionsTable';
import WinningHistoryTable from './tables/WinningHistoryTable';
import MarketingRewardsTable from './tables/MarketingRewardsTable';
import DonatedNFTTable from './donations/DonatedNFTTable';
import { StakingRewardsTable } from './staking/StakingRewardsTable';
import { CSTStakingRewardsByDepositTable } from './staking/CSTStakingRewardsByDepositTable';
import { CollectedCSTStakingRewardsTable } from './staking/CollectedCSTStakingRewardsTable';
import { UncollectedCSTStakingRewardsTable } from './staking/UncollectedCSTStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from './staking/RwalkStakingRewardMintsTable';
import DonatedERC20Table from './donations/DonatedERC20Table';
import { MainWrapper } from './styled';

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------ */

interface UserProfileInfo {
  NumBids: number;
  NumPrizes: number;
  MaxBidAmount?: number;
  MaxWinAmount?: number;
  CosmicSignatureNumTransfers?: number;
  TotalCSTokensWon?: number;
  Address?: string;
  SumRaffleEthWinnings?: number;
  SumRaffleEthWithdrawal?: number;
  UnclaimedNFTs?: number;
  NumRaffleEthWinnings?: number;
  RaffleNFTsCount?: number;
  RewardNFTsCount?: number;
  StakingStatisticsRWalk?: {
    TotalNumStakeActions: number;
    TotalNumUnstakeActions: number;
    TotalTokensStaked: number;
    TotalTokensMinted: number;
  };
  [key: string]: unknown;
}

interface StakingRewardRow {
  TokenId: number;
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

interface UserStatisticsViewProps {
  address: string | null | undefined;
  isOwnProfile: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/* ------------------------------------------------------------------
   Sub-Components
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

function UserStatsSection({
  userInfo,
  balanceETH,
  balanceCST,
  raffleETHProbability,
  raffleNFTProbability,
  data,
}: {
  userInfo: UserProfileInfo;
  balanceETH: number;
  balanceCST: number;
  raffleETHProbability: number;
  raffleNFTProbability: number;
  data: DashboardInfo | null;
}) {
  if (!userInfo) {
    return <Typography variant="h6">There is no user information yet.</Typography>;
  }

  return (
    <>
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
        <Typography component="span">{userInfo.CosmicSignatureNumTransfers}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Maximum Bid Amount:
        </Typography>
        &nbsp;
        <Typography component="span">{formatEthValue(userInfo.MaxBidAmount ?? 0)}</Typography>
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
        <Typography component="span">{(userInfo.MaxWinAmount ?? 0).toFixed(6)} ETH</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Amount of Winnings in ETH raffles:
        </Typography>
        &nbsp;
        <Typography component="span">
          {(userInfo.SumRaffleEthWinnings ?? 0).toFixed(6)} ETH
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Amount Withdrawn from ETH raffles:
        </Typography>
        &nbsp;
        <Typography component="span">
          {(userInfo.SumRaffleEthWithdrawal ?? 0).toFixed(6)} ETH
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
            sx={{ color: 'inherit', fontSize: 'inherit' }}
          >
            {(
              (userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0)
            ).toFixed(6)}{' '}
            ETH
          </Link>
        </Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Number of (ETH) raffles Participated in:
        </Typography>
        &nbsp;
        <Typography component="span">{userInfo.NumRaffleEthWinnings}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Raffle NFTs Count (Raffle Mints):
        </Typography>
        &nbsp;
        <Typography component="span">
          <Link
            href={`/user/raffle-nft/${userInfo.Address}`}
            sx={{ color: 'inherit', fontSize: 'inherit' }}
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

      {!((data?.CurRoundNum ?? 0) > 0 && data?.TsRoundStart === 0) && raffleETHProbability >= 0 && (
        <>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Probability of Winning ETH:
            </Typography>
            &nbsp;
            <Typography component="span">{(raffleETHProbability * 100).toFixed(2)}%</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Probability of Winning NFT:
            </Typography>
            &nbsp;
            <Typography component="span">{(raffleNFTProbability * 100).toFixed(2)}%</Typography>
          </Box>
        </>
      )}

      <Typography mt={3}>
        This account has {userInfo.CosmicSignatureNumTransfers} CosmicSignature (ERC721) transfers.
        Click <Link href={`/cosmic-signature-transfer/${userInfo.Address}`}>here</Link> to see all
        the transfers made by this account.
      </Typography>
      <Typography mt={1}>
        Click <Link href={`/cosmic-token-transfer/${userInfo.Address}`}>here</Link> to see all
        CosmicToken (ERC20) transfers made by this account.
      </Typography>
    </>
  );
}

function CSTStakingTab({
  stakingActions,
  cstStakingRewards,
  cstStakingRewardsByDeposit,
  collectedCstStakingRewards,
  address,
}: {
  stakingActions: StakingAction[];
  cstStakingRewards: StakingRewardRow[];
  cstStakingRewardsByDeposit: CSTStakingRewardByDeposit[];
  collectedCstStakingRewards: CollectedReward[];
  address: string;
}) {
  const totalStakeActions = stakingActions.filter((a) => a.ActionType !== 1).length;
  const totalUnstakeActions = stakingActions.filter((a) => a.ActionType === 1).length;
  const totalRewardEth = cstStakingRewards.reduce(
    (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
    0,
  );
  const unclaimedRewardEth = cstStakingRewards.reduce(
    (sum, r) => sum + (r.RewardToCollectEth ?? 0),
    0,
  );

  return (
    <>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Stake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">{totalStakeActions}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Unstake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">{totalUnstakeActions}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens with Rewards:
        </Typography>
        &nbsp;
        <Typography component="span">{cstStakingRewards.length}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Rewards:
        </Typography>
        &nbsp;
        <Typography component="span">{formatEthValue(totalRewardEth)}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Unclaimed Rewards:
        </Typography>
        &nbsp;
        <Typography component="span">{formatEthValue(unclaimedRewardEth)}</Typography>
      </Box>

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
        <StakingRewardsTable list={cstStakingRewards} address={address} />
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
        <UncollectedCSTStakingRewardsTable user={address} />
      </Box>
    </>
  );
}

function RWLKStakingTab({
  userInfo,
  stakingActions,
  rwlkMints,
}: {
  userInfo: UserProfileInfo;
  stakingActions: StakingAction[];
  rwlkMints: StakingRewardMint[];
}) {
  const rwlkStats = userInfo?.StakingStatisticsRWalk;

  return (
    <>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Stake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">{rwlkStats?.TotalNumStakeActions ?? 0}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Number of Unstake Actions:
        </Typography>
        &nbsp;
        <Typography component="span">{rwlkStats?.TotalNumUnstakeActions ?? 0}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens Staked:
        </Typography>
        &nbsp;
        <Typography component="span">{rwlkStats?.TotalTokensStaked ?? 0}</Typography>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Total Tokens Minted:
        </Typography>
        &nbsp;
        <Typography component="span">{rwlkStats?.TotalTokensMinted ?? 0}</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
          Stake / Unstake Actions
        </Typography>
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
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
   Main Component
------------------------------------------------------------------ */

const UserStatisticsView: React.FC<UserStatisticsViewProps> = ({ address, isOwnProfile }) => {
  const { account } = useActiveWeb3React();
  const prizeWalletContract = useRaffleWalletContract();
  const { fetchData: fetchStakedTokens } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();

  const canClaim =
    isOwnProfile || (!!account && !!address && account.toLowerCase() === address.toLowerCase());

  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  const [data, setData] = useState<DashboardInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserProfileInfo | null>(null);
  const [balance, setBalance] = useState({ CosmicToken: 0, ETH: 0 });

  const [raffleETHProbability, setRaffleETHProbability] = useState(-1);
  const [raffleNFTProbability, setRaffleNFTProbability] = useState(-1);

  const [bidHistory, setBidHistory] = useState<BidInfo[]>([]);
  const [claimHistory, setClaimHistory] = useState<WinningHistoryEntry[] | null>(null);
  const [marketingRewards, setMarketingRewards] = useState<MarketingReward[]>([]);

  const [stakingCSTActions, setStakingCSTActions] = useState<StakingAction[]>([]);
  const [cstStakingRewards, setCstStakingRewards] = useState<StakingRewardRow[]>([]);
  const [collectedCstStakingRewards, setCollectedCstStakingRewards] = useState<CollectedReward[]>(
    [],
  );
  const [cstStakingRewardsByDeposit, setCstStakingRewardsByDeposit] = useState<
    CSTStakingRewardByDeposit[]
  >([]);
  const [cstList, setCSTList] = useState<CSTToken[]>([]);

  const [stakingRWLKActions, setStakingRWLKActions] = useState<StakingAction[]>([]);
  const [rwlkMints, setRWLKMints] = useState<StakingRewardMint[]>([]);

  const [claimedDonatedNFTs, setClaimedDonatedNFTs] = useState({
    data: [] as NFTRecord[],
    loading: false,
  });
  const [unclaimedDonatedNFTs, setUnclaimedDonatedNFTs] = useState({
    data: [] as NFTRecord[],
    loading: false,
  });
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState({
    data: [] as DonatedERC20Token[],
    loading: false,
  });

  const [stakingTab, setStakingTab] = useState(0);

  /* --------------------------------------------------
     Data Fetching
  -------------------------------------------------- */

  const fetchUserData = useCallback(
    async (addr: string, reload: boolean = true) => {
      if (reload) setLoading(true);
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

        const { Bids, UserInfo } = userInfoData ?? {};
        setClaimHistory(claimHist as WinningHistoryEntry[] | null);
        setBidHistory(Bids ?? []);
        setUserInfo((UserInfo as UserProfileInfo) ?? null);
        if (balanceData) {
          setBalance({
            CosmicToken: Number(formatEther(BigInt(balanceData.CosmicTokenBalance || 0))),
            ETH: Number(formatEther(BigInt(balanceData.ETH_Balance || 0))),
          });
        }

        setStakingCSTActions(Array.isArray(cstActions) ? (cstActions as StakingAction[]) : []);
        setStakingRWLKActions(Array.isArray(rwalkActions) ? (rwalkActions as StakingAction[]) : []);
        setMarketingRewards((mRewards ?? []) as MarketingReward[]);
        setCSTList((userCstList ?? []) as unknown as CSTToken[]);
        setCstStakingRewards((stakingRewards ?? []) as StakingRewardRow[]);
        setCollectedCstStakingRewards((collectedRewards ?? []) as unknown as CollectedReward[]);
        setCstStakingRewardsByDeposit((rewardsByDeposit ?? []) as CSTStakingRewardByDeposit[]);
        setRWLKMints(rwalkMinted ?? []);

        fetchStakedTokens();
        fetchStatusData();
      } catch (err) {
        console.error(err);
        setNotification({
          text: 'Failed to fetch data',
          type: 'error',
          visible: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [fetchStakedTokens, fetchStatusData, setNotification],
  );

  const fetchDonatedNFTs = useCallback(
    async (reload: boolean = true) => {
      if (!address) return;
      setClaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));
      setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));
      try {
        const [claimed, unclaimed] = await Promise.all([
          api.get_claimed_donated_nft_by_user(address),
          api.get_unclaimed_donated_nft_by_user(address),
        ]);
        setClaimedDonatedNFTs({
          data: Array.isArray(claimed) ? (claimed as NFTRecord[]) : [],
          loading: false,
        });
        setUnclaimedDonatedNFTs({
          data: Array.isArray(unclaimed) ? (unclaimed as NFTRecord[]) : [],
          loading: false,
        });
      } catch (err) {
        console.error(err);
        setNotification({
          text: 'Failed to fetch donated NFTs',
          type: 'error',
          visible: true,
        });
        setClaimedDonatedNFTs((prev) => ({ ...prev, loading: false }));
        setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: false }));
      }
    },
    [address, setNotification],
  );

  const fetchDonatedERC20Tokens = useCallback(
    async (reload: boolean = true) => {
      if (!address) return;
      setDonatedERC20Tokens((prev) => ({ ...prev, loading: reload }));
      try {
        const tokens = await api.get_donations_erc20_by_user(address);
        setDonatedERC20Tokens({
          data: Array.isArray(tokens) ? (tokens as DonatedERC20Token[]) : [],
          loading: false,
        });
      } catch (err) {
        console.error(err);
        setNotification({
          text: 'Failed to fetch donated ERC20 tokens',
          type: 'error',
          visible: true,
        });
        setDonatedERC20Tokens((prev) => ({ ...prev, loading: false }));
      }
    },
    [address, setNotification],
  );

  const calculateProbability = useCallback(async () => {
    if (!address) return;
    try {
      const newData = await api.get_dashboard_info();
      setData(newData);

      if (newData) {
        const {
          CurRoundNum,
          NumRaffleEthWinnersBidding = 1,
          NumRaffleNFTWinnersBidding = 1,
        } = newData;
        const bidList = await api.get_bid_list_by_round(CurRoundNum, 'desc');
        const totalBids = bidList.length;
        const userBids = bidList.filter(
          (bid: BidInfo) => bid.BidderAddr?.toLowerCase() === address?.toLowerCase(),
        ).length;

        if (totalBids > 0) {
          setRaffleETHProbability(
            1 - Math.pow((totalBids - userBids) / totalBids, NumRaffleEthWinnersBidding),
          );
          setRaffleNFTProbability(
            1 - Math.pow((totalBids - userBids) / totalBids, NumRaffleNFTWinnersBidding),
          );
        } else {
          setRaffleETHProbability(-1);
          setRaffleNFTProbability(-1);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [address]);

  /* --------------------------------------------------
     Claim Handlers
  -------------------------------------------------- */

  const handleDonatedNFTsClaim = async (tokenID: number) => {
    if (!prizeWalletContract) return;
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    setIsClaiming(true);
    try {
      await prizeWalletContract.write.claimDonatedNft?.([tokenID]);
      setTimeout(() => {
        fetchUserData(address!, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      const ethErr = err as { code?: number; data?: { message?: string } };
      if (ethErr?.code !== 4001) {
        console.error(err);
        const msg = ethErr?.data?.message
          ? getErrorMessage(ethErr.data.message)
          : 'An error occurred';
        setNotification({ text: msg, type: 'error', visible: true });
      }
      setIsClaiming(false);
    } finally {
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    if (!unclaimedDonatedNFTs.data.length || !prizeWalletContract) return;
    setIsClaiming(true);
    try {
      const indexList = unclaimedDonatedNFTs.data.map((item: { Index: number }) => item.Index);
      await prizeWalletContract.write.claimManyDonatedNfts?.([indexList]);
      setTimeout(() => {
        fetchUserData(address!, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      const ethErr = err as { code?: number; data?: { message?: string } };
      if (ethErr?.code !== 4001) {
        console.error(err);
        const msg = ethErr?.data?.message
          ? getErrorMessage(ethErr.data.message)
          : 'An error occurred while claiming donated NFTs!';
        setNotification({ text: msg, type: 'error', visible: true });
      }
      setIsClaiming(false);
    }
  };

  const handleDonatedERC20Claim = async (roundNum: number, tokenAddr: string, amount: string) => {
    if (!prizeWalletContract) return;
    try {
      await prizeWalletContract.write.claimDonatedToken?.([roundNum, tokenAddr, amount]);
      setTimeout(() => {
        fetchDonatedERC20Tokens(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      const msg = ethErr?.data?.message
        ? getErrorMessage(ethErr.data.message)
        : 'An error occurred';
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  const handleAllDonatedERC20Claim = async () => {
    if (!prizeWalletContract) return;
    try {
      const donatedTokensToClaim = donatedERC20Tokens.data
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountDonatedEth,
        }));
      await prizeWalletContract.write.claimManyDonatedTokens?.([donatedTokensToClaim]);
      setTimeout(() => {
        fetchDonatedERC20Tokens(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const ethErr = err as { data?: { message?: string } };
      const msg = ethErr?.data?.message
        ? getErrorMessage(ethErr.data.message)
        : 'An error occurred';
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  /* --------------------------------------------------
     Tab Handling
  -------------------------------------------------- */

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setStakingTab(newValue);
  };

  /* --------------------------------------------------
     Effects
  -------------------------------------------------- */

  useEffect(() => {
    if (!address || address === 'Invalid Address') return;
    fetchUserData(address);
    fetchDonatedNFTs();
    fetchDonatedERC20Tokens();
    calculateProbability();
  }, [address, fetchUserData, fetchDonatedNFTs, fetchDonatedERC20Tokens, calculateProbability]);

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */

  if (address === 'Invalid Address') {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Address</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      {isOwnProfile ? (
        <Typography variant="h4" color="primary" mb={4}>
          My Statistics
        </Typography>
      ) : (
        <Box mb={4}>
          <Typography variant="h6" color="primary" component="span" mr={2}>
            User
          </Typography>
          <Typography
            variant="h6"
            component="span"
            fontFamily="monospace"
            sx={{ wordBreak: 'break-all' }}
          >
            {address}
          </Typography>
        </Box>
      )}

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

          {/* Staking Statistics */}
          <Box mt={4}>
            <Typography variant="h6" lineHeight={1} mb={1}>
              Staking Statistics
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs variant="fullWidth" value={stakingTab} onChange={handleTabChange}>
                <Tab
                  label={
                    <Box sx={{ display: 'flex' }}>
                      <Image
                        src="/images/CosmicSignatureNFT.png"
                        width={94}
                        height={60}
                        alt="cosmic signature nft"
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          whiteSpace: 'nowrap',
                          textTransform: 'none',
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
                    <Box sx={{ display: 'flex' }}>
                      <Image src="/images/rwalk.jpg" width={94} height={60} alt="RandomWalk nft" />
                      <Typography
                        variant="h6"
                        sx={{
                          whiteSpace: 'nowrap',
                          textTransform: 'none',
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

            <CustomTabPanel value={stakingTab} index={0}>
              <CSTStakingTab
                stakingActions={stakingCSTActions}
                cstStakingRewards={cstStakingRewards}
                cstStakingRewardsByDeposit={cstStakingRewardsByDeposit}
                collectedCstStakingRewards={collectedCstStakingRewards}
                address={address!}
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
              winningHistory={claimHistory ?? []}
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

          {/* Donated NFTs */}
          <Box mt={8}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Donated NFTs User Won</Typography>
              {unclaimedDonatedNFTs.data.length > 0 && canClaim && (
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
                list={[...unclaimedDonatedNFTs.data, ...claimedDonatedNFTs.data]}
                handleClaim={canClaim ? handleDonatedNFTsClaim : undefined}
                claimingTokens={claimingDonatedNFTs}
              />
            )}
          </Box>

          {/* Donated ERC20 */}
          <Box mt={8}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Donated ERC20 Tokens</Typography>
              {donatedERC20Tokens.data.filter((x) => !x.Claimed).length > 0 && canClaim && (
                <Button onClick={handleAllDonatedERC20Claim} variant="contained">
                  Claim All
                </Button>
              )}
            </Box>

            {donatedERC20Tokens.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedERC20Table
                list={donatedERC20Tokens.data}
                handleClaim={canClaim ? handleDonatedERC20Claim : null}
              />
            )}
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

export default UserStatisticsView;

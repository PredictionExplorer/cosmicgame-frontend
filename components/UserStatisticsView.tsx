import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatEther } from 'viem';

import { formatEthValue } from '@/utils';

import { useActiveWeb3React } from '@/hooks/web3';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/services/api';
import type { DashboardInfo, BidInfo, StakingAction, StakingRewardMint } from '@/services/api';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CSTTable, type CSTToken } from './tokens/CSTTable';
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

/* ------------------------------------------------------------------
   Sub-Components
------------------------------------------------------------------ */

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <span className="text-primary">{label}</span>
      &nbsp;
      <span>{children}</span>
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
    return <h6 className="text-xl font-medium">There is no user information yet.</h6>;
  }

  return (
    <>
      {balanceETH !== 0 && <StatRow label="ETH Balance:">{balanceETH.toFixed(6)} ETH</StatRow>}
      {balanceCST !== 0 && (
        <StatRow label="Cosmic Tokens Balance:">{balanceCST.toFixed(2)} CST</StatRow>
      )}

      <StatRow label="Number of Bids:">{userInfo.NumBids}</StatRow>
      <StatRow label="Number of Cosmic Signature Transfers:">
        {userInfo.CosmicSignatureNumTransfers}
      </StatRow>
      <StatRow label="Maximum Bid Amount:">{formatEthValue(userInfo.MaxBidAmount ?? 0)}</StatRow>
      <StatRow label="Number of Prizes Taken:">{userInfo.NumPrizes}</StatRow>
      <StatRow label="Maximum Amount Gained (in prize winnings):">
        {(userInfo.MaxWinAmount ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Amount of Winnings in ETH raffles:">
        {(userInfo.SumRaffleEthWinnings ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Amount Withdrawn from ETH raffles:">
        {(userInfo.SumRaffleEthWithdrawal ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Unclaimed Donated NFTs:">{userInfo.UnclaimedNFTs}</StatRow>
      <StatRow label="Total ETH Won in raffles:">
        <Link href={`/user/raffle-eth/${userInfo.Address}`} className="text-inherit">
          {((userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0)).toFixed(
            6,
          )}{' '}
          ETH
        </Link>
      </StatRow>
      <StatRow label="Number of (ETH) raffles Participated in:">
        {userInfo.NumRaffleEthWinnings}
      </StatRow>
      <StatRow label="Raffle NFTs Count (Raffle Mints):">
        <Link href={`/user/raffle-nft/${userInfo.Address}`} className="text-inherit">
          {userInfo.RaffleNFTsCount}
        </Link>
      </StatRow>
      <StatRow label="Reward NFTs Count (All Mints):">{userInfo.RewardNFTsCount}</StatRow>
      <StatRow label="Number of Cosmic Signature Tokens Won:">{userInfo.TotalCSTokensWon}</StatRow>

      {!((data?.CurRoundNum ?? 0) > 0 && data?.TsRoundStart === 0) && raffleETHProbability >= 0 && (
        <>
          <StatRow label="Probability of Winning ETH:">
            {(raffleETHProbability * 100).toFixed(2)}%
          </StatRow>
          <StatRow label="Probability of Winning NFT:">
            {(raffleNFTProbability * 100).toFixed(2)}%
          </StatRow>
        </>
      )}

      <p className="mt-6">
        This account has {userInfo.CosmicSignatureNumTransfers} CosmicSignature (ERC721) transfers.
        Click{' '}
        <Link
          href={`/cosmic-signature-transfer/${userInfo.Address}`}
          className="text-primary underline"
        >
          here
        </Link>{' '}
        to see all the transfers made by this account.
      </p>
      <p className="mt-2">
        Click{' '}
        <Link
          href={`/cosmic-token-transfer/${userInfo.Address}`}
          className="text-primary underline"
        >
          here
        </Link>{' '}
        to see all CosmicToken (ERC20) transfers made by this account.
      </p>
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
      <StatRow label="Total Number of Stake Actions:">{totalStakeActions}</StatRow>
      <StatRow label="Total Number of Unstake Actions:">{totalUnstakeActions}</StatRow>
      <StatRow label="Total Tokens with Rewards:">{cstStakingRewards.length}</StatRow>
      <StatRow label="Total Rewards:">{formatEthValue(totalRewardEth)}</StatRow>
      <StatRow label="Unclaimed Rewards:">{formatEthValue(unclaimedRewardEth)}</StatRow>

      <div>
        <h6 className="text-base font-medium leading-none mt-8 mb-4">Stake / Unstake Actions</h6>
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Staking Rewards by Token</h6>
        <StakingRewardsTable list={cstStakingRewards} address={address} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Staking Rewards by Deposit</h6>
        <CSTStakingRewardsByDepositTable list={cstStakingRewardsByDeposit} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Collected Staking Rewards</h6>
        <CollectedCSTStakingRewardsTable list={collectedCstStakingRewards} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Uncollected Staking Rewards</h6>
        <UncollectedCSTStakingRewardsTable user={address} />
      </div>
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
      <StatRow label="Total Number of Stake Actions:">
        {rwlkStats?.TotalNumStakeActions ?? 0}
      </StatRow>
      <StatRow label="Total Number of Unstake Actions:">
        {rwlkStats?.TotalNumUnstakeActions ?? 0}
      </StatRow>
      <StatRow label="Total Tokens Staked:">{rwlkStats?.TotalTokensStaked ?? 0}</StatRow>
      <StatRow label="Total Tokens Minted:">{rwlkStats?.TotalTokensMinted ?? 0}</StatRow>

      <div>
        <h6 className="text-base font-medium leading-none mt-8 mb-4">Stake / Unstake Actions</h6>
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
      </div>

      <div>
        <h6 className="text-base font-medium leading-none mt-8 mb-4">Staking Reward Tokens</h6>
        <RwalkStakingRewardMintsTable list={rwlkMints} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */

const UserStatisticsView = ({ address, isOwnProfile }: UserStatisticsViewProps) => {
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
        reportError(err, 'fetch user statistics');
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
        reportError(err, 'fetch donated NFTs');
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
        reportError(err, 'fetch donated ERC20 tokens');
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
      reportError(err, 'calculate win probability');
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
      if (!isUserRejection(err)) {
        reportError(err, 'claim donated NFT');
        const msg = getEthErrorMessage(err, 'An error occurred');
        setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
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
      if (!isUserRejection(err)) {
        reportError(err, 'claim all donated NFTs');
        const msg = getEthErrorMessage(err, 'An error occurred while claiming donated NFTs!');
        setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
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
      if (isUserRejection(err)) return;
      reportError(err, 'claim donated ERC20 token');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
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
      if (isUserRejection(err)) return;
      reportError(err, 'claim all donated ERC20 tokens');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    }
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
        <h6 className="text-xl font-medium">Invalid Address</h6>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      {isOwnProfile ? (
        <h4 className="text-2xl font-bold text-primary mb-8">My Statistics</h4>
      ) : (
        <div className="mb-8">
          <span className="text-xl font-medium text-primary mr-4">User</span>
          <span className="text-xl font-mono break-all">{address}</span>
        </div>
      )}

      {loading ? (
        <h6 className="text-xl font-medium">Loading...</h6>
      ) : !userInfo ? (
        <h6 className="text-xl font-medium">There is no user information yet.</h6>
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
          <div className="mt-8">
            <h6 className="text-xl font-medium leading-none mb-2">Staking Statistics</h6>

            <Tabs defaultValue="cst" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-auto bg-transparent border-b border-border rounded-none p-0">
                <TabsTrigger
                  value="cst"
                  className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center">
                    <Image
                      src="/images/CosmicSignatureNFT.png"
                      width={94}
                      height={60}
                      alt="cosmic signature nft"
                    />
                    <span className="text-lg whitespace-nowrap normal-case ml-4">
                      Cosmic Signature Staking
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="rwlk"
                  className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center">
                    <Image src="/images/rwalk.jpg" width={94} height={60} alt="RandomWalk nft" />
                    <span className="text-lg whitespace-nowrap normal-case ml-4">
                      Random Walk Staking
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cst" className="p-6">
                <CSTStakingTab
                  stakingActions={stakingCSTActions}
                  cstStakingRewards={cstStakingRewards}
                  cstStakingRewardsByDeposit={cstStakingRewardsByDeposit}
                  collectedCstStakingRewards={collectedCstStakingRewards}
                  address={address!}
                />
              </TabsContent>

              <TabsContent value="rwlk" className="p-6">
                <RWLKStakingTab
                  userInfo={userInfo}
                  stakingActions={stakingRWLKActions}
                  rwlkMints={rwlkMints}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Bidding History */}
          <div className="mt-12">
            <h6 className="text-xl font-medium leading-none mb-4">Bid History</h6>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </div>

          {/* User CST Tokens */}
          <div>
            <h6 className="text-xl font-medium leading-none mt-16 mb-4">
              Cosmic Signature Tokens User Own
            </h6>
            <CSTTable list={cstList} />
          </div>

          {/* History of Winnings */}
          <div>
            <h6 className="text-xl font-medium leading-none mt-16 mb-4">History of Winnings</h6>
            <WinningHistoryTable
              winningHistory={claimHistory ?? []}
              showClaimedStatus={true}
              showWinnerAddr={false}
            />
          </div>

          {/* Marketing Rewards */}
          {marketingRewards.length > 0 && (
            <div>
              <h6 className="text-xl font-medium leading-none mt-16 mb-4">Marketing Rewards</h6>
              <MarketingRewardsTable list={marketingRewards} />
            </div>
          )}

          {/* Donated NFTs */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-xl font-medium">Donated NFTs User Won</h6>
              {unclaimedDonatedNFTs.data.length > 0 && canClaim && (
                <Button onClick={handleAllDonatedNFTsClaim} disabled={isClaiming}>
                  Claim All
                </Button>
              )}
            </div>

            {unclaimedDonatedNFTs.loading || claimedDonatedNFTs.loading ? (
              <h6 className="text-xl font-medium">Loading...</h6>
            ) : (
              <DonatedNFTTable
                list={[...unclaimedDonatedNFTs.data, ...claimedDonatedNFTs.data]}
                handleClaim={canClaim ? handleDonatedNFTsClaim : undefined}
                claimingTokens={claimingDonatedNFTs}
              />
            )}
          </div>

          {/* Donated ERC20 */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-xl font-medium">Donated ERC20 Tokens</h6>
              {donatedERC20Tokens.data.filter((x) => !x.Claimed).length > 0 && canClaim && (
                <Button onClick={handleAllDonatedERC20Claim}>Claim All</Button>
              )}
            </div>

            {donatedERC20Tokens.loading ? (
              <h6 className="text-xl font-medium">Loading...</h6>
            ) : (
              <DonatedERC20Table
                list={donatedERC20Tokens.data}
                handleClaim={canClaim ? handleDonatedERC20Claim : null}
              />
            )}
          </div>
        </>
      )}
    </MainWrapper>
  );
};

export default UserStatisticsView;

'use client';

import { useState, useMemo } from 'react';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react';

import { useActiveWeb3React } from '@/hooks/web3';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { BidInfo } from '@/services/api';
import {
  useDashboardInfo,
  useClaimHistoryByUser,
  useUserInfo,
  useUserBalance,
  useStakingCSTActionsByUser,
  useStakingRWLKActionsByUser,
  useMarketingRewardsByUser,
  useCSTTokensByUser,
  useStakingRewardsByUser,
  useStakingCSTRewardsCollectedByUser,
  useStakingCSTByUserByDepositRewards,
  useStakingRWLKMintsByUser,
  useClaimedDonatedNFTByUser,
  useUnclaimedDonatedNFTByUser,
  useDonationsERC20ByUser,
  useBidListByRound,
} from '@/hooks/useApiQuery';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { StatCardSkeleton } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressChip } from '@/components/ui/address-chip';

import { CSTTable } from './tokens/CSTTable';
import type { WinningHistoryEntry } from './tables/WinningHistoryTable';
import type { MarketingReward } from './tables/MarketingRewardsTable';
import type { CSTStakingRewardByDeposit } from './staking/CSTStakingRewardsByDepositTable';
import type { NFTRecord } from './donations/DonatedNFTTable';
import type { DonatedERC20Token } from './donations/DonatedERC20Table';
import BiddingHistoryTable from './tables/BiddingHistoryTable';
import WinningHistoryTable from './tables/WinningHistoryTable';
import MarketingRewardsTable from './tables/MarketingRewardsTable';
import { UserStatsSection, type UserProfileInfo } from './user-statistics/UserStatsSection';
import { UserStakingSection } from './user-statistics/UserStakingSection';
import { DonatedAssetsSection } from './user-statistics/DonatedAssetsSection';

interface StakingRewardRow {
  TokenId: number;
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface UserStatisticsViewProps {
  address: string | null | undefined;
  isOwnProfile: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8" data-testid="statistics-loading-skeleton">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Comprehensive user profile view with bidding stats, winning history, staking actions, token holdings, and raffle claims. */
const UserStatisticsView = ({ address, isOwnProfile }: UserStatisticsViewProps) => {
  const { account } = useActiveWeb3React();
  const prizeWalletContract = useRaffleWalletContract();
  const { fetchData: fetchStakedTokens } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();
  const queryClient = useQueryClient();

  const canClaim =
    isOwnProfile || (!!account && !!address && account.toLowerCase() === address.toLowerCase());
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);

  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: claimHistoryRaw, isLoading: loadingClaims } = useClaimHistoryByUser(address);
  const { data: userInfoRaw, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: balanceData, isLoading: loadingBalance } = useUserBalance(address);
  const { data: stakingCSTActions = [], isLoading: loadingCSTActions } =
    useStakingCSTActionsByUser(address);
  const { data: stakingRWLKActions = [], isLoading: loadingRWLKActions } =
    useStakingRWLKActionsByUser(address);
  const { data: marketingRewardsRaw = [], isLoading: loadingMarketing } =
    useMarketingRewardsByUser(address);
  const { data: cstListRaw = [], isLoading: loadingCST } = useCSTTokensByUser(address);
  const { data: cstStakingRewardsRaw = [], isLoading: loadingStakingRewards } =
    useStakingRewardsByUser(address);
  const { data: collectedCstStakingRewardsRaw = [], isLoading: loadingCollected } =
    useStakingCSTRewardsCollectedByUser(address);
  const { data: cstStakingRewardsByDepositRaw = [], isLoading: loadingByDeposit } =
    useStakingCSTByUserByDepositRewards(address);
  const { data: rwlkMints = [], isLoading: loadingMints } = useStakingRWLKMintsByUser(address);
  const { data: claimedNFTsRaw = [], isLoading: loadingClaimedNFTs } =
    useClaimedDonatedNFTByUser(address);
  const { data: unclaimedNFTsRaw = [], isLoading: loadingUnclaimedNFTs } =
    useUnclaimedDonatedNFTByUser(address);
  const { data: erc20Raw = [], isLoading: loadingERC20 } = useDonationsERC20ByUser(address);

  const curRoundNum = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListForProb = [] } = useBidListByRound(curRoundNum, 'desc');

  const data = dashboardData ?? null;
  const { Bids: bidHistory = [], UserInfo: userInfoObj } = userInfoRaw ?? {};
  const userInfo = (userInfoObj as UserProfileInfo) ?? null;
  const claimHistory = (claimHistoryRaw as WinningHistoryEntry[] | null) ?? null;
  const marketingRewards = (marketingRewardsRaw ?? []) as MarketingReward[];
  const cstList = cstListRaw ?? [];
  const cstStakingRewards = (cstStakingRewardsRaw ?? []) as StakingRewardRow[];
  const collectedCstStakingRewards = collectedCstStakingRewardsRaw ?? [];
  const cstStakingRewardsByDeposit = (cstStakingRewardsByDepositRaw ??
    []) as CSTStakingRewardByDeposit[];
  const claimedDonatedNFTsList = Array.isArray(claimedNFTsRaw)
    ? (claimedNFTsRaw as NFTRecord[])
    : [];
  const unclaimedDonatedNFTsList = Array.isArray(unclaimedNFTsRaw)
    ? (unclaimedNFTsRaw as NFTRecord[])
    : [];
  const donatedERC20List = (erc20Raw ?? []) as DonatedERC20Token[];

  const balance = useMemo(() => {
    if (!balanceData) return { CosmicToken: 0, ETH: 0 };
    return {
      CosmicToken: Number(formatEther(BigInt(balanceData.CosmicTokenBalance || 0))),
      ETH: Number(formatEther(BigInt(balanceData.ETH_Balance || 0))),
    };
  }, [balanceData]);

  const { raffleETHProbability, raffleNFTProbability } = useMemo(() => {
    if (!address || !dashboardData || !bidListForProb.length)
      return { raffleETHProbability: -1, raffleNFTProbability: -1 };
    const totalBids = bidListForProb.length;
    const userBids = bidListForProb.filter(
      (bid: BidInfo) => bid.BidderAddr?.toLowerCase() === address?.toLowerCase(),
    ).length;
    if (totalBids > 0) {
      return {
        raffleETHProbability:
          1 -
          Math.pow(
            (totalBids - userBids) / totalBids,
            dashboardData.NumRaffleEthWinnersBidding ?? 1,
          ),
        raffleNFTProbability:
          1 -
          Math.pow(
            (totalBids - userBids) / totalBids,
            dashboardData.NumRaffleNFTWinnersBidding ?? 1,
          ),
      };
    }
    return { raffleETHProbability: -1, raffleNFTProbability: -1 };
  }, [address, dashboardData, bidListForProb]);

  const totalStakeRewardEth = useMemo(
    () =>
      cstStakingRewards.reduce(
        (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
        0,
      ),
    [cstStakingRewards],
  );

  const loading =
    loadingDashboard ||
    loadingClaims ||
    loadingUserInfo ||
    loadingBalance ||
    loadingCSTActions ||
    loadingRWLKActions ||
    loadingMarketing ||
    loadingCST ||
    loadingStakingRewards ||
    loadingCollected ||
    loadingByDeposit ||
    loadingMints;

  const handleDonatedNFTsClaim = async (tokenID: number) => {
    if (!prizeWalletContract) return;
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    setIsClaiming(true);
    try {
      await prizeWalletContract.write.claimDonatedNft?.([tokenID]);
      setTimeout(() => {
        queryClient.invalidateQueries();
        fetchStakedTokens();
        fetchStatusData();
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
    if (!unclaimedDonatedNFTsList.length || !prizeWalletContract) return;
    setIsClaiming(true);
    try {
      const indexList = unclaimedDonatedNFTsList.map((item: { Index: number }) => item.Index);
      await prizeWalletContract.write.claimManyDonatedNfts?.([indexList]);
      setTimeout(() => {
        queryClient.invalidateQueries();
        fetchStakedTokens();
        fetchStatusData();
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
        queryClient.invalidateQueries({ queryKey: ['donationsERC20ByUser'] });
      }, 3000);
    } catch (err) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim donated ERC20 token');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      setNotification({ text: getErrorMessage(rawMsg) || rawMsg, type: 'error', visible: true });
    }
  };

  const handleAllDonatedERC20Claim = async () => {
    if (!prizeWalletContract) return;
    try {
      const donatedTokensToClaim = donatedERC20List
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountDonatedEth,
        }));
      await prizeWalletContract.write.claimManyDonatedTokens?.([donatedTokensToClaim]);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['donationsERC20ByUser'] });
      }, 3000);
    } catch (err) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim all donated ERC20 tokens');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      setNotification({ text: getErrorMessage(rawMsg) || rawMsg, type: 'error', visible: true });
    }
  };

  if (address === 'Invalid Address') {
    return (
      <MainWrapper>
        <h1 className="text-xl font-medium">Invalid Address</h1>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper aria-label={isOwnProfile ? 'My Statistics' : 'User Statistics'}>
      <PageHeader
        title={isOwnProfile ? 'My Statistics' : 'User Profile'}
        subtitle={
          isOwnProfile
            ? 'Your complete performance dashboard and activity history'
            : 'Viewing another player\u2019s statistics and activity'
        }
      >
        {address && !isOwnProfile && (
          <div className="mt-3 flex justify-center">
            <AddressChip address={address} truncateLength={8} />
          </div>
        )}
      </PageHeader>

      {loading ? (
        <LoadingSkeleton />
      ) : !userInfo ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-white/[0.04] p-4">
            <UserCircle className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-semibold">No activity yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This account hasn&apos;t participated in any rounds yet. Place a bid to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <UserStatsSection
            userInfo={userInfo}
            balanceETH={balance.ETH}
            balanceCST={balance.CosmicToken}
            raffleETHProbability={raffleETHProbability}
            raffleNFTProbability={raffleNFTProbability}
            data={data}
            isOwnProfile={isOwnProfile}
            totalStakeRewardEth={totalStakeRewardEth}
          />

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title="Bidding History" />
            <div className="mt-6">
              <BiddingHistoryTable biddingHistory={bidHistory} />
            </div>
          </motion.section>

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title="Winning History" />
            <div className="mt-6">
              <WinningHistoryTable
                winningHistory={claimHistory ?? []}
                showClaimedStatus={true}
                showWinnerAddr={false}
              />
            </div>
          </motion.section>

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title="Staking" />
            <div className="mt-6">
              <UserStakingSection
                address={address!}
                userInfo={userInfo}
                stakingCSTActions={stakingCSTActions}
                stakingRWLKActions={stakingRWLKActions}
                cstStakingRewards={cstStakingRewards}
                cstStakingRewardsByDeposit={cstStakingRewardsByDeposit}
                collectedCstStakingRewards={collectedCstStakingRewards}
                rwlkMints={rwlkMints}
              />
            </div>
          </motion.section>

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title="Token Holdings" />
            <div className="mt-6">
              <CSTTable list={cstList} />
            </div>
          </motion.section>

          {marketingRewards.length > 0 && (
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <SectionDivider title="Marketing Rewards" />
              <div className="mt-6">
                <MarketingRewardsTable list={marketingRewards} />
              </div>
            </motion.section>
          )}

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title="Claimable Assets" />
            <div className="mt-6 space-y-10">
              <DonatedAssetsSection
                unclaimedNFTs={unclaimedDonatedNFTsList}
                claimedNFTs={claimedDonatedNFTsList}
                donatedERC20={donatedERC20List}
                loadingNFTs={loadingUnclaimedNFTs || loadingClaimedNFTs}
                loadingERC20={loadingERC20}
                canClaim={canClaim}
                isClaiming={isClaiming}
                claimingDonatedNFTs={claimingDonatedNFTs}
                onClaimNFT={handleDonatedNFTsClaim}
                onClaimAllNFTs={handleAllDonatedNFTsClaim}
                onClaimERC20={handleDonatedERC20Claim}
                onClaimAllERC20={handleAllDonatedERC20Claim}
              />
            </div>
          </motion.section>
        </div>
      )}
    </MainWrapper>
  );
};

export default UserStatisticsView;

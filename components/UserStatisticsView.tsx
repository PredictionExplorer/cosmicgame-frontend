'use client';

import { useCallback, useMemo } from 'react';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useActiveWeb3React } from '@/hooks/web3';
import { useClaimAllocations } from '@/hooks/useClaimAllocations';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import type { GestureInfo } from '@/services/api';
import {
  useDashboardInfo,
  useClaimHistoryByUser,
  useUserInfo,
  useUserBalance,
  useCSTAnchorActionsByUser,
  useRWLKAnchorActionsByUser,
  useMarketingRewardsByUser,
  useCSTTokensByUser,
  useAnchorDistributionsByUser,
  useCSTAnchorDistributionsRetrievedByUser,
  useCSTAnchorDistributionsByUserByDeposit,
  useRWLKAnchorImprintsByUser,
  useClaimedDonatedNFTByUser,
  useUnclaimedDonatedNFTByUser,
  useDonationsERC20ByUser,
  useGestureListByCycle,
} from '@/hooks/useApiQuery';
import { getDonatedErc20RawClaimAmount } from '@/utils/donatedErc20';
import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { StatCardSkeleton } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressChip } from '@/components/ui/address-chip';

import { CSTTable } from './tokens/CSTTable';
import type { WinningHistoryEntry } from './tables/RecipientHistoryTable';
import type { MarketingReward } from './tables/MarketingRewardsTable';
import type { CSTAnchorDistributionByDeposit } from './anchoring/CSTAnchorDistributionsByDepositTable';
import type { NFTRecord } from './attachments/AttachedNFTTable';
import type { DonatedERC20Token } from './attachments/AttachedERC20Table';
import GestureHistoryTable from './tables/GestureHistoryTable';
import RecipientHistoryTable from './tables/RecipientHistoryTable';
import MarketingRewardsTable from './tables/MarketingRewardsTable';
import { UserStatsSection, type UserProfileInfo } from './user-statistics/UserStatsSection';
import { UserAnchoringSection } from './user-statistics/UserAnchoringSection';
import { DonatedAssetsSection } from './user-statistics/DonatedAssetsSection';

interface AnchorDistributionRow {
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

/** Comprehensive user profile view with bidding stats, winning history, anchoring actions, token holdings, and stellarSelection claims. */
const UserStatisticsView = ({ address, isOwnProfile }: UserStatisticsViewProps) => {
  const t = useTranslations('myPages');
  const { account } = useActiveWeb3React();
  const { fetchData: fetchStakedTokens } = useAnchoredToken();
  const queryClient = useQueryClient();

  const canClaim =
    isOwnProfile || (!!account && !!address && account.toLowerCase() === address.toLowerCase());
  const refreshProfileClaims = useCallback(() => {
    queryClient.invalidateQueries();
    fetchStakedTokens();
  }, [fetchStakedTokens, queryClient]);
  const {
    isClaiming,
    claimingDonatedNFTs,
    claimDonatedNFT,
    claimAllDonatedNFTs,
    claimDonatedERC20,
    claimAllDonatedERC20,
  } = useClaimAllocations(refreshProfileClaims);

  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: claimHistoryRaw, isLoading: loadingClaims } = useClaimHistoryByUser(address);
  const { data: userInfoRaw, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: balanceData, isLoading: loadingBalance } = useUserBalance(address);
  const { data: cstAnchorActions = [], isLoading: loadingCSTActions } =
    useCSTAnchorActionsByUser(address);
  const { data: rwlkAnchorActions = [], isLoading: loadingRWLKActions } =
    useRWLKAnchorActionsByUser(address);
  const { data: marketingRewardsRaw = [], isLoading: loadingMarketing } =
    useMarketingRewardsByUser(address);
  const { data: cstListRaw = [], isLoading: loadingCST } = useCSTTokensByUser(address);
  const { data: cstStakingRewardsRaw = [], isLoading: loadingStakingRewards } =
    useAnchorDistributionsByUser(address);
  const { data: collectedCstStakingRewardsRaw = [], isLoading: loadingCollected } =
    useCSTAnchorDistributionsRetrievedByUser(address);
  const { data: cstStakingRewardsByDepositRaw = [], isLoading: loadingByDeposit } =
    useCSTAnchorDistributionsByUserByDeposit(address);
  const { data: rwlkImprints = [], isLoading: loadingMints } = useRWLKAnchorImprintsByUser(address);
  const { data: claimedNFTsRaw = [], isLoading: loadingClaimedNFTs } =
    useClaimedDonatedNFTByUser(address);
  const { data: unclaimedNFTsRaw = [], isLoading: loadingUnclaimedNFTs } =
    useUnclaimedDonatedNFTByUser(address);
  const { data: erc20Raw = [], isLoading: loadingERC20 } = useDonationsERC20ByUser(address);

  const curRoundNum = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListForProb = [] } = useGestureListByCycle(curRoundNum, 'desc');

  const data = dashboardData ?? null;
  const { Gestures: gestureHistory = [], UserInfo: userInfoObj } = userInfoRaw ?? {};
  const userInfo = (userInfoObj as UserProfileInfo) ?? null;
  const claimHistory = (claimHistoryRaw as WinningHistoryEntry[] | null) ?? null;
  const marketingRewards = (marketingRewardsRaw ?? []) as MarketingReward[];
  const cstList = cstListRaw ?? [];
  const cstAnchorDistributions = useMemo(
    () => (cstStakingRewardsRaw ?? []) as AnchorDistributionRow[],
    [cstStakingRewardsRaw],
  );
  const retrievedCstAnchorDistributions = collectedCstStakingRewardsRaw ?? [];
  const cstAnchorDistributionsByDeposit = (cstStakingRewardsByDepositRaw ??
    []) as CSTAnchorDistributionByDeposit[];
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

  const { stellarSelectionETHProbability, stellarSelectionNFTProbability } = useMemo(() => {
    if (!address || !dashboardData || !bidListForProb.length)
      return { stellarSelectionETHProbability: -1, stellarSelectionNFTProbability: -1 };
    const totalGestures = bidListForProb.length;
    const userGestures = bidListForProb.filter(
      (bid: GestureInfo) => bid.BidderAddr?.toLowerCase() === address?.toLowerCase(),
    ).length;
    if (totalGestures > 0) {
      return {
        stellarSelectionETHProbability:
          1 -
          Math.pow(
            (totalGestures - userGestures) / totalGestures,
            dashboardData.NumRaffleEthWinnersBidding ?? 1,
          ),
        stellarSelectionNFTProbability:
          1 -
          Math.pow(
            (totalGestures - userGestures) / totalGestures,
            dashboardData.NumRaffleNFTWinnersBidding ?? 1,
          ),
      };
    }
    return { stellarSelectionETHProbability: -1, stellarSelectionNFTProbability: -1 };
  }, [address, dashboardData, bidListForProb]);

  const totalAnchorDistributionEth = useMemo(
    () =>
      cstAnchorDistributions.reduce(
        (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
        0,
      ),
    [cstAnchorDistributions],
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

  const handleDonatedNFTsClaim = (tokenID: number) => {
    claimDonatedNFT(tokenID);
  };

  const handleAllDonatedNFTsClaim = () => {
    const indexList = unclaimedDonatedNFTsList.map((item: { Index: number }) => item.Index);
    claimAllDonatedNFTs(indexList);
  };

  const handleDonatedERC20Claim = (roundNum: number, tokenAddr: string, amount: string) => {
    claimDonatedERC20(roundNum, tokenAddr, amount);
  };

  const handleAllDonatedERC20Claim = () => {
    const donatedTokensToClaim = donatedERC20List
      .filter((x) => !x.Claimed)
      .map((x) => ({
        roundNum: x.RoundNum,
        tokenAddress: x.TokenAddr,
        amount: getDonatedErc20RawClaimAmount(x),
      }));
    claimAllDonatedERC20(donatedTokensToClaim);
  };

  if (address === 'Invalid Address') {
    return (
      <MainWrapper>
        <h1 className="text-xl font-medium">{t('statistics.page.invalidAddress')}</h1>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper
      aria-label={isOwnProfile ? t('statistics.page.ariaOwn') : t('statistics.page.ariaUser')}
    >
      <PageHeader
        title={isOwnProfile ? t('statistics.page.ownTitle') : t('statistics.page.userTitle')}
        subtitle={
          isOwnProfile ? t('statistics.page.ownSubtitle') : t('statistics.page.userSubtitle')
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
          <h2 className="text-lg font-semibold">{t('statistics.page.emptyTitle')}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t('statistics.page.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <UserStatsSection
            userInfo={userInfo}
            balanceETH={balance.ETH}
            balanceCST={balance.CosmicToken}
            stellarSelectionETHProbability={stellarSelectionETHProbability}
            stellarSelectionNFTProbability={stellarSelectionNFTProbability}
            data={data}
            isOwnProfile={isOwnProfile}
            totalAnchorDistributionEth={totalAnchorDistributionEth}
          />

          <motion.section
            className="print-motion-visible"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title={t('statistics.page.sections.gestureHistory')} />
            <div className="mt-6">
              <GestureHistoryTable gestureHistory={gestureHistory} />
            </div>
          </motion.section>

          <motion.section
            className="print-motion-visible"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title={t('statistics.page.sections.recipientHistory')} />
            <div className="mt-6">
              <RecipientHistoryTable
                winningHistory={claimHistory ?? []}
                showClaimedStatus={true}
                showWinnerAddr={false}
              />
            </div>
          </motion.section>

          <motion.section
            className="print-motion-visible"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title={t('statistics.page.sections.anchoring')} />
            <div className="mt-6">
              <UserAnchoringSection
                address={address!}
                userInfo={userInfo}
                cstAnchorActions={cstAnchorActions}
                rwlkAnchorActions={rwlkAnchorActions}
                cstAnchorDistributions={cstAnchorDistributions}
                cstAnchorDistributionsByDeposit={cstAnchorDistributionsByDeposit}
                retrievedCstAnchorDistributions={retrievedCstAnchorDistributions}
                rwlkImprints={rwlkImprints}
              />
            </div>
          </motion.section>

          <motion.section
            className="print-motion-visible"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title={t('statistics.page.sections.tokenHoldings')} />
            <div className="mt-6">
              <CSTTable list={cstList} />
            </div>
          </motion.section>

          {marketingRewards.length > 0 && (
            <motion.section
              className="print-motion-visible"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <SectionDivider title={t('statistics.page.sections.outreachAllocations')} />
              <div className="mt-6">
                <MarketingRewardsTable list={marketingRewards} />
              </div>
            </motion.section>
          )}

          <motion.section
            className="print-motion-visible"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SectionDivider title={t('statistics.page.sections.claimableAssets')} />
            <div className="mt-6 space-y-10">
              <DonatedAssetsSection
                unclaimedNFTs={unclaimedDonatedNFTsList}
                claimedNFTs={claimedDonatedNFTsList}
                donatedERC20={donatedERC20List}
                loadingNFTs={loadingUnclaimedNFTs || loadingClaimedNFTs}
                loadingERC20={loadingERC20}
                canClaim={canClaim}
                isClaiming={isClaiming.donatedNFT}
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

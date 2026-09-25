'use client';

import { useCallback, useMemo } from 'react';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useActiveWeb3React } from '@/hooks/web3';
import { useClaimAllocations } from '@/hooks/useClaimAllocations';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
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
} from '@/hooks/useApiQuery';
import { getSelectionShare } from '@/lib/selectionStanding';
import { getDonatedErc20RawClaimAmount } from '@/utils/donatedErc20';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { PageHeader } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { PageShell } from '@/components/ui/page-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { SectionShell } from '@/components/statistics/SectionShell';
import { SITE_EDGE_SHELL_CLASS } from '@/components/statistics/shell';

import type { WinningHistoryEntry } from './tables/RecipientHistoryTable';
import type { MarketingReward } from './tables/MarketingRewardsTable';
import type { CSTAnchorDistributionByDeposit } from './anchoring/CSTAnchorDistributionsByDepositTable';
import type { NFTRecord } from './attachments/AttachedNFTTable';
import type { DonatedERC20Token } from './attachments/AttachedERC20Table';
import GestureHistoryTable from './tables/GestureHistoryTable';
import RecipientHistoryTable from './tables/RecipientHistoryTable';
import MarketingRewardsTable from './tables/MarketingRewardsTable';
import {
  anchoredArtworks,
  summarizeAllocations,
  summarizeGestures,
} from './user-statistics/profileSummary';
import type { UserProfileInfo } from './user-statistics/types';
import { ProfileHeader } from './user-statistics/ProfileHeader';
import { ProfileOverview } from './user-statistics/ProfileOverview';
import { ProfileArtworks } from './user-statistics/ProfileArtworks';
import { QuickActions } from './user-statistics/QuickActions';
import { SelectionShare } from './user-statistics/SelectionShare';
import {
  UserAnchoringSection,
  type AnchorDistributionRow,
} from './user-statistics/UserAnchoringSection';
import { DonatedAssetsSection } from './user-statistics/DonatedAssetsSection';

const SHELL_CLASS = SITE_EDGE_SHELL_CLASS;

interface UserStatisticsViewProps {
  address: string | null | undefined;
  isOwnProfile: boolean;
}

/** Wei balance string → whole tokens, or null when it cannot be read. */
function tokenBalance(wei: string | undefined): number | null {
  try {
    return Number(formatEther(BigInt(wei ?? '0')));
  } catch {
    return null;
  }
}

/**
 * A participant's profile (and your own statistics): the identity header,
 * this cycle's Stellar Selection share, the figures behind its history, its
 * NFTs, and the ledgers. Each section stands on its own data: an address
 * with no gestures can still hold allocations, anchors and assets to
 * retrieve, so "no activity" shows only once every source answered empty.
 */
const UserStatisticsView = ({ address, isOwnProfile }: UserStatisticsViewProps) => {
  const t = useTranslations('myPages');
  const participantTrail = useParticipantTrail();
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

  const { data: dashboardData } = useDashboardInfo();
  const claimsQuery = useClaimHistoryByUser(address);
  const userInfoQuery = useUserInfo(address);
  const { data: balanceData, isLoading: loadingBalance } = useUserBalance(address);
  const cstAnchorActionsQuery = useCSTAnchorActionsByUser(address);
  const rwlkAnchorActionsQuery = useRWLKAnchorActionsByUser(address);
  const marketingQuery = useMarketingRewardsByUser(address);
  const cstTokensQuery = useCSTTokensByUser(address);
  const anchorDistributionsQuery = useAnchorDistributionsByUser(address);
  const { data: collectedCstStakingRewardsRaw = [] } =
    useCSTAnchorDistributionsRetrievedByUser(address);
  const { data: cstStakingRewardsByDepositRaw = [] } =
    useCSTAnchorDistributionsByUserByDeposit(address);
  const { data: rwlkImprints = [] } = useRWLKAnchorImprintsByUser(address);
  const claimedNFTsQuery = useClaimedDonatedNFTByUser(address);
  const unclaimedNFTsQuery = useUnclaimedDonatedNFTByUser(address);
  const erc20Query = useDonationsERC20ByUser(address);

  const { data: cstAnchorActions = [], isLoading: loadingCSTActions } = cstAnchorActionsQuery;
  const { data: rwlkAnchorActions = [], isLoading: loadingRWLKActions } = rwlkAnchorActionsQuery;
  const { data: marketingRewardsRaw = [], isLoading: loadingMarketing } = marketingQuery;
  const { data: cstListRaw = [], isLoading: loadingCST } = cstTokensQuery;
  const { data: cstStakingRewardsRaw = [], isLoading: loadingStakingRewards } =
    anchorDistributionsQuery;
  const { data: claimedNFTsRaw = [], isLoading: loadingClaimedNFTs } = claimedNFTsQuery;
  const { data: unclaimedNFTsRaw = [], isLoading: loadingUnclaimedNFTs } = unclaimedNFTsQuery;
  const { data: erc20Raw = [], isLoading: loadingERC20 } = erc20Query;

  const userInfoRaw = userInfoQuery.data;
  const gestureHistory = useMemo(() => userInfoRaw?.Gestures ?? [], [userInfoRaw]);
  const userInfo = (userInfoRaw?.UserInfo as UserProfileInfo | undefined) ?? null;
  const claimHistory = useMemo(
    () => (claimsQuery.data as WinningHistoryEntry[] | null | undefined) ?? [],
    [claimsQuery.data],
  );
  const marketingRewards = (marketingRewardsRaw ?? []) as MarketingReward[];
  const cstAnchorDistributions = useMemo(
    () => (cstStakingRewardsRaw ?? []) as AnchorDistributionRow[],
    [cstStakingRewardsRaw],
  );
  const cstAnchorDistributionsByDeposit = (cstStakingRewardsByDepositRaw ??
    []) as CSTAnchorDistributionByDeposit[];
  const claimedDonatedNFTsList = Array.isArray(claimedNFTsRaw)
    ? (claimedNFTsRaw as NFTRecord[])
    : [];
  const unclaimedDonatedNFTsList = Array.isArray(unclaimedNFTsRaw)
    ? (unclaimedNFTsRaw as NFTRecord[])
    : [];
  const donatedERC20List = (erc20Raw ?? []) as DonatedERC20Token[];

  const gestureSummary = useMemo(
    () => (userInfoRaw ? summarizeGestures(gestureHistory) : null),
    [userInfoRaw, gestureHistory],
  );
  const allocationSummary = useMemo(
    () => (claimsQuery.data ? summarizeAllocations(claimHistory) : null),
    [claimsQuery.data, claimHistory],
  );
  const balance = useMemo(() => {
    if (!balanceData) return null;
    const eth = tokenBalance(balanceData.ETH_Balance);
    const cst = tokenBalance(balanceData.CosmicTokenBalance);
    return eth === null || cst === null ? null : { eth, cst };
  }, [balanceData]);

  const latestGestureTs = useMemo(() => {
    const stamps = gestureHistory
      .map((gesture) => toFiniteNumber(gesture.TimeStamp))
      .filter((ts): ts is number => ts !== null && ts > 0);
    return stamps.length > 0 ? Math.max(...stamps) : null;
  }, [gestureHistory]);

  // This cycle's Stellar Selection share: the address's gestures in the live
  // cycle out of all of them. One entry per gesture; never compounded into odds.
  const currentCycle = toFiniteNumber(dashboardData?.CurRoundNum);
  const selectionShare = useMemo(() => {
    const cycleStarted = (toFiniteNumber(dashboardData?.TsRoundStart) ?? 0) > 0;
    if (currentCycle === null || !cycleStarted) return null;
    return getSelectionShare({
      totalGestures: toFiniteNumber(dashboardData?.CurNumBids) ?? 0,
      myGestures: gestureHistory.filter((gesture) => gesture.RoundNum === currentCycle).length,
    });
  }, [currentCycle, dashboardData?.TsRoundStart, dashboardData?.CurNumBids, gestureHistory]);

  const totalAnchorDistributionEth = useMemo(
    () =>
      cstAnchorDistributions.reduce(
        (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
        0,
      ),
    [cstAnchorDistributions],
  );
  const rwlkStats = userInfo?.StakingStatisticsRWalk;
  const anchoredNow =
    (userInfoRaw?.CurrentlyStakedTokens?.length ?? 0) + (rwlkStats?.TotalTokensStaked ?? 0);
  const anchorActions =
    cstAnchorActions.length +
    (rwlkStats?.TotalNumStakeActions ?? 0) +
    (rwlkStats?.TotalNumUnstakeActions ?? 0);

  const handleAllDonatedNFTsClaim = () => {
    claimAllDonatedNFTs(unclaimedDonatedNFTsList.map((item: { Index: number }) => item.Index));
  };

  const handleAllDonatedERC20Claim = () => {
    claimAllDonatedERC20(
      donatedERC20List
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: getDonatedErc20RawClaimAmount(x),
        })),
    );
  };

  if (!address || address === 'Invalid Address') {
    return (
      <PageShell variant="data" className={SHELL_CLASS}>
        <PageHeader
          section="explore"
          breadcrumbs={participantTrail}
          title={t('statistics.page.invalidAddress')}
        />
      </PageShell>
    );
  }

  const headerLoading = userInfoQuery.isLoading || claimsQuery.isLoading || loadingBalance;
  const anyLoading =
    userInfoQuery.isLoading ||
    claimsQuery.isLoading ||
    loadingCST ||
    loadingCSTActions ||
    loadingRWLKActions ||
    loadingStakingRewards ||
    loadingMarketing ||
    loadingClaimedNFTs ||
    loadingUnclaimedNFTs ||
    loadingERC20;
  const anchoredTokens = userInfoRaw?.CurrentlyStakedTokens ?? [];
  const hasActivity =
    gestureHistory.length > 0 ||
    claimHistory.length > 0 ||
    (cstListRaw?.length ?? 0) > 0 ||
    anchoredTokens.length > 0 ||
    cstAnchorActions.length > 0 ||
    rwlkAnchorActions.length > 0 ||
    anchorActions > 0 ||
    cstAnchorDistributions.length > 0 ||
    marketingRewards.length > 0 ||
    claimedDonatedNFTsList.length > 0 ||
    unclaimedDonatedNFTsList.length > 0 ||
    donatedERC20List.length > 0;
  // A read that failed is not "nothing": its `[]` default would read as empty, so the page
  // is empty only once every source has answered, and answered with nothing.
  const anyFailed = [
    userInfoQuery,
    claimsQuery,
    cstTokensQuery,
    cstAnchorActionsQuery,
    rwlkAnchorActionsQuery,
    anchorDistributionsQuery,
    marketingQuery,
    claimedNFTsQuery,
    unclaimedNFTsQuery,
    erc20Query,
  ].some((query) => query.isError);
  const allEmpty = !anyLoading && !hasActivity && !anyFailed;

  return (
    <PageShell variant="data" className={SHELL_CLASS}>
      <ProfileHeader
        address={address}
        isOwnProfile={isOwnProfile}
        gestures={gestureSummary}
        allocations={allocationSummary}
        balance={balance}
        loading={headerLoading}
      />

      {userInfoQuery.isLoading ? (
        // A screen tall, as the sections that replace it are: the footer stays below the
        // fold while they load, instead of showing and then being pushed away (CLS).
        <div data-testid="statistics-loading-skeleton" className="min-h-svh">
          <SkeletonTable rows={6} columns={4} />
        </div>
      ) : allEmpty ? (
        <EmptyState
          variant="page"
          headingLevel={2}
          title={t('statistics.page.emptyTitle')}
          description={t('statistics.page.emptyDescription')}
        />
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {isOwnProfile ? <QuickActions address={address} /> : null}

          {selectionShare && currentCycle !== null ? (
            <SelectionShare
              share={selectionShare}
              cycle={currentCycle}
              ethSelections={toFiniteNumber(dashboardData?.NumRaffleEthWinnersBidding)}
              nftSelections={toFiniteNumber(dashboardData?.NumRaffleNFTWinnersBidding)}
            />
          ) : null}

          {/* The figures come from the profile record; an address without one skips them. */}
          {userInfo && gestureSummary ? (
            <ProfileOverview
              address={address}
              userInfo={userInfo}
              gestures={gestureSummary}
              latestGestureTs={latestGestureTs}
              anchoredNow={anchoredNow}
              anchorActions={anchorActions}
              anchorDistributionsEth={totalAnchorDistributionEth}
            />
          ) : null}

          <SectionShell title={t('statistics.page.sections.artworks')}>
            <ProfileArtworks
              tokens={cstListRaw ?? []}
              anchored={anchoredArtworks(anchoredTokens)}
              loading={loadingCST}
            />
          </SectionShell>

          <SectionShell title={t('statistics.page.sections.gestureHistory')}>
            {userInfoQuery.isError ? (
              <ErrorState
                headingLevel={3}
                title={t('statistics.page.loadErrorTitle')}
                message={t('statistics.page.loadErrorMessage')}
                onRetry={() => userInfoQuery.refetch()}
              />
            ) : (
              // An empty list says "No gestures yet" inside the section.
              <GestureHistoryTable
                gestureHistory={gestureHistory}
                showParticipant={false}
                showHold={false}
              />
            )}
          </SectionShell>

          <SectionShell title={t('statistics.page.sections.recipientHistory')}>
            <RecipientHistoryTable
              allocationRecords={claimHistory}
              showClaimedStatus
              showRecipient={false}
              loading={claimsQuery.isLoading}
              error={claimsQuery.isError ? t('statistics.page.loadErrorMessage') : undefined}
              onRetry={() => claimsQuery.refetch()}
            />
          </SectionShell>

          <SectionShell
            title={t('statistics.page.sections.anchoring')}
            busy={loadingCSTActions || loadingRWLKActions || loadingStakingRewards}
          >
            {loadingCSTActions || loadingRWLKActions || loadingStakingRewards ? (
              <SkeletonTable rows={4} columns={4} />
            ) : (
              <UserAnchoringSection
                address={address}
                userInfo={userInfo}
                cstAnchorActions={cstAnchorActions}
                rwlkAnchorActions={rwlkAnchorActions}
                cstAnchorDistributions={cstAnchorDistributions}
                cstAnchorDistributionsByDeposit={cstAnchorDistributionsByDeposit}
                retrievedCstAnchorDistributions={collectedCstStakingRewardsRaw ?? []}
                rwlkImprints={rwlkImprints}
              />
            )}
          </SectionShell>

          {marketingRewards.length > 0 ? (
            <SectionShell title={t('statistics.page.sections.outreachAllocations')}>
              <MarketingRewardsTable list={marketingRewards} />
            </SectionShell>
          ) : null}

          <SectionShell title={t('statistics.page.sections.claimableAssets')}>
            <DonatedAssetsSection
              unclaimedNFTs={unclaimedDonatedNFTsList}
              claimedNFTs={claimedDonatedNFTsList}
              donatedERC20={donatedERC20List}
              loadingNFTs={loadingUnclaimedNFTs || loadingClaimedNFTs}
              loadingERC20={loadingERC20}
              canClaim={canClaim}
              isClaiming={isClaiming.donatedNFT}
              claimingDonatedNFTs={claimingDonatedNFTs}
              onClaimNFT={claimDonatedNFT}
              onClaimAllNFTs={handleAllDonatedNFTsClaim}
              onClaimERC20={claimDonatedERC20}
              onClaimAllERC20={handleAllDonatedERC20Claim}
            />
          </SectionShell>
        </div>
      )}
    </PageShell>
  );
};

export default UserStatisticsView;

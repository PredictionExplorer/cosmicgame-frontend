'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { PageShell } from '@/components/ui/page-shell';
import { Spinner } from '@/components/ui/spinner';
import { useMarketingRewards } from '@/hooks/useApiQuery';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import type { MarketingReward } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { MarketingHero } from '@/components/marketing/MarketingHero';
import { MarketingStats } from '@/components/marketing/MarketingStats';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { TopMarketersLeaderboard } from '@/components/marketing/TopMarketersLeaderboard';
import { RewardsHistorySection } from '@/components/marketing/RewardsHistorySection';
import { MarketingCTA } from '@/components/marketing/MarketingCTA';

/**
 * `seoSummary` is the server-rendered page header, the page's only header. It
 * carries the program's figures, so the page body does not repeat them.
 */
const MarketingRewards = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('marketing');
  const { data: marketingRewards, isLoading: rewardsLoading } = useMarketingRewards();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardInfo();

  // The dashboard only feeds the stat row, which the server header replaces.
  const loading = rewardsLoading || (!seoSummary && dashboardLoading);

  const rewards = useMemo(() => (marketingRewards ?? []) as MarketingReward[], [marketingRewards]);

  // `null` until the list is read, so a failed read shows as unknown rather than 0.
  const activeMarketers = useMemo(
    () => (marketingRewards ? new Set(rewards.map((r) => r.MarketerAddr)).size : null),
    [marketingRewards, rewards],
  );

  // `TotalMktRewardsEth` is a CST amount despite its wire name. A figure the dashboard read
  // did not return stays `null` (unknown), never a confident 0.
  const totalAllocatedCst = toFiniteNumber(dashboard?.MainStats?.TotalMktRewardsEth);
  const rewardTransactions = toFiniteNumber(dashboard?.MainStats?.NumMktRewards);

  if (loading) {
    return (
      <PageShell variant="data" backdrop="signature">
        {seoSummary}
        <div className="flex justify-center py-16" role="status" aria-label={t('loadingAria')}>
          <Spinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <>
          <MarketingHero />
          <MarketingStats
            totalAllocatedCst={totalAllocatedCst}
            activeMarketers={activeMarketers}
            rewardTransactions={rewardTransactions}
          />
        </>
      )}
      <HowItWorks />
      <TopMarketersLeaderboard rewards={rewards} />
      <RewardsHistorySection rewards={rewards} />
      <MarketingCTA />
    </PageShell>
  );
};

export default MarketingRewards;

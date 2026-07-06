'use client';

import { useMemo } from 'react';

import { PageShell } from '@/components/ui/page-shell';
import { Spinner } from '@/components/ui/spinner';
import { useMarketingRewards } from '@/hooks/useApiQuery';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import type { MarketingReward } from '@/services/api/types';
import { MarketingHero } from '@/components/marketing/MarketingHero';
import { MarketingStats } from '@/components/marketing/MarketingStats';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { TopMarketersLeaderboard } from '@/components/marketing/TopMarketersLeaderboard';
import { RewardsHistorySection } from '@/components/marketing/RewardsHistorySection';
import { MarketingCTA } from '@/components/marketing/MarketingCTA';

const MarketingRewards = () => {
  const { data: marketingRewards = [], isLoading: rewardsLoading } = useMarketingRewards();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardInfo();

  const loading = rewardsLoading || dashboardLoading;

  const rewards = useMemo(() => (marketingRewards ?? []) as MarketingReward[], [marketingRewards]);

  const activeMarketers = useMemo(() => {
    const unique = new Set(rewards.map((r) => r.MarketerAddr));
    return unique.size;
  }, [rewards]);

  const totalRewardsEth = dashboard?.MainStats?.TotalMktRewardsEth ?? 0;
  const rewardTransactions = dashboard?.MainStats?.NumMktRewards ?? 0;

  if (loading) {
    return (
      <PageShell variant="data" backdrop="signature">
        <div
          className="flex justify-center py-32"
          role="status"
          aria-label="Loading marketing rewards"
        >
          <Spinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <MarketingHero />
      <MarketingStats
        totalRewardsEth={totalRewardsEth}
        activeMarketers={activeMarketers}
        rewardTransactions={rewardTransactions}
      />
      <HowItWorks />
      <TopMarketersLeaderboard rewards={rewards} />
      <RewardsHistorySection rewards={rewards} />
      <MarketingCTA />
    </PageShell>
  );
};

export default MarketingRewards;

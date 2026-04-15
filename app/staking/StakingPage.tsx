'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Coins, Users, Layers, TrendingUp, ArrowRight } from 'lucide-react';

import { MainWrapper } from '@/components/styled';
import { GlobalStakingRewardsTable } from '@/components/staking/GlobalStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';
import { StakingHeroStats } from '@/components/staking/StakingHeroStats';
import { HowStakingWorks } from '@/components/staking/HowStakingWorks';
import {
  useStakingCSTRewards,
  useStakingRWLKMintsGlobal,
  useDashboardInfo,
  useUniqueCSTStakers,
} from '@/hooks/useApiQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { formatEthValue } from '@/utils/format';

const StakingPage = () => {
  const {
    data: cosmicSignatureRewards,
    isLoading: isLoadingCST,
    error: cstError,
  } = useStakingCSTRewards();
  const {
    data: randomWalkRewards,
    isLoading: isLoadingRWLK,
    error: rwlkError,
  } = useStakingRWLKMintsGlobal();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardInfo();
  const { data: uniqueStakers, isLoading: isLoadingStakers } = useUniqueCSTStakers();

  const loading = isLoadingCST || isLoadingRWLK;
  const statsLoading = isLoadingDashboard || isLoadingStakers;
  const error = cstError?.message || rwlkError?.message || null;

  const rewardPerCST = useMemo(() => {
    const totalStakedCST = dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;
    if (totalStakedCST > 0) {
      return (dashboardData?.StakingAmountEth ?? 0) / totalStakedCST;
    }
    return 0;
  }, [dashboardData]);

  const heroStats = useMemo(
    () => [
      {
        label: 'Staking Pool',
        value: formatEthValue(dashboardData?.StakingAmountEth ?? 0),
        tooltip:
          'Total ETH currently held in the staking reward pool, distributed proportionally to CST stakers each round.',
        icon: <Coins className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: 'CST Tokens Staked',
        value: (
          dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked ?? 0
        ).toLocaleString(),
        tooltip:
          'Total number of CosmicSignature NFTs currently locked in the staking contract across all stakers.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'RWLK Tokens Staked',
        value: (
          dashboardData?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0
        ).toLocaleString(),
        tooltip:
          'Total number of RandomWalk NFTs currently staked. Staked RWLK tokens are eligible for random reward mints.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'Reward per CST',
        value: rewardPerCST > 0 ? `${rewardPerCST.toFixed(6)} ETH` : '--',
        tooltip:
          'Current ETH reward you would earn for staking a single CST token, based on the pool size divided by total staked tokens.',
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: 'Unique Stakers',
        value: (uniqueStakers?.length ?? 0).toLocaleString(),
        tooltip: 'Number of distinct wallet addresses that have staked CST tokens.',
        icon: <Users className="h-4 w-4" />,
      },
    ],
    [dashboardData, rewardPerCST, uniqueStakers],
  );

  if (error) {
    return (
      <MainWrapper>
        <ErrorState title="Error loading staking data" message={error} />
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <PageHeader
        title="Staking Rewards"
        subtitle="Overview of global staking activity and reward distributions"
      />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Stake your COSMIC NFTs or RandomWalk NFTs to earn passive ETH rewards from the
        game&apos;s prize pool. Each round, 19% of the CosmicGame contract balance is distributed
        equally among all staked token holders. The more tokens you stake, the larger your share of
        the reward pool.
      </p>

      <StakingHeroStats stats={heroStats} loading={statsLoading} className="mb-10" />

      <HowStakingWorks className="mb-10" />

      <Link
        href="/my-staking"
        className="group mb-10 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-5 transition-all hover:border-primary/40 hover:bg-primary/[0.08] no-underline"
      >
        <div>
          <p className="text-base font-semibold text-foreground">Start Staking</p>
          <p className="text-sm text-muted-foreground mt-1">
            Stake your NFTs to earn a share of each round&apos;s reward pool.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary opacity-60 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
      </Link>

      <div>
        <SectionDivider title="CosmicSignature Token" />
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <GlobalStakingRewardsTable list={cosmicSignatureRewards ?? []} />
        )}
      </div>

      <div>
        <SectionDivider title="RandomWalk NFT" />
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <RwalkStakingRewardMintsTable list={randomWalkRewards ?? []} />
        )}
      </div>
    </MainWrapper>
  );
};

export default StakingPage;

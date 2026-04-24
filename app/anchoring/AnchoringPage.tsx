'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Coins, Users, Layers, TrendingUp, ArrowRight } from 'lucide-react';

import { GlobalAnchorDistributionsTable } from '@/components/anchoring/GlobalAnchorDistributionsTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';
import { AnchoringHeroStats } from '@/components/anchoring/AnchoringHeroStats';
import { HowAnchoringWorks } from '@/components/anchoring/HowAnchoringWorks';
import {
  useCSTAnchorDistributions,
  useGlobalRWLKAnchorImprints,
  useDashboardInfo,
  useUniqueCSTAnchorHolders,
} from '@/hooks/useApiQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionDivider } from '@/components/ui/section-divider';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { formatEthValue } from '@/utils/format';

const AnchoringPage = () => {
  const {
    data: cosmicSignatureRewards,
    isLoading: isLoadingCST,
    error: cstError,
  } = useCSTAnchorDistributions();
  const {
    data: randomWalkRewards,
    isLoading: isLoadingRWLK,
    error: rwlkError,
  } = useGlobalRWLKAnchorImprints();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardInfo();
  const { data: uniqueStakers, isLoading: isLoadingStakers } = useUniqueCSTAnchorHolders();

  const loading = isLoadingCST || isLoadingRWLK;
  const statsLoading = isLoadingDashboard || isLoadingStakers;
  const error = cstError?.message || rwlkError?.message || null;

  const rewardPerCST = useMemo(() => {
    const totalAnchoredCST = dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;
    if (totalAnchoredCST > 0) {
      return (dashboardData?.StakingAmountEth ?? 0) / totalAnchoredCST;
    }
    return 0;
  }, [dashboardData]);

  const heroStats = useMemo(
    () => [
      {
        label: 'Anchor Distribution Pool',
        value: formatEthValue(dashboardData?.StakingAmountEth ?? 0),
        tooltip:
          'Total ETH currently allocated to the Anchor Distribution pool, distributed proportionally to CST anchor-holders each cycle.',
        icon: <Coins className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: 'CST Tokens Anchored',
        value: (
          dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked ?? 0
        ).toLocaleString(),
        tooltip:
          'Total number of Cosmic Signature NFTs currently anchored to the protocol across all anchor-holders.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'RWLK Tokens Anchored',
        value: (
          dashboardData?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0
        ).toLocaleString(),
        tooltip:
          'Total number of RandomWalk NFTs currently anchored. Anchored RWLK tokens are eligible for allocation imprints via on-chain random selection.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'Distribution per CST',
        value: rewardPerCST > 0 ? `${rewardPerCST.toFixed(6)} ETH` : '--',
        tooltip:
          'Current ETH Anchor Distribution per anchored CST token, based on the pool size divided by total anchored tokens.',
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: 'Unique Anchor-holders',
        value: (uniqueStakers?.length ?? 0).toLocaleString(),
        tooltip: 'Number of distinct wallet addresses that have anchored CST tokens.',
        icon: <Users className="h-4 w-4" />,
      },
    ],
    [dashboardData, rewardPerCST, uniqueStakers],
  );

  if (error) {
    return (
      <PageShell variant="data">
        <ErrorState title="Error loading anchoring data" message={error} />
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="aurora" pulse>
            Anchor Distributions · Live
          </SectionEyebrow>
        }
        title="Anchor Distributions"
        gradientTitle="signature"
        subtitle="Overview of global anchoring activity and distribution history"
      />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Anchor your Cosmic Signature NFTs or RandomWalk NFTs to receive ETH Anchor Distributions
        from the protocol&apos;s Cycle Reserve. Each cycle, 19% of the Cosmic Signature contract
        balance is distributed equally among all anchored token holders. The more tokens you anchor,
        the larger your share of the Anchor Distribution pool.
      </p>

      <AnchoringHeroStats stats={heroStats} loading={statsLoading} className="mb-10" />

      <HowAnchoringWorks className="mb-10" />

      <Link
        href="/my-anchors"
        className="group mb-10 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-5 transition-all hover:border-primary/40 hover:bg-primary/[0.08] no-underline"
      >
        <div>
          <p className="text-base font-semibold text-foreground">Start Anchoring</p>
          <p className="text-sm text-muted-foreground mt-1">
            Anchor your NFTs to receive a share of each cycle&apos;s Anchor Distribution pool.
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
          <GlobalAnchorDistributionsTable list={cosmicSignatureRewards ?? []} />
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
          <RwalkAnchorDistributionImprintsTable list={randomWalkRewards ?? []} />
        )}
      </div>
    </PageShell>
  );
};

export default AnchoringPage;

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Coins, Users, Layers, TrendingUp, ArrowRight } from 'lucide-react';

import { protocolFacts } from '@/content/protocol-facts';

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
import { Surface } from '@/components/ui/surface';
import { formatEthValue } from '@/utils/format';
import { formatDistributionPerAnchoredNftEth } from '@/utils/anchoringStats';

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

  const distributionPerNft = useMemo(
    () =>
      formatDistributionPerAnchoredNftEth(
        dashboardData?.StakingAmountEth,
        dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked,
      ),
    [dashboardData],
  );

  const heroStats = useMemo(
    () => [
      {
        label: 'Anchor Distribution Pool',
        value: formatEthValue(dashboardData?.StakingAmountEth ?? 0),
        tooltip:
          'Total ETH currently allocated to the Anchor Distribution pool, distributed proportionally to Cosmic Signature NFT anchor-holders each cycle.',
        icon: <Coins className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: 'Cosmic Signature NFTs Anchored',
        value: (
          dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked ?? 0
        ).toLocaleString(),
        tooltip:
          'Total number of Cosmic Signature NFTs currently anchored to the protocol across all anchor-holders.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'RWLK NFTs Anchored',
        value: (
          dashboardData?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0
        ).toLocaleString(),
        tooltip:
          'Total number of RandomWalk NFTs currently anchored. Anchored RWLK tokens are eligible for allocation imprints via on-chain random selection.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'Distribution per NFT',
        value: distributionPerNft.value,
        tooltip:
          'Current ETH Anchor Distribution per anchored Cosmic Signature NFT: on-chain pool divided by the indexed total of anchored NFTs.' +
          distributionPerNft.tooltipSuffix,
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: 'Unique Anchor-holders',
        value: (uniqueStakers?.length ?? 0).toLocaleString(),
        tooltip: 'Number of distinct wallet addresses that have anchored CST tokens.',
        icon: <Users className="h-4 w-4" />,
      },
    ],
    [dashboardData, distributionPerNft, uniqueStakers],
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

      <Surface
        variant="impact"
        radius="xl"
        padding="lg"
        className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-center"
      >
        <p className="type-body-md text-muted-foreground">
          Anchor your Cosmic Signature NFTs to share {protocolFacts.anchorDistributionPercentage}%
          of each cycle&apos;s Cycle Reserve through ETH Anchor Distributions. Anchor RandomWalk
          NFTs to enter the Anchored-NFT Stellar Selection.
        </p>
        <div className="relative min-h-[160px] overflow-hidden rounded-[var(--radius-surface)] border border-white/[0.08] bg-black/20">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--impact-green-rgb)/0.5)] shadow-[0_0_50px_rgb(var(--impact-green-rgb)/0.16)]"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--aurora-cyan-rgb)/0.25)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-[rgb(var(--impact-green-rgb)/0.14)] px-4 py-2 text-sm font-semibold text-[rgb(var(--impact-green-rgb))]">
              {protocolFacts.anchorDistributionPercentage}% anchor flow
            </div>
          </div>
        </div>
      </Surface>

      <AnchoringHeroStats stats={heroStats} loading={statsLoading} className="mb-10" />

      <HowAnchoringWorks className="mb-10" />

      <Link
        href="/my-anchors"
        className="group mb-10 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-5 transition-all hover:border-primary/40 hover:bg-primary/[0.08] no-underline"
      >
        <div>
          <p className="text-base font-semibold text-foreground">Start Anchoring</p>
          <p className="text-sm text-muted-foreground mt-1">
            Anchor your Cosmic Signature NFTs to receive a share of each cycle&apos;s Anchor
            Distribution pool.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary opacity-60 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
      </Link>

      <div>
        <SectionDivider title="Cosmic Signature NFT" />
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

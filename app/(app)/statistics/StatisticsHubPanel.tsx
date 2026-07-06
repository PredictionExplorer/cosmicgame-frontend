'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Coins, Hash, Heart, Layers, Lock, Trophy, Wallet } from 'lucide-react';

import { formatCSTValue, formatEthValue } from '@/utils';
import { statisticsCopy } from '@/content/statistics-copy';

import { useCTStatistics, useDashboardInfo } from '@/hooks/useApiQuery';
import type { DashboardInfo } from '@/services/api/types';
import { StatCard } from '@/components/ui/stat-card';
import { Surface } from '@/components/ui/surface';
import { SectionDivider } from '@/components/ui/section-divider';
import { SkeletonStatCard } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { StatisticsItem } from '@/components/statistics/StatisticsItem';
import { StatisticsGroup } from '@/components/statistics/StatisticsGroup';

import { STATISTICS_SECTIONS, type StatisticsSectionDef } from './statistics-sections';

/** Prefer DB row count from cg_prize; fall back to aggregated recipient counts. */
function getTotalAllocationsDistributed(data: DashboardInfo): number {
  return Number(
    data.CgPrizeRowCount ??
      data.MainStats?.CgPrizeRowCount ??
      data.TotalPrizeAwards ??
      data.MainStats?.TotalPrizeAwards ??
      data.TotalPrizes ??
      0,
  );
}

interface ExploreCardProps {
  section: StatisticsSectionDef;
  headline: ReactNode;
  headlineLabel: string;
}

function ExploreCard({ section, headline, headlineLabel }: ExploreCardProps) {
  const Icon = section.icon;
  return (
    <Surface asChild variant="glass-bordered" radius="lg" padding="none" interactive>
      <Link href={section.href} className="group block no-underline">
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"
              >
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-white">{section.label}</h3>
            </div>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
            {section.description}
          </p>
          <p className="mt-4 text-sm">
            <span className="text-xl font-semibold text-foreground">{headline}</span>{' '}
            <span className="text-muted-foreground">{headlineLabel}</span>
          </p>
        </div>
      </Link>
    </Surface>
  );
}

/** Statistics hub: headline metrics, protocol economy groups, and links into the section pages. */
const StatisticsHubPanel = () => {
  const { data: dashboardData, isLoading: dashboardLoading, isError, refetch } = useDashboardInfo();
  const { data: ctStatisticsData } = useCTStatistics();

  if (dashboardLoading) {
    return (
      <div data-testid="statistics-hub-loading">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatCard key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <ErrorState
        title="Failed to load statistics"
        message="The statistics service did not respond. Try again in a moment."
        onRetry={() => refetch()}
        surface
      />
    );
  }

  const data = dashboardData;
  const totalAllocationsDistributed = getTotalAllocationsDistributed(data);
  const cstAnchorStats = data.MainStats.StakeStatisticsCST;
  const rwlkAnchorStats = data.MainStats.StakeStatisticsRWalk;
  const totalAnchored = cstAnchorStats.TotalTokensStaked + rwlkAnchorStats.TotalTokensStaked;

  const exploreHeadlines: Record<string, { headline: ReactNode; headlineLabel: string }> = {
    participation: {
      headline: data.MainStats.NumUniqueBidders.toLocaleString(),
      headlineLabel: 'unique participants',
    },
    tokens: {
      headline: data.MainStats.NumCSTokenMints.toLocaleString(),
      headlineLabel: 'NFTs imprinted',
    },
    anchoring: {
      headline: totalAnchored.toLocaleString(),
      headlineLabel: 'NFTs anchored',
    },
    activity: {
      headline: Number(data.CurNumBids ?? 0).toLocaleString(),
      headlineLabel: 'gestures this cycle',
    },
    performance: {
      headline: totalAllocationsDistributed.toLocaleString(),
      headlineLabel: 'allocations distributed',
    },
  };

  return (
    <div data-testid="statistics-hub">
      {/* Headline metrics */}
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label={statisticsCopy.metrics.totalCycles.label}
          value={data.CurRoundNum}
          icon={<Hash className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.totalCycles.tooltip}
        />
        <StatCard
          label={statisticsCopy.metrics.allocationsDistributed.label}
          value={totalAllocationsDistributed}
          icon={<Trophy className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.allocationsDistributed.tooltip}
        />
        <StatCard
          label={statisticsCopy.metrics.cosmicSignatureNftsImprinted.shortLabel}
          value={data.MainStats.NumCSTokenMints}
          icon={<Layers className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.cosmicSignatureNftsImprinted.tooltip}
        />
        <StatCard
          label={statisticsCopy.metrics.contractBalance.label}
          value={formatEthValue(data.CosmicGameBalanceEth ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.contractBalance.tooltip}
          gradient
        />
      </div>

      {/* Section explore cards */}
      <SectionDivider title="Explore Statistics" className="mb-6" />
      <nav aria-label="Statistics section pages" className="mb-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STATISTICS_SECTIONS.map((section) => (
            <ExploreCard
              key={section.slug}
              section={section}
              headline={exploreHeadlines[section.slug]?.headline ?? '—'}
              headlineLabel={exploreHeadlines[section.slug]?.headlineLabel ?? ''}
            />
          ))}
        </div>
      </nav>

      {/* Link to current cycle */}
      <Surface
        asChild
        variant="aurora"
        radius="lg"
        padding="none"
        interactive
        className="mb-12 block no-underline"
      >
        <Link href="/current-cycle" className="group">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-base font-semibold text-white">Looking for current cycle data?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                View gesture history, leaderboards, and live cycle details
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--aurora-cyan-rgb)/0.25)] bg-[rgb(var(--aurora-cyan-rgb)/0.10)]">
              <ArrowRight
                aria-hidden
                className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </div>
          <div
            aria-hidden
            className="h-1 bg-gradient-to-r from-[rgb(var(--aurora-cyan-rgb))] via-[rgb(var(--nebula-violet-rgb))] to-[rgb(var(--chrono-rose-rgb))] opacity-70"
          />
        </Link>
      </Surface>

      {/* Protocol economy */}
      <SectionDivider title="Protocol Economy" className="mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatisticsGroup
          title="Allocation Economy"
          icon={<Trophy className="h-4 w-4" />}
          accentColor="blue"
          tooltip={statisticsCopy.groups.allocationEconomy}
        >
          <StatisticsItem
            title={statisticsCopy.metrics.numAllocationsDistributed.label}
            value={
              <Link href="/allocation" className="text-inherit">
                {totalAllocationsDistributed}
              </Link>
            }
            tooltip={statisticsCopy.metrics.numAllocationsDistributed.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.totalSignatureAllocationsDistributed.label}
            value={formatEthValue(Number(data.TotalPrizesPaidAmountEth) || 0)}
            tooltip={statisticsCopy.metrics.totalSignatureAllocationsDistributed.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.stellarSelectionEthDeposited.label}
            value={formatEthValue(data.MainStats.TotalRaffleEthDeposits)}
            tooltip={statisticsCopy.metrics.stellarSelectionEthDeposited.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.stellarSelectionEthRetrieved.label}
            value={formatEthValue(data.MainStats.TotalRaffleEthWithdrawn)}
            tooltip={statisticsCopy.metrics.stellarSelectionEthRetrieved.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.ethInGesturesCurrentCycle.label}
            value={formatEthValue(data.CurRoundStats?.TotalEthInBidsEth ?? 0)}
            tooltip={statisticsCopy.metrics.ethInGesturesCurrentCycle.tooltip}
          />
          {(data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0) > 0 && (
            <p className="mt-2 text-sm text-primary">{`${data.MainStats.NumWinnersWithPendingRaffleWithdrawal} recipients have yet to retrieve funds totaling ${formatEthValue(data.MainStats.TotalRaffleEthDeposits - data.MainStats.TotalRaffleEthWithdrawn)}`}</p>
          )}
        </StatisticsGroup>

        <StatisticsGroup
          title="Token Economy"
          icon={<Coins className="h-4 w-4" />}
          accentColor="purple"
          tooltip={statisticsCopy.groups.tokenEconomy}
        >
          <StatisticsItem
            title={statisticsCopy.metrics.totalSupplyErc20.label}
            value={formatCSTValue(ctStatisticsData?.TotalSupplyEth ?? 0)}
            tooltip={statisticsCopy.metrics.totalSupplyErc20.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.cosmicSignatureNftsImprinted.shortLabel}
            value={
              <Link href="/gallery" className="text-inherit">
                {data.MainStats.NumCSTokenMints}
              </Link>
            }
            tooltip={statisticsCopy.metrics.cosmicSignatureNftsImprinted.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.totalCstConsumed.label}
            value={formatCSTValue(data.MainStats.TotalCSTConsumedEth)}
            tooltip={statisticsCopy.metrics.totalCstConsumed.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.cstConsumedCurrentCycle.label}
            value={formatCSTValue(data.CurRoundStats?.TotalCstInBidsEth ?? 0)}
            tooltip={statisticsCopy.metrics.cstConsumedCurrentCycle.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.cstGestures.label}
            value={data.MainStats.NumBidsCST}
            tooltip={statisticsCopy.metrics.cstGestures.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.outreachReserve.label}
            value={formatCSTValue(data.MainStats.TotalMktRewardsEth)}
            tooltip={statisticsCopy.metrics.outreachReserve.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.outreachTransactions.label}
            value={
              <Link className="text-inherit" href="/marketing">
                {data.MainStats.NumMktRewards}
              </Link>
            }
            tooltip={statisticsCopy.metrics.outreachTransactions.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.randomWalkNftsUsed.label}
            value={
              <Link className="text-inherit" href="/used-rwlk-nfts">
                {data.NumRwalkTokensUsed as ReactNode}
              </Link>
            }
            tooltip={statisticsCopy.metrics.randomWalkNftsUsed.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.namedTokens.label}
            value={
              <Link className="text-inherit" href="/named-nfts">
                {data.MainStats.TotalNamedTokens}
              </Link>
            }
            tooltip={statisticsCopy.metrics.namedTokens.tooltip}
          />
        </StatisticsGroup>

        <StatisticsGroup
          title="Public Goods & Contributions"
          icon={<Heart className="h-4 w-4" />}
          accentColor="emerald"
          tooltip={statisticsCopy.groups.publicGoods}
        >
          <StatisticsItem
            title={statisticsCopy.metrics.publicGoodsBalance.label}
            value={formatEthValue(Number(data.CharityBalanceEth) || 0)}
            tooltip={statisticsCopy.metrics.publicGoodsBalance.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.attachedNfts.label}
            value={
              <Link className="text-inherit" href="/attached-nfts">
                {data.NumDonatedNFTs as ReactNode}
              </Link>
            }
            tooltip={statisticsCopy.metrics.attachedNfts.tooltip}
          />
          <StatisticsItem
            title={statisticsCopy.metrics.totalContributedEth.label}
            value={
              <Link
                className="text-inherit"
                href="/eth-contribution"
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatEthValue(data.MainStats.TotalEthDonatedAmountEth ?? 0)}
              </Link>
            }
            tooltip={statisticsCopy.metrics.totalContributedEth.tooltip}
          />
          {(data.MainStats.NumCosmicGameDonations ?? 0) > 0 && (
            <>
              <StatisticsItem
                title={statisticsCopy.metrics.protocolContributions.label}
                value={
                  <Link className="text-inherit" href="/public-goods-contributions-cg">
                    {data.MainStats.NumCosmicGameDonations}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.protocolContributions.tooltip}
              />
              <StatisticsItem
                title={statisticsCopy.metrics.protocolContributionsSum.label}
                value={
                  <Link className="text-inherit" href="/public-goods-contributions-cg">
                    {formatEthValue(data.MainStats.SumCosmicGameDonationsEth ?? 0)}
                  </Link>
                }
                tooltip={statisticsCopy.metrics.protocolContributionsSum.tooltip}
              />
            </>
          )}
          {(Number(data.SumVoluntaryDonationsEth) || 0) > 0 && (
            <StatisticsItem
              title={statisticsCopy.metrics.voluntaryContributions.label}
              value={
                <Link className="text-inherit" href="/public-goods-contributions-voluntary">
                  {`${data.NumVoluntaryDonations} totaling ${formatEthValue(Number(data.SumVoluntaryDonationsEth) || 0)}`}
                </Link>
              }
              tooltip={statisticsCopy.metrics.voluntaryContributions.tooltip}
            />
          )}
          {(data.MainStats.NumWithdrawals ?? 0) > 0 && (
            <StatisticsItem
              title={statisticsCopy.metrics.publicGoodsRetrievals.label}
              value={
                <Link className="text-inherit" href="/public-goods-retrievals">
                  {data.MainStats.NumWithdrawals}
                </Link>
              }
              tooltip={statisticsCopy.metrics.publicGoodsRetrievals.tooltip}
            />
          )}
          <StatisticsItem
            title={statisticsCopy.metrics.totalPublicGoodsRetrieved.label}
            value={formatEthValue(data.MainStats.SumWithdrawals ?? 0)}
            tooltip={statisticsCopy.metrics.totalPublicGoodsRetrieved.tooltip}
          />
        </StatisticsGroup>
      </div>

      {/* Anchoring snapshot */}
      <div className="mt-12">
        <SectionDivider title="Anchoring at a Glance" className="mb-6" />
        <Surface
          variant="gradient-border-accent"
          radius="xl"
          padding="lg"
          data-testid="anchoring-at-a-glance"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {(cstAnchorStats.TotalTokensStaked ?? 0).toLocaleString()} Cosmic Signature NFTs and{' '}
              {(rwlkAnchorStats.TotalTokensStaked ?? 0).toLocaleString()} RandomWalk NFTs are
              currently anchored. See anchor actions, anchored tokens, and unique anchor-holders on
              the anchoring statistics page.
            </p>
            <Link
              href="/statistics/anchoring"
              className="group inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary no-underline transition-colors hover:border-primary/45 hover:bg-primary/15 lg:self-auto"
            >
              <Lock className="h-4 w-4" aria-hidden />
              Anchoring statistics
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Surface>
      </div>
    </div>
  );
};

export default StatisticsHubPanel;

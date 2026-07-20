'use client';

import type { ReactNode } from 'react';
import { ArrowRight, Coins, Hash, Heart, Layers, Lock, Trophy, Wallet } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCSTValue, formatEthValue, formatGroupedNumber } from '@/utils';

import { Link } from '@/i18n/navigation';
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
  const t = useTranslations('statistics');
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
              <h3 className="text-base font-semibold text-white">
                {t(`navigation.${section.messageKey}.label`)}
              </h3>
            </div>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
            {t(`navigation.${section.messageKey}.description`)}
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
  const t = useTranslations('statistics');
  const locale = useLocale();
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
        title={t('hub.loadErrorTitle')}
        message={t('hub.loadErrorMessage')}
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
      headline: formatGroupedNumber(data.MainStats.NumUniqueBidders, locale),
      headlineLabel: t('hub.headlines.uniqueParticipants'),
    },
    tokens: {
      headline: formatGroupedNumber(data.MainStats.NumCSTokenMints, locale),
      headlineLabel: t('hub.headlines.nftsImprinted'),
    },
    anchoring: {
      headline: formatGroupedNumber(totalAnchored, locale),
      headlineLabel: t('hub.headlines.nftsAnchored'),
    },
    activity: {
      headline: formatGroupedNumber(Number(data.CurNumBids ?? 0), locale),
      headlineLabel: t('hub.headlines.gesturesThisCycle'),
    },
    performance: {
      headline: formatGroupedNumber(totalAllocationsDistributed, locale),
      headlineLabel: t('hub.headlines.allocationsDistributed'),
    },
  };

  return (
    <div data-testid="statistics-hub">
      {/* Headline metrics */}
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label={t('metrics.totalCycles.label')}
          value={data.CurRoundNum}
          icon={<Hash className="h-4 w-4" />}
          tooltip={t('metrics.totalCycles.tooltip')}
        />
        <StatCard
          label={t('metrics.allocationsDistributed.label')}
          value={totalAllocationsDistributed}
          icon={<Trophy className="h-4 w-4" />}
          tooltip={t('metrics.allocationsDistributed.tooltip')}
        />
        <StatCard
          label={t('metrics.cosmicSignatureNftsImprinted.shortLabel')}
          value={data.MainStats.NumCSTokenMints}
          icon={<Layers className="h-4 w-4" />}
          tooltip={t('metrics.cosmicSignatureNftsImprinted.tooltip')}
        />
        <StatCard
          label={t('metrics.contractBalance.label')}
          value={formatEthValue(data.CosmicGameBalanceEth ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          tooltip={t('metrics.contractBalance.tooltip')}
          gradient
        />
      </div>

      {/* Section explore cards */}
      <SectionDivider title={t('hub.exploreTitle')} className="mb-6" />
      <nav aria-label={t('hub.exploreAria')} className="mb-12">
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
              <p className="text-base font-semibold text-white">{t('hub.currentCycleTitle')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('hub.currentCycleSubtitle')}</p>
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
      <SectionDivider title={t('hub.protocolEconomyTitle')} className="mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatisticsGroup
          title={t('groups.allocationEconomy.label')}
          icon={<Trophy className="h-4 w-4" />}
          accentColor="blue"
          tooltip={t('groups.allocationEconomy.tooltip')}
        >
          <StatisticsItem
            title={t('metrics.numAllocationsDistributed.label')}
            value={
              <Link href="/allocation" className="text-inherit">
                {totalAllocationsDistributed}
              </Link>
            }
            tooltip={t('metrics.numAllocationsDistributed.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.totalSignatureAllocationsDistributed.label')}
            value={formatEthValue(Number(data.TotalPrizesPaidAmountEth) || 0)}
            tooltip={t('metrics.totalSignatureAllocationsDistributed.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.stellarSelectionEthDeposited.label')}
            value={formatEthValue(data.MainStats.TotalRaffleEthDeposits)}
            tooltip={t('metrics.stellarSelectionEthDeposited.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.stellarSelectionEthRetrieved.label')}
            value={formatEthValue(data.MainStats.TotalRaffleEthWithdrawn)}
            tooltip={t('metrics.stellarSelectionEthRetrieved.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.ethInGesturesCurrentCycle.label')}
            value={formatEthValue(data.CurRoundStats?.TotalEthInBidsEth ?? 0)}
            tooltip={t('metrics.ethInGesturesCurrentCycle.tooltip')}
          />
          {(data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0) > 0 && (
            <p className="mt-2 text-sm text-primary">
              {t('hub.pendingStellarRetrievals', {
                count: formatGroupedNumber(
                  data.MainStats.NumWinnersWithPendingRaffleWithdrawal ?? 0,
                  locale,
                ),
                amount: formatEthValue(
                  data.MainStats.TotalRaffleEthDeposits - data.MainStats.TotalRaffleEthWithdrawn,
                ),
              })}
            </p>
          )}
        </StatisticsGroup>

        <StatisticsGroup
          title={t('groups.tokenEconomy.label')}
          icon={<Coins className="h-4 w-4" />}
          accentColor="purple"
          tooltip={t('groups.tokenEconomy.tooltip')}
        >
          <StatisticsItem
            title={t('metrics.totalSupplyErc20.label')}
            value={formatCSTValue(ctStatisticsData?.TotalSupplyEth ?? 0)}
            tooltip={t('metrics.totalSupplyErc20.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.cosmicSignatureNftsImprinted.shortLabel')}
            value={
              <Link href="/gallery" className="text-inherit">
                {data.MainStats.NumCSTokenMints}
              </Link>
            }
            tooltip={t('metrics.cosmicSignatureNftsImprinted.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.totalCstConsumed.label')}
            value={formatCSTValue(data.MainStats.TotalCSTConsumedEth)}
            tooltip={t('metrics.totalCstConsumed.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.cstConsumedCurrentCycle.label')}
            value={formatCSTValue(data.CurRoundStats?.TotalCstInBidsEth ?? 0)}
            tooltip={t('metrics.cstConsumedCurrentCycle.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.cstGestures.label')}
            value={data.MainStats.NumBidsCST}
            tooltip={t('metrics.cstGestures.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.outreachReserve.label')}
            value={formatCSTValue(data.MainStats.TotalMktRewardsEth)}
            tooltip={t('metrics.outreachReserve.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.outreachTransactions.label')}
            value={
              <Link className="text-inherit" href="/marketing">
                {data.MainStats.NumMktRewards}
              </Link>
            }
            tooltip={t('metrics.outreachTransactions.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.randomWalkNftsUsed.label')}
            value={
              <Link className="text-inherit" href="/used-rwlk-nfts">
                {data.NumRwalkTokensUsed as ReactNode}
              </Link>
            }
            tooltip={t('metrics.randomWalkNftsUsed.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.namedTokens.label')}
            value={
              <Link className="text-inherit" href="/named-nfts">
                {data.MainStats.TotalNamedTokens}
              </Link>
            }
            tooltip={t('metrics.namedTokens.tooltip')}
          />
        </StatisticsGroup>

        <StatisticsGroup
          title={t('groups.publicGoods.label')}
          icon={<Heart className="h-4 w-4" />}
          accentColor="emerald"
          tooltip={t('groups.publicGoods.tooltip')}
        >
          <StatisticsItem
            title={t('metrics.publicGoodsBalance.label')}
            value={formatEthValue(Number(data.CharityBalanceEth) || 0)}
            tooltip={t('metrics.publicGoodsBalance.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.attachedNfts.label')}
            value={
              <Link className="text-inherit" href="/attached-nfts">
                {data.NumDonatedNFTs as ReactNode}
              </Link>
            }
            tooltip={t('metrics.attachedNfts.tooltip')}
          />
          <StatisticsItem
            title={t('metrics.totalContributedEth.label')}
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
            tooltip={t('metrics.totalContributedEth.tooltip')}
          />
          {(data.MainStats.NumCosmicGameDonations ?? 0) > 0 && (
            <>
              <StatisticsItem
                title={t('metrics.protocolContributions.label')}
                value={
                  <Link className="text-inherit" href="/public-goods-contributions-cg">
                    {data.MainStats.NumCosmicGameDonations}
                  </Link>
                }
                tooltip={t('metrics.protocolContributions.tooltip')}
              />
              <StatisticsItem
                title={t('metrics.protocolContributionsSum.label')}
                value={
                  <Link className="text-inherit" href="/public-goods-contributions-cg">
                    {formatEthValue(data.MainStats.SumCosmicGameDonationsEth ?? 0)}
                  </Link>
                }
                tooltip={t('metrics.protocolContributionsSum.tooltip')}
              />
            </>
          )}
          {(Number(data.SumVoluntaryDonationsEth) || 0) > 0 && (
            <StatisticsItem
              title={t('metrics.voluntaryContributions.label')}
              value={
                <Link className="text-inherit" href="/public-goods-contributions-voluntary">
                  {t('hub.voluntaryContributionSummary', {
                    count: formatGroupedNumber(Number(data.NumVoluntaryDonations) || 0, locale),
                    amount: formatEthValue(Number(data.SumVoluntaryDonationsEth) || 0),
                  })}
                </Link>
              }
              tooltip={t('metrics.voluntaryContributions.tooltip')}
            />
          )}
          {(data.MainStats.NumWithdrawals ?? 0) > 0 && (
            <StatisticsItem
              title={t('metrics.publicGoodsRetrievals.label')}
              value={
                <Link className="text-inherit" href="/public-goods-retrievals">
                  {data.MainStats.NumWithdrawals}
                </Link>
              }
              tooltip={t('metrics.publicGoodsRetrievals.tooltip')}
            />
          )}
          <StatisticsItem
            title={t('metrics.totalPublicGoodsRetrieved.label')}
            value={formatEthValue(data.MainStats.SumWithdrawals ?? 0)}
            tooltip={t('metrics.totalPublicGoodsRetrieved.tooltip')}
          />
        </StatisticsGroup>
      </div>

      {/* Anchoring snapshot */}
      <div className="mt-12">
        <SectionDivider title={t('hub.anchoringGlanceTitle')} className="mb-6" />
        <Surface
          variant="gradient-border-accent"
          radius="xl"
          padding="lg"
          data-testid="anchoring-at-a-glance"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {t('hub.anchoringGlanceDescription', {
                cosmicCount: formatGroupedNumber(cstAnchorStats.TotalTokensStaked ?? 0, locale),
                randomWalkCount: formatGroupedNumber(
                  rwlkAnchorStats.TotalTokensStaked ?? 0,
                  locale,
                ),
              })}
            </p>
            <Link
              href="/statistics/anchoring"
              className="group inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary no-underline transition-colors hover:border-primary/45 hover:bg-primary/15 lg:self-auto"
            >
              <Lock className="h-4 w-4" aria-hidden />
              {t('hub.anchoringGlanceLink')}
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

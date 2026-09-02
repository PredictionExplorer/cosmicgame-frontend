'use client';

import { Activity, ArrowRight, Coins, Lock, TrendingUp, Users } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { formatEthValue, formatGroupedNumber } from '@/utils';

import { Link } from '@/i18n/navigation';
import { formatDistributionPerAnchoredNftEth } from '@/utils/anchoringStats';
import {
  useCSTAnchorActions,
  useDashboardInfo,
  useGlobalAnchoredCSTokens,
  useGlobalAnchoredRWLKTokens,
  useRWLKAnchorActions,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { Surface } from '@/components/ui/surface';
import { SkeletonStatCard } from '@/components/ui/skeleton';
import {
  AnchoringHeroStats,
  type AnchoringStatItem,
} from '@/components/anchoring/AnchoringHeroStats';
import {
  AnchoringSection,
  type AnchoringDataState,
} from '@/components/statistics/AnchoringSection';
import type { UniqueAnchorHolderCST } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import type { UniqueAnchorHolderRWLK } from '@/components/tables/UniqueAnchorHoldersRWLKTable';

function toDataState<T>(query: UseQueryResult<T[], Error>): AnchoringDataState<T> {
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    onRetry: () => query.refetch(),
  };
}

/** Anchoring snapshot cards plus the CST/RWLK anchoring detail tabs. */
const AnchoringPanel = () => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo(undefined, {
    poll: false,
  });
  const cstAnchorActionsQuery = useCSTAnchorActions();
  const rwlkAnchorActionsQuery = useRWLKAnchorActions();
  const anchoredCSTokensQuery = useGlobalAnchoredCSTokens();
  const anchoredRWLKTokensQuery = useGlobalAnchoredRWLKTokens();
  const uniqueCSTAnchorHoldersQuery = useUniqueCSTAnchorHolders();
  const uniqueRWLKAnchorHoldersQuery = useUniqueRWLKAnchorHolders();

  const cstAnchorStats = dashboardData?.MainStats.StakeStatisticsCST;
  const rwlkAnchorStats = dashboardData?.MainStats.StakeStatisticsRWalk;

  const distributionPerCst = formatDistributionPerAnchoredNftEth(
    dashboardData?.StakingAmountEth,
    cstAnchorStats?.TotalTokensStaked,
  );
  const totalActiveAnchorHolders =
    (cstAnchorStats?.NumActiveStakers ?? 0) + (rwlkAnchorStats?.NumActiveStakers ?? 0);

  const anchoringSnapshotStats: AnchoringStatItem[] = [
    {
      label: t('anchoringPage.snapshot.cosmicSignatureLabel'),
      value: formatGroupedNumber(cstAnchorStats?.TotalTokensStaked ?? 0, locale),
      tooltip: t('anchoringPage.snapshot.cosmicSignatureTooltip'),
      icon: <Lock className="h-4 w-4" />,
      featured: true,
    },
    {
      label: t('anchoringPage.snapshot.randomWalkLabel'),
      value: formatGroupedNumber(rwlkAnchorStats?.TotalTokensStaked ?? 0, locale),
      tooltip: t('anchoringPage.snapshot.randomWalkTooltip'),
      icon: <Activity className="h-4 w-4" />,
      featured: true,
    },
    {
      label: t('anchoringPage.snapshot.poolLabel'),
      value: formatEthValue(dashboardData?.StakingAmountEth ?? 0),
      tooltip: t('anchoringPage.snapshot.poolTooltip'),
      icon: <Coins className="h-4 w-4" />,
      gradient: true,
    },
    {
      label: t('anchoringPage.snapshot.perNftLabel'),
      value: distributionPerCst.value,
      tooltip: distributionPerCst.indexedCountUnavailable
        ? t('anchoringPage.snapshot.perNftTooltipUnavailable')
        : t('anchoringPage.snapshot.perNftTooltip'),
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: t('anchoringPage.snapshot.activeHoldersLabel'),
      value: formatGroupedNumber(totalActiveAnchorHolders, locale),
      tooltip: t('anchoringPage.snapshot.activeHoldersTooltip'),
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <div data-testid="anchoring-panel">
      <Surface variant="gradient-border-accent" radius="xl" padding="lg" className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {t('anchoringPage.description')}
          </p>
          <Link
            href="/anchoring"
            className="group inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary no-underline transition-colors hover:border-primary/45 hover:bg-primary/15 lg:self-auto"
          >
            {t('anchoringPage.historyLink')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {dashboardLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <AnchoringHeroStats
            stats={anchoringSnapshotStats}
            className="mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          />
        )}
      </Surface>

      <Surface variant="glass" radius="lg" padding="md" className="mb-6">
        <p className="text-sm leading-6 text-muted-foreground">
          {t('anchoringPage.tableDescription')}
        </p>
      </Surface>

      <div className="gradient-border-card rounded-xl bg-white/[0.02] p-1">
        <AnchoringSection
          cstStats={cstAnchorStats ?? { NumActiveStakers: 0, TotalTokensStaked: 0 }}
          rwlkStats={rwlkAnchorStats ?? { NumActiveStakers: 0, TotalTokensStaked: 0 }}
          cstAnchorActions={toDataState(cstAnchorActionsQuery)}
          rwlkAnchorActions={toDataState(rwlkAnchorActionsQuery)}
          anchoredCSTokens={toDataState(anchoredCSTokensQuery)}
          anchoredRWLKTokens={toDataState(anchoredRWLKTokensQuery)}
          uniqueCSTAnchorHolders={
            toDataState(uniqueCSTAnchorHoldersQuery) as AnchoringDataState<UniqueAnchorHolderCST>
          }
          uniqueRWLKAnchorHolders={
            toDataState(uniqueRWLKAnchorHoldersQuery) as AnchoringDataState<UniqueAnchorHolderRWLK>
          }
        />
      </div>
    </div>
  );
};

export default AnchoringPanel;

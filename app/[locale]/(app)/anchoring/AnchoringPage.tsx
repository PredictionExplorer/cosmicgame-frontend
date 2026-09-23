'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Coins, Users, Layers, TrendingUp, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { Link } from '@/i18n/navigation';
import { GlobalAnchorDistributionsTable } from '@/components/anchoring/GlobalAnchorDistributionsTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';
import { AnchoringHeroStats } from '@/components/anchoring/AnchoringHeroStats';
import { HowAnchoringWorks } from '@/components/anchoring/HowAnchoringWorks';
import {
  useCSTAnchorDistributions,
  useGlobalRWLKAnchorImprints,
  useDashboardInfo,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionDivider } from '@/components/ui/section-divider';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { Surface } from '@/components/ui/surface';
import { UnknownValue } from '@/components/ui/unknown-value';
import { formatEthValue } from '@/utils/format';
import {
  countActiveAnchorHolders,
  distributionPerAnchoredNft,
  formatPerNftEth,
} from '@/utils/anchoringStats';

const AnchoringPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('anchoring');
  const tCommon = useTranslations('common');
  const locale = useLocale();
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
  const { data: cstHolders, isLoading: isLoadingCstHolders } = useUniqueCSTAnchorHolders();
  const { data: rwlkHolders, isLoading: isLoadingRwlkHolders } = useUniqueRWLKAnchorHolders();

  const loading = isLoadingCST || isLoadingRWLK;
  const statsLoading = isLoadingDashboard || isLoadingCstHolders || isLoadingRwlkHolders;
  const hasError = Boolean(cstError || rwlkError);

  const heroStats = useMemo(() => {
    const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
    const count = (value: number | undefined) =>
      typeof value === 'number' ? value.toLocaleString(locale) : unknown;
    const pool = dashboardData?.StakingAmountEth;
    const perNft = distributionPerAnchoredNft(
      pool,
      dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked,
    );
    const activeHolders = countActiveAnchorHolders(cstHolders, rwlkHolders);

    return [
      {
        label: t('overview.stats.pool.label'),
        value: typeof pool === 'number' ? formatEthValue(pool) : unknown,
        tooltip: t('overview.stats.pool.tooltip'),
        caption: t('overview.stats.pool.caption'),
        icon: <Coins className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: t('overview.stats.cosmicSignatureAnchored.label'),
        value: count(dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked),
        tooltip: t('overview.stats.cosmicSignatureAnchored.tooltip'),
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: t('overview.stats.randomWalkAnchored.label'),
        value: count(dashboardData?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked),
        tooltip: t('overview.stats.randomWalkAnchored.tooltip'),
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: t('overview.stats.distributionPerNft.label'),
        value: perNft.status === 'available' ? formatPerNftEth(perNft.perNftEth) : unknown,
        tooltip: t('overview.stats.distributionPerNft.tooltip'),
        caption:
          perNft.status === 'noneAnchored'
            ? t('overview.stats.distributionPerNft.noneAnchored')
            : undefined,
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        // One definition with /statistics/anchoring: distinct wallets anchoring either kind.
        label: t('overview.stats.activeHolders.label'),
        value: activeHolders === null ? unknown : activeHolders.toLocaleString(locale),
        tooltip: t('overview.stats.activeHolders.tooltip'),
        icon: <Users className="h-4 w-4" />,
      },
    ];
  }, [cstHolders, dashboardData, locale, rwlkHolders, t, tCommon]);

  if (hasError) {
    return (
      <PageShell variant="data">
        {seoSummary}
        <ErrorState title={t('overview.errorTitle')} message={t('overview.errorMessage')} />
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}
      {!seoSummary && (
        <PageHeader
          align="left"
          eyebrow={
            <SectionEyebrow tone="aurora" pulse>
              {t('overview.eyebrow')}
            </SectionEyebrow>
          }
          title={t('overview.title')}
          titleLevel={2}
          subtitle={t('overview.subtitle')}
        />
      )}

      <Surface
        variant="impact"
        radius="xl"
        padding="lg"
        className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-center"
      >
        <p className="type-body-md text-muted-foreground">
          {t('overview.intro.description', {
            percentage: protocolFacts.anchorDistributionPercentage,
          })}
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
              {t('overview.intro.flow', {
                percentage: protocolFacts.anchorDistributionPercentage,
              })}
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
          <p className="text-base font-semibold text-foreground">{t('overview.cta.title')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('overview.cta.description')}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary opacity-60 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
      </Link>

      <div>
        <SectionDivider title={t('overview.sections.cosmicSignature')} />
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
        <SectionDivider title={t('overview.sections.randomWalk')} />
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

'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import dynamic from 'next/dynamic';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useDashboardInfo, useSystemModelist } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import { StatsSection } from '@/components/statistics/StatsSection';
import { SectionShell } from '@/components/statistics/SectionShell';
import { SkeletonChart } from '@/components/ui/skeleton';
import { CycleScopeControl } from '@/components/statistics/CycleScopeControl';
import { useCycleScope } from '@/components/statistics/useCycleScope';
import { BidFrequencyChart } from '@/components/statistics/BidFrequencyChart';
import { LastBidSpikeChart } from '@/components/statistics/LastBidSpikeChart';
import { BidderActivePeriodsTimeline } from '@/components/statistics/BidderActivePeriodsTimeline';
import { SystemModesTable, type EventRow } from '@/components/tables/SystemModesTable';

/**
 * The one-cycle charts sit below three all-time sections: each loads in its
 * own chunk after the page, behind a skeleton of its height, so the page's
 * first load carries only the charts at the top.
 */
const chartSkeleton = (height: number) =>
  function ChartLoading() {
    return <SkeletonChart height={height} bars={18} />;
  };
const GestureTypeMixChart = dynamic(
  () => import('@/components/statistics/GestureTypeMixChart').then((m) => m.GestureTypeMixChart),
  { ssr: false, loading: chartSkeleton(300) },
);
const EnduranceTimelineChart = dynamic(
  () => import('@/components/statistics/EnduranceTimelineChart'),
  { ssr: false, loading: chartSkeleton(320) },
);
const CstCalibrationWindowChart = dynamic(
  () => import('@/components/statistics/CstCalibrationWindowChart'),
  { ssr: false, loading: chartSkeleton(320) },
);
const CstGestureCostChart = dynamic(() => import('@/components/statistics/CstGestureCostChart'), {
  ssr: false,
  loading: chartSkeleton(320),
});

/**
 * Gesture activity: frequency, spikes and the most active participants over
 * all time, then one cycle's story (method mix, lead history, Calibration
 * Window, CST cost) under the page's one cycle picker, kept in `?cycle=`,
 * and the cycle activations log. The cycle charts mount only once the
 * dashboard names the live cycle: until then the section shows a chart
 * skeleton, and a failed read shows an error with a retry, never a chart's
 * "not started" or "select a cycle" state for a cycle that is live. The live
 * cycle is read only after hydration, so the first client render matches the
 * server's skeleton even when the dashboard query has already answered.
 */
const ActivityPanel = () => {
  const t = useTranslations('statistics');
  const hydrated = useHydrated();
  const dashboardQuery = useDashboardInfo(undefined, { poll: false });
  const systemModesQuery = useSystemModelist();
  const liveCycle = hydrated ? (dashboardQuery.data?.CurRoundNum ?? -1) : -1;
  const scope = useCycleScope(liveCycle);
  const cycleKnown = liveCycle >= 0;
  const dashboardFailed = hydrated && dashboardQuery.isError;
  const systemModeChanges = (systemModesQuery.data ?? []) as EventRow[];
  const title = (key: string) => t(`activity.sections.${key}`);

  return (
    <div className="space-y-12 sm:space-y-16" data-testid="activity-panel">
      <StatsSection title={title('frequency')} tooltip={t('sectionTooltips.gestureFrequency')}>
        <BidFrequencyChart label={title('frequency')} />
      </StatsSection>

      <StatsSection title={title('spikes')} tooltip={t('sectionTooltips.gestureSpikes')}>
        <LastBidSpikeChart label={title('spikes')} />
      </StatsSection>

      <StatsSection
        title={title('activePeriods')}
        tooltip={t('sectionTooltips.participantActivePeriods')}
      >
        <BidderActivePeriodsTimeline label={title('activePeriods')} />
      </StatsSection>

      <StatsSection
        id="cycle"
        title={title('cycleTimelines')}
        description={t('activity.cycleTimelinesDescription')}
        actions={<CycleScopeControl scope={scope} />}
        isLoading={!cycleKnown && !dashboardFailed}
        isError={!cycleKnown && dashboardFailed}
        onRetry={() => dashboardQuery.refetch()}
        skeleton={<SkeletonChart />}
      >
        <div className="space-y-12">
          <SectionShell
            headingLevel={3}
            title={title('typeDistribution')}
            tooltip={t('sectionTooltips.gestureTypeDistribution')}
          >
            <GestureTypeMixChart
              round={scope.cycle}
              isLive={scope.isLive}
              label={title('typeDistribution')}
            />
          </SectionShell>

          <SectionShell
            headingLevel={3}
            title={title('enduranceTimeline')}
            tooltip={t('sectionTooltips.enduranceTimeline')}
            actions={
              scope.cycle >= 0 ? (
                <Link
                  href={`/embed/endurance/${scope.cycle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-quiet group inline-flex min-h-11 items-center gap-1.5 type-label text-muted-foreground hover:text-foreground sm:min-h-8"
                >
                  {t('charts.endurance.openWindow')}
                  <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
                </Link>
              ) : null
            }
          >
            <EnduranceTimelineChart
              round={scope.cycle}
              isLive={scope.isLive}
              label={title('enduranceTimeline')}
            />
          </SectionShell>

          <SectionShell
            headingLevel={3}
            title={title('cstWindow')}
            tooltip={t('sectionTooltips.cstWindow')}
          >
            <CstCalibrationWindowChart
              round={scope.cycle}
              isLive={scope.isLive}
              label={title('cstWindow')}
            />
          </SectionShell>

          <SectionShell
            headingLevel={3}
            title={title('cstCost')}
            tooltip={t('sectionTooltips.cstCost')}
          >
            <CstGestureCostChart round={scope.cycle} label={title('cstCost')} />
          </SectionShell>
        </div>
      </StatsSection>

      <StatsSection
        title={title('cycleActivations')}
        tooltip={t('sectionTooltips.cycleActivations')}
        defaultOpen={false}
        lazy
        collapsedSummary={
          systemModesQuery.data
            ? t('activity.cycleActivationsCount', { count: systemModeChanges.length })
            : null
        }
        isLoading={systemModesQuery.isLoading}
        isError={systemModesQuery.isError}
        onRetry={() => systemModesQuery.refetch()}
        isEmpty={systemModeChanges.length === 0}
        emptyTitle={t('activity.emptyCycleActivations')}
      >
        <SystemModesTable list={systemModeChanges} />
      </StatsSection>
    </div>
  );
};

export default ActivityPanel;
// lexicon-allow-end

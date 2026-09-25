'use client';

import dynamic from 'next/dynamic';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useDashboardInfo, useSystemModelist } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import { StatsSection } from '@/components/statistics/StatsSection';
import { SectionShell } from '@/components/statistics/SectionShell';
import { DefinitionsDisclosure } from '@/components/statistics/DefinitionsDisclosure';
import { CycleScopeControl } from '@/components/statistics/CycleScopeControl';
import { useCycleScope } from '@/components/statistics/useCycleScope';
import { GestureFrequencyChart } from '@/components/statistics/GestureFrequencyChart';
import { GestureSpikeChart } from '@/components/statistics/GestureSpikeChart';
import {
  ACTIVE_PERIODS_TOP_N,
  ParticipantActivePeriodsTimeline,
} from '@/components/statistics/ParticipantActivePeriodsTimeline';
import { EnduranceTimelineSkeleton } from '@/components/statistics/EnduranceTimelineSkeleton';
import { ChartFigureSkeleton } from '@/components/statistics/charts/ChartFigureSkeleton';
import { SystemModesTable, type EventRow } from '@/components/tables/SystemModesTable';

/**
 * The one-cycle charts sit below three all-time sections: each loads in its
 * own chunk after the page, behind a skeleton in the finished figure's shape
 * (readout, toolbar, plot), so the page's first load carries only the charts
 * at the top and nothing moves when a chart replaces its skeleton.
 */
const GestureTypeMixChart = dynamic(
  () => import('@/components/statistics/GestureTypeMixChart').then((m) => m.GestureTypeMixChart),
  { ssr: false, loading: () => <ChartFigureSkeleton figures={4} captions height={300} /> },
);
const EnduranceTimelineChart = dynamic(
  () => import('@/components/statistics/EnduranceTimelineChart'),
  { ssr: false, loading: () => <EnduranceTimelineSkeleton lanes={14} /> },
);
const CstCalibrationWindowChart = dynamic(
  () => import('@/components/statistics/CstCalibrationWindowChart'),
  { ssr: false, loading: () => <ChartFigureSkeleton figures={3} height={320} /> },
);
const CstGestureCostChart = dynamic(() => import('@/components/statistics/CstGestureCostChart'), {
  ssr: false,
  loading: () => <ChartFigureSkeleton figures={3} captions height={344} />,
});

/**
 * Gesture activity: frequency, spikes and the most active participants over
 * all time, then one cycle's story (method mix, lead history, Calibration
 * Window, CST cost) under the page's one cycle picker, kept in `?cycle=`,
 * and the cycle activations log. Each chart reads out its point in figures
 * and keeps a one- or two-line note; what each section measures and how is
 * in one Definitions disclosure at the end, not an ⓘ on every heading. The
 * cycle charts mount only once the dashboard names the live cycle: until
 * then the section shows a chart skeleton, and a failed read shows an error
 * with a retry. The live cycle is read only after hydration, so the first
 * client render matches the server's skeleton.
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
      <StatsSection title={title('frequency')}>
        <GestureFrequencyChart label={title('frequency')} />
      </StatsSection>

      <StatsSection title={title('spikes')}>
        <GestureSpikeChart label={title('spikes')} />
      </StatsSection>

      <StatsSection title={title('activePeriods')}>
        <ParticipantActivePeriodsTimeline label={title('activePeriods')} />
      </StatsSection>

      <StatsSection
        id="cycle"
        title={title('cycleTimelines')}
        description={t('activity.cycleTimelinesDescription')}
        actions={<CycleScopeControl scope={scope} />}
        isLoading={!cycleKnown && !dashboardFailed}
        isError={!cycleKnown && dashboardFailed}
        onRetry={() => dashboardQuery.refetch()}
        skeleton={<ChartFigureSkeleton figures={4} captions height={300} />}
      >
        <div className="space-y-12">
          <SectionShell headingLevel={3} title={title('typeDistribution')}>
            <GestureTypeMixChart
              round={scope.cycle}
              isLive={scope.isLive}
              label={title('typeDistribution')}
            />
          </SectionShell>

          <SectionShell
            headingLevel={3}
            title={title('enduranceTimeline')}
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
                  <span className="sr-only"> {t('embed.opensNewWindow')}</span>
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

          <SectionShell headingLevel={3} title={title('cstWindow')}>
            <CstCalibrationWindowChart
              round={scope.cycle}
              isLive={scope.isLive}
              label={title('cstWindow')}
            />
          </SectionShell>

          <SectionShell headingLevel={3} title={title('cstCost')}>
            <CstGestureCostChart round={scope.cycle} label={title('cstCost')} />
          </SectionShell>
        </div>
      </StatsSection>

      <StatsSection
        title={title('cycleActivations')}
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

      <DefinitionsDisclosure
        className="border-t border-rule pt-8 sm:pt-10"
        label={t('shared.definitions')}
        items={[
          { term: title('frequency'), definition: t('charts.frequency.openingExcluded') },
          { term: title('spikes'), definition: t('sectionTooltips.gestureSpikes') },
          {
            term: title('activePeriods'),
            definition: t('charts.activePeriods.description', { count: ACTIVE_PERIODS_TOP_N }),
          },
          {
            term: title('typeDistribution'),
            definition: t('sectionTooltips.gestureTypeDistribution'),
          },
          { term: title('enduranceTimeline'), definition: t('charts.endurance.description') },
          { term: title('cstWindow'), definition: t('charts.cstWindow.description') },
          { term: title('cstCost'), definition: t('charts.cstCost.description') },
          { term: title('cycleActivations'), definition: t('sectionTooltips.cycleActivations') },
        ]}
      />
    </div>
  );
};

export default ActivityPanel;

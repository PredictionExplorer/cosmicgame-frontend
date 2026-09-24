'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useDashboardInfo, useSystemModelist } from '@/hooks/useApiQuery';
import { StatsSection } from '@/components/statistics/StatsSection';
import { SectionShell } from '@/components/statistics/SectionShell';
import { CycleScopeControl } from '@/components/statistics/CycleScopeControl';
import { useCycleScope } from '@/components/statistics/useCycleScope';
import { BidFrequencyChart } from '@/components/statistics/BidFrequencyChart';
import { LastBidSpikeChart } from '@/components/statistics/LastBidSpikeChart';
import { BidderActivePeriodsTimeline } from '@/components/statistics/BidderActivePeriodsTimeline';
import { GestureTypeMixChart } from '@/components/statistics/GestureTypeMixChart';
import CstCalibrationWindowChart from '@/components/statistics/CstCalibrationWindowChart';
import CstGestureCostChart from '@/components/statistics/CstGestureCostChart';
import EnduranceTimelineChart from '@/components/statistics/EnduranceTimelineChart';
import { SystemModesTable, type EventRow } from '@/components/tables/SystemModesTable';

/**
 * Gesture activity: frequency, spikes and the most active participants over
 * all time, then one cycle's story (method mix, lead history, Calibration
 * Window, CST cost) under the page's one cycle picker, kept in `?cycle=`,
 * and the cycle activations log.
 */
const ActivityPanel = () => {
  const t = useTranslations('statistics');
  const { data: dashboardData } = useDashboardInfo(undefined, { poll: false });
  const systemModesQuery = useSystemModelist();
  const scope = useCycleScope(dashboardData?.CurRoundNum ?? -1);
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

      <SectionShell
        id="cycle"
        title={title('cycleTimelines')}
        description={t('activity.cycleTimelinesDescription')}
        actions={<CycleScopeControl scope={scope} />}
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

          <SectionShell headingLevel={3} title={title('cstCost')} tooltip={t('sectionTooltips.cstCost')}>
            <CstGestureCostChart round={scope.cycle} label={title('cstCost')} />
          </SectionShell>
        </div>
      </SectionShell>

      <StatsSection
        title={title('cycleActivations')}
        tooltip={t('sectionTooltips.cycleActivations')}
        defaultOpen={false}
        lazy
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

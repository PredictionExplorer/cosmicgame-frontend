'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { Activity, BarChart3, Flame, Users } from 'lucide-react';

import { statisticsCopy } from '@/content/statistics-copy';

import { useDashboardInfo, useSystemModelist } from '@/hooks/useApiQuery';
import { StatsSection } from '@/components/statistics/StatsSection';
import { BidFrequencyChart } from '@/components/statistics/BidFrequencyChart';
import { LastBidSpikeChart } from '@/components/statistics/LastBidSpikeChart';
import { BidderActivePeriodsTimeline } from '@/components/statistics/BidderActivePeriodsTimeline';
import { BidTypeRatioChart } from '@/components/statistics/BidTypeRatioChart';
import { EnduranceTimelineSection } from '@/components/statistics/EnduranceTimelineChart';
import { SystemModesTable, type EventRow } from '@/components/tables/SystemModesTable';

/** Gesture activity charts, cycle timelines, and system events. */
const ActivityPanel = () => {
  const { data: dashboardData } = useDashboardInfo(undefined, { poll: false });
  const systemModesQuery = useSystemModelist();

  const curRoundNum = dashboardData?.CurRoundNum ?? -1;
  const systemModeChanges = (systemModesQuery.data ?? []) as EventRow[];

  return (
    <div className="space-y-4" data-testid="activity-panel">
      <StatsSection
        title="Gesture Frequency Over Time"
        tooltip={statisticsCopy.sections.gestureFrequency}
        icon={<BarChart3 className="h-3.5 w-3.5" />}
      >
        <BidFrequencyChart />
      </StatsSection>

      <StatsSection
        title="Gesture Spikes"
        tooltip={statisticsCopy.sections.gestureSpikes}
        icon={<Flame className="h-3.5 w-3.5" />}
      >
        <LastBidSpikeChart />
      </StatsSection>

      <StatsSection
        title="Top 20 Participant Active Periods"
        tooltip={statisticsCopy.sections.participantActivePeriods}
        icon={<Users className="h-3.5 w-3.5" />}
      >
        <BidderActivePeriodsTimeline />
      </StatsSection>

      <StatsSection
        title="Gesture Type Distribution"
        tooltip={statisticsCopy.sections.gestureTypeDistribution}
        icon={<Activity className="h-3.5 w-3.5" />}
      >
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Current cycle only
          </span>
        </div>
        <BidTypeRatioChart roundStartTs={dashboardData?.TsRoundStart ?? 0} />
      </StatsSection>

      <StatsSection
        title="Endurance & Chrono Timeline"
        tooltip={statisticsCopy.sections.enduranceTimeline}
        icon={<Activity className="h-3.5 w-3.5" />}
      >
        <EnduranceTimelineSection currentRoundNum={curRoundNum} />
      </StatsSection>

      <StatsSection
        title="Cycle Activations"
        tooltip={statisticsCopy.sections.cycleActivations}
        icon={<Activity className="h-3.5 w-3.5" />}
        defaultOpen={false}
        lazy
        isLoading={systemModesQuery.isLoading}
        isError={systemModesQuery.isError}
        onRetry={() => systemModesQuery.refetch()}
        isEmpty={systemModeChanges.length === 0}
        emptyTitle="No cycle activations indexed yet"
      >
        <SystemModesTable list={systemModeChanges} />
      </StatsSection>
    </div>
  );
};

export default ActivityPanel;
// lexicon-allow-end

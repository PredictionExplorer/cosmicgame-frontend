'use client';

import type { FC } from 'react';

import EnduranceTimelineChart from '@/components/statistics/EnduranceTimelineChart';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';

/**
 * Standalone, chrome-less endurance/chrono Gantt for a single round — meant to be
 * opened in its own browser window. It fills the full window width (no max-width),
 * so maximizing or full-screening the window stretches the chart to 100%.
 */
const EmbedEnduranceChart: FC<{ roundNum: number }> = ({ roundNum }) => {
  const { data: dashboard, isLoading } = useDashboardInfo();

  if (isLoading) {
    return (
      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-screen w-full items-center justify-center bg-background"
      >
        <Spinner size="lg" />
      </main>
    );
  }

  const curRoundNum = dashboard?.CurRoundNum ?? roundNum;
  const isLive = roundNum >= curRoundNum;

  return (
    <main id="main" tabIndex={-1} className="min-h-screen w-full bg-background p-4 sm:p-6">
      <EnduranceTimelineChart round={roundNum} isLive={isLive} />
    </main>
  );
};

export default EmbedEnduranceChart;

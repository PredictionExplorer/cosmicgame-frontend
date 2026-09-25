'use client';

import type { FC } from 'react';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useDashboardInfo } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import EnduranceTimelineChart, {
  EnduranceTimelineSkeleton,
} from '@/components/statistics/EnduranceTimelineChart';
import { ChartLinksOpenNewWindow } from '@/components/statistics/charts/timeline';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';

import { EmbedFrame } from './EmbedFrame';

interface EmbedEnduranceChartProps {
  roundNum: number;
  /** The live cycle the server read for this render; undefined when it did not read one. */
  seedLiveCycle?: number;
  /** How many addresses held the lead in this cycle, by the server's read. */
  expectedLanes?: number;
}

/**
 * The Endurance & Chrono timeline of one cycle in a window of its own
 * (opened from the activity page, or shared), in the embed's frame
 * (`EmbedFrame`): an H1 named as the section it comes from with the cycle,
 * and beside it whether the cycle is live or final. It fills the window's
 * width, so maximizing the window widens the chart, and it draws every lane:
 * the window scrolls, never a box inside it.
 *
 * Whether the cycle is live or final comes from the dashboard: the server's
 * read (`seedLiveCycle`) puts the badge and the chart's frame in the HTML,
 * sized to the server's lane count, so nothing moves when the client's data
 * arrives. A cycle past the server's live one never gets here: the page
 * renders `EmbedCycleNotStarted` instead. Without a server read, nothing
 * claims either state until the client reads: a skeleton while it loads, an
 * error with a retry if it fails, and the embed's 404 for a cycle past the
 * live one, not a "live" chart of nothing.
 */
const EmbedEnduranceChart: FC<EmbedEnduranceChartProps> = ({
  roundNum,
  seedLiveCycle,
  expectedLanes,
}) => {
  const t = useTranslations('statistics');
  const hydrated = useHydrated();
  const { data: dashboard, isError, refetch } = useDashboardInfo();
  const clientLive =
    hydrated && typeof dashboard?.CurRoundNum === 'number' && dashboard.CurRoundNum >= 0
      ? dashboard.CurRoundNum
      : undefined;
  if (clientLive !== undefined && roundNum > clientLive) notFound();
  const liveCycle = clientLive ?? seedLiveCycle;
  // Known once a read covers the cycle: the server sends one only for a cycle that has opened.
  const known = typeof liveCycle === 'number' && liveCycle >= 0 && roundNum <= liveCycle;
  const isLive = known && roundNum === liveCycle;
  const title = t('embed.title', { cycle: roundNum });

  return (
    <EmbedFrame
      title={title}
      sourceHref={`/statistics/activity?cycle=${roundNum}#cycle`}
      status={
        !known ? (
          // Holds the badge's place while the dashboard says whether the cycle is live.
          <Skeleton as="span" className="inline-block h-6 w-16" />
        ) : isLive ? (
          <Badge tone="live" shape="pill" dot>
            {t('charts.cyclePicker.liveCycle')}
          </Badge>
        ) : (
          <Badge>{t('embed.final')}</Badge>
        )
      }
    >
      {known ? (
        // Its participants open in a new window, like the source link above.
        <ChartLinksOpenNewWindow>
          <EnduranceTimelineChart
            round={roundNum}
            isLive={isLive}
            label={title}
            laneLimit={null}
            expectedLanes={expectedLanes}
          />
        </ChartLinksOpenNewWindow>
      ) : isError && hydrated ? (
        <ErrorState headingLevel={2} message={t('shared.serviceError')} onRetry={() => refetch()} />
      ) : (
        <EnduranceTimelineSkeleton lanes={expectedLanes} />
      )}
    </EmbedFrame>
  );
};

export default EmbedEnduranceChart;

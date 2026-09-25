'use client';

import type { FC } from 'react';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import EnduranceTimelineChart, {
  EnduranceTimelineSkeleton,
} from '@/components/statistics/EnduranceTimelineChart';
import { ChartLinksOpenNewWindow } from '@/components/statistics/charts/timeline';
import { Wordmark } from '@/components/layout/Wordmark';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';

interface EmbedEnduranceChartProps {
  roundNum: number;
  /** The live cycle the server read for this render; undefined when it did not read one. */
  seedLiveCycle?: number;
  /** How many addresses held the lead in this cycle, by the server's read. */
  expectedLanes?: number;
}

/**
 * The Endurance & Chrono timeline of one cycle in a window of its own
 * (opened from the activity page, or shared). It says whose it is and what
 * it is: the Cosmic Signature lockup (to the Observatory), an H1 named as
 * the section it comes from with the cycle, whether the cycle is live or
 * final, and a link back to the full activity page. It fills the window's width, so maximizing the
 * window widens the chart, and it draws every lane: the window scrolls, never
 * a box inside it. Every link opens a new window, so the embed stays itself.
 *
 * Whether the cycle is live or final comes from the dashboard: the server's
 * read (`seedLiveCycle`) puts the badge and the chart's frame in the HTML,
 * sized to the server's lane count, so nothing moves when the client's data
 * arrives. Without it, nothing claims either state until the client reads:
 * a skeleton while it loads, an error with a retry if it fails. A cycle past
 * the live one has not opened: that is the app's 404 (decided in the
 * browser, never cached), not a "live" chart of nothing.
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
  // A server read never 404s a cycle (it may open a minute later): it only counts when it covers it.
  const known = typeof liveCycle === 'number' && liveCycle >= 0 && roundNum <= liveCycle;
  const isLive = known && roundNum === liveCycle;
  const title = t('embed.title', { cycle: roundNum });

  return (
    <main
      id="main"
      tabIndex={-1}
      className="min-h-screen w-full bg-background px-4 py-5 sm:px-8 sm:py-7"
    >
      <header className="mb-6 border-b border-rule pb-4">
        {/* Whose chart this is, for a reader who meets the window on its own: the lockup
            leads to the Observatory, the source link to the chart's own section. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-control no-underline sm:min-h-8"
          >
            {/* The mark alone on a phone, so the source link shares its row; the name stays
                the link's name. */}
            <Wordmark size="sm" nameClassName="max-sm:sr-only" />
            <span className="sr-only"> {t('embed.opensNewWindow')}</span>
          </Link>
          <Link
            href={`/statistics/activity?cycle=${roundNum}#cycle`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet group inline-flex min-h-11 items-center gap-1.5 type-label text-muted-foreground hover:text-foreground sm:min-h-8"
          >
            {t('embed.source')}
            <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
            <span className="sr-only"> {t('embed.opensNewWindow')}</span>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="type-heading-3 text-foreground">{title}</h1>
          {!known ? (
            // Holds the badge's place while the dashboard says whether the cycle is live.
            <Skeleton as="span" className="inline-block h-6 w-16" />
          ) : isLive ? (
            <Badge tone="live" shape="pill" dot>
              {t('charts.cyclePicker.liveCycle')}
            </Badge>
          ) : (
            <Badge>{t('embed.final')}</Badge>
          )}
        </div>
      </header>
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
    </main>
  );
};

export default EmbedEnduranceChart;

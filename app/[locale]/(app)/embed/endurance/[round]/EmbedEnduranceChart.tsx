'use client';

import type { FC } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import EnduranceTimelineChart from '@/components/statistics/EnduranceTimelineChart';
import { Badge } from '@/components/ui/badge';
import { SkeletonChart } from '@/components/ui/skeleton';

/**
 * The Endurance timeline of one cycle in a window of its own (opened from
 * the activity page, or shared). It says what it is: an H1 with the cycle,
 * whether the cycle is live or final, and a link back to the full activity
 * page in Cosmic Signature. It fills the window's width, so maximizing the
 * window widens the chart.
 */
const EmbedEnduranceChart: FC<{ roundNum: number }> = ({ roundNum }) => {
  const t = useTranslations('statistics');
  const { data: dashboard, isLoading } = useDashboardInfo();
  const liveCycle = dashboard?.CurRoundNum;
  const isLive = typeof liveCycle === 'number' && roundNum >= liveCycle;
  const title = t('embed.title', { cycle: roundNum });

  return (
    <main id="main" tabIndex={-1} className="min-h-screen w-full bg-background px-4 py-5 sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-rule pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="type-heading-3 text-foreground">{title}</h1>
          {isLoading ? null : isLive ? (
            <Badge tone="live" shape="pill" dot>
              {t('charts.cyclePicker.liveCycle')}
            </Badge>
          ) : (
            <Badge>{t('embed.final')}</Badge>
          )}
        </div>
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
      </header>
      {isLoading ? (
        <SkeletonChart height={420} bars={20} />
      ) : (
        <EnduranceTimelineChart round={roundNum} isLive={isLive} label={title} />
      )}
    </main>
  );
};

export default EmbedEnduranceChart;

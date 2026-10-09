'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

// lexicon-allow-start: the hook name mirrors the backend route statistics/bidding/frequency
import { useBidFrequency as useFrequencyQuery } from '@/hooks/useApiQuery';
// lexicon-allow-end
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { Skeleton } from '@/components/ui/skeleton';
import { SparkBars } from '@/components/statistics/charts/SparkBars';
import { SERIES_COLOR } from '@/components/statistics/charts/theme';
import { formatMonthDay } from '@/components/statistics/charts/labels';

const DAY = 86_400;
/** Days in the strip when the cycle's opening is unknown. */
export const RHYTHM_DAYS = 30;
/** The most days the strip draws: a longer cycle shows its latest days. */
export const RHYTHM_MAX_DAYS = 60;

export interface DailyCount {
  /** UTC midnight of the day, in Unix seconds. */
  day: number;
  count: number;
}

/**
 * The last `days` UTC days ending today, oldest first, with the API's daily
 * buckets filled in and missing days as zero, so the strip never skips a day.
 */
export function dailySeries(
  buckets: readonly { BucketTs: number; NumBids?: number }[],
  todayTs: number,
  days = RHYTHM_DAYS,
): DailyCount[] {
  const today = Math.floor(todayTs / DAY) * DAY;
  const byDay = new Map<number, number>();
  for (const bucket of buckets) {
    const day = Math.floor(bucket.BucketTs / DAY) * DAY;
    byDay.set(day, (byDay.get(day) ?? 0) + (bucket.NumBids ?? 0));
  }
  return Array.from({ length: days }, (_, index) => {
    const day = today - (days - 1 - index) * DAY;
    return { day, count: byDay.get(day) ?? 0 };
  });
}

/**
 * How many UTC days the strip covers: from the day the cycle opened through
 * today (at most `RHYTHM_MAX_DAYS`), or the last `RHYTHM_DAYS` when the
 * opening is unknown. `sinceOpening` says whether it starts at the opening.
 */
export function rhythmSpan(
  todayTs: number,
  openedTs: number | null,
): { days: number; sinceOpening: boolean } {
  if (openedTs === null || openedTs <= 0 || openedTs > todayTs) {
    return { days: RHYTHM_DAYS, sinceOpening: false };
  }
  const today = Math.floor(todayTs / DAY) * DAY;
  const opened = Math.floor(openedTs / DAY) * DAY;
  const days = (today - opened) / DAY + 1;
  return days <= RHYTHM_MAX_DAYS
    ? { days, sinceOpening: true }
    : { days: RHYTHM_MAX_DAYS, sinceOpening: false };
}

/**
 * The hub's pulse beside the live cycle: gestures per UTC day since the cycle
 * opened (its latest 60 days for a long cycle, the last 30 when the opening
 * is unknown), read in one line (the total and the busiest day) with the
 * range under the strip. Today's bar is still filling, so it draws as a
 * partial bar and its end label says so, rather than reading as a drop. The
 * counts leave out each cycle's first hour (the backend's rule), which the
 * label says. Plain SVG, no chart library on the hub.
 */
export function CycleRhythm({ openedTs }: { openedTs: number | null }) {
  const t = useTranslations('statistics');
  const format = useFormat();
  // Whole days: the query key changes once a day, not on every render.
  const today = Math.floor(useNow(60_000) / 1000 / DAY) * DAY;
  const { days, sinceOpening } = rhythmSpan(today, openedTs);
  const from = today - (days - 1) * DAY;
  const { data, isLoading, isError } = useFrequencyQuery(from, today + DAY, DAY);

  const series = useMemo(() => dailySeries(data ?? [], today, days), [data, today, days]);
  const total = series.reduce((sum, point) => sum + point.count, 0);
  const peak = series.reduce<DailyCount | null>(
    (best, point) => (point.count > 0 && (!best || point.count > best.count) ? point : best),
    null,
  );

  if (isLoading) {
    return (
      <div aria-hidden className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  if (isError) {
    return <p className="type-body-sm text-muted-foreground">{t('hub.cycle.rhythmUnavailable')}</p>;
  }

  const rhythmLabel = sinceOpening
    ? t('hub.cycle.rhythmCycleLabel')
    : t('hub.cycle.rhythmLabel', { days });
  const summary =
    peak === null
      ? t('hub.cycle.rhythmEmpty')
      : t('hub.cycle.rhythmSummary', {
          total: format.count(total),
          peak: format.count(peak.count),
          date: formatMonthDay(peak.day, format.locale),
        });

  return (
    <figure className="min-w-0">
      <figcaption className="type-body-sm text-muted-foreground">
        <span className="block type-label text-subtle">{rhythmLabel}</span>
        <span className="mt-1 block">{summary}</span>
      </figcaption>
      <SparkBars
        values={series.map((point) => point.count)}
        label={rhythmLabel}
        color={SERIES_COLOR.gestures}
        height={64}
        partialLast
        className="mt-4"
      />
      <div
        aria-hidden
        className="mt-1.5 flex justify-between gap-4 type-caption text-subtle tabular-nums"
      >
        <span>{formatMonthDay(series[0]!.day, format.locale)}</span>
        <span>{t('hub.cycle.todaySoFar')}</span>
      </div>
    </figure>
  );
}

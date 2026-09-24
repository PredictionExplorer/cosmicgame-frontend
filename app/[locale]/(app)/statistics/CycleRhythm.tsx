'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useBidFrequency } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { Skeleton } from '@/components/ui/skeleton';
import { SparkBars } from '@/components/statistics/charts/SparkBars';
import { SERIES_COLOR } from '@/components/statistics/charts/theme';
import { formatMonthDay } from '@/components/statistics/charts/labels';

const DAY = 86_400;
/** Days in the strip. */
export const RHYTHM_DAYS = 30;

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
 * The hub's pulse: gestures per day over the last 30 days as a spark strip,
 * read in one sentence beside it (the total and the busiest day), with the
 * range under the strip. Plain SVG, no chart library on the hub.
 */
export function CycleRhythm() {
  const t = useTranslations('statistics');
  const format = useFormat();
  // Whole days: the query key changes once a day, not on every render.
  const today = Math.floor(useNow(60_000) / 1000 / DAY) * DAY;
  const from = today - (RHYTHM_DAYS - 1) * DAY;
  const { data, isLoading, isError } = useBidFrequency(from, today + DAY, DAY);

  const series = useMemo(() => dailySeries(data ?? [], today), [data, today]);
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

  const rhythmLabel = t('hub.cycle.rhythmLabel', { days: RHYTHM_DAYS });
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
        label={`${rhythmLabel}: ${summary}`}
        color={SERIES_COLOR.gestures}
        height={64}
        className="mt-4"
      />
      <div
        aria-hidden
        className="mt-1.5 flex justify-between type-caption text-subtle tabular-nums"
      >
        <span>{formatMonthDay(series[0]!.day, format.locale)}</span>
        <span>{formatMonthDay(series[series.length - 1]!.day, format.locale)}</span>
      </div>
    </figure>
  );
}

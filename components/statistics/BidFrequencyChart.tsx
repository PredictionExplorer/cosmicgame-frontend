'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatUnixTsLabel } from '@/utils/format';
import { useBidFrequency, useBidTimeBounds } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import type { BidFrequencyBucket } from '@/services/api/types';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';

import { ChartFigure } from './charts/ChartFigure';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { formatDateRange } from './charts/labels';
import { useCountAxis, useTimeAxis } from './charts/axes';
import {
  CHART_MARGIN,
  GRID_PROPS,
  SERIES_COLOR,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';
import { SegmentedControl } from './SegmentedControl';

const CHART_HEIGHT = 300;
const DAY_SECS = 86_400;
const HOUR_SECS = 3_600;
/** How far back each interval looks: a year of days, a week of hours. */
const LOOKBACK: Record<IntervalOption, number> = { day: 365 * DAY_SECS, hour: 7 * DAY_SECS };

type IntervalOption = 'day' | 'hour';

type ChartPoint = {
  bucketTs: number;
  numBids: number;
  uniqueBidders: number;
};

function toChartPoints(records: readonly BidFrequencyBucket[]): ChartPoint[] {
  return records.map((r) => ({
    bucketTs: r.BucketTs,
    numBids: r.NumBids ?? 0,
    uniqueBidders: r.UniqueBidders ?? 0,
  }));
}

function FrequencyTooltip({
  active,
  payload,
  withTime,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
  withTime: boolean;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <ChartTooltipCard
      title={formatUnixTsLabel(point.bucketTs, withTime, locale)}
      rows={[
        {
          key: 'gestures',
          label: t('charts.frequency.gestures'),
          value: format.count(point.numBids),
          color: SERIES_COLOR.gestures,
        },
        {
          key: 'participants',
          label: t('charts.frequency.uniqueParticipants'),
          value: format.count(point.uniqueBidders),
        },
      ]}
    />
  );
}

type BidFrequencyChartProps = {
  enabled?: boolean;
  /** Names the figure (the section's title). */
  label: string;
};

/**
 * Gestures over time, per day for the last year or per hour for the last
 * week, as bars on one theme: round count ticks, calendar date ticks, a
 * one-line reading as the caption, and the same buckets as a table.
 */
export const BidFrequencyChart: FC<BidFrequencyChartProps> = ({ enabled = true, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const [interval, setInterval] = useState<IntervalOption>('day');
  const { data: bounds } = useBidTimeBounds(enabled);
  const nowSec = Math.floor(useNow(60_000) / 1000);
  const intervalSecs = interval === 'hour' ? HOUR_SECS : DAY_SECS;

  const { initTs, finTs } = useMemo(() => {
    const maxTs = bounds?.MaxTs && bounds.MaxTs > 0 ? bounds.MaxTs : nowSec;
    const minTs = bounds?.MinTs && bounds.MinTs > 0 ? bounds.MinTs : maxTs - LOOKBACK[interval];
    const start = Math.max(minTs, maxTs - LOOKBACK[interval]);
    return {
      initTs: Math.floor(start / intervalSecs) * intervalSecs,
      finTs: maxTs + intervalSecs,
    };
  }, [bounds, interval, intervalSecs, nowSec]);

  const { data, isLoading, isError, refetch } = useBidFrequency(
    initTs,
    finTs,
    intervalSecs,
    enabled,
  );

  const points = useMemo(() => toChartPoints(data ?? []), [data]);
  const firstTs = points[0]?.bucketTs ?? initTs;
  const lastTs = points[points.length - 1]?.bucketTs ?? finTs;
  const withTime = interval === 'hour';
  const total = points.reduce((sum, point) => sum + point.numBids, 0);
  const peak = points.reduce<ChartPoint | null>(
    (best, point) => (point.numBids > 0 && (!best || point.numBids > best.numBids) ? point : best),
    null,
  );
  const xAxis = useTimeAxis(firstTs - intervalSecs / 2, lastTs + intervalSecs / 2);
  const yAxis = useCountAxis(peak?.numBids ?? 0);

  const columns = useMemo<DataTableColumn<ChartPoint>[]>(
    () => [
      {
        id: 'period',
        kind: 'text',
        header: interval === 'hour' ? t('charts.frequency.hour') : t('charts.frequency.day'),
        value: (row) => row.bucketTs,
        cell: (row) => formatUnixTsLabel(row.bucketTs, withTime, locale),
        sortable: true,
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('charts.frequency.gestures'),
        value: (row) => row.numBids,
        sortable: true,
      },
      {
        id: 'participants',
        kind: 'count',
        header: t('charts.frequency.uniqueParticipants'),
        value: (row) => row.uniqueBidders,
        sortable: true,
      },
    ],
    [interval, locale, t, withTime],
  );

  const controls = (
    <SegmentedControl
      label={t('charts.frequency.bucket')}
      value={interval}
      onValueChange={setInterval}
      options={[
        { value: 'day', label: t('charts.frequency.daily') },
        { value: 'hour', label: t('charts.frequency.hourly') },
      ]}
    />
  );

  const state = isLoading ? (
    <SkeletonChart height={CHART_HEIGHT} bars={24} />
  ) : isError ? (
    <ErrorState
      headingLevel={3}
      title={t('charts.frequency.loadErrorTitle')}
      message={t('charts.frequency.loadErrorMessage')}
      onRetry={() => refetch()}
    />
  ) : peak === null ? (
    // Every bucket at zero draws empty axes: say so instead.
    <EmptyState headingLevel={3} variant="inline" title={t('charts.frequency.empty')} />
  ) : null;

  return (
    <ChartFigure
      label={label}
      summary={
        peak
          ? t(withTime ? 'charts.frequency.summaryHourly' : 'charts.frequency.summaryDaily', {
              total: format.count(total),
              range: formatDateRange(firstTs, lastTs, locale),
              peak: format.count(peak.numBids),
              date: formatUnixTsLabel(peak.bucketTs, withTime, locale),
            })
          : undefined
      }
      controls={controls}
      state={state}
      note={t('charts.frequency.openingExcluded')}
      table={
        <DataTable
          data={points}
          columns={columns}
          ariaLabel={label}
          initialSort={{ id: 'period', direction: 'desc' }}
        />
      }
    >
      <div data-testid="bid-frequency-chart">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={points} margin={CHART_MARGIN} barCategoryGap="12%">
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              {...X_AXIS_PROPS}
              dataKey="bucketTs"
              type="number"
              domain={xAxis.domain}
              ticks={xAxis.ticks}
              tickFormatter={xAxis.format}
            />
            <YAxis
              {...Y_AXIS_PROPS}
              domain={yAxis.domain}
              ticks={yAxis.ticks}
              tickFormatter={yAxis.format}
              width={44}
              allowDecimals={false}
            />
            <Tooltip {...TOOLTIP_PROPS} content={<FrequencyTooltip withTime={withTime} />} />
            <Bar
              dataKey="numBids"
              fill={SERIES_COLOR.gestures}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
};
// lexicon-allow-end

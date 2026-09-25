'use client';

import { useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatUnixTsLabel } from '@/utils/format';
// lexicon-allow-start: the hook and wire type mirror the backend route statistics/bidding/frequency
import { useBidFrequency as useFrequencyQuery, useDashboardInfo } from '@/hooks/useApiQuery';
import type { BidFrequencyBucket as FrequencyBucket } from '@/services/api/types';
// lexicon-allow-end
import { useFormat } from '@/hooks/useFormat';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

import { ChartFigure } from './charts/ChartFigure';
import { ChartPlot } from './charts/ChartPlot';
import type { ReadoutItem } from './charts/ChartReadout';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { formatDateRange } from './charts/labels';
import { useCountAxis, useTimeAxis } from './charts/axes';
import {
  CHART_MARGIN,
  GRID_PROPS,
  MAX_BAR_SIZE,
  SERIES_COLOR,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';
import { useGestureTimeBounds } from './charts/useGestureTimeBounds';

const CHART_HEIGHT = 300;
const DAY_SECS = 86_400;
const HOUR_SECS = 3_600;
/** How far back each interval looks: a year of days, a week of hours. */
const LOOKBACK: Record<IntervalOption, number> = { day: 365 * DAY_SECS, hour: 7 * DAY_SECS };

type IntervalOption = 'day' | 'hour';

type ChartPoint = {
  bucketTs: number;
  gestures: number;
  participants: number;
};

function toChartPoints(records: readonly FrequencyBucket[]): ChartPoint[] {
  return records.map((r) => ({
    bucketTs: r.BucketTs,
    gestures: r.NumBids ?? 0,
    participants: r.UniqueBidders ?? 0,
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
          value: format.count(point.gestures),
          color: SERIES_COLOR.gestures,
        },
        {
          key: 'participants',
          label: t('charts.frequency.uniqueParticipants'),
          value: format.count(point.participants),
        },
      ]}
    />
  );
}

type GestureFrequencyChartProps = {
  enabled?: boolean;
  /** Names the figure (the section's title). */
  label: string;
};

/**
 * Gestures over time, per day for the last year or per hour for the last
 * week, as bars on one theme: round count ticks, calendar date ticks, the
 * total and the busiest day read out above, and the same buckets as a table.
 * Each cycle's first hour is left out (the backend's rule), which the note
 * under the plot says; when the daily view reaches the first gesture, the
 * readout adds every gesture ever made, first hours included, so its total
 * and the hub's never read as a contradiction.
 */
export const GestureFrequencyChart: FC<GestureFrequencyChartProps> = ({
  enabled = true,
  label,
}) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const [interval, setInterval] = useState<IntervalOption>('day');
  const bounds = useGestureTimeBounds(enabled);
  const intervalSecs = interval === 'hour' ? HOUR_SECS : DAY_SECS;

  const { initTs, finTs } = useMemo(() => {
    const start = Math.max(bounds.firstTs, bounds.lastTs - LOOKBACK[interval]);
    return {
      initTs: Math.floor(start / intervalSecs) * intervalSecs,
      finTs: bounds.lastTs + intervalSecs,
    };
  }, [bounds.firstTs, bounds.lastTs, interval, intervalSecs]);

  const { data, isLoading, isError, refetch } = useFrequencyQuery(
    initTs,
    finTs,
    intervalSecs,
    enabled && bounds.settled,
  );
  // Every gesture ever made, first hours included, so the chart's total (which leaves them
  // out) reads beside the one the statistics hub shows, instead of contradicting it.
  const dashboard = useDashboardInfo();
  const allGestures = toFiniteNumber(
    (dashboard.data?.MainStats as { TotalBids?: unknown } | undefined)?.TotalBids,
  );
  // Only the daily view reaches back to the first gesture; a week of hours is not comparable.
  const coversAll = interval === 'day' && initTs <= bounds.firstTs;
  const showAll = coversAll && !dashboard.isError;

  const points = useMemo(() => toChartPoints(data ?? []), [data]);
  // The range a reader is told is the one with gestures in it, not the query's padded end.
  const active = points.filter((point) => point.gestures > 0);
  const firstTs = active[0]?.bucketTs ?? points[0]?.bucketTs ?? initTs;
  const lastTs =
    active[active.length - 1]?.bucketTs ?? points[points.length - 1]?.bucketTs ?? finTs;
  const withTime = interval === 'hour';
  const total = points.reduce((sum, point) => sum + point.gestures, 0);
  const peak = points.reduce<ChartPoint | null>(
    (best, point) =>
      point.gestures > 0 && (!best || point.gestures > best.gestures) ? point : best,
    null,
  );
  const xAxis = useTimeAxis(firstTs - intervalSecs / 2, lastTs + intervalSecs / 2);
  const yAxis = useCountAxis(peak?.gestures ?? 0);

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
        value: (row) => row.gestures,
        sortable: true,
      },
      {
        id: 'participants',
        kind: 'count',
        header: t('charts.frequency.uniqueParticipants'),
        value: (row) => row.participants,
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

  // The bounds come first: until they settle, the chart has not asked for anything yet.
  const loading = !bounds.settled || isLoading;
  const peakLabel = t(withTime ? 'charts.frequency.busiestHour' : 'charts.frequency.busiestDay');
  const allItem: ReadoutItem | null = showAll
    ? {
        id: 'all',
        label: t('charts.frequency.allGestures'),
        value: loading || allGestures === null ? null : format.count(allGestures),
        caption: loading || allGestures === null ? null : t('charts.frequency.allGesturesCaption'),
      }
    : null;
  const readout: ReadoutItem[] | undefined = loading
    ? [
        { id: 'total', label: t('charts.frequency.gestures'), value: null, caption: null },
        { id: 'peak', label: peakLabel, value: null, caption: null },
        ...(allItem ? [allItem] : []),
      ]
    : peak
      ? [
          {
            id: 'total',
            label: t('charts.frequency.gestures'),
            value: format.count(total),
            caption: formatDateRange(firstTs, lastTs, locale),
          },
          {
            id: 'peak',
            label: peakLabel,
            value: format.count(peak.gestures),
            caption: formatUnixTsLabel(peak.bucketTs, withTime, locale),
          },
          ...(allItem ? [allItem] : []),
        ]
      : undefined;

  const state = loading ? (
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
      readout={isError ? undefined : readout}
      controls={controls}
      state={state}
      loading={loading}
      note={t('charts.frequency.openingNote')}
      table={
        <DataTable
          data={points}
          columns={columns}
          ariaLabel={label}
          initialSort={{ id: 'period', direction: 'desc' }}
        />
      }
    >
      <div data-testid="gesture-frequency-chart">
        <ChartPlot height={CHART_HEIGHT}>
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
              width={yAxis.width}
              allowDecimals={false}
            />
            <Tooltip {...TOOLTIP_PROPS} content={<FrequencyTooltip withTime={withTime} />} />
            <Bar
              dataKey="gestures"
              fill={SERIES_COLOR.gestures}
              radius={[2, 2, 0, 0]}
              maxBarSize={MAX_BAR_SIZE}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartPlot>
      </div>
    </ChartFigure>
  );
};

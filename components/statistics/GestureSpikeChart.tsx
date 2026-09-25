'use client';

import { useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatUnixTsLabel } from '@/utils/format';
// lexicon-allow-start: the hooks and wire types mirror the backend routes statistics/bidding/*
import {
  useBiddingActivity as useSpikesQuery,
  useBidFrequency as useFrequencyQuery,
} from '@/hooks/useApiQuery';
import type {
  BidFrequencyBucket as FrequencyBucket,
  BidSpike as GestureSpike,
} from '@/services/api/types';
// lexicon-allow-end
import { useFormat } from '@/hooks/useFormat';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

import { ChartFigure } from './charts/ChartFigure';
import { ChartPlot } from './charts/ChartPlot';
import type { ReadoutItem } from './charts/ChartReadout';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { formatMonthDay, formatMonthDayHour } from './charts/labels';
import { useCountAxis, useTimeAxis } from './charts/axes';
import {
  CHART_MARGIN,
  GRID_PROPS,
  SERIES_COLOR,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';
import { useGestureTimeBounds } from './charts/useGestureTimeBounds';

const CHART_HEIGHT = 280;
const HOUR = 3_600;
const VIEW_PADDING_SECS = 12 * HOUR;
const LOOKBACK_SECS = 365 * 86_400;

type ChartPoint = { bucketTs: number; gestures: number };

const alignHour = (ts: number): number => Math.floor(ts / HOUR) * HOUR;

function spikeViewRange(spike: GestureSpike): { initTs: number; finTs: number } {
  return {
    initTs: alignHour(spike.StartTs - VIEW_PADDING_SECS),
    finTs: alignHour(spike.EndTs + VIEW_PADDING_SECS) + HOUR,
  };
}

/**
 * The spike a reader lands on: the recent one when the backend flags one,
 * else the latest by start time (the array order is not guaranteed).
 */
export function defaultSpikeIndex(
  spikes: readonly GestureSpike[],
  recentIndex: number,
): number | null {
  if (spikes.length === 0) return null;
  if (recentIndex >= 0 && recentIndex < spikes.length) return recentIndex;
  let latest = 0;
  spikes.forEach((spike, index) => {
    if (spike.StartTs > spikes[latest]!.StartTs) latest = index;
  });
  return latest;
}

function SpikeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <ChartTooltipCard
      title={formatUnixTsLabel(point.bucketTs, true, locale)}
      rows={[
        {
          key: 'gestures',
          label: t('charts.frequency.gestures'),
          value: format.count(point.gestures),
          color: SERIES_COLOR.gestures,
        },
      ]}
    />
  );
}

type GestureSpikeChartProps = {
  enabled?: boolean;
  /** Names the figure (the section's title). */
  label: string;
};

/**
 * Hours when gestures came much faster than around them. Opens on the
 * recent spike, or the latest one, never on an empty frame; each spike is
 * picked by its date, and the hours around it are drawn with the spike
 * shaded. The spike's busiest hour and its total read out above.
 */
export const GestureSpikeChart: FC<GestureSpikeChartProps> = ({ enabled = true, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const bounds = useGestureTimeBounds(enabled);
  const initTs = Math.max(bounds.firstTs, bounds.lastTs - LOOKBACK_SECS);
  const finTs = bounds.lastTs + HOUR;

  const { data, isLoading, isError, refetch } = useSpikesQuery(
    initTs,
    finTs,
    HOUR,
    enabled && bounds.settled,
  );

  const spikes = useMemo(() => data?.Spikes ?? [], [data?.Spikes]);
  const recentIndex = data?.RecentSpikeIndex ?? -1;
  const [picked, setPicked] = useState<number | null>(null);
  const selectedIndex =
    picked !== null && picked < spikes.length ? picked : defaultSpikeIndex(spikes, recentIndex);
  const spike = selectedIndex !== null ? spikes[selectedIndex] : undefined;
  const viewRange = spike ? spikeViewRange(spike) : null;

  const hours = useFrequencyQuery(
    viewRange?.initTs ?? 0,
    viewRange?.finTs ?? 0,
    HOUR,
    enabled && viewRange !== null,
  );
  const points = useMemo<ChartPoint[]>(
    () =>
      (hours.data ?? []).map((r: FrequencyBucket) => ({
        bucketTs: r.BucketTs,
        gestures: r.NumBids ?? 0,
      })),
    [hours.data],
  );

  const peakInWindow = points.reduce((max, point) => Math.max(max, point.gestures), 0);
  const xAxis = useTimeAxis(
    (viewRange?.initTs ?? 0) - HOUR / 2,
    (viewRange?.finTs ?? HOUR) - HOUR / 2,
  );
  const yAxis = useCountAxis(peakInWindow);

  const columns = useMemo<DataTableColumn<ChartPoint>[]>(
    () => [
      {
        id: 'hour',
        kind: 'text',
        header: t('charts.frequency.hour'),
        value: (row) => row.bucketTs,
        cell: (row) => formatUnixTsLabel(row.bucketTs, true, locale),
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('charts.frequency.gestures'),
        value: (row) => row.gestures,
      },
    ],
    [locale, t],
  );

  // A chip names its spike by day; when two spikes share a day, every chip
  // shows its hour, so the row reads in one format.
  const days = spikes.map((item) => formatMonthDay(item.PeakTs, locale));
  const withHour = new Set(days).size < days.length;
  const options = spikes.map((item, index) => ({
    value: String(index),
    label: withHour ? formatMonthDayHour(item.PeakTs, locale) : days[index]!,
    ariaLabel: t('charts.spikes.optionAria', {
      date: formatUnixTsLabel(item.PeakTs, true, locale),
      peak: format.count(item.PeakNumBids),
    }),
  }));

  const loading = !bounds.settled || isLoading || (spike !== undefined && hours.isLoading);
  const readout: ReadoutItem[] | undefined = loading
    ? [
        { id: 'peak', label: t('charts.frequency.busiestHour'), value: null, caption: null },
        { id: 'total', label: t('charts.spikes.inSpike'), value: null },
      ]
    : spike
      ? [
          {
            id: 'peak',
            label: t('charts.frequency.busiestHour'),
            value: format.count(spike.PeakNumBids),
            caption: formatUnixTsLabel(spike.PeakTs, true, locale),
          },
          {
            id: 'total',
            label: t('charts.spikes.inSpike'),
            value: format.count(spike.TotalBids),
          },
        ]
      : undefined;

  const state = loading ? (
    <SkeletonChart height={CHART_HEIGHT} bars={24} />
  ) : isError || hours.isError ? (
    <ErrorState
      headingLevel={3}
      title={t('charts.spikes.loadErrorTitle')}
      message={t('charts.spikes.loadErrorMessage')}
      onRetry={() => {
        void refetch();
        void hours.refetch();
      }}
    />
  ) : !spike ? (
    <EmptyState headingLevel={3} variant="inline" title={t('charts.spikes.empty')} />
  ) : points.length === 0 ? (
    <EmptyState headingLevel={3} variant="inline" title={t('charts.spikes.emptyWindow')} />
  ) : null;

  return (
    <ChartFigure
      label={label}
      readout={isError || hours.isError ? undefined : readout}
      controls={
        spikes.length > 0 ? (
          <SegmentedControl
            scroll
            label={t('charts.spikes.count', { count: format.count(spikes.length) })}
            value={String(selectedIndex ?? 0)}
            onValueChange={(value) => setPicked(Number(value))}
            options={options}
          />
        ) : null
      }
      state={state}
      loading={loading}
      note={recentIndex < 0 && spikes.length > 0 ? t('charts.spikes.noneRecent') : undefined}
      table={<DataTable data={points} columns={columns} ariaLabel={label} />}
    >
      <div data-testid="gesture-spike-chart">
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
            <Tooltip {...TOOLTIP_PROPS} content={<SpikeTooltip />} />
            {spike ? (
              <ReferenceArea
                x1={alignHour(spike.StartTs) - HOUR / 2}
                x2={alignHour(spike.EndTs) + HOUR / 2}
                fill="hsl(var(--foreground) / 0.08)"
                strokeOpacity={0}
              />
            ) : null}
            <Bar
              dataKey="gestures"
              fill={SERIES_COLOR.gestures}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartPlot>
      </div>
    </ChartFigure>
  );
};

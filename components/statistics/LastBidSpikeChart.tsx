'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { useMemo, useState, type FC } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatUnixTsLabel } from '@/utils/format';
import { useBiddingActivity, useBidFrequency, useBidTimeBounds } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import type { BidFrequencyBucket, BidSpike } from '@/services/api/types';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';

import { ChartFigure } from './charts/ChartFigure';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { formatMonthDay } from './charts/labels';
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

const CHART_HEIGHT = 280;
const HOUR = 3_600;
const VIEW_PADDING_SECS = 12 * HOUR;
const DEFAULT_LOOKBACK_SECS = 365 * 86_400;

type ChartPoint = { bucketTs: number; numBids: number };

const alignHour = (ts: number): number => Math.floor(ts / HOUR) * HOUR;

function spikeViewRange(spike: BidSpike): { initTs: number; finTs: number } {
  return {
    initTs: alignHour(spike.StartTs - VIEW_PADDING_SECS),
    finTs: alignHour(spike.EndTs + VIEW_PADDING_SECS) + HOUR,
  };
}

/**
 * The spike a reader lands on: the recent one when the backend flags one,
 * else the latest by start time (the array order is not guaranteed).
 */
export function defaultSpikeIndex(spikes: readonly BidSpike[], recentIndex: number): number | null {
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
          value: format.count(point.numBids),
          color: SERIES_COLOR.gestures,
        },
      ]}
    />
  );
}

type LastBidSpikeChartProps = {
  enabled?: boolean;
  /** Names the figure (the section's title). */
  label: string;
};

/**
 * Hours when gestures came much faster than around them. Opens on the
 * recent spike, or the latest one, never on an empty frame; each spike is
 * picked by its date, and the hours around it are drawn with the spike
 * shaded.
 */
export const LastBidSpikeChart: FC<LastBidSpikeChartProps> = ({ enabled = true, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const { data: bounds } = useBidTimeBounds(enabled);
  const nowSec = Math.floor(useNow(60_000) / 1000);

  const { initTs, finTs } = useMemo(() => {
    const maxTs = bounds?.MaxTs && bounds.MaxTs > 0 ? bounds.MaxTs : nowSec;
    const minTs = bounds?.MinTs && bounds.MinTs > 0 ? bounds.MinTs : maxTs - DEFAULT_LOOKBACK_SECS;
    return { initTs: Math.max(minTs, maxTs - DEFAULT_LOOKBACK_SECS), finTs: maxTs + HOUR };
  }, [bounds, nowSec]);

  const { data, isLoading, isError, refetch } = useBiddingActivity(
    initTs,
    finTs,
    HOUR,
    enabled && initTs > 0,
  );

  const spikes = useMemo(() => data?.Spikes ?? [], [data?.Spikes]);
  const recentIndex = data?.RecentSpikeIndex ?? -1;
  const [picked, setPicked] = useState<number | null>(null);
  const selectedIndex =
    picked !== null && picked < spikes.length ? picked : defaultSpikeIndex(spikes, recentIndex);
  const spike = selectedIndex !== null ? spikes[selectedIndex] : undefined;
  const viewRange = spike ? spikeViewRange(spike) : null;

  const hours = useBidFrequency(
    viewRange?.initTs ?? 0,
    viewRange?.finTs ?? 0,
    HOUR,
    enabled && viewRange !== null,
  );
  const points = useMemo<ChartPoint[]>(
    () =>
      (hours.data ?? []).map((r: BidFrequencyBucket) => ({
        bucketTs: r.BucketTs,
        numBids: r.NumBids ?? 0,
      })),
    [hours.data],
  );

  const peakInWindow = points.reduce((max, point) => Math.max(max, point.numBids), 0);
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
        value: (row) => row.numBids,
      },
    ],
    [locale, t],
  );

  // A chip names its spike by day; two spikes on one day also show the hour.
  const days = spikes.map((item) => formatMonthDay(item.PeakTs, locale));
  const options = spikes.map((item, index) => ({
    value: String(index),
    label:
      days.indexOf(days[index]!) === days.lastIndexOf(days[index]!)
        ? days[index]!
        : `${days[index]!} ${String(new Date(item.PeakTs * 1000).getUTCHours()).padStart(2, '0')}:00`,
    ariaLabel: t('charts.spikes.optionAria', {
      date: formatUnixTsLabel(item.PeakTs, true, locale),
      peak: format.count(item.PeakNumBids),
    }),
  }));

  const state =
    isLoading || (spike !== undefined && hours.isLoading) ? (
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
      summary={
        spike
          ? t('charts.spikes.summary', {
              date: formatUnixTsLabel(spike.PeakTs, true, locale),
              peak: format.count(spike.PeakNumBids),
              total: format.count(spike.TotalBids),
            })
          : undefined
      }
      controls={
        spikes.length > 0 ? (
          <SegmentedControl
            label={t('charts.spikes.count', { count: format.count(spikes.length) })}
            value={String(selectedIndex ?? 0)}
            onValueChange={(value) => setPicked(Number(value))}
            options={options}
          />
        ) : null
      }
      state={state}
      note={recentIndex < 0 && spikes.length > 0 ? t('charts.spikes.noneRecent') : undefined}
      table={<DataTable data={points} columns={columns} ariaLabel={label} />}
    >
      <div data-testid="last-bid-spike-chart">
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
              width={40}
              allowDecimals={false}
            />
            <Tooltip {...TOOLTIP_PROPS} content={<SpikeTooltip />} />
            {spike ? (
              <ReferenceArea
                x1={alignHour(spike.StartTs) - HOUR / 2}
                x2={alignHour(spike.EndTs) + HOUR / 2}
                fill="hsl(var(--data-1) / 0.12)"
                strokeOpacity={0}
              />
            ) : null}
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

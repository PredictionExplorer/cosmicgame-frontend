'use client';

import { memo, useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatUnixTsLabel } from '@/utils/format';
import { useGestureListByCycle, useRoundInfo, useCurrentTime } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { GESTURE_METHOD_COLOR } from '@/lib/theme/dataColors';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

import { ChartFigure } from './charts/ChartFigure';
import { ChartLegend } from './charts/ChartLegend';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { useCountAxis, useTimeAxis } from './charts/axes';
import {
  GESTURE_METHODS,
  bucketGestureMix,
  defaultMixInterval,
  mixIntervalsFor,
  mixTotals,
  type GestureMethodKey,
  type MixBucket,
  type MixInterval,
} from './charts/gestureMix';
import {
  CHART_MARGIN,
  GRID_PROPS,
  MAX_BAR_SIZE,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';

const CHART_HEIGHT = 300;

const INTERVAL_KEY: Readonly<Record<MixInterval, string>> = {
  3_600: 'oneHour',
  21_600: 'sixHours',
  43_200: 'twelveHours',
  86_400: 'oneDay',
};

const METHOD_KEY: Readonly<Record<GestureMethodKey, string>> = {
  eth: 'charts.mix.eth',
  ethRandomWalk: 'charts.mix.ethRandomWalk',
  cst: 'charts.mix.cst',
};

function MixTooltip({
  active,
  payload,
  withTime,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: MixBucket }>;
  withTime: boolean;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const bucket = active ? payload?.[0]?.payload : undefined;
  if (!bucket) return null;
  return (
    <ChartTooltipCard
      title={formatUnixTsLabel(bucket.start, withTime, locale)}
      rows={GESTURE_METHODS.map((method) => ({
        key: method,
        label: t(METHOD_KEY[method]),
        value: format.count(bucket[method]),
        color: GESTURE_METHOD_COLOR[method],
      }))}
      footer={t('charts.mix.total', { count: bucket.total })}
    />
  );
}

const MixBars = memo(function MixBars({
  buckets,
  interval,
}: {
  buckets: MixBucket[];
  interval: number;
}) {
  const first = buckets[0]?.start ?? 0;
  const last = buckets[buckets.length - 1]?.start ?? interval;
  const xAxis = useTimeAxis(first - interval / 2, last + interval / 2);
  const yAxis = useCountAxis(buckets.reduce((max, b) => Math.max(max, b.total), 0));
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={buckets} margin={CHART_MARGIN} barCategoryGap="10%">
        <CartesianGrid {...GRID_PROPS} />
        <XAxis
          {...X_AXIS_PROPS}
          dataKey="start"
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
        <Tooltip {...TOOLTIP_PROPS} content={<MixTooltip withTime={interval < 86_400} />} />
        {GESTURE_METHODS.map((method, index) => (
          <Bar
            key={method}
            dataKey={method}
            stackId="mix"
            fill={GESTURE_METHOD_COLOR[method]}
            radius={index === GESTURE_METHODS.length - 1 ? [2, 2, 0, 0] : 0}
            maxBarSize={MAX_BAR_SIZE}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
});

type GestureTypeMixChartProps = {
  round: number;
  /** True for the live cycle, which stays open at "now". */
  isLive: boolean;
  /** Names the figure. */
  label: string;
};

/**
 * How the gestures of one cycle split between methods over time: stacked
 * counts per window (ETH, ETH with a Random Walk NFT, CST), so each bar shows
 * how busy the window was and what it was made of. Counted from the cycle's
 * gesture list, the same one the other cycle charts read.
 */
export const GestureTypeMixChart: FC<GestureTypeMixChartProps> = ({ round, isLive, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');
  const { data: roundInfo } = useRoundInfo(hasRound && !isLive ? round : -1);
  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const nowSec = serverNow && serverNow > 0 ? serverNow : clientNow;

  const list = useMemo(() => gestures ?? [], [gestures]);
  const fromTs = list.reduce(
    (min, g) => (typeof g.TimeStamp === 'number' && g.TimeStamp < min ? g.TimeStamp : min),
    Number.POSITIVE_INFINITY,
  );
  const lastTs = list.reduce(
    (max, g) => (typeof g.TimeStamp === 'number' && g.TimeStamp > max ? g.TimeStamp : max),
    0,
  );
  const toTs = isLive
    ? Math.floor(nowSec / 3_600) * 3_600
    : roundInfo?.TimeStamp && roundInfo.TimeStamp > lastTs
      ? roundInfo.TimeStamp
      : lastTs;
  const span = Number.isFinite(fromTs) ? Math.max(3_600, toTs - fromTs) : 0;
  const intervals = mixIntervalsFor(span);
  const [chosen, setChosen] = useState<MixInterval | null>(null);
  const interval = chosen && intervals.includes(chosen) ? chosen : defaultMixInterval(span);

  const buckets = useMemo(
    () => (Number.isFinite(fromTs) ? bucketGestureMix(list, fromTs, toTs, interval) : []),
    [list, fromTs, toTs, interval],
  );
  const totals = useMemo(() => mixTotals(list), [list]);
  const share = (count: number) =>
    format.percent(totals.total > 0 ? count / totals.total : 0, { scale: 'ratio' });

  const columns = useMemo<DataTableColumn<MixBucket>[]>(
    () => [
      {
        id: 'start',
        kind: 'text',
        header: t('charts.mix.window'),
        value: (row) => row.start,
        cell: (row) => formatUnixTsLabel(row.start, interval < 86_400, locale),
        sortable: true,
      },
      ...GESTURE_METHODS.map(
        (method): DataTableColumn<MixBucket> => ({
          id: method,
          kind: 'count',
          header: t(METHOD_KEY[method]),
          value: (row) => row[method],
          sortable: true,
        }),
      ),
      {
        id: 'total',
        kind: 'count',
        header: t('charts.typeRatio.totalGestures'),
        value: (row) => row.total,
        sortable: true,
      },
    ],
    [interval, locale, t],
  );

  const state = !hasRound ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.typeRatio.notStarted')} />
  ) : isLoading ? (
    <SkeletonChart height={CHART_HEIGHT} bars={20} />
  ) : isError ? (
    <ErrorState
      headingLevel={4}
      title={t('charts.typeRatio.loadErrorTitle')}
      message={t('charts.typeRatio.loadErrorMessage')}
      onRetry={() => refetch()}
    />
  ) : totals.total === 0 ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.typeRatio.empty')} />
  ) : null;

  return (
    <ChartFigure
      label={label}
      summary={
        totals.total > 0
          ? t('charts.mix.summary', {
              total: format.count(totals.total),
              cst: format.count(totals.cst),
              cstShare: share(totals.cst),
              eth: format.count(totals.eth),
              ethShare: share(totals.eth),
              rwlk: format.count(totals.ethRandomWalk),
              rwlkShare: share(totals.ethRandomWalk),
            })
          : undefined
      }
      controls={
        intervals.length > 1 ? (
          <SegmentedControl
            label={t('charts.typeRatio.sampleEvery')}
            value={String(interval)}
            onValueChange={(value) => setChosen(Number(value) as MixInterval)}
            options={intervals.map((value) => ({
              value: String(value),
              label: t(`charts.typeRatio.intervals.${INTERVAL_KEY[value]}`),
              ariaLabel: t('charts.mix.intervalAria', { hours: value / 3_600 }),
            }))}
          />
        ) : null
      }
      legend={
        <ChartLegend
          items={GESTURE_METHODS.map((method) => ({
            key: method,
            label: t(METHOD_KEY[method]),
            color: GESTURE_METHOD_COLOR[method],
          }))}
        />
      }
      state={state}
      table={
        <DataTable
          data={buckets.filter((bucket) => bucket.total > 0)}
          columns={columns}
          ariaLabel={label}
        />
      }
    >
      <div data-testid="gesture-type-mix-chart">
        <MixBars buckets={buckets} interval={interval} />
      </div>
    </ChartFigure>
  );
};

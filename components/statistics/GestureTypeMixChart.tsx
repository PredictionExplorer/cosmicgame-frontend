'use client';

import { memo, useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatUnixTsLabel } from '@/utils/format';
import { useGestureListByCycle } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { GESTURE_METHOD_COLOR } from '@/lib/theme/dataColors';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

import { ChartFigure } from './charts/ChartFigure';
import { ChartPlot } from './charts/ChartPlot';
import type { ReadoutItem } from './charts/ChartReadout';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { useCountAxis, useTimeAxis } from './charts/axes';
import {
  GESTURE_METHODS,
  bucketGestureMix,
  defaultMixInterval,
  mixAxisCap,
  mixIntervalsFor,
  mixTotals,
  plotMixBuckets,
  type GestureMethodKey,
  type MixBucket,
  type MixInterval,
  type MixPlotBucket,
} from './charts/gestureMix';
import {
  CHART_MARGIN,
  GRID_PROPS,
  MAX_BAR_SIZE,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';
import { useCycleClock } from './charts/useCycleClock';

const CHART_HEIGHT = 300;
/** Room above a clipped bar for its true count. */
const CLIPPED_LABEL_ROOM = 20;

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

/** What Recharts hands a bar's label renderer. */
interface BarLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
}

/** The method whose segment tops a window's stack: the last one with a count. */
function topMethod(bucket: MixPlotBucket): GestureMethodKey | null {
  for (let i = GESTURE_METHODS.length - 1; i >= 0; i -= 1) {
    const method = GESTURE_METHODS[i]!;
    if (bucket.plotted[method] > 0) return method;
  }
  return null;
}

/**
 * The top of a clipped window, drawn by the segment that tops its stack: a
 * break across the bar in the page's ground, so the bar reads as cut, and the
 * window's true count above it.
 */
function clippedLabel(
  buckets: readonly MixPlotBucket[],
  method: GestureMethodKey,
  count: (value: number) => string,
) {
  return function ClippedLabel({ x, y, width, index }: BarLabelProps) {
    const bucket = index === undefined ? undefined : buckets[index];
    if (!bucket?.clipped || topMethod(bucket) !== method) return null;
    const left = Number(x);
    const top = Number(y);
    const barWidth = Number(width);
    if (![left, top, barWidth].every(Number.isFinite)) return null;
    const cut = (offset: number) =>
      `M${left - 1},${top + offset + 3} L${left + barWidth + 1},${top + offset - 1}`;
    return (
      <g aria-hidden>
        <path d={cut(6)} stroke="hsl(var(--background))" strokeWidth={2} />
        <path d={cut(10)} stroke="hsl(var(--background))" strokeWidth={2} />
        <text
          x={left + barWidth / 2}
          y={top - 6}
          textAnchor="middle"
          fontSize={12}
          fill="hsl(var(--foreground))"
          className="tabular-nums"
        >
          {count(bucket.total)}
        </text>
      </g>
    );
  };
}

const MixBars = memo(function MixBars({
  buckets,
  interval,
}: {
  buckets: MixBucket[];
  interval: number;
}) {
  const format = useFormat();
  const first = buckets[0]?.start ?? 0;
  const last = buckets[buckets.length - 1]?.start ?? interval;
  const xAxis = useTimeAxis(first - interval / 2, last + interval / 2);
  const cap = useMemo(() => mixAxisCap(buckets), [buckets]);
  const tallest = buckets.reduce((max, b) => Math.max(max, b.total), 0);
  const yAxis = useCountAxis(cap ?? tallest);
  const limit = cap === null ? 0 : yAxis.domain[1];
  const plotted = useMemo(() => plotMixBuckets(buckets, limit), [buckets, limit]);
  const renderClipped = useMemo(
    () =>
      Object.fromEntries(
        GESTURE_METHODS.map((method) => [
          method,
          clippedLabel(plotted, method, (value) => format.count(value)),
        ]),
      ) as Record<GestureMethodKey, ReturnType<typeof clippedLabel>>,
    [format, plotted],
  );
  const lastMethod = GESTURE_METHODS[GESTURE_METHODS.length - 1];
  return (
    <ChartPlot height={CHART_HEIGHT}>
      <BarChart
        data={plotted}
        margin={{ ...CHART_MARGIN, top: cap === null ? CHART_MARGIN.top : CLIPPED_LABEL_ROOM }}
        barCategoryGap="10%"
      >
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
          allowDataOverflow
        />
        <Tooltip {...TOOLTIP_PROPS} content={<MixTooltip withTime={interval < 86_400} />} />
        {GESTURE_METHODS.map((method) => (
          <Bar
            key={method}
            dataKey={(bucket: MixPlotBucket) => bucket.plotted[method]}
            name={method}
            stackId="mix"
            fill={GESTURE_METHOD_COLOR[method]}
            radius={method === lastMethod ? [2, 2, 0, 0] : 0}
            maxBarSize={MAX_BAR_SIZE}
            isAnimationActive={false}
            label={cap !== null ? renderClipped[method] : undefined}
          />
        ))}
      </BarChart>
    </ChartPlot>
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
 * how busy the window was and what it was made of. The readout above gives
 * the cycle's totals by method, each with its colour, so it is also the key.
 * A window far above the rest (the opening surge) is clipped at the top of
 * the axis with its true count, rather than flattening every other window.
 * Counted from the cycle's gesture list, the one the other cycle charts
 * read, and ended where they end it (`useCycleClock`).
 */
export const GestureTypeMixChart: FC<GestureTypeMixChartProps> = ({ round, isLive, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');
  const clock = useCycleClock(round, isLive);

  const list = useMemo(() => gestures ?? [], [gestures]);
  const fromTs = list.reduce(
    (min, g) => (typeof g.TimeStamp === 'number' && g.TimeStamp < min ? g.TimeStamp : min),
    Number.POSITIVE_INFINITY,
  );
  const lastTs = list.reduce(
    (max, g) => (typeof g.TimeStamp === 'number' && g.TimeStamp > max ? g.TimeStamp : max),
    0,
  );
  // The live cycle runs to now, never short of its latest gesture; a finalized one to its
  // finalization. If that read fails, its last gesture ends it: the counts are the same.
  const toTs = Math.max(lastTs, isLive ? clock.nowTs : clock.endTs);
  const span = Number.isFinite(fromTs) ? Math.max(3_600, toTs - fromTs) : 0;
  const intervals = mixIntervalsFor(span);
  const [chosen, setChosen] = useState<MixInterval | null>(null);
  const interval = chosen && intervals.includes(chosen) ? chosen : defaultMixInterval(span);

  const buckets = useMemo(
    () => (Number.isFinite(fromTs) ? bucketGestureMix(list, fromTs, toTs, interval) : []),
    [list, fromTs, toTs, interval],
  );
  const totals = useMemo(() => mixTotals(list), [list]);

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

  const loading = hasRound && (isLoading || clock.status === 'loading');
  const share = (count: number) =>
    format.percent(totals.total > 0 ? count / totals.total : 0, { scale: 'ratio' });
  const readout: ReadoutItem[] | undefined =
    loading || totals.total > 0
      ? [
          {
            id: 'total',
            label: t('charts.frequency.gestures'),
            value: loading ? null : format.count(totals.total),
          },
          ...GESTURE_METHODS.map((method) => ({
            id: method,
            label: t(METHOD_KEY[method]),
            value: loading ? null : format.count(totals[method]),
            caption: loading ? null : share(totals[method]),
            swatch: { color: GESTURE_METHOD_COLOR[method] },
          })),
        ]
      : undefined;

  const state = !hasRound ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.mix.selectCycle')} />
  ) : loading ? (
    <SkeletonChart height={CHART_HEIGHT} bars={20} />
  ) : isError ? (
    <ErrorState
      headingLevel={4}
      title={t('charts.mix.loadErrorTitle')}
      message={t('charts.mix.loadErrorMessage')}
      onRetry={() => refetch()}
    />
  ) : totals.total === 0 ? (
    <EmptyState headingLevel={4} variant="inline" title={t('charts.mix.empty')} />
  ) : null;

  return (
    <ChartFigure
      label={label}
      readout={isError ? undefined : readout}
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
      state={state}
      loading={loading}
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

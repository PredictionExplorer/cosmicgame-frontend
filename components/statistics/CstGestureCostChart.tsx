'use client';

import { memo, useMemo, type FC } from 'react';
import { Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import {
  formatAddress,
  formatAmount,
  formatDuration,
  formatHoursTick,
  formatSeconds,
  formatUnixTsLabel,
} from '@/utils/format';
import { getExplorerUrl } from '@/utils/urls';
import {
  getCstGestureCostSeries,
  type CstGestureCostPoint,
  type CstGestureCostSeries,
} from '@/utils/cstGestureCost';
import type { GestureInfo } from '@/services/api/types';
import { useGestureListByCycle } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { GESTURE_METHOD_COLOR } from '@/lib/theme/dataColors';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';

import { ChartFigure } from './charts/ChartFigure';
import { ChartPlot } from './charts/ChartPlot';
import { UtcTime } from './charts/UtcTime';
import { ChartLegend } from './charts/ChartLegend';
import type { ReadoutItem } from './charts/ChartReadout';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { useDurationAxis, useElapsedHoursAxis, yAxisWidth } from './charts/axes';
import {
  CHART_MARGIN,
  DENSE_POINTS,
  GRID_PROPS,
  MIN_PLOT_POINTS,
  SERIES_COLOR,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';
import { useCoarsePointer } from './charts/timeline';

/** CST actually paid, in the CST method's colour on every chart. */
const PRICE_COLOR = GESTURE_METHOD_COLOR.cst;
/** The allocation clock is a reference series: quiet ink. */
const CLOCK_COLOR = SERIES_COLOR.reference;

/** The cost panel and the clock panel under it, sharing one time axis. */
const PRICE_HEIGHT = 220;
const CLOCK_HEIGHT = 120;
/** Both panels' plots start at the same x, so a gesture's dot sits over its clock reading. */
const SYNC_ID = 'cst-gesture-cost';

/** Decade (powers of ten) ticks enclosing [min, max] for the log axis. */
export function decadeTicks(min: number, max: number): number[] {
  const lo = Math.floor(Math.log10(Math.max(min, 1e-6)));
  const hi = Math.ceil(Math.log10(Math.max(max, min, 1e-6)));
  const ticks: number[] = [];
  for (let e = lo; e <= hi; e++) ticks.push(10 ** e);
  return ticks;
}

function CostTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CstGestureCostPoint }>;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  // A finger opens the tooltip rather than the transaction: the table links each one.
  const coarse = useCoarsePointer();
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <ChartTooltipCard
      title={t('charts.cstCost.intoCycle', {
        duration: formatHoursTick(point.hoursIntoRound, locale),
      })}
      rows={[
        {
          key: 'when',
          label: t('charts.cstCost.when'),
          value: formatUnixTsLabel(point.ts, true, locale),
        },
        {
          key: 'paid',
          label: t('charts.cstCost.cstPaid'),
          value: formatAmount(point.cstPaid, { unit: 'CST', locale }),
          color: PRICE_COLOR,
          shape: point.isClamped ? 'hollowDot' : 'dot',
        },
        {
          key: 'clock',
          label: t('charts.cstCost.clockBefore'),
          value:
            point.clockRemainingSeconds !== null
              ? formatSeconds(point.clockRemainingSeconds, locale)
              : '—',
          color: CLOCK_COLOR,
          shape: 'square',
        },
        {
          key: 'by',
          label: t('charts.cstCost.gestureBy'),
          value: formatAddress(point.bidder),
        },
      ]}
      footer={point.txHash && !coarse ? t('charts.cstCost.clickHint') : undefined}
    />
  );
}

type DotProps = { cx?: number; cy?: number; index?: number; payload?: CstGestureCostPoint };

/**
 * A dot per CST gesture, at least 4px across; a gesture that paid nothing
 * (clamped onto the log axis) is an open ring, so free gestures read apart
 * from cheap ones. A dense series draws smaller, lighter dots.
 */
function priceDot(dense: boolean) {
  return function PriceDot({ cx, cy, index, payload }: DotProps) {
    if (cx === undefined || cy === undefined || !payload) return <g key={`dot-${index}`} />;
    const free = payload.isClamped;
    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={dense ? 2 : 3}
        fill={free ? 'hsl(var(--background))' : PRICE_COLOR}
        fillOpacity={free ? 1 : dense ? 0.75 : 0.95}
        stroke={PRICE_COLOR}
        strokeOpacity={free ? 1 : 0}
        strokeWidth={free ? 1.5 : 0}
      />
    );
  };
}

function openGestureTx(payload: unknown) {
  const point = payload as CstGestureCostPoint | undefined;
  if (point?.txHash && typeof window !== 'undefined') {
    window.open(getExplorerUrl('tx', point.txHash), '_blank', 'noopener,noreferrer');
  }
}

const CostChartView = memo(function CostChartView({ series }: { series: CstGestureCostSeries }) {
  const locale = useLocale();
  const wide = useMediaQuery('(min-width: 640px)');
  const dense = series.points.length > DENSE_POINTS || !wide;
  const dot = useMemo(() => priceDot(dense), [dense]);
  const priceTicks = useMemo(
    () => decadeTicks(series.minPaid, series.maxPaid),
    [series.minPaid, series.maxPaid],
  );
  const priceTick = (value: number) =>
    formatAmount(value, { unit: 'CST', context: 'hero', withUnit: false, locale });
  const maxClock = series.points.reduce((max, p) => Math.max(max, p.clockRemainingSeconds ?? 0), 0);
  const xAxis = useElapsedHoursAxis(series.points[series.points.length - 1]?.hoursIntoRound ?? 0);
  const clockAxis = useDurationAxis(0, maxClock, 2);
  // One label column for both panels, so their plots start at the same x.
  const labelWidth = Math.max(yAxisWidth(priceTicks.map(priceTick)), clockAxis.width);
  const xAxisProps = {
    ...X_AXIS_PROPS,
    dataKey: 'hoursIntoRound',
    type: 'number' as const,
    domain: xAxis.domain,
    ticks: xAxis.ticks,
    tickFormatter: xAxis.format,
  };

  return (
    <div className="space-y-1">
      <ChartPlot height={PRICE_HEIGHT}>
        <ComposedChart data={series.points} margin={CHART_MARGIN} syncId={SYNC_ID}>
          <CartesianGrid {...GRID_PROPS} />
          {/* The time labels sit under the clock panel; this axis draws only the rule. */}
          <XAxis {...xAxisProps} tick={false} height={1} />
          <YAxis
            {...Y_AXIS_PROPS}
            scale="log"
            domain={[priceTicks[0]!, priceTicks[priceTicks.length - 1]!]}
            ticks={priceTicks}
            tickFormatter={(v) => priceTick(Number(v))}
            width={labelWidth}
            allowDataOverflow
          />
          <Tooltip {...TOOLTIP_PROPS} content={<CostTooltip />} />
          <Line
            type="linear"
            dataKey="cstPlotted"
            stroke={PRICE_COLOR}
            // A dense cloud reads as points; a joining line would fuse it into a band.
            strokeOpacity={dense ? 0 : 0.35}
            strokeWidth={1}
            dot={dot}
            activeDot={{
              r: 5,
              style: { cursor: 'pointer' },
              onClick: (_e: unknown, dotProps: unknown) =>
                openGestureTx((dotProps as { payload?: unknown })?.payload),
            }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartPlot>
      <ChartPlot height={CLOCK_HEIGHT}>
        <ComposedChart data={series.points} margin={{ ...CHART_MARGIN, top: 4 }} syncId={SYNC_ID}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis {...xAxisProps} />
          <YAxis
            {...Y_AXIS_PROPS}
            domain={clockAxis.domain}
            ticks={clockAxis.ticks}
            tickFormatter={clockAxis.format}
            width={labelWidth}
          />
          {/* The panel above carries the tooltip; this one shows the shared cursor only. */}
          <Tooltip {...TOOLTIP_PROPS} content={() => null} />
          <Area
            type="stepAfter"
            dataKey="clockRemainingSeconds"
            stroke={CLOCK_COLOR}
            strokeWidth={1.25}
            fill={CLOCK_COLOR}
            fillOpacity={0.14}
            connectNulls
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartPlot>
    </div>
  );
});

type CostRow = CstGestureCostPoint;

type CstGestureCostViewProps = {
  /** The cycle's full gesture list (any order; ETH gestures inform the clock). */
  gestures: GestureInfo[];
  /** Names the figure. */
  label: string;
};

/**
 * What each CST gesture cost over one cycle, above the allocation clock that
 * was left before it, on one shared time axis: the cost on a log scale (paid
 * amounts span fractions to thousands), free gestures as open rings, and the
 * clock as its own panel instead of a second scale on the same plot.
 * Together they show why prices rise when the clock runs low: the cost has
 * no time to descend between gestures.
 */
export const CstGestureCostView: FC<CstGestureCostViewProps> = ({ gestures, label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const format = useFormat();
  const series = useMemo(() => getCstGestureCostSeries(gestures), [gestures]);

  const columns = useMemo<DataTableColumn<CostRow>[]>(
    () => [
      {
        id: 'ts',
        kind: 'text',
        header: t('charts.cstCost.when'),
        value: (row) => row.ts,
        // UTC, like the chart's axis.
        cell: (row) => <UtcTime timestamp={row.ts} locale={locale} txHash={row.txHash} />,
        sortable: true,
      },
      {
        id: 'paid',
        kind: 'amount',
        unit: 'CST',
        header: t('charts.cstCost.cstPaid'),
        value: (row) => row.cstPaid,
        sortable: true,
      },
      {
        id: 'clock',
        kind: 'duration',
        header: t('charts.cstCost.clockBefore'),
        value: (row) => row.clockRemainingSeconds,
        sortable: true,
      },
      {
        id: 'by',
        kind: 'address',
        header: t('charts.cstCost.gestureBy'),
        value: (row) => row.bidder,
      },
    ],
    [locale, t],
  );

  if (series.points.length === 0) {
    return <EmptyState headingLevel={4} variant="inline" title={t('charts.cstCost.empty')} />;
  }

  const readout: ReadoutItem[] = [
    {
      id: 'count',
      label: t('charts.cstCost.gestures'),
      value: format.count(series.points.length),
    },
    {
      id: 'total',
      label: t('charts.cstCost.consumed'),
      value: formatAmount(series.totalPaid, { unit: 'CST', locale }),
    },
    {
      id: 'max',
      label: t('charts.cstCost.highest'),
      value: formatAmount(series.maxPaid, { unit: 'CST', locale }),
      // A duration in the page's one form ("10d 12h"), not an axis tick ("10.5d").
      caption: t('charts.cstCost.intoCycle', {
        duration: formatDuration(series.maxTs - series.roundStart, { locale, maxUnits: 2 }),
      }),
      swatch: { color: PRICE_COLOR, shape: 'dot' },
    },
  ];

  return (
    <ChartFigure
      label={label}
      readout={readout}
      legend={
        <ChartLegend
          items={[
            { key: 'paid', label: t('charts.cstCost.priceLine'), color: PRICE_COLOR, shape: 'dot' },
            {
              key: 'free',
              label: t('charts.cstCost.freeGesture'),
              color: PRICE_COLOR,
              shape: 'hollowDot',
            },
            {
              key: 'clock',
              label: t('charts.cstCost.clockLine'),
              color: CLOCK_COLOR,
              shape: 'square',
            },
          ]}
        />
      }
      note={t('charts.cstCost.note')}
      preferTable={series.points.length < MIN_PLOT_POINTS}
      table={
        <DataTable
          data={series.points}
          columns={columns}
          ariaLabel={label}
          initialSort={{ id: 'ts', direction: 'desc' }}
        />
      }
    >
      <div data-testid="cst-gesture-cost-chart">
        <CostChartView series={series} />
      </div>
    </ChartFigure>
  );
};

type CstGestureCostChartProps = {
  round: number;
  /** Names the figure. */
  label: string;
};

/** Loads the cycle's gesture list and renders the CST gesture cost chart. */
const CstGestureCostChart: FC<CstGestureCostChartProps> = ({ round, label }) => {
  const t = useTranslations('statistics');
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');

  if (!hasRound) {
    return <EmptyState headingLevel={4} variant="inline" title={t('charts.cstCost.selectCycle')} />;
  }
  if (isLoading) {
    return (
      <ChartFigure
        label={label}
        readout={[
          { id: 'count', label: t('charts.cstCost.gestures'), value: null },
          { id: 'total', label: t('charts.cstCost.consumed'), value: null },
          { id: 'max', label: t('charts.cstCost.highest'), value: null, caption: null },
        ]}
        state={<SkeletonChart height={PRICE_HEIGHT + CLOCK_HEIGHT} bars={18} />}
        loading
      />
    );
  }
  if (isError) {
    return (
      <ErrorState
        headingLevel={4}
        title={t('charts.cstCost.loadErrorTitle')}
        message={t('charts.cstCost.loadErrorMessage')}
        onRetry={() => refetch()}
      />
    );
  }
  return <CstGestureCostView gestures={gestures ?? []} label={label} />;
};

export default CstGestureCostChart;

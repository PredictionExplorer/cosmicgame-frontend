'use client';

import { memo, useMemo, type FC } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import {
  formatCSTValue,
  formatSeconds,
  formatUnixTsLabel,
  getExplorerUrl,
  shortenHex,
} from '@/utils';

import {
  getCstGestureCostSeries,
  type CstGestureCostPoint,
  type CstGestureCostSeries,
} from '@/utils/cstGestureCost';
import type { GestureInfo } from '@/services/api/types';
import { useGestureListByCycle } from '@/hooks/useApiQuery';
import { CyclePickerSection } from '@/components/statistics/CyclePickerSection';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const PRICE_COLOR = '#9C37FD'; // violet — CST actually paid
const CLOCK_COLOR = '#fb7185'; // rose — allocation clock remaining (subdued dashed line)

const CHART_HEIGHT = 360;

/** Compact "hours into round" label, e.g. "45m", "1.5h", "2d". */
function formatHoursTick(hours: number, locale: string = 'en'): string {
  const zh = locale === 'zh';
  if (hours >= 24) {
    const d = hours / 24;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}${zh ? '天' : 'd'}`;
  }
  if (hours >= 1) {
    return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}${zh ? '小时' : 'h'}`;
  }
  return `${Math.round(hours * 60)}${zh ? '分' : 'm'}`;
}

/** Compact duration for the clock axis, e.g. "45m", "1.5h", "2d". */
function formatDurationTick(secs: number, locale: string = 'en'): string {
  const zh = locale === 'zh';
  if (secs <= 0) return '0';
  if (secs >= 86400) {
    const d = secs / 86400;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}${zh ? '天' : 'd'}`;
  }
  if (secs >= 3600) {
    const h = secs / 3600;
    return `${Number.isInteger(h) ? h.toFixed(0) : h.toFixed(1)}${zh ? '小时' : 'h'}`;
  }
  return `${Math.round(secs / 60)}${zh ? '分' : 'm'}`;
}

/** Compact CST amount for the log-axis decade ticks: "0.01", "1", "100", "1k". */
function formatCstTick(value: number): string {
  if (value >= 1000) return `${value / 1000}k`;
  if (value >= 1) return `${value}`;
  return value.toString();
}

/** Decade (powers of ten) bounds and ticks enclosing [min, max] for the log axis. */
function decadeTicks(min: number, max: number): number[] {
  const lo = Math.floor(Math.log10(Math.max(min, 1e-6)));
  const hi = Math.ceil(Math.log10(Math.max(max, min, 1e-6)));
  const ticks: number[] = [];
  for (let e = lo; e <= hi; e++) ticks.push(10 ** e);
  return ticks;
}

function LegendItem({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dashed ? (
        <span
          className="inline-block h-0 w-4"
          style={{ borderTop: `2px dashed ${color}` }}
          aria-hidden
        />
      ) : (
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

type CostTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CstGestureCostPoint }>;
};

function CostTooltip({ active, payload }: CostTooltipProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">
        {t('charts.cstCost.intoCycle', {
          duration: formatHoursTick(point.hoursIntoRound, locale),
        })}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {formatUnixTsLabel(point.ts, true, locale)}
        </span>
      </p>
      <dl className="space-y-1 text-muted-foreground">
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PRICE_COLOR }}
            />
            {t('charts.cstCost.cstPaid')}
          </dt>
          <dd className="text-white">{formatCSTValue(point.cstPaid)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2">
            <span
              className="inline-block h-0 w-3"
              style={{ borderTop: `2px dashed ${CLOCK_COLOR}` }}
            />
            {t('charts.cstCost.clockBefore')}
          </dt>
          <dd className="text-white">
            {point.clockRemainingSeconds !== null
              ? formatSeconds(point.clockRemainingSeconds, locale)
              : '—'}
          </dd>
        </div>
        <div className="mt-1 flex justify-between gap-4 border-t border-white/10 pt-1">
          <dt>{t('charts.cstCost.gestureBy')}</dt>
          <dd className="font-mono text-white">{shortenHex(point.bidder, 4)}</dd>
        </div>
      </dl>
      {point.txHash ? (
        <p className="pt-1 text-xs text-muted-foreground">{t('charts.cstCost.clickHint')}</p>
      ) : null}
    </div>
  );
}

type DotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: CstGestureCostPoint;
};

/** Violet per-gesture marker; clamped (free) gestures render hollow. */
function priceDot(props: DotProps) {
  const { cx, cy, index, payload } = props;
  if (cx === undefined || cy === undefined || !payload) {
    return <g key={`dot-${index}`} />;
  }
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={2.5}
      fill={payload.isClamped ? 'none' : PRICE_COLOR}
      fillOpacity={0.9}
      stroke={PRICE_COLOR}
      strokeWidth={payload.isClamped ? 1.2 : 0}
    />
  );
}

function openGestureTx(payload: unknown) {
  const point = payload as CstGestureCostPoint | undefined;
  if (point?.txHash && typeof window !== 'undefined') {
    window.open(getExplorerUrl('tx', point.txHash), '_blank', 'noopener,noreferrer');
  }
}

/** Price + clock chart, memoized on `series` so it doesn't repaint on poll ticks. */
const CostChartView = memo(function CostChartView({ series }: { series: CstGestureCostSeries }) {
  const t = useTranslations('statistics');
  const locale = useLocale();

  const ticks = useMemo(
    () => decadeTicks(series.minPaid, series.maxPaid),
    [series.minPaid, series.maxPaid],
  );

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart data={series.points} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="hoursIntoRound"
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={(h) => formatHoursTick(Number(h), locale)}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={32}
          label={{
            value: t('charts.cstCost.timeIntoCycle'),
            position: 'insideBottom',
            offset: -4,
            fill: 'rgba(255,255,255,0.45)',
            fontSize: 11,
          }}
        />
        <YAxis
          yAxisId="cst"
          scale="log"
          domain={[ticks[0]!, ticks[ticks.length - 1]!]}
          ticks={ticks}
          tickFormatter={(v) => formatCstTick(Number(v))}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          width={48}
        />
        <YAxis
          yAxisId="clock"
          orientation="right"
          domain={[0, 'auto']}
          tickFormatter={(v) => formatDurationTick(Number(v), locale)}
          tick={{ fill: 'rgba(251,113,133,0.6)', fontSize: 11 }}
          width={48}
        />
        <Tooltip
          content={<CostTooltip />}
          isAnimationActive={false}
          allowEscapeViewBox={{ x: false, y: false }}
          wrapperStyle={{ pointerEvents: 'none', zIndex: 10 }}
        />
        <Line
          yAxisId="clock"
          type="linear"
          dataKey="clockRemainingSeconds"
          name={t('charts.cstCost.clockLine')}
          stroke={CLOCK_COLOR}
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
        <Line
          yAxisId="cst"
          type="linear"
          dataKey="cstPlotted"
          name={t('charts.cstCost.priceLine')}
          stroke={PRICE_COLOR}
          strokeOpacity={0.55}
          strokeWidth={1}
          dot={priceDot}
          activeDot={{
            r: 4,
            style: { cursor: 'pointer' },
            onClick: (_e: unknown, dotProps: unknown) =>
              openGestureTx((dotProps as { payload?: unknown })?.payload),
          }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

type CstGestureCostViewProps = {
  /** The cycle's full gesture list (any order; ETH gestures inform the clock). */
  gestures: GestureInfo[];
};

/**
 * CST gesture cost over one cycle: a dot per CST gesture (log scale — paid
 * amounts span fractions to thousands) with the allocation clock remaining
 * right before each gesture on a secondary axis. Together they show the
 * endgame effect: rapid last-minute gestures leave the auction no time to
 * decay, so paid prices escalate dramatically.
 */
export const CstGestureCostView: FC<CstGestureCostViewProps> = ({ gestures }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();

  const series = useMemo(() => getCstGestureCostSeries(gestures), [gestures]);

  if (series.points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{t('charts.cstCost.empty')}</p>
    );
  }

  return (
    <div className="space-y-3" data-testid="cst-gesture-cost-chart">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span className="text-white">
          {t('charts.cstCost.summaryMax', {
            amount: formatCSTValue(series.maxPaid),
            when: formatHoursTick((series.maxTs - series.roundStart) / 3600, locale),
          })}
        </span>
        <span>
          {t('charts.cstCost.summaryTotal', { amount: formatCSTValue(series.totalPaid) })}
        </span>
        <span>{t('charts.cstCost.summaryCount', { count: series.points.length })}</span>
      </div>

      <CostChartView series={series} />

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <LegendItem color={PRICE_COLOR} label={t('charts.cstCost.priceLine')} />
        <LegendItem color={CLOCK_COLOR} label={t('charts.cstCost.clockLine')} dashed />
      </div>

      <p className="text-xs text-muted-foreground">{t('charts.cstCost.description')}</p>
    </div>
  );
};

type CstGestureCostChartProps = {
  round: number;
};

/** Fetching wrapper: loads the cycle's gesture list and renders the chart. */
const CstGestureCostChart: FC<CstGestureCostChartProps> = ({ round }) => {
  const t = useTranslations('statistics');
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');

  if (!hasRound) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('charts.cstCost.selectCycle')}
      </p>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState
        title={t('charts.cstCost.loadErrorTitle')}
        message={t('charts.cstCost.loadErrorMessage')}
        onRetry={() => refetch()}
      />
    );
  }

  return <CstGestureCostView gestures={gestures ?? []} />;
};

type CstGestureCostSectionProps = {
  /** The current in-progress round number (from dashboard CurRoundNum). */
  currentRoundNum: number;
};

/** Round picker + CST gesture cost chart. */
export const CstGestureCostSection: FC<CstGestureCostSectionProps> = ({ currentRoundNum }) => (
  <CyclePickerSection currentRoundNum={currentRoundNum}>
    {(selectedRound) => <CstGestureCostChart round={selectedRound} />}
  </CyclePickerSection>
);

export default CstGestureCostChart;

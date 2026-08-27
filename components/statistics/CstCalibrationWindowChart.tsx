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

import { formatSeconds, shortenHex } from '@/utils';

import {
  getCstCalibrationTimeline,
  type CstCalibrationPoint,
  type CstCalibrationTimeline,
} from '@/utils/cstCalibration';
import type { GestureInfo } from '@/services/api/types';
import { useGestureListByCycle, useRoundInfo, useCurrentTime } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { CyclePickerSection } from '@/components/statistics/CyclePickerSection';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const LINE_COLOR = 'rgba(255,255,255,0.85)';
const ETH_COLOR = '#15bffd'; // cyan — ETH gesture (shortens the window)
const RWALK_COLOR = '#fbbf24'; // amber — ETH + RandomWalk gesture (shortens)
const CST_COLOR = '#9C37FD'; // violet — CST gesture (lengthens)

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

/** Compact duration for the Y-axis ticks, e.g. "45m", "1.5h", "2d". */
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

function gestureColor(gestureType: number): string {
  if (gestureType === 2) return CST_COLOR;
  if (gestureType === 1) return RWALK_COLOR;
  return ETH_COLOR;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

type WindowTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CstCalibrationPoint }>;
};

function WindowTooltip({ active, payload }: WindowTooltipProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const typeLabel =
    point.gestureType === 2
      ? t('charts.cstWindow.typeCst')
      : point.gestureType === 1
        ? t('charts.cstWindow.typeRandomWalk')
        : point.gestureType === 0
          ? t('charts.cstWindow.typeEth')
          : null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">
        {t('charts.cstWindow.intoCycle', {
          duration: formatHoursTick(point.hoursIntoRound, locale),
        })}
      </p>
      <dl className="space-y-1 text-muted-foreground">
        <div className="flex items-center justify-between gap-4">
          <dt>{t('charts.cstWindow.windowAfter')}</dt>
          <dd className="text-white">{formatSeconds(point.windowSeconds, locale)}</dd>
        </div>
        {typeLabel ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: gestureColor(point.gestureType) }}
              />
              {typeLabel}
            </dt>
            {point.bidder ? (
              <dd className="font-mono text-white">{shortenHex(point.bidder, 4)}</dd>
            ) : null}
          </div>
        ) : null}
      </dl>
    </div>
  );
}

type DotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: CstCalibrationPoint;
};

/** Colored per-gesture marker; the synthetic end point renders no dot. */
function gestureDot(props: DotProps) {
  const { cx, cy, index, payload } = props;
  if (cx === undefined || cy === undefined || !payload || payload.gestureType < 0) {
    return <g key={`dot-${index}`} />;
  }
  const isCst = payload.gestureType === 2;
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={isCst ? 2.5 : 1.5}
      fill={gestureColor(payload.gestureType)}
      fillOpacity={isCst ? 0.95 : 0.7}
      stroke="none"
    />
  );
}

/**
 * Step chart of the timeline, memoized on `points` so it doesn't repaint on
 * the page's periodic re-renders.
 */
const CalibrationChartView = memo(function CalibrationChartView({
  points,
}: {
  points: CstCalibrationPoint[];
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart data={points} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
            value: t('charts.cstWindow.timeIntoCycle'),
            position: 'insideBottom',
            offset: -4,
            fill: 'rgba(255,255,255,0.45)',
            fontSize: 11,
          }}
        />
        <YAxis
          domain={[
            (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.92)),
            (dataMax: number) => Math.ceil(dataMax * 1.05),
          ]}
          tickFormatter={(v) => formatDurationTick(Number(v), locale)}
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
          width={48}
        />
        <Tooltip
          content={<WindowTooltip />}
          isAnimationActive={false}
          allowEscapeViewBox={{ x: false, y: false }}
          wrapperStyle={{ pointerEvents: 'none', zIndex: 10 }}
        />
        <Line
          type="stepAfter"
          dataKey="windowSeconds"
          name={t('charts.cstWindow.window')}
          stroke={LINE_COLOR}
          strokeWidth={1.5}
          dot={gestureDot}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

type CstCalibrationWindowViewProps = {
  /** The cycle's gesture list (any order; invalid/legacy entries are skipped). */
  gestures: GestureInfo[];
  /** True when showing the in-progress cycle (timeline stays open at "now"). */
  isLive: boolean;
  /** Finalized cycles end at their claim timestamp; ignored when `isLive`. */
  roundEndTs?: number;
};

/**
 * CST Calibration Window step chart for one cycle: the window length after
 * every gesture, with per-gesture markers colored by type (ETH and RandomWalk
 * gestures shorten the window, CST gestures lengthen it).
 */
export const CstCalibrationWindowView: FC<CstCalibrationWindowViewProps> = ({
  gestures,
  isLive,
  roundEndTs = 0,
}) => {
  const t = useTranslations('statistics');
  const locale = useLocale();

  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const nowSec = serverNow && serverNow > 0 ? serverNow : clientNow;
  // Only the live cycle depends on "now"; quantize to whole minutes so the
  // memo (and the chart) updates at most once a minute.
  const nowForCalc = isLive ? Math.floor(nowSec / 60) * 60 : 0;

  const timeline: CstCalibrationTimeline = useMemo(
    () => getCstCalibrationTimeline(gestures, isLive ? 0 : roundEndTs, nowForCalc),
    [gestures, isLive, roundEndTs, nowForCalc],
  );

  if (timeline.points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('charts.cstWindow.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="cst-calibration-window-chart">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>
          {t('charts.cstWindow.summaryMin', {
            duration: formatSeconds(timeline.minSeconds, locale),
          })}
        </span>
        <span>
          {t('charts.cstWindow.summaryMax', {
            duration: formatSeconds(timeline.maxSeconds, locale),
          })}
        </span>
        <span className="text-white">
          {t(isLive ? 'charts.cstWindow.summaryCurrent' : 'charts.cstWindow.summaryFinal', {
            duration: formatSeconds(timeline.currentSeconds, locale),
          })}
        </span>
      </div>

      <CalibrationChartView points={timeline.points} />

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <LegendDot color={ETH_COLOR} label={t('charts.cstWindow.typeEth')} />
        <LegendDot color={RWALK_COLOR} label={t('charts.cstWindow.typeRandomWalk')} />
        <LegendDot color={CST_COLOR} label={t('charts.cstWindow.typeCst')} />
      </div>

      <p className="text-xs text-muted-foreground">{t('charts.cstWindow.description')}</p>
    </div>
  );
};

type CstCalibrationWindowChartProps = {
  round: number;
  /** True when `round` is the in-progress round (open-ended at "now"). */
  isLive: boolean;
};

/** Fetching wrapper: loads the cycle's gesture list and renders the chart. */
const CstCalibrationWindowChart: FC<CstCalibrationWindowChartProps> = ({ round, isLive }) => {
  const t = useTranslations('statistics');
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');

  // Finalized cycles end at their claim timestamp; the live cycle stays open.
  const { data: roundInfo } = useRoundInfo(hasRound && !isLive ? round : -1);
  const roundEndTs = !isLive && roundInfo?.TimeStamp ? roundInfo.TimeStamp : 0;

  if (!hasRound) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('charts.cstWindow.selectCycle')}
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
        title={t('charts.cstWindow.loadErrorTitle')}
        message={t('charts.cstWindow.loadErrorMessage')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <CstCalibrationWindowView gestures={gestures ?? []} isLive={isLive} roundEndTs={roundEndTs} />
  );
};

type CstCalibrationWindowSectionProps = {
  /** The current in-progress round number (from dashboard CurRoundNum). */
  currentRoundNum: number;
};

/**
 * Round picker + Calibration Window chart. Defaults to the current cycle and
 * lets you step back through finalized cycles to compare their calibration
 * dynamics.
 */
export const CstCalibrationWindowSection: FC<CstCalibrationWindowSectionProps> = ({
  currentRoundNum,
}) => (
  <CyclePickerSection currentRoundNum={currentRoundNum}>
    {(selectedRound, isLive) => <CstCalibrationWindowChart round={selectedRound} isLive={isLive} />}
  </CyclePickerSection>
);

export default CstCalibrationWindowChart;

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

import { formatAddress, formatHoursTick, formatSeconds } from '@/utils/format';
import {
  getCstCalibrationTimeline,
  type CstCalibrationPoint,
  type CstCalibrationTimeline,
} from '@/utils/cstCalibration';
import type { GestureInfo } from '@/services/api/types';
import { useGestureListByCycle, useRoundInfo, useCurrentTime } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { GESTURE_METHOD_COLOR, gestureMethodColor } from '@/lib/theme/dataColors';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';

import { ChartFigure } from './charts/ChartFigure';
import { ChartLegend } from './charts/ChartLegend';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { useDurationAxis, useElapsedHoursAxis } from './charts/axes';
import {
  CHART_MARGIN,
  DOTS_MAX_POINTS,
  GRID_PROPS,
  SERIES_COLOR,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';

const CHART_HEIGHT = 320;

/** The method a gesture was made with, as its legend label key. */
const METHOD_LABEL_KEY: Readonly<Record<number, string>> = {
  0: 'charts.cstWindow.typeEth',
  1: 'charts.cstWindow.typeRandomWalk',
  2: 'charts.cstWindow.typeCst',
};

function WindowTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CstCalibrationPoint }>;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  const methodKey = METHOD_LABEL_KEY[point.gestureType];
  return (
    <ChartTooltipCard
      title={t('charts.cstWindow.intoCycle', {
        duration: formatHoursTick(point.hoursIntoRound, locale),
      })}
      rows={[
        {
          key: 'window',
          label: t('charts.cstWindow.windowAfter'),
          value: formatSeconds(point.windowSeconds, locale),
          color: SERIES_COLOR.measure,
          shape: 'line',
        },
        ...(methodKey
          ? [
              {
                key: 'method',
                label: t(methodKey),
                value: point.bidder ? formatAddress(point.bidder) : '',
                color: gestureMethodColor(point.gestureType),
                shape: 'dot' as const,
              },
            ]
          : []),
      ]}
    />
  );
}

type DotProps = { cx?: number; cy?: number; index?: number; payload?: CstCalibrationPoint };

/** A dot per gesture in its method's colour; the synthetic end point draws none. */
function gestureDot({ cx, cy, index, payload }: DotProps) {
  if (cx === undefined || cy === undefined || !payload || payload.gestureType < 0) {
    return <g key={`dot-${index}`} />;
  }
  const isCst = payload.gestureType === 2;
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={isCst ? 2.25 : 1.5}
      fill={gestureMethodColor(payload.gestureType)}
      fillOpacity={isCst ? 0.95 : 0.8}
      stroke="none"
    />
  );
}

/** The hovered gesture, ringed in its method's colour. */
function activeGestureDot({ cx, cy, payload }: DotProps) {
  if (cx === undefined || cy === undefined || !payload) return <g />;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={
        payload.gestureType < 0 ? SERIES_COLOR.measure : gestureMethodColor(payload.gestureType)
      }
      stroke="hsl(var(--background))"
      strokeWidth={1.5}
    />
  );
}

/**
 * Whether every gesture draws its dot at rest. A cycle of a thousand
 * gestures would bury the step line under its dots, so above
 * `DOTS_MAX_POINTS` the line reads alone and a gesture's method shows on
 * hover, in the tooltip and in the table.
 */
export function drawsGestureDots(points: readonly CstCalibrationPoint[]): boolean {
  return points.length <= DOTS_MAX_POINTS;
}

const CalibrationChartView = memo(function CalibrationChartView({
  points,
  minSeconds,
  maxSeconds,
}: {
  points: CstCalibrationPoint[];
  minSeconds: number;
  maxSeconds: number;
}) {
  const dots = drawsGestureDots(points);
  const xAxis = useElapsedHoursAxis(points[points.length - 1]?.hoursIntoRound ?? 0);
  const yAxis = useDurationAxis(minSeconds, maxSeconds);
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart data={points} margin={CHART_MARGIN}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis
          {...X_AXIS_PROPS}
          dataKey="hoursIntoRound"
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
        />
        <Tooltip {...TOOLTIP_PROPS} content={<WindowTooltip />} />
        <Line
          type="stepAfter"
          dataKey="windowSeconds"
          stroke={SERIES_COLOR.measure}
          strokeOpacity={dots ? 0.7 : 1}
          strokeWidth={dots ? 1.25 : 1.5}
          dot={dots ? gestureDot : false}
          activeDot={activeGestureDot}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

type WindowRow = {
  hours: number;
  method: string;
  participant: string | null;
  window: number;
};

type CstCalibrationWindowViewProps = {
  /** The cycle's gesture list (any order; invalid or legacy entries are skipped). */
  gestures: GestureInfo[];
  /** True when showing the in-progress cycle (the timeline stays open at "now"). */
  isLive: boolean;
  /** Finalized cycles end at their claim timestamp; ignored when `isLive`. */
  roundEndTs?: number;
  /** Names the figure. */
  label: string;
};

/**
 * The CST Calibration Window over one cycle: the window after every gesture
 * as a step line, each gesture a dot in its method's colour (ETH and Random
 * Walk gestures shorten it, CST gestures lengthen it) while the cycle is
 * small enough for the dots to leave the line readable, on whole-hour ticks.
 */
export const CstCalibrationWindowView: FC<CstCalibrationWindowViewProps> = ({
  gestures,
  isLive,
  roundEndTs = 0,
  label,
}) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data: serverNow } = useCurrentTime();
  const clientNow = Math.floor(useNow(60_000) / 1000);
  const nowSec = serverNow && serverNow > 0 ? serverNow : clientNow;
  const nowForCalc = isLive ? Math.floor(nowSec / 60) * 60 : 0;

  const timeline: CstCalibrationTimeline = useMemo(
    () => getCstCalibrationTimeline(gestures, isLive ? 0 : roundEndTs, nowForCalc),
    [gestures, isLive, roundEndTs, nowForCalc],
  );

  const rows = useMemo<WindowRow[]>(
    () =>
      timeline.points
        .filter((point) => point.gestureType >= 0)
        .map((point) => ({
          hours: point.hoursIntoRound,
          method: t(METHOD_LABEL_KEY[point.gestureType] ?? 'charts.cstWindow.typeEth'),
          participant: point.bidder || null,
          window: point.windowSeconds,
        })),
    [t, timeline.points],
  );

  const columns = useMemo<DataTableColumn<WindowRow>[]>(
    () => [
      {
        id: 'hours',
        kind: 'text',
        header: t('charts.cstWindow.timeIntoCycle'),
        value: (row) => row.hours,
        cell: (row) => formatHoursTick(row.hours, locale),
        sortable: true,
      },
      {
        id: 'method',
        kind: 'text',
        header: t('charts.cstWindow.method'),
        value: (row) => row.method,
      },
      {
        id: 'participant',
        kind: 'address',
        header: t('charts.activePeriods.participant'),
        value: (row) => row.participant,
      },
      {
        id: 'window',
        kind: 'duration',
        header: t('charts.cstWindow.windowAfter'),
        value: (row) => row.window,
        sortable: true,
      },
    ],
    [locale, t],
  );

  if (timeline.points.length === 0) {
    return <EmptyState headingLevel={4} variant="inline" title={t('charts.cstWindow.empty')} />;
  }

  return (
    <ChartFigure
      label={label}
      summary={t(isLive ? 'charts.cstWindow.summaryLive' : 'charts.cstWindow.summaryFinal', {
        current: formatSeconds(timeline.currentSeconds, locale),
        low: formatSeconds(timeline.minSeconds, locale),
        high: formatSeconds(timeline.maxSeconds, locale),
      })}
      legend={
        <ChartLegend
          items={[
            {
              key: 'window',
              label: t('charts.cstWindow.window'),
              color: SERIES_COLOR.measure,
              shape: 'line',
            },
            // The legend keys only what the plot draws: a dense cycle has no
            // dots at rest, and its tooltip names the hovered gesture's method.
            ...(drawsGestureDots(timeline.points)
              ? ([
                  {
                    key: 'eth',
                    label: t('charts.cstWindow.typeEth'),
                    color: GESTURE_METHOD_COLOR.eth,
                    shape: 'dot',
                  },
                  {
                    key: 'rwlk',
                    label: t('charts.cstWindow.typeRandomWalk'),
                    color: GESTURE_METHOD_COLOR.ethRandomWalk,
                    shape: 'dot',
                  },
                  {
                    key: 'cst',
                    label: t('charts.cstWindow.typeCst'),
                    color: GESTURE_METHOD_COLOR.cst,
                    shape: 'dot',
                  },
                ] as const)
              : []),
          ]}
        />
      }
      note={t('charts.cstWindow.description')}
      table={<DataTable data={rows} columns={columns} ariaLabel={label} />}
    >
      <div data-testid="cst-calibration-window-chart">
        <CalibrationChartView
          points={timeline.points}
          minSeconds={timeline.minSeconds}
          maxSeconds={timeline.maxSeconds}
        />
      </div>
    </ChartFigure>
  );
};

type CstCalibrationWindowChartProps = {
  round: number;
  /** True when `round` is the in-progress round (open-ended at "now"). */
  isLive: boolean;
  /** Names the figure. */
  label: string;
};

/** Loads the cycle's gesture list and renders the Calibration Window chart. */
const CstCalibrationWindowChart: FC<CstCalibrationWindowChartProps> = ({
  round,
  isLive,
  label,
}) => {
  const t = useTranslations('statistics');
  const hasRound = round >= 0;
  const { data: gestures, isLoading, isError, refetch } = useGestureListByCycle(round, 'asc');
  const { data: roundInfo } = useRoundInfo(hasRound && !isLive ? round : -1);
  const roundEndTs = !isLive && roundInfo?.TimeStamp ? roundInfo.TimeStamp : 0;

  if (!hasRound) {
    return (
      <EmptyState headingLevel={4} variant="inline" title={t('charts.cstWindow.selectCycle')} />
    );
  }
  if (isLoading) return <SkeletonChart height={CHART_HEIGHT} bars={18} />;
  if (isError) {
    return (
      <ErrorState
        headingLevel={4}
        title={t('charts.cstWindow.loadErrorTitle')}
        message={t('charts.cstWindow.loadErrorMessage')}
        onRetry={() => refetch()}
      />
    );
  }
  return (
    <CstCalibrationWindowView
      gestures={gestures ?? []}
      isLive={isLive}
      roundEndTs={roundEndTs}
      label={label}
    />
  );
};

export default CstCalibrationWindowChart;

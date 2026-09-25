'use client';

import { memo, useId, useMemo, useState, type FC } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';

import { formatAmount, formatUnixTsLabel, supplyHistoryBootstrapRange } from '@/utils/format';
// lexicon-allow-start: the supply-history hook and record names mirror the API routes
import {
  useCTTotalSupplyHistoryByBid as useSupplyByGestureQuery,
  useCTTotalSupplyHistoryByDate as useSupplyByDateQuery,
} from '@/hooks/useApiQuery';
import type {
  CTTotalSupplyHistoryByBidRecord as SupplyByGestureRecord,
  CTTotalSupplyHistoryByDateRecord as SupplyByDateRecord,
} from '@/services/api/types';
// lexicon-allow-end
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonChart } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

import { ChartFigure } from './charts/ChartFigure';
import { ChartPlot } from './charts/ChartPlot';
import type { ReadoutItem } from './charts/ChartReadout';
import { UtcTime } from './charts/UtcTime';
import { ChartTooltipCard } from './charts/ChartTooltipCard';
import { useLinearAxis, useTimeAxis } from './charts/axes';
import { formatDateRange } from './charts/labels';
import {
  CHART_MARGIN,
  GRID_PROPS,
  MIN_PLOT_POINTS,
  SERIES_COLOR,
  TOOLTIP_PROPS,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from './charts/theme';

const CHART_HEIGHT = 300;
const DAY = 86_400;
const COLOR = SERIES_COLOR.supply;

/** One point of the supply series: a UTC day, or the moment of one gesture. */
export interface SupplyPoint {
  /** Unix seconds: the day's start, or the gesture's block time. */
  ts: number;
  supply: number;
  imprinted: number;
  burned: number;
  net: number;
  /** Date view: gestures that day. */
  gestures?: number;
  /** Gesture view: the gesture's number in the whole history (1 = first). */
  gesture?: number;
  txHash?: string;
}

/** UTC midnight of a `YYYYMMDD` day, in Unix seconds; NaN when it is not one. */
function dayStart(date: string | undefined): number {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(date ?? '');
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 1000 : NaN;
}

/** The daily series, oldest first. A day without a timestamp is placed by its `Date`. */
export function supplyByDate(records: readonly SupplyByDateRecord[]): SupplyPoint[] {
  return records
    .map((r) => ({
      ts: Number.isFinite(r.TimeStamp) ? r.TimeStamp : dayStart(r.Date),
      supply: r.TotalSupplyEth ?? 0,
      imprinted: r.MintAmountEth ?? 0,
      burned: r.BurnAmountEth ?? 0,
      net: r.AmountEth ?? 0,
      gestures: r.NumBids ?? 0,
    }))
    .filter((p) => Number.isFinite(p.ts))
    .sort((a, b) => a.ts - b.ts);
}

/** The supply after every gesture, oldest first, numbered from the first gesture. */
export function supplyByGesture(records: readonly SupplyByGestureRecord[]): SupplyPoint[] {
  return records
    .map((r) => {
      // The wire nests the transaction under `Tx`; older responses flatten it.
      const tx = (r as { Tx?: { TimeStamp?: number; TxHash?: string } }).Tx;
      return {
        ts: tx?.TimeStamp ?? r.TimeStamp,
        supply: r.TotalSupplyEth ?? 0,
        imprinted: r.MintAmountEth ?? 0,
        burned: r.BurnAmountEth ?? 0,
        net: r.AmountEth ?? 0,
        txHash: tx?.TxHash ?? r.TxHash,
      };
    })
    .filter((p) => Number.isFinite(p.ts))
    .sort((a, b) => a.ts - b.ts)
    .map((p, index) => ({ ...p, gesture: index + 1 }));
}

/** How far back the chart reaches from its latest point. */
export const SUPPLY_RANGES = ['30', '90', '365', 'all'] as const;
export type SupplyRange = (typeof SUPPLY_RANGES)[number];

/** The points within `range` of the latest one. */
export function sliceRange(points: readonly SupplyPoint[], range: SupplyRange): SupplyPoint[] {
  const last = points[points.length - 1];
  if (!last || range === 'all') return [...points];
  const from = last.ts - Number(range) * DAY;
  return points.filter((p) => p.ts > from);
}

type View = 'date' | 'gesture';

function SupplyTooltip({
  active,
  payload,
  view,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SupplyPoint }>;
  view: View;
}) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  const cst = (value: number) => formatAmount(value, { unit: 'CST', locale });
  const when = formatUnixTsLabel(point.ts, view === 'gesture', locale);
  // By gesture, the title is the gesture and its moment is a row of its own: two
  // translated strings are never glued with one language's separator.
  const byGesture = view === 'gesture';
  return (
    <ChartTooltipCard
      title={byGesture ? t('charts.supply.gesture', { number: point.gesture ?? 0 }) : when}
      rows={[
        ...(byGesture ? [{ key: 'when', label: t('charts.cstCost.when'), value: when }] : []),
        {
          key: 'supply',
          label: t('charts.supply.totalSupply'),
          value: cst(point.supply),
          color: COLOR,
          shape: 'line',
        },
        { key: 'imprinted', label: t('charts.supply.imprint'), value: cst(point.imprinted) },
        { key: 'burned', label: t('charts.supply.consume'), value: cst(point.burned) },
      ]}
    />
  );
}

const SupplyArea = memo(function SupplyArea({
  points,
  view,
}: {
  points: SupplyPoint[];
  view: View;
}) {
  const gradientId = `supply-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const timeAxis = useTimeAxis(first.ts, last.ts);
  const gestureAxis = useLinearAxis(first.gesture ?? 0, last.gesture ?? 0);
  const xAxis = view === 'gesture' ? gestureAxis : timeAxis;
  const supplies = points.map((p) => p.supply);
  const yAxis = useLinearAxis(Math.min(...supplies), Math.max(...supplies));
  // An area's height reads as an amount, which is only true from zero: on a
  // range that starts higher the supply is a line with no fill, so a swing
  // of a few percent never looks like a doubling.
  const fromZero = yAxis.domain[0] <= 0;

  return (
    <ChartPlot height={CHART_HEIGHT}>
      <AreaChart data={points} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis
          {...X_AXIS_PROPS}
          dataKey={view === 'gesture' ? 'gesture' : 'ts'}
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
        />
        <Tooltip {...TOOLTIP_PROPS} content={<SupplyTooltip view={view} />} />
        <Area
          type="monotone"
          dataKey="supply"
          stroke={COLOR}
          strokeWidth={1.75}
          fill={fromZero ? `url(#${gradientId})` : 'none'}
          baseValue={0}
          dot={false}
          activeDot={{ r: 4, fill: COLOR, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartPlot>
  );
});

/**
 * CST total supply over time: one line (filled only when its axis starts at
 * zero), by day or after every gesture, over the last 30 or 90 days, the
 * last year or all time. The readout gives the supply at the end of the
 * range (its swatch keys the line) and what was imprinted and burned in it;
 * the table view lists the same points.
 */
export const CstSupplyHistory: FC<{ label: string }> = ({ label }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const [view, setView] = useState<View>('date');
  const [range, setRange] = useState<SupplyRange>('all');
  const bounds = useMemo(() => supplyHistoryBootstrapRange(), []);
  const byDate = useSupplyByDateQuery(bounds.from, bounds.to);
  const byGesture = useSupplyByGestureQuery(view === 'gesture');
  const query = view === 'gesture' ? byGesture : byDate;

  const series = useMemo(
    () =>
      view === 'gesture' ? supplyByGesture(byGesture.data ?? []) : supplyByDate(byDate.data ?? []),
    [view, byDate.data, byGesture.data],
  );
  const points = useMemo(() => sliceRange(series, range), [series, range]);
  const cst = (value: number) => formatAmount(value, { unit: 'CST', locale });

  const columns = useMemo<DataTableColumn<SupplyPoint>[]>(() => {
    const amount = (id: 'supply' | 'imprinted' | 'burned' | 'net', header: string) => ({
      id,
      kind: 'amount' as const,
      unit: 'CST' as const,
      header,
      value: (row: SupplyPoint) => row[id],
      sortable: true,
    });
    return view === 'gesture'
      ? [
          {
            id: 'gesture',
            kind: 'count',
            header: t('charts.supply.gestureNumber'),
            value: (row) => row.gesture ?? null,
            sortable: true,
          },
          {
            id: 'ts',
            kind: 'text',
            header: t('charts.cstCost.when'),
            value: (row) => row.ts,
            // UTC, like the chart's axis.
            cell: (row) => <UtcTime timestamp={row.ts} locale={locale} txHash={row.txHash} />,
            sortable: true,
          },
          amount('supply', t('charts.supply.totalSupply')),
          amount('imprinted', t('charts.supply.imprint')),
          amount('burned', t('charts.supply.consume')),
        ]
      : [
          {
            id: 'ts',
            kind: 'text',
            header: t('charts.frequency.day'),
            value: (row) => row.ts,
            cell: (row) => formatUnixTsLabel(row.ts, false, locale),
            sortable: true,
          },
          amount('supply', t('charts.supply.totalSupply')),
          amount('imprinted', t('charts.supply.imprint')),
          amount('burned', t('charts.supply.consume')),
          amount('net', t('charts.supply.net')),
          {
            id: 'gestures',
            kind: 'count',
            header: t('charts.supply.numGestures'),
            value: (row) => row.gestures ?? null,
            sortable: true,
          },
        ];
  }, [view, locale, t]);

  const last = points[points.length - 1];
  const first = points[0];
  const loading = query.isLoading;
  // The same calendar style for the day and the range.
  const period = first && last ? formatDateRange(first.ts, last.ts, locale) : null;
  const readout: ReadoutItem[] | undefined =
    loading || (first && last)
      ? [
          {
            id: 'supply',
            label: t('charts.supply.totalSupply'),
            value: last && !loading ? cst(last.supply) : null,
            caption: last && !loading ? formatDateRange(last.ts, last.ts, locale) : null,
            swatch: { color: COLOR, shape: 'line' },
          },
          {
            id: 'imprinted',
            label: t('charts.supply.imprint'),
            value: loading ? null : cst(points.reduce((sum, p) => sum + p.imprinted, 0)),
            caption: loading ? null : period,
          },
          {
            id: 'burned',
            label: t('charts.supply.consume'),
            value: loading ? null : cst(points.reduce((sum, p) => sum + p.burned, 0)),
            caption: loading ? null : period,
          },
        ]
      : undefined;

  const state = loading ? (
    <SkeletonChart height={CHART_HEIGHT} bars={24} />
  ) : query.isError ? (
    <ErrorState
      headingLevel={4}
      title={t('charts.supply.loadErrorTitle')}
      message={t(
        view === 'gesture' ? 'charts.supply.loadGestureError' : 'charts.supply.loadDateError',
      )}
      onRetry={() => query.refetch()}
    />
  ) : points.length === 0 ? (
    <EmptyState
      headingLevel={4}
      variant="inline"
      title={t(view === 'gesture' ? 'charts.supply.emptyGesture' : 'charts.supply.emptyDate')}
    />
  ) : null;

  return (
    <ChartFigure
      label={label}
      readout={query.isError ? undefined : readout}
      loading={loading}
      preferTable={points.length > 0 && points.length < MIN_PLOT_POINTS}
      controls={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <SegmentedControl
            label={t('charts.supply.view')}
            value={view}
            onValueChange={(value) => setView(value as View)}
            options={[
              { value: 'date', label: t('tokens.supplyTabs.date') },
              { value: 'gesture', label: t('tokens.supplyTabs.gesture') },
            ]}
          />
          <SegmentedControl
            label={t('charts.supply.range')}
            value={range}
            onValueChange={(value) => setRange(value as SupplyRange)}
            options={SUPPLY_RANGES.map((value) => ({
              value,
              label:
                value === 'all'
                  ? t('charts.supply.rangeAll')
                  : value === '365'
                    ? t('charts.supply.rangeYear')
                    : t('charts.supply.rangeDays', { days: Number(value) }),
            }))}
          />
        </div>
      }
      state={state}
      table={
        <DataTable
          data={points}
          columns={columns}
          ariaLabel={label}
          initialSort={{ id: 'ts', direction: 'desc' }}
        />
      }
    >
      <div data-testid="cst-supply-history">
        {points.length > 0 ? <SupplyArea points={points} view={view} /> : null}
      </div>
    </ChartFigure>
  );
};

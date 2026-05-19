'use client';

import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCTTotalSupplyHistoryByDate } from '@/hooks/useApiQuery';
import type { CTTotalSupplyHistoryByDateRecord } from '@/services/api/types';
import {
  formatCSTValue,
  formatYyyymmddLabel,
  fromYyyymmdd,
  supplyHistoryBootstrapRange,
  supplyHistoryDateBounds,
  toYyyymmdd,
} from '@/utils';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const CHART_HEIGHT = 320;
const LINE_COLOR = '#15bffd';

type ChartPoint = {
  dateKey: string;
  label: string;
  totalSupplyEth: number;
  mintAmountEth: number;
  burnAmountEth: number;
  amountEth: number;
  numBids: number;
};

export function toChartPoints(records: CTTotalSupplyHistoryByDateRecord[]): ChartPoint[] {
  return records.map((r) => ({
    dateKey: r.Date,
    label: formatYyyymmddLabel(r.Date),
    totalSupplyEth: r.TotalSupplyEth ?? 0,
    mintAmountEth: r.MintAmountEth ?? 0,
    burnAmountEth: r.BurnAmountEth ?? 0,
    amountEth: r.AmountEth ?? 0,
    numBids: r.NumBids ?? 0,
  }));
}

type SupplyTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
};

function SupplyTooltip({ active, payload }: SupplyTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{point.label}</p>
      <dl className="space-y-1 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Total supply</dt>
          <dd className="text-white">{formatCSTValue(point.totalSupplyEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Mint</dt>
          <dd className="text-white">{formatCSTValue(point.mintAmountEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Burn</dt>
          <dd className="text-white">{formatCSTValue(point.burnAmountEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Net</dt>
          <dd className="text-white">{formatCSTValue(point.amountEth)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Num bids</dt>
          <dd className="text-white">{point.numBids}</dd>
        </div>
      </dl>
    </div>
  );
}

type CSTTotalSupplyHistoryChartProps = {
  enabled?: boolean;
};

/** Line chart of CST total supply over time with date-range controls. */
export const CSTTotalSupplyHistoryChart: FC<CSTTotalSupplyHistoryChartProps> = ({
  enabled = true,
}) => {
  const bootstrap = useMemo(() => supplyHistoryBootstrapRange(), []);
  const [draftFrom, setDraftFrom] = useState(() => fromYyyymmdd(bootstrap.from));
  const [draftTo, setDraftTo] = useState(() => fromYyyymmdd(bootstrap.to));
  const [appliedFrom, setAppliedFrom] = useState(bootstrap.from);
  const [appliedTo, setAppliedTo] = useState(bootstrap.to);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const rangeInitialized = useRef(false);

  const { data, isLoading, isError, refetch } = useCTTotalSupplyHistoryByDate(
    appliedFrom,
    appliedTo,
    enabled,
  );

  const chartData = useMemo(() => toChartPoints(data ?? []), [data]);

  useEffect(() => {
    if (!data?.length || rangeInitialized.current) return;
    const bounds = supplyHistoryDateBounds(data);
    if (!bounds) return;
    rangeInitialized.current = true;
    setAppliedFrom(bounds.from);
    setAppliedTo(bounds.to);
    setDraftFrom(fromYyyymmdd(bounds.from));
    setDraftTo(fromYyyymmdd(bounds.to));
  }, [data]);

  const handleUpdate = () => {
    const from = toYyyymmdd(draftFrom);
    const to = toYyyymmdd(draftTo);
    if (from > to) {
      setRangeError('Start date must be on or before end date.');
      return;
    }
    setRangeError(null);
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  return (
    <div className="space-y-6" data-testid="cst-total-supply-history-chart">
      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        <DatePicker
          id="supply-history-from"
          label="From"
          value={draftFrom}
          onChange={setDraftFrom}
        />
        <DatePicker id="supply-history-to" label="To" value={draftTo} onChange={setDraftTo} />
        <Button type="submit" variant="default">
          Update chart
        </Button>
      </form>

      {rangeError ? <p className="text-sm text-destructive">{rangeError}</p> : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load supply history"
          message="Could not fetch CST total supply for the selected range."
          onRetry={() => refetch()}
        />
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No supply history for this date range.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
              tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(0) : String(v))}
              width={56}
            />
            <Tooltip content={<SupplyTooltip />} />
            <Line
              type="monotone"
              dataKey="totalSupplyEth"
              stroke={LINE_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: LINE_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

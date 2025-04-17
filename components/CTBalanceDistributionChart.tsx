import React, { FC, useMemo } from "react";
import {
  Chart,
  ChartArea,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-default/dist/all.css";

import { MARKETING_WALLET_ADDRESS } from "../config/app";
import { shortenHex } from "../utils";

/** Maximum number of individual addresses to highlight before grouping the rest */
const DISPLAY_LIMIT = 9;

/**
 * Balance entry as returned by the backend.
 */
export interface BalanceDistribution {
  /** Wallet address */
  OwnerAddr: string;
  /** Floating‑point token balance */
  BalanceFloat: number;
}

/** Props for `<CTBalanceDistributionChart>` */
interface CTBalanceDistributionChartProps {
  /** Full list of owner balances sorted by `BalanceFloat` DESC */
  list: BalanceDistribution[];
}

/**
 * Converts the raw list of balances into two things: a processed list that
 * contains at most `DISPLAY_LIMIT` addresses plus an optional "Others" bucket,
 * and the maximum value so we can scale the chart with some breathing room.
 */
const useProcessedBalances = (list: BalanceDistribution[], limit: number) => {
  return useMemo(() => {
    if (list.length === 0) return { processed: [], max: 0 };

    if (list.length <= limit) {
      // Nothing to group – return the list as‑is
      return { processed: list, max: list[0].BalanceFloat };
    }

    // Group everything after the limit into a single "Others" category
    const othersValue = list
      .slice(limit)
      .reduce((sum, curr) => sum + curr.BalanceFloat, 0);

    const processed: BalanceDistribution[] = [
      ...list.slice(0, limit),
      { OwnerAddr: "Others", BalanceFloat: othersValue },
    ];

    const max = Math.max(list[0].BalanceFloat, othersValue);

    return { processed, max };
  }, [list, limit]);
};

/**
 * Bar chart that shows the distribution of token balances among top holders.
 * Remaining holders are aggregated into an "Others" bucket.
 */
export const CTBalanceDistributionChart: FC<CTBalanceDistributionChartProps> = ({
  list,
}) => {
  const { processed: data, max } = useProcessedBalances(list, DISPLAY_LIMIT);

  if (data.length === 0) return null; // Nothing to render yet

  /** Map raw data into objects understood by KendoReact */
  const chartData = data.map((entry) => ({
    category:
      entry.OwnerAddr === MARKETING_WALLET_ADDRESS
        ? "Marketing Wallet"
        : entry.OwnerAddr === "Others"
        ? "Others"
        : shortenHex(entry.OwnerAddr, 6),
    value: entry.BalanceFloat,
  }));

  return (
    <Chart transitions={false} style={{ width: "100%" }}>
      {/* Hide legend – we label bars directly */}
      <ChartLegend visible={false} />

      {/* Transparent background so parent containers control styling */}
      <ChartArea background="transparent" />

      {/* Category axis – just show white tick labels */}
      <ChartCategoryAxis>
        <ChartCategoryAxisItem color="white" />
      </ChartCategoryAxis>

      {/* Value axis – hidden, but we cap it to 140% of the max for spacing */}
      <ChartValueAxis>
        <ChartValueAxisItem visible={false} max={max * 1.4} />
      </ChartValueAxis>

      {/* Single series for the bar chart */}
      <ChartSeries>
        <ChartSeriesItem
          type="bar"
          data={chartData}
          field="value"
          categoryField="category"
          labels={{
            visible: true,
            content: ({ value }) => value.toFixed(2),
            color: "white",
            background: "none",
          }}
        />
      </ChartSeries>
    </Chart>
  );
};

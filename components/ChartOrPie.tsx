import React, { useCallback } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  Chart,
  ChartArea,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-default/dist/all.css";

type DistData = {
  PrizePercentage?: number;
  RafflePercentage?: number;
  CharityPercentage?: number;
  StakingPercentage?: number;
  StakignPercentage?: number; // fallback
  ChronoWarriorPercentage?: number;
  CosmicGameBalanceEth?: number;
};

const clamp = (n: number, min = 0, max = 100) => {
  const num = Number(n);
  return Number.isFinite(num) ? Math.min(max, Math.max(min, num)) : 0;
};

const fmtEth = (eth: number) =>
  Number.isFinite(eth) ? eth.toFixed(4) : "0.0000";

const ChartOrPie: React.FC<{ data?: DistData }> = ({ data }) => {
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up("md"));

  // normalize and guard values
  const prize = clamp(data?.PrizePercentage);
  const raffle = clamp(data?.RafflePercentage);
  const charity = clamp(data?.CharityPercentage);
  const staking = clamp(data?.StakingPercentage ?? data?.StakignPercentage);
  const chrono = clamp(data?.ChronoWarriorPercentage);
  const balance = Number(data?.CosmicGameBalanceEth) || 0;

  const remainder = clamp(100 - (prize + raffle + charity + staking + chrono));

  const series = [
    { category: "Prize", value: prize },
    { category: "Raffle", value: raffle },
    { category: "Charity", value: charity },
    { category: "Staking", value: staking },
    { category: "Chrono Warrior", value: chrono },
    { category: "Next round", value: remainder },
  ];

  const labelContent = useCallback(
    (props: any) => {
      const v = Number(props?.dataItem?.value) || 0;
      const cat = String(props?.dataItem?.category || "");
      const eth = (v * balance) / 100;
      return `${cat}: ${v}% (${fmtEth(eth)} ETH)`;
    },
    [balance]
  );

  const barAxisMax = Math.min(
    100,
    Math.max(80, Math.ceil(Math.max(...series.map((s) => s.value)) * 1.2))
  );

  return upMd ? (
    // Desktop/tablet: PIE chart
    <Chart transitions={false} style={{ width: "100%", height: 300 }}>
      <ChartLegend visible={false} />
      <ChartArea background="transparent" />
      <ChartSeries>
        <ChartSeriesItem
          type="pie"
          data={series}
          field="value"
          categoryField="category"
          labels={{
            visible: true,
            content: labelContent,
            color: "white",
            background: "none",
          }}
        />
      </ChartSeries>
    </Chart>
  ) : (
    // Mobile: BAR chart
    <Chart transitions={false} style={{ width: "100%", height: "100%" }}>
      <ChartLegend visible={false} />
      <ChartArea background="transparent" />
      <ChartValueAxis>
        <ChartValueAxisItem visible={false} max={barAxisMax} />
      </ChartValueAxis>
      <ChartSeries>
        <ChartSeriesItem
          type="bar"
          data={series}
          field="value"
          categoryField="category"
          labels={{
            visible: true,
            color: "white",
            background: "none",
            content: (props) => {
              const v = Number(props?.value) || 0;
              const eth = (v * balance) / 100;
              return `${v}% (${fmtEth(eth)} ETH)`;
            },
          }}
        />
      </ChartSeries>
    </Chart>
  );
};

export default ChartOrPie;

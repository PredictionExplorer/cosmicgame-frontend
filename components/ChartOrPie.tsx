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

  const barAxisMax = Math.min(
    100,
    Math.max(80, Math.ceil(Math.max(...series.map((s) => s.value)) * 1.2))
  );
  return (
    <Chart
      transitions={false}
      style={{ width: "100%", height: "200px", margin: "auto" }}
    >
      <ChartLegend visible={false} />
      <ChartArea background="transparent" />
      <ChartValueAxis>
        <ChartValueAxisItem visible={false} max={barAxisMax} />
      </ChartValueAxis>
      <ChartCategoryAxis>
        <ChartCategoryAxisItem
          labels={{ font: "13px Inter, system-ui, sans-serif", color: "white" }}
        />
      </ChartCategoryAxis>
      <ChartSeries>
        <ChartSeriesItem
          type="bar"
          data={series.sort((a, b) => b.value - a.value)}
          field="value"
          categoryField="category"
          color="#15bffd"
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

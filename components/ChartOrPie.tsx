import { useMediaQuery, useTheme } from "@mui/material";
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
import { isMobile } from "react-device-detect";

const ChartOrPie = ({ data }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const series = data
    ? [
        { category: "Prize", value: data.PrizePercentage },
        { category: "Raffle", value: data.RafflePercentage },
        { category: "Charity", value: data.CharityPercentage },
        { category: "Staking", value: data.StakignPercentage },
        { category: "Chrono Warrior", value: data.ChronoWarriorPercentage },
        {
          category: "Next round",
          value:
            100 -
            data.CharityPercentage -
            data.RafflePercentage -
            data.StakignPercentage -
            data.ChronoWarriorPercentage -
            data.PrizePercentage,
        },
      ]
    : [];

  const labelContent = (props: any) => {
    return data
      ? `${props.dataItem.category}: ${props.dataItem.value}% (${(
          (props.dataItem.value * data.CosmicGameBalanceEth) /
          100
        ).toFixed(4)} ETH)`
      : "";
  };

  return (
    <>
      {isMobile ? (
        <Chart transitions={false} style={{ width: "100%", height: "100%" }}>
          <ChartLegend visible={false} />
          <ChartArea background="transparent" />
          <ChartCategoryAxis>
            <ChartCategoryAxisItem color="white" />
          </ChartCategoryAxis>
          <ChartValueAxis>
            <ChartValueAxisItem visible={false} max={80} />
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
                content: (props) =>
                  `${props.value}% (${(
                    (props.dataItem.value * data?.CosmicGameBalanceEth) /
                    100
                  ).toFixed(4)} ETH)`,
              }}
            />
          </ChartSeries>
        </Chart>
      ) : (
        <Chart
          transitions={false}
          style={{ width: "100%", height: matches ? 300 : 200 }}
        >
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
      )}
    </>
  );
};

export default ChartOrPie;

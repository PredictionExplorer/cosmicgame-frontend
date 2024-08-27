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
import { MARKETING_WALLET_ADDRESS } from "../config/app";
import { shortenHex } from "../utils";
import { useEffect, useState } from "react";

export const CTBalanceDistributionChart = ({ list }) => {
  const limit = 9;
  const [newList, setNewList] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  useEffect(() => {
    if (list.length > limit) {
      const otherValue = list
        .slice(limit)
        .reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue.BalanceFloat,
          0
        );
      setNewList([
        ...list.slice(0, limit),
        {
          OwnerAddr: "Others",
          BalanceFloat: otherValue / (list.length - limit),
        },
      ]);
      setMaxValue(
        list[0].BalanceFloat > otherValue ? list[0].BalanceFloat : otherValue
      );
    } else if (list.length > 0) {
      setNewList(list);
      setMaxValue(list[0].BalanceFloat);
    }
  }, []);
  return (
    <>
      {newList.length > 0 && (
        <Chart transitions={false} style={{ width: "100%" }}>
          <ChartLegend visible={false} />
          <ChartArea background="transparent" />
          <ChartCategoryAxis>
            <ChartCategoryAxisItem color="white" />
          </ChartCategoryAxis>
          <ChartValueAxis>
            <ChartValueAxisItem visible={false} max={maxValue * 1.4} />
          </ChartValueAxis>
          <ChartSeries>
            <ChartSeriesItem
              type="bar"
              data={newList.map((value) => ({
                category:
                  value.OwnerAddr === MARKETING_WALLET_ADDRESS
                    ? "Marketing Wallet"
                    : value.OwnerAddr === "Others"
                    ? "Others"
                    : shortenHex(value.OwnerAddr, 6),
                value: value.BalanceFloat,
              }))}
              field="value"
              categoryField="category"
              labels={{
                visible: true,
                content: (props) => props.value.toFixed(4),
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

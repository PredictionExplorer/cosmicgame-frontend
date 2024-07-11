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
  const limit = 5;
  const [newList, setNewList] = useState([]);
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
        { OwnerAddr: "Other", BalanceFloat: otherValue },
      ]);
    } else {
      setNewList(list);
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
            <ChartValueAxisItem
              visible={false}
              max={newList[0].BalanceFloat * 1.4}
            />
          </ChartValueAxis>
          <ChartSeries>
            <ChartSeriesItem
              type="bar"
              data={newList.map((value) => ({
                category:
                  value.OwnerAddr === MARKETING_WALLET_ADDRESS
                    ? "Marketing Wallet"
                    : value.OwnerAddr === "Other"
                    ? "Other"
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

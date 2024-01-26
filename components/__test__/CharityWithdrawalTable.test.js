import { render, screen } from "@testing-library/react";
import CharityWithdrawalTable from "../CharityWithdrawalTable";
import "@testing-library/jest-dom";
import { convertTimestampToDateTime } from "../../utils";

test("CharityWithdrawalTable with no records", () => {
  render(<CharityWithdrawalTable list={[]} />);
  expect(screen.getByText("No deposits yet.")).toBeInTheDocument();
});

test("CharityWithdrawalTable with mock data", () => {
  const mockData = [
    {
      EvtLogId: 5621730,
      BlockNum: 1737504,
      TxId: 895134,
      TxHash:
        "0xb1cf0f7147701aeb2d8b4645f84add966b2bee1d098e899eaf1aa1548dff04e0",
      TimeStamp: 1701346718,
      DateTime: "2023-11-30T12:18:38Z",
      DestinationAddr: "0x555eced709352759Ed0f1317dfC0a5FEf1310e60",
      AmountEth: 0.10041564272868614,
    },
  ];
  render(<CharityWithdrawalTable list={mockData} />);
  expect(
    screen.getByText(convertTimestampToDateTime(mockData[0].TimeStamp))
  ).toBeInTheDocument();
  expect(screen.getByText(mockData[0].DestinationAddr)).toBeInTheDocument();
  expect(
    screen.getByText(mockData[0].AmountEth.toFixed(6))
  ).toBeInTheDocument();
});

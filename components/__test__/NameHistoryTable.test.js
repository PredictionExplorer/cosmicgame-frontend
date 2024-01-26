import { render, screen } from "@testing-library/react";
import NameHistoryTable from "../NameHistoryTable";
import "@testing-library/jest-dom";
import { convertTimestampToDateTime } from "../../utils";

test("NameHistoryTable with no records", () => {
  render(<NameHistoryTable list={[]} />);
  expect(screen.getByText("DateTime")).toBeInTheDocument();
  expect(screen.getByText("Token Name")).toBeInTheDocument();
});

test("NameHistoryTable with mock data", async () => {
  const mockData = [
    {
      EvtLogId: 8638,
      BlockNum: 113431,
      TxId: 2621,
      TxHash:
        "0x0f3956591792f76e2878e7aa57829899296ac84a96e0597425c94dbef34afb32",
      TimeStamp: 1699452241,
      DateTime: "2023-11-08T14:04:01Z",
      TokenId: 240,
      TokenName: "12345",
    },
  ];
  render(<NameHistoryTable list={mockData} />);
  expect(
    screen.getByText(convertTimestampToDateTime(mockData[0].TimeStamp))
  ).toBeInTheDocument();
  expect(screen.getByText(mockData[0].TokenName)).toBeInTheDocument();
});

test("NameHistoryTable with no token name", async () => {
  const mockData = [
    {
      EvtLogId: 8641,
      BlockNum: 113437,
      TxId: 2624,
      TxHash:
        "0xc42a12c2f7c34a3e3181710da0680549c66ece70be4f1085f8c8479fa7616d61",
      TimeStamp: 1699452340,
      DateTime: "2023-11-08T14:05:40Z",
      TokenId: 240,
      TokenName: "",
    },
  ];
  render(<NameHistoryTable list={mockData} />);
  expect(
    screen.getByText(convertTimestampToDateTime(mockData[0].TimeStamp))
  ).toBeInTheDocument();
  expect(screen.getByText("Token name was removed.")).toBeInTheDocument();
});

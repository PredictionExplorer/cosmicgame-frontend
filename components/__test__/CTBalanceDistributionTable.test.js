import { render, screen } from "@testing-library/react";
import CTBalanceDistributionTable from "../CTBalanceDistributionTable";
import "@testing-library/jest-dom";

test("CTBalanceDistributionTable with no records", () => {
  render(<CTBalanceDistributionTable list={[]} />);
  expect(screen.getByText("No tokens yet.")).toBeInTheDocument();
});

test("CTBalanceDistributionTable with mock data", () => {
  const mockData = [
    {
      OwnerAid: 77430,
      OwnerAddr: "0x555eced709352759Ed0f1317dfC0a5FEf1310e60",
      BalanceFloat: 3.10041564272868614,
    },
  ];
  render(<CTBalanceDistributionTable list={mockData} />);
  expect(screen.getByText(mockData[0].OwnerAddr)).toBeInTheDocument();
  expect(screen.getByText(mockData[0].BalanceFloat)).toBeInTheDocument();
});

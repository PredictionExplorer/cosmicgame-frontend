import { render, screen } from "@testing-library/react";
import { CTBalanceDistributionTable } from "../tokens/CTBalanceDistributionTable";
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
  // AddressLink shows full address on desktop or shortened (0x555ece....310e60) on mobile
  const addressEl =
    screen.queryByText(mockData[0].OwnerAddr) ||
    screen.queryByText(/0x555ece.*310e60/);
  expect(addressEl).toBeInTheDocument();
  // Component displays balance with toFixed(6)
  expect(
    screen.getByText(mockData[0].BalanceFloat.toFixed(6))
  ).toBeInTheDocument();
});

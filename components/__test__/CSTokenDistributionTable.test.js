import { render, screen } from "@testing-library/react";
import CSTokenDistributionTable from "../CSTokenDistributionTable";
import "@testing-library/jest-dom";

test("CSTokenDistributionTable with no records", () => {
  render(<CSTokenDistributionTable list={[]} />);
  expect(screen.getByText("No tokens yet.")).toBeInTheDocument();
});

test("CSTokenDistributionTable with mock data", () => {
  const mockData = [
    {
      OwnerAid: 77430,
      OwnerAddr: "0x555eced709352759Ed0f1317dfC0a5FEf1310e60",
      NumTokens: 3,
    },
  ];
  render(<CSTokenDistributionTable list={mockData} />);
  expect(screen.getByText(mockData[0].OwnerAddr)).toBeInTheDocument();
  expect(screen.getByText(mockData[0].NumTokens)).toBeInTheDocument();
});

import { render, screen } from "@testing-library/react";
import DonatedNFTDistributionTable from "../DonatedNFTDistributionTable";
import "@testing-library/jest-dom";

test("DonatedNFTDistributionTable with no records", () => {
  render(<DonatedNFTDistributionTable list={[]} />);
  expect(screen.getByText("No bidders yet.")).toBeInTheDocument();
});

test("DonatedNFTDistributionTable with mock data", () => {
  const mockData = [
    {
      ContractAddr: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      NumDonatedTokens: 39,
    },
    {
      ContractAddr: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
      NumDonatedTokens: 6,
    },
  ];
  render(<DonatedNFTDistributionTable list={mockData} />);
  expect(screen.getByText(mockData[0].ContractAddr)).toBeInTheDocument();
  expect(screen.getByText(mockData[0].NumDonatedTokens)).toBeInTheDocument();
});

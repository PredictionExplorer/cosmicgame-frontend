import { render, screen, act } from "@testing-library/react";
import LatestNFTs from "../LatestNFTs";
import "@testing-library/jest-dom";

test("LatestNFTs with no records", () => {
  render(<LatestNFTs />);
  expect(screen.getByText("Latest NFT's")).toBeInTheDocument();
  expect(screen.getByText("There is no NFT yet.")).toBeInTheDocument();
});

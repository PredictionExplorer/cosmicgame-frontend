import { render, screen } from "@testing-library/react";
import NFTImage from "../nft/NFTImage";
import { getAssetsUrl } from "../../utils";
import "@testing-library/jest-dom";

test("NFTImage with src", () => {
  const mockData = getAssetsUrl("cosmicsignature/000000.png");
  render(<NFTImage src={mockData} />);
  expect(screen.getByAltText("nft image").getAttribute("src")).toEqual(
    mockData
  );
});

test("NFTImage with no src", () => {
  const mockData = "";
  render(<NFTImage src={mockData} />);
  expect(screen.getByAltText("nft image").getAttribute("src")).toEqual(
    "/images/qmark.png"
  );
});

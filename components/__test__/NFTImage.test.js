import { render, screen } from "@testing-library/react";
import NFTImage from "../NFTImage";
import "@testing-library/jest-dom";

test("NFTImage with src", () => {
  const mockData = "https://cosmic-game2.s3.us-east-2.amazonaws.com/000000.png";
  render(<NFTImage src={mockData} />);
  setTimeout(() => {
    expect(screen.getByAltText("nft image").getAttribute("src")).toEqual(
      mockData
    );
  }, 1000);
});

test("NFTImage with no src", () => {
  const mockData = "";
  render(<NFTImage src={mockData} />);
  setTimeout(() => {
    expect(screen.getByAltText("nft image").getAttribute("src")).toEqual(
      "/images/qmark.png"
    );
  }, 1000);
});

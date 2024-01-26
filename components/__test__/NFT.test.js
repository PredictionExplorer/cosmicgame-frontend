import { render, screen } from "@testing-library/react";
import NFT from "../NFT";
import "@testing-library/jest-dom";
import { formatId } from "../../utils";

test("NFT with mock data", () => {
  const mockData = {
    EvtLogId: 8285,
    BlockNum: 59198,
    TimeStamp: 1694133281,
    DateTime: "2023-09-08T00:34:41Z",
    TxId: 2491,
    TxHash:
      "0x3b4001ea7d348cd9dd7d10fa4a7c3e73942ad7f4572031395d85f805a81ae600",
    LogIndex: 0,
    ContractAddr: "",
    TokenId: 211,
    WinnerAid: 10,
    WinnerAddr: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    CurOwnerAid: 22,
    CurOwnerAddr: "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
    Seed: "35e6548c4475b6e4322a3ef49c273563251f2e12cfdfb34fa034af404564839b",
    RoundNum: 21,
    RecordType: 1,
    TokenName: "Six",
  };
  render(<NFT nft={mockData} />);

  const fileName = mockData.TokenId.toString().padStart(6, "0");
  const image = `https://cosmic-game2.s3.us-east-2.amazonaws.com/${fileName}.png`;
  setTimeout(() => {
    expect(screen.getByAltText("nft image").getAttribute("src")).toEqual(image);
  }, 1000);
  expect(screen.getByText(formatId(mockData.TokenId))).toBeInTheDocument();
  expect(screen.getByText(mockData.TokenName)).toBeInTheDocument();
});

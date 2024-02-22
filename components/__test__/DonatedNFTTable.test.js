import { render, screen, act } from "@testing-library/react";
import DonatedNFTTable from "../DonatedNFTTable";
import "@testing-library/jest-dom";
import { convertTimestampToDateTime, shortenHex } from "../../utils";
import axios from "axios";

test("DonatedNFTTable with no records", () => {
  render(<DonatedNFTTable list={[]} />);
  expect(screen.getByText("No NFTs yet.")).toBeInTheDocument();
});

test("DonatedNFTTable with mock data", async () => {
  const mockData = [
    {
      RecordId: 45,
      EvtId: 0,
      BlockNum: 71474,
      TimeStamp: 1694659504,
      DateTime: "2023-09-14T02:45:04Z",
      TxId: 2509,
      TxHash:
        "0xb9166d0e8449d5b63993e221ae888a0a1e57cd258cd45871bb133723a0488486",
      RoundNum: 23,
      Index: 0,
      TokenAddr: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      NFTTokenId: 13000081,
      NFTTokenURI: "https://token.artblocks.io/13000081",
      WinnerIndex: 44,
      WinnerAid: 10,
      WinnerAddr: "",
      DonorAddr: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    },
  ];
  render(<DonatedNFTTable list={mockData} />);
  expect(
    screen.getByText(convertTimestampToDateTime(mockData[0].TimeStamp))
  ).toBeInTheDocument();
  expect(
    screen.getByText(shortenHex(mockData[0].DonorAddr, 6))
  ).toBeInTheDocument();
  expect(screen.getByText(mockData[0].RoundNum)).toBeInTheDocument();
  expect(
    screen.getByText(shortenHex(mockData[0].TokenAddr, 6))
  ).toBeInTheDocument();
  expect(
    screen.getByText(mockData[0].NFTTokenId || mockData[0].TokenId)
  ).toBeInTheDocument();

  let result;
  await act(async () => {
    result = await axios.get(mockData[0].NFTTokenURI);
  });
  setTimeout(() => {
    expect(screen.getByAltText("nft image").getAttribute("src")).toEqual(
      result.data.image
    );
  }, 1000);

  expect(screen.getByTestId("Claim Button").textContent).toEqual("Claim");
});

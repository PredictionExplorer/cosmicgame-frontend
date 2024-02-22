import { render, screen } from "@testing-library/react";
import BiddingHistoryTable from "../BiddingHistoryTable";
import "@testing-library/jest-dom";
import { convertTimestampToDateTime, shortenHex } from "../../utils";

test("BiddingHistoryTable with no records", () => {
  render(<BiddingHistoryTable biddingHistory={[]} />);
  expect(screen.getByText("No bid history yet.")).toBeInTheDocument();
});

test("BiddingHistoryTable with mock data", () => {
  const mockData = [
    {
      EvtLogId: 5621730,
      BlockNum: 1737504,
      TxId: 895134,
      TxHash:
        "0xb1cf0f7147701aeb2d8b4645f84add966b2bee1d098e899eaf1aa1548dff04e0",
      TimeStamp: 1701346718,
      DateTime: "2023-11-30T12:18:38Z",
      BidderAid: 77430,
      BidderAddr: "0x555eced709352759Ed0f1317dfC0a5FEf1310e60",
      BidPrice: "100415642728686138",
      BidPriceEth: 0.10041564272868614,
      RWalkNFTId: -1,
      RoundNum: 4,
      ERC20_Amount: "100000000000000000000",
      ERC20_AmountEth: 100,
      NFTDonationTokenId: -1,
      NFTDonationTokenAddr: "",
      NFTTokenURI: "",
      ImageURL: "",
      Message: "RANDOMWALKNFTS(consistent joe)",
    },
  ];
  render(<BiddingHistoryTable biddingHistory={mockData} />);
  expect(
    screen.getByText(convertTimestampToDateTime(mockData[0].TimeStamp))
  ).toBeInTheDocument();
  expect(
    screen.getByText(shortenHex(mockData[0].BidderAddr, 6))
  ).toBeInTheDocument();
  expect(
    screen.getByText(`${mockData[0].BidPriceEth.toFixed(7)}Ξ`)
  ).toBeInTheDocument();
  expect(screen.getByText(mockData[0].RoundNum)).toBeInTheDocument();
  expect(screen.getByText(mockData[0].Message)).toBeInTheDocument();
});

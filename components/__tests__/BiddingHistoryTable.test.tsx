import { render, screen } from '../../test-utils';
import BiddingHistoryTable from '../tables/BiddingHistoryTable';
import '@testing-library/jest-dom';
import { convertTimestampToDateTime, shortenHex } from '../../utils';

describe('BiddingHistoryTable', () => {
  test('with no records', () => {
    render(<BiddingHistoryTable biddingHistory={[]} />);
    expect(screen.getByText('No bid history yet.')).toBeInTheDocument();
  });

  test('with mock data', () => {
    const mockData = [
      {
        EvtLogId: 5621730,
        BlockNum: 1737504,
        TxId: 895134,
        TxHash: '0xb1cf0f7147701aeb2d8b4645f84add966b2bee1d098e899eaf1aa1548dff04e0',
        TimeStamp: 1701346718,
        DateTime: '2023-11-30T12:18:38Z',
        BidderAid: 77430,
        BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        BidPrice: '100415642728686138',
        EthPriceEth: 0.10041564272868614,
        BidType: 0,
        RWalkNFTId: -1,
        RoundNum: 4,
        ERC20_Amount: '100000000000000000000',
        ERC20RewardAmountEth: 100,
        NFTDonationTokenId: -1,
        NFTDonationTokenAddr: '',
        NFTTokenURI: '',
        ImageURL: '',
        Message: 'RANDOMWALKNFTS(consistent joe)',
      },
    ];
    render(<BiddingHistoryTable biddingHistory={mockData} />);
    // Component uses convertTimestampToDateTime(ts, true) - includes seconds
    expect(
      screen.getByText(convertTimestampToDateTime(mockData[0]!.TimeStamp, true)),
    ).toBeInTheDocument();
    expect(screen.getByText(shortenHex(mockData[0]!.BidderAddr, 6))).toBeInTheDocument();
    // Component displays "X ETH" suffix, not "Ξ"
    expect(screen.getByText(`${mockData[0]!.EthPriceEth.toFixed(7)} ETH`)).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.RoundNum)).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.Message)).toBeInTheDocument();
  });
});

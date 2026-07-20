// lexicon-allow-start: test fixture names preserve legacy event terminology

import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import GestureHistoryTable from '@/components/tables/GestureHistoryTable';

import { render, screen, checkA11y } from '@/test-utils';

const mockConvertTimestampToDateTime = jest.fn();
const mockFormatSeconds = jest.fn();
jest.mock('@/utils', () => {
  const actual = jest.requireActual<typeof import('@/utils')>('@/utils');
  return {
    ...actual,
    convertTimestampToDateTime: (timestamp: number, showSecond?: boolean, locale?: string) => {
      mockConvertTimestampToDateTime(timestamp, showSecond, locale);
      return actual.convertTimestampToDateTime(timestamp, showSecond, locale);
    },
    formatSeconds: (seconds: number, locale?: string) => {
      mockFormatSeconds(seconds, locale);
      return actual.formatSeconds(seconds, locale);
    },
  };
});

beforeEach(() => jest.clearAllMocks());

describe('GestureHistoryTable', () => {
  test('with no records', () => {
    render(<GestureHistoryTable gestureHistory={[]} />);
    expect(screen.getByText('tables.empty.gestures')).toBeInTheDocument();
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
        GestureCost: '100415642728686138',
        EthPriceEth: 0.10041564272868614,
        GestureType: 0,
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
    render(<GestureHistoryTable gestureHistory={mockData} />);
    // Component uses convertTimestampToDateTime(ts, true) - includes seconds
    expect(
      screen.getByText(convertTimestampToDateTime(mockData[0]!.TimeStamp, true)),
    ).toBeInTheDocument();
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(1701346718, true, 'en');
    expect(mockFormatSeconds).toHaveBeenCalledWith(expect.any(Number), 'en');
    expect(screen.getByText(shortenHex(mockData[0]!.BidderAddr, 6))).toBeInTheDocument();
    // Component displays "X ETH" suffix, not "Ξ"
    expect(screen.getByText(`${mockData[0]!.EthPriceEth.toFixed(7)} ETH`)).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.RoundNum)).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.Message)).toBeInTheDocument();
  });

  test('shows CST cost and gesture type for CST bids', () => {
    render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 2,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 2,
            CstPriceEth: 25.5,
            EthPriceEth: -1,
            RoundNum: 0,
            Message: 'CST bid',
          },
        ]}
        showRound={false}
      />,
    );

    expect(screen.getByText('25.5000 CST')).toBeInTheDocument();
    expect(screen.getByText('CST')).toBeInTheDocument();
  });

  test('uses localized alt text for the Random Walk NFT image', () => {
    render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 3,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 1,
            EthPriceEth: 0.1,
            RWalkNFTId: 42,
          },
        ]}
        showRound={false}
      />,
    );

    expect(screen.getByAltText('tables.gestureHistory.randomWalkImageAlt')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureHistoryTable gestureHistory={[]} />);
    await checkA11y(container);
  });
});

// lexicon-allow-end

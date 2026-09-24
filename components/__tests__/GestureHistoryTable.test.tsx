// lexicon-allow-start: test fixture names preserve legacy event terminology

import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import GestureHistoryTable from '@/components/tables/GestureHistoryTable';

import { render, screen, checkA11y } from '@/test-utils';

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
    expect(document.querySelector('time[datetime="2023-11-30T12:18:38.000Z"]')).toBeInTheDocument();
    expect(screen.getByText(shortenHex(mockData[0]!.BidderAddr, 6))).toBeInTheDocument();
    // The cost reads at the ledger precision with its unit, never "Ξ".
    expect(screen.getByText('0.1004').textContent).toBe('0.1004\u00a0ETH');
    // The cycle links to its allocation page.
    expect(screen.getByRole('link', { name: '4' })).toHaveAttribute('href', '/allocation/4');
    expect(screen.getByText(mockData[0]!.Message)).toBeInTheDocument();
    // The method is a tag, not a row tint.
    expect(screen.getAllByText('ETH').length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('tbody tr')).not.toHaveAttribute('style');
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

    expect(screen.getByText('25.50').textContent).toBe('25.50\u00a0CST');
    expect(screen.getAllByText('CST').length).toBeGreaterThanOrEqual(1);
  });

  test('drops the info and message columns when no gesture has either', () => {
    const { container } = render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 9,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 0,
            EthPriceEth: 0.1,
            RoundNum: 1,
          },
        ]}
      />,
    );
    const headers = Array.from(container.querySelectorAll('th')).map((th) => th.textContent);
    expect(headers).not.toContain('tables.columns.gestureInfo');
    expect(headers).not.toContain('tables.columns.message');
    // No labelled blank line survives on a phone record.
    expect(container.querySelector('td[data-label="tables.columns.gestureInfo"]')).toBeNull();
  });

  test('pages 20 gestures at a time, each leading to its gesture page', () => {
    const list = Array.from({ length: 25 }, (_, i) => ({
      EvtLogId: 1000 + i,
      TimeStamp: 1701346718 - i * 60,
      BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
      GestureType: 0,
      EthPriceEth: 0.1,
      RoundNum: 1,
    }));
    const { container } = render(<GestureHistoryTable gestureHistory={list} showRound={false} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(
      screen.getByRole('link', { name: 'tables.gestureHistory.viewGesture(id=1000)' }),
    ).toHaveAttribute('href', '/gesture/1000');
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

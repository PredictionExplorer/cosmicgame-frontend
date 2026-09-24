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
    // The cycle reads "Cycle 4" and links to its allocation page (the live
    // cycle is not known here, so every cycle leads to its record).
    expect(screen.getByRole('link', { name: 'tables.allocation.cycle(cycle=4)' })).toHaveAttribute(
      'href',
      '/allocation/4',
    );
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
      BidPosition: 25 - i,
      TimeStamp: 1701346718 - i * 60,
      BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
      GestureType: 0,
      EthPriceEth: 0.1,
      RoundNum: 1,
    }));
    const { container } = render(<GestureHistoryTable gestureHistory={list} showRound={false} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    // WCAG 2.5.3: the link's name starts with the date it shows (plus the
    // method tag that rides on the date line on phones; CSS hides it from
    // sm, jsdom does not), then names the gesture by the number its own
    // page carries in its title.
    const date = convertTimestampToDateTime(list[0]!.TimeStamp, true);
    const link = screen.getByRole('link', {
      name: `${date} ETH tables.gestureHistory.viewGesture(position=25)`,
    });
    expect(link).toHaveAttribute('href', '/gesture/1000');
    expect(link).not.toHaveAttribute('aria-label');
  });

  test('names a gesture link by its date alone when its position is unknown', () => {
    render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 77,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 0,
            EthPriceEth: 0.1,
          },
        ]}
        showRound={false}
      />,
    );
    // The date and the phone-only method tag on its line, nothing after them.
    expect(
      screen.getByRole('link', { name: `${convertTimestampToDateTime(1701346718, true)} ETH` }),
    ).toHaveAttribute('href', '/gesture/77');
  });

  test("drops who and how long on a participant's own page", () => {
    const { container } = render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 11,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 0,
            EthPriceEth: 0.1,
            RoundNum: 1,
          },
        ]}
        showParticipant={false}
        showHold={false}
      />,
    );
    const headers = Array.from(container.querySelectorAll('th')).map((th) => th.textContent);
    expect(headers).not.toContain('tables.columns.participant');
    expect(headers).not.toContain('tables.columns.gestureDuration');
    expect(headers).toContain('tables.columns.gestureCost');
  });

  test('holds a finished cycle’s last gesture until the cycle ended', () => {
    // Regression: on /allocation/N the newest gesture's hold kept ticking
    // forever ("43d 4h 6m 3s" on cycle 1).
    const gesture = (id: number, timeStamp: number) => ({
      EvtLogId: id,
      TimeStamp: timeStamp,
      BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
      GestureType: 0,
      EthPriceEth: 0.1,
      RoundNum: 1,
    });
    const { container } = render(
      <GestureHistoryTable
        gestureHistory={[gesture(2, 1_700_000_600), gesture(1, 1_700_000_000)]}
        showRound={false}
        heldUntil={1_700_004_239}
      />,
    );
    const holds = Array.from(container.querySelectorAll('td[data-kind="duration"]')).map((cell) =>
      cell.textContent?.replace(/\s+/g, ' '),
    );
    expect(holds).toEqual(['1h 0m 39s', '10m']);
  });

  test('names the Random Walk NFT a gesture used as a link, with no image to break', () => {
    render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 3,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 1,
            EthPriceEth: 0.1,
            RWalkNFTId: 987654,
          },
        ]}
        showRound={false}
      />,
    );

    const walk = screen.getByText('tables.gestureHistory.randomWalkToken(id=#987654)');
    expect(walk.closest('a')).toHaveAttribute('href', 'https://randomwalknft.com/detail/987654');
    expect(document.querySelector('td img')).toBeNull();
  });

  test('lists an attached NFT as data, linked to the token', () => {
    render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 4,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 0,
            EthPriceEth: 0.1,
            NFTDonationTokenAddr: '0xabcdef0123456789abcdef0123456789abcdef01',
            NFTDonationTokenId: 123456,
          },
        ]}
        showRound={false}
      />,
    );

    expect(screen.getByText('tables.gestureHistory.attached')).toBeInTheDocument();
    const nft = screen.getByText('tables.recipientHistory.nft(id=123456)');
    expect(nft.closest('a')?.getAttribute('href')).toMatch(
      /\/token\/0xabcdef0123456789abcdef0123456789abcdef01\?a=123456$/,
    );
  });

  test('shows a long message in two lines with a way to read all of it', () => {
    const message = 'x'.repeat(400);
    render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 5,
            TimeStamp: 1701346718,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 0,
            EthPriceEth: 0.1,
            Message: message,
          },
        ]}
        showRound={false}
      />,
    );
    const text = screen.getByText(message);
    // Never a hover-only tooltip: the text is in the cell, clamped by CSS,
    // and breaks anywhere rather than widen the table.
    expect(text).toHaveClass('sm:line-clamp-2', '[overflow-wrap:anywhere]');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('reads as lines on a phone: the method on the date line, the cycle only when it varies', () => {
    const gesture = (id: number, round: number) => ({
      EvtLogId: id,
      TimeStamp: 1_700_000_000 + id,
      BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
      GestureType: 2,
      CstPriceEth: 25.5,
      RoundNum: round,
    });
    const cellOf = (container: HTMLElement, kind: string) =>
      container.querySelector(`tbody tr td[data-kind="${kind}"]`);

    const { container, unmount } = render(
      <GestureHistoryTable
        gestureHistory={[gesture(2, 2), gesture(1, 2)]}
        showParticipant={false}
        showHold={false}
      />,
    );
    // The type column is dropped on phones; its tag rides on the date line.
    const typeHeader = screen.getByRole('columnheader', { name: /tables.columns.gestureType/ });
    expect(typeHeader).toHaveAttribute('data-priority', 'secondary');
    const dateTag = cellOf(container, 'datetime')?.querySelector('.sm\\:hidden');
    expect(dateTag).toHaveTextContent('CST');
    // One cycle in the list: each record would repeat it, so phones drop it.
    expect(cellOf(container, 'link')).toHaveAttribute('data-priority', 'secondary');
    unmount();

    const spanning = render(
      <GestureHistoryTable
        gestureHistory={[gesture(2, 3), gesture(1, 2)]}
        showParticipant={false}
        showHold={false}
      />,
    );
    expect(cellOf(spanning.container, 'link')).toHaveAttribute('data-priority', 'primary');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureHistoryTable gestureHistory={[]} />);
    await checkA11y(container);
  });
});

// lexicon-allow-end

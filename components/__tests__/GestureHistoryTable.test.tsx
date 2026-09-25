// lexicon-allow-start: test fixture names preserve legacy event terminology

import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { formatAddress } from '@/utils';
import { phoneRecords, wideLedger } from '@/test-utils/ledger';

import GestureHistoryTable, { holdDurations } from '@/components/tables/GestureHistoryTable';

import { render, screen, checkA11y, within } from '@/test-utils';

/** The hidden-message list: read, and hiding nothing, unless a test says otherwise. */
const mockUseBannedGestures = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  ...jest.requireActual('@/hooks/useApiQuery'),
  useBannedGestures: () => mockUseBannedGestures(),
}));

beforeEach(() => {
  mockUseBannedGestures.mockReturnValue({ data: [], isError: false, refetch: jest.fn() });
});

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
    const { container } = render(<GestureHistoryTable gestureHistory={mockData} />);
    const wide = within(wideLedger(container));
    // The date with seconds, in UTC (as on the server).
    expect(wide.getAllByText('Nov 30, 2023, 12:18:38')).toHaveLength(1);
    expect(document.querySelector('time[datetime="2023-11-30T12:18:38.000Z"]')).toBeInTheDocument();
    expect(wide.getAllByText(formatAddress(mockData[0]!.BidderAddr))).toHaveLength(1);
    // The cost reads at the ledger precision with its unit, never "Ξ".
    expect(wide.getByText('0.1004').textContent).toBe('0.1004\u00a0ETH');
    // The cycle reads "Cycle 4" and links to its allocation page (the live
    // cycle is not known here, so every cycle leads to its record).
    expect(wide.getByRole('link', { name: 'tables.allocation.cycle(cycle=4)' })).toHaveAttribute(
      'href',
      '/allocation/4',
    );
    expect(screen.getByText(mockData[0]!.Message)).toBeInTheDocument();
    // The method is a tag beside the cost's unit, not a row tint.
    expect(wide.getAllByText('ETH')).toHaveLength(2);
    expect(document.querySelector('tbody tr')).not.toHaveAttribute('style');
  });

  test('shows CST cost and gesture type for CST bids', () => {
    const { container } = render(
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

    const wide = within(wideLedger(container));
    expect(wide.getByText('25.50').textContent).toBe('25.50\u00a0CST');
    expect(wide.getAllByText('CST').length).toBeGreaterThanOrEqual(1);
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
    // WCAG 2.5.3: the link's name starts with the date it shows, then names
    // the gesture by the number its own page carries in its title. The
    // ledger's cell and the phone record (one of them hidden by CSS) say
    // the same.
    const date = 'Nov 30, 2023, 12:18:38';
    const links = screen.getAllByRole('link', {
      name: `${date} tables.gestureHistory.viewGesture(position=25)`,
    });
    expect(links).toHaveLength(2);
    expect(phoneRecords(container)[0]).toContainElement(links[1]!);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/gesture/1000');
      expect(link).not.toHaveAttribute('aria-label');
    }
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
    // The date, nothing after it.
    for (const link of screen.getAllByRole('link', { name: 'Nov 30, 2023, 12:18:38' })) {
      expect(link).toHaveAttribute('href', '/gesture/77');
    }
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
    // Fixed clock fields, so the right-aligned column lines up.
    expect(holds).toEqual(['01:00:39', '00:10:00']);
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
    // The one Random Walk host every link uses (utils/urls randomWalkTokenUrl).
    expect(walk.closest('a')).toHaveAttribute(
      'href',
      'https://www.randomwalknft.com/detail/987654',
    );
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

  test('reads each gesture as a two-line record on a phone', () => {
    // V230: when and who on the first line; the cost with its method's dot
    // and the hold on the second, at the end edge, with no label repeated.
    const { container } = render(
      <GestureHistoryTable
        gestureHistory={[
          {
            EvtLogId: 12,
            BidPosition: 3,
            TimeStamp: 1_700_000_600,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 2,
            CstPriceEth: 25.5,
            RoundNum: 2,
          },
          {
            EvtLogId: 11,
            BidPosition: 2,
            TimeStamp: 1_700_000_000,
            BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
            GestureType: 1,
            EthPriceEth: 0.1,
            RoundNum: 2,
          },
        ]}
        heldUntil={1_700_004_239}
      />,
    );
    const [first, second] = phoneRecords(container);
    const [line1, line2] = Array.from(first!.children);

    // Line 1: the date is the row link; the participant is its own link.
    const dateLink = within(line1 as HTMLElement).getByRole('link', {
      name: /tables\.gestureHistory\.viewGesture\(position=3\)$/,
    });
    expect(dateLink).toHaveAttribute('href', '/gesture/12');
    expect(
      within(line1 as HTMLElement)
        .getByRole('link', { name: /0x555e/ })
        .getAttribute('href'),
    ).toMatch(/^\/user\/0x555e/i);
    expect(container.querySelector('tbody a a')).toBeNull();

    // Line 2, at the end edge: the method named for a screen reader, the
    // cost with its unit, the hold after its spoken name.
    expect(line2).toHaveClass('justify-end');
    expect(line2).toHaveTextContent(
      /^CST\s*25\.50\sCST\s*·\s*tables\.columns\.gestureDuration\s*01:00:39$/,
    );
    expect(second).toHaveTextContent(/ETH \+ RWLK\s*0\.1000\sETH/);

    // One cycle in the list: no record repeats it. Every column the record
    // says leaves the phone.
    expect(first).not.toHaveTextContent('tables.allocation.cycle');
    const omitted = Array.from(container.querySelectorAll('tbody tr:first-child td'))
      .filter((cell) => cell.getAttribute('data-phone') === 'omit')
      .map((cell) => cell.getAttribute('data-label'));
    expect(omitted).toEqual([
      'tables.columns.participant',
      'tables.columns.gestureCost',
      'tables.columns.cycle',
      'tables.columns.gestureType',
      'tables.columns.gestureDuration',
    ]);
  });

  test("leads a participant's record with the cost, and names the cycle only when it varies", () => {
    const gesture = (id: number, round: number) => ({
      EvtLogId: id,
      TimeStamp: 1_700_000_000 + id,
      BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
      GestureType: 2,
      CstPriceEth: 25.5,
      RoundNum: round,
    });

    const oneCycle = render(
      <GestureHistoryTable
        gestureHistory={[gesture(2, 2), gesture(1, 2)]}
        showParticipant={false}
        showHold={false}
      />,
    );
    const [record] = phoneRecords(oneCycle.container);
    // Every gesture is theirs: the cost takes the first line's end.
    expect(record!.firstElementChild).toHaveTextContent(/25\.50\sCST$/);
    expect(record).not.toHaveTextContent('0x555e');
    // One line: nothing to say under it.
    expect(record!.children).toHaveLength(1);
    oneCycle.unmount();

    const spanning = render(
      <GestureHistoryTable
        gestureHistory={[gesture(2, 3), gesture(1, 2)]}
        showParticipant={false}
        showHold={false}
      />,
    );
    const line2 = phoneRecords(spanning.container)[0]!.children[1] as HTMLElement;
    expect(
      within(line2).getByRole('link', { name: 'tables.allocation.cycle(cycle=3)' }),
    ).toHaveAttribute('href', '/allocation/3');
    expect(line2).not.toHaveClass('justify-end');
  });

  describe('moderation', () => {
    const withMessage = (id: number, message: string) => ({
      EvtLogId: id,
      TimeStamp: 1701346718 - id,
      BidderAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
      GestureType: 0,
      EthPriceEth: 0.1,
      Message: message,
    });

    test('leaves out the message of a gesture moderation hid', () => {
      mockUseBannedGestures.mockReturnValue({ data: [{ bid_id: 2 }], isError: false });
      render(
        <GestureHistoryTable
          gestureHistory={[withMessage(2, 'Hidden'), withMessage(3, 'Shown')]}
          showRound={false}
        />,
      );
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
      expect(screen.getByText('Shown')).toBeInTheDocument();
    });

    test('holds every message back while the hidden list loads', () => {
      // Regression: the ledger showed every message until the list that
      // hides some of them arrived, and kept showing them when it failed.
      mockUseBannedGestures.mockReturnValue({ data: undefined, isError: false });
      const { container } = render(
        <GestureHistoryTable gestureHistory={[withMessage(2, 'Hidden')]} showRound={false} />,
      );
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
      // The column keeps its place with a placeholder, so nothing jumps.
      const cell = container.querySelector('td[data-label="tables.columns.message"]');
      expect(cell?.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    });

    test('holds every message back, with a notice and a retry, when the hidden list fails', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseBannedGestures.mockReturnValue({ data: undefined, isError: true, refetch });
      render(
        <GestureHistoryTable
          gestureHistory={[withMessage(2, 'Hidden')]}
          showRound={false}
          headingLevel={3}
        />,
      );

      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('columnheader', { name: 'tables.columns.message' }),
      ).not.toBeInTheDocument();
      // The gestures themselves still read; only their messages wait.
      expect(screen.getAllByRole('row')).toHaveLength(2);
      expect(
        screen.getByRole('heading', { level: 3, name: 'tables.gestureHistory.messagesHeld.title' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Try again' }));
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    test('says nothing is held back where no gesture carries a message', () => {
      mockUseBannedGestures.mockReturnValue({ data: undefined, isError: true, refetch: jest.fn() });
      render(<GestureHistoryTable gestureHistory={[withMessage(2, '')]} showRound={false} />);
      expect(
        screen.queryByText('tables.gestureHistory.messagesHeld.title'),
      ).not.toBeInTheDocument();
    });
  });

  // Regression: each hold was measured to the row before it in the list, so
  // a list that arrived oldest first got every duration wrong.
  test('measures each hold to the next gesture in time, whatever the order', () => {
    const gestures = [
      { EvtLogId: 1, TimeStamp: 1_000 },
      { EvtLogId: 3, TimeStamp: 1_900 },
      { EvtLogId: 2, TimeStamp: 1_300 },
    ];
    const holds = holdDurations(gestures, 2_000);
    expect(holds.get(1)).toBe(300);
    expect(holds.get(2)).toBe(600);
    expect(holds.get(3)).toBe(100);
    expect(holdDurations([...gestures].reverse(), 2_000)).toEqual(holds);
    // The cycle in progress: the newest is still holding.
    expect(holdDurations(gestures, null).get(3)).toBeNull();
  });

  test('says it lists the newest first, so a first click on the date turns it around', async () => {
    const user = userEvent.setup();
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
      />,
    );
    const date = screen.getByRole('columnheader', { name: /tables\.columns\.datetime/ });
    expect(date).toHaveAttribute('aria-sort', 'descending');

    await user.click(within(date).getByRole('button'));
    expect(date).toHaveAttribute('aria-sort', 'ascending');
    expect(container.querySelector('tbody tr a')).toHaveAttribute('href', '/gesture/1');
    expect(within(phoneRecords(container)[0]!).getAllByRole('link')[0]).toHaveAttribute(
      'href',
      '/gesture/1',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureHistoryTable gestureHistory={[]} />);
    await checkA11y(container);
  });
});

// lexicon-allow-end

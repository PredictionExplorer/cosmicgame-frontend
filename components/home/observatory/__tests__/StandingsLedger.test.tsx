import type { ChampionsState } from '@/hooks/useChampions';
import type { GestureInfo } from '@/services/api';

import { render, screen, within, checkA11y } from '@/test-utils';

import { StandingsLedger } from '../StandingsLedger';

const LATEST = '0x1111111111111111111111111111111111111111';
const ENDURANCE = '0x2222222222222222222222222222222222222222';
const CHRONO = '0x3333333333333333333333333333333333333333';
const FINAL_CST = '0x4444444444444444444444444444444444444444';

function makeChampions(overrides: Partial<ChampionsState> = {}): ChampionsState {
  return {
    isLoading: false,
    hasData: true,
    endurance: { address: ENDURANCE, duration: 3600, lockedDuration: 3600, isLive: false },
    chrono: { address: CHRONO, duration: 7200, lockedDuration: 7200, isLive: false },
    chronoChallenge: {
      address: ENDURANCE,
      duration: 3000,
      recordToBeat: 7200,
      isLive: false,
      isRecordHolder: false,
      hasDetails: true,
      startsGrowingIn: 4201,
    },
    lastCst: { address: FINAL_CST },
    latestGesture: {
      address: LATEST,
      isTimeKnown: true,
      holdDuration: 900,
      latestGestureTime: 1_700_000_000,
      isCurrentEnduranceChampion: false,
      isExtendingEnduranceRecord: false,
      durationToBeat: 3601,
      secondsUntilEnduranceChampion: 2701,
      progressToEnduranceChampion: 24.99,
    },
    raw: null,
    source: 'api-v2',
    ...overrides,
  };
}

const latestGesture = {
  EvtLogId: 77,
  BlockNum: 100,
  TxId: 7,
  TxHash: '0x77',
  BidPosition: 1141,
  TimeStamp: 1_700_000_000,
  BidderAddr: LATEST,
  RoundNum: 7,
  GestureType: 2,
  CstCost: 214.916,
  GestureCostEth: -1,
  ParticipationCST: 210.0317,
  RWalkNFTId: -1,
  Message: 'The orbit holds.',
} as GestureInfo;

const baseProps = {
  champions: makeChampions(),
  latestGesture,
  gestureDetailsPending: false,
  showLastGesture: true,
  account: null as string | null,
  chronoEth: 2.5835,
};

/** Visible text only: explained terms carry their definitions in hidden nodes. */
const visibleText = (element: HTMLElement) => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], .sr-only').forEach((node) => node.remove());
  return clone.textContent ?? '';
};

describe('StandingsLedger', () => {
  it('sets the four roles as one aligned ledger, each role an explained term', () => {
    render(<StandingsLedger {...baseProps} />);

    const ledger = screen.getByTestId('standings-ledger');
    expect(within(ledger).getByRole('heading', { level: 2 })).toHaveTextContent(
      'home.observatory.standings.title',
    );
    const rows = within(ledger).getAllByRole('listitem');
    expect(rows.map((row) => row.getAttribute('data-testid'))).toEqual([
      'latest-participant-intel',
      'control-desk-endurance',
      'chrono-role-summary',
      'final-cst-role-summary',
    ]);
    expect(
      within(rows[1]!).getByRole('heading', { level: 3 }).querySelector('[data-term]'),
    ).toHaveAttribute('data-term', 'enduranceChampion');
    expect(
      within(rows[2]!).getByRole('heading', { level: 3 }).querySelector('[data-term]'),
    ).toHaveAttribute('data-term', 'chronoWarrior');
    expect(
      within(rows[3]!).getByRole('heading', { level: 3 }).querySelector('[data-term]'),
    ).toHaveAttribute('data-term', 'finalCstGesture');

    // Every value is labelled for assistive technology; the column heads are visual.
    expect(within(rows[1]!).getByText('home.observatory.ledger.columns.holder')).toHaveClass(
      '@[30rem]/ledger:sr-only',
    );
    expect(within(rows[1]!).getByRole('link', { name: /0x2222/ })).toHaveAttribute(
      'href',
      `/user/${ENDURANCE}`,
    );
  });

  it('gives each role its own holder and its record in tabular figures', () => {
    render(<StandingsLedger {...baseProps} />);
    const chrono = screen.getByTestId('chrono-role-summary');
    expect(within(chrono).getByRole('link', { name: /0x3333/ })).toHaveAttribute(
      'href',
      `/user/${CHRONO}`,
    );
    expect(within(chrono).queryByRole('link', { name: /0x2222/ })).not.toBeInTheDocument();
    expect(visibleText(chrono)).toContain('2h');
    expect(visibleText(chrono)).toContain('2.5835');
    expect(visibleText(screen.getByTestId('control-desk-endurance'))).toContain(
      'home.observatory.standings.cstPlusNft',
    );
  });

  it('never paints a confident 0s hold before the clock is known', () => {
    const champions = makeChampions({
      latestGesture: { ...makeChampions().latestGesture, isTimeKnown: false, holdDuration: 0 },
    });
    render(<StandingsLedger {...baseProps} champions={champions} />);

    const latest = screen.getByTestId('latest-participant-intel');
    expect(visibleText(latest)).not.toMatch(/\b0s\b/);
    // The hold and its progress both read as pending (a skeleton and a spoken "Loading").
    expect(within(latest).getAllByText('common.status.loadingEllipsis')).toHaveLength(2);
    expect(within(latest).queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('measures the Last Gesture against the Endurance record on a 2px rule', () => {
    render(<StandingsLedger {...baseProps} />);
    const progress = screen.getByRole('progressbar', {
      name: 'tables.specialAllocation.progressAria',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '24');
    expect(progress).toHaveClass('h-0.5');
    // The time left reads as a clock in its own column, beside a label that
    // never changes, so the row keeps its height while it ticks.
    const countdown = screen.getByTestId('latest-endurance-countdown');
    expect(countdown).toHaveTextContent('home.observatory.ledger.passesRecordIn');
    expect(within(countdown).getByText('00:45:01')).toHaveClass('whitespace-nowrap');
  });

  it('gives every line that ticks a fixed shape, never a wrapping flex row', () => {
    render(<StandingsLedger {...baseProps} />);
    for (const line of [
      screen.getByTestId('latest-endurance-countdown'),
      screen.getByTestId('chrono-challenge-segment'),
      screen.getByTestId('chrono-challenge-next-change'),
    ]) {
      expect(line.className).toMatch(/grid-cols-\[minmax\(0,3fr\)_minmax\(0,2fr\)\]/);
      expect(line.className).not.toMatch(/flex-wrap/);
      expect(line.querySelector('time')).toHaveClass('whitespace-nowrap', 'tabular-nums');
    }
  });

  it('shows what the Last Gesture paid, received and when, with its record one tap away', () => {
    render(<StandingsLedger {...baseProps} />);
    expect(visibleText(screen.getByTestId('latest-participant-paid-amount'))).toContain('214.92');
    expect(visibleText(screen.getByTestId('latest-participant-cst-received'))).toContain('210.03');
    expect(
      within(screen.getByTestId('latest-participant-gesture-id')).getByRole('link'),
    ).toHaveAttribute('href', '/gesture/77');
    expect(screen.getByTestId('latest-participant-message')).toHaveTextContent('The orbit holds.');
  });

  it('says the transaction is syncing while its row has not been indexed', () => {
    render(<StandingsLedger {...baseProps} latestGesture={null} gestureDetailsPending />);
    expect(screen.getByTestId('latest-participant-gesture-syncing')).toHaveTextContent(
      'tables.specialAllocation.gestureDetailsSyncing',
    );
  });

  it('marks the connected wallet in its ranked place, never renaming the row', () => {
    render(<StandingsLedger {...baseProps} account={CHRONO.toUpperCase().replace('0X', '0x')} />);
    const chrono = screen.getByTestId('chrono-role-summary');
    expect(chrono).toHaveAttribute('data-current');
    expect(within(chrono).getByText('tables.status.youBadge')).toBeInTheDocument();
    expect(screen.getByTestId('latest-participant-intel')).not.toHaveAttribute('data-current');
  });

  it('marks the landing of the wallet own Gesture on the Last Gesture row', () => {
    render(
      <StandingsLedger
        {...baseProps}
        account={LATEST}
        moment={{ kind: 'landed', by: null, atMs: 0 }}
      />,
    );
    expect(screen.getByTestId('latest-participant-landed')).toHaveTextContent(
      'home.observatory.standing.landed',
    );
  });

  it('settles a row whose holder just changed with a --live rule', () => {
    const { rerender } = render(<StandingsLedger {...baseProps} />);
    expect(screen.getByTestId('latest-participant-intel')).not.toHaveAttribute('data-settling');

    const moved = makeChampions({
      latestGesture: { ...makeChampions().latestGesture, address: FINAL_CST },
    });
    rerender(<StandingsLedger {...baseProps} champions={moved} />);
    expect(screen.getByTestId('latest-participant-intel')).toHaveAttribute('data-settling');
  });

  it('reads the Endurance reign against the Chrono record under the row it can change', () => {
    render(<StandingsLedger {...baseProps} />);
    const chrono = screen.getByTestId('chrono-role-summary');
    const challenge = within(chrono).getByTestId('chrono-active-challenge');
    // Both lines read as clocks, so the stacked figures share one format.
    expect(within(challenge).getByTestId('chrono-challenge-segment')).toHaveTextContent(
      /home\.observatory\.ledger\.challenge\.reign\s*00:50:00/,
    );
    expect(within(challenge).getByTestId('chrono-challenge-next-change')).toHaveTextContent(
      /home\.observatory\.ledger\.challenge\.passesIn\s*01:10:01/,
    );
    // The reign against the record on the row's own 2px rule: 3000s of 7201s.
    expect(
      within(challenge).getByRole('progressbar', {
        name: 'home.observatory.ledger.challenge.progressAria',
      }),
    ).toHaveAttribute('aria-valuenow', '41');
    // No contest wording ("record to beat", "overtake"), no repeated holder or record.
    expect(challenge.textContent).not.toMatch(/recordToBeat|canOvertakeIn|overtake/i);
    expect(within(challenge).queryByRole('link')).not.toBeInTheDocument();
    expect(visibleText(challenge)).not.toContain('2h');
  });

  it('states an empty role once, under its name, and dashes its holder and time', () => {
    const champions = makeChampions({
      endurance: { address: null, duration: 0, lockedDuration: 0, isLive: false },
      chrono: { address: null, duration: 0, lockedDuration: 0, isLive: false },
      chronoChallenge: { ...makeChampions().chronoChallenge, hasDetails: false },
      lastCst: { address: null },
    });
    render(<StandingsLedger {...baseProps} champions={champions} />);
    expect(screen.getByTestId('control-desk-endurance-empty')).toHaveTextContent(
      'home.observatory.ledger.empty.endurance',
    );
    expect(screen.getByTestId('chrono-role-summary-empty')).toHaveTextContent(
      'home.observatory.ledger.empty.chrono',
    );
    expect(screen.getByTestId('final-cst-role-summary-empty')).toHaveTextContent(
      'home.observatory.ledger.empty.finalCst',
    );
    // A held role has no empty line.
    expect(screen.queryByTestId('latest-participant-intel-empty')).not.toBeInTheDocument();
    // The holder and time held columns read as a dash, and as "None" for readers.
    for (const testId of ['control-desk-endurance', 'chrono-role-summary']) {
      const row = screen.getByTestId(testId);
      for (const column of ['columns.holder', 'columns.time']) {
        const value = within(row).getByText(`home.observatory.ledger.${column}`).nextElementSibling;
        expect(value).toHaveTextContent('—');
        expect(value).toHaveTextContent('tables.status.none');
      }
    }
  });

  it('draws placeholder rows, never "no record yet", until the holders are first read', () => {
    render(
      <StandingsLedger
        {...baseProps}
        champions={makeChampions({ isLoading: true, hasData: false })}
      />,
    );
    const ledger = screen.getByTestId('standings-ledger');
    expect(ledger).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByTestId('standings-ledger-skeleton-row')).toHaveLength(4);
    expect(within(ledger).queryByRole('link')).not.toBeInTheDocument();
    expect(ledger).not.toHaveTextContent('tables.specialAllocation.noEnduranceRecord');
    expect(screen.queryByTestId('chrono-active-challenge')).not.toBeInTheDocument();
    expect(within(ledger).getByText('common.status.loading')).toHaveClass('sr-only');
  });

  it('names the Signature Allocation in the Last Gesture row until a page gives its figure', () => {
    const { rerender } = render(<StandingsLedger {...baseProps} />);
    const latestRow = () => screen.getByTestId('latest-participant-intel');
    // The home: its clock already shows the figure, so the row names it.
    expect(visibleText(latestRow())).toContain('home.observatory.clock.reserveLabel');
    expect(visibleText(latestRow())).not.toContain('8.0735');

    // The cycle page: a figure like the other rows', captioned with its name.
    rerender(<StandingsLedger {...baseProps} signatureEth={8.0735} />);
    expect(visibleText(latestRow())).toContain('8.0735');
    expect(visibleText(latestRow())).toContain('home.observatory.clock.reserveLabel');

    rerender(<StandingsLedger {...baseProps} signatureEth={null} />);
    expect(within(latestRow()).getByText('common.status.unavailable')).toBeInTheDocument();
  });

  it('sits one level deeper, introduced by a line, inside the cycle page', () => {
    render(
      <StandingsLedger
        {...baseProps}
        headingLevel={3}
        headingId="cycle-standings-heading"
        description="tables.specialAllocation.headingHelp"
      />,
    );
    const ledger = screen.getByRole('region', { name: 'home.observatory.standings.title' });
    expect(within(ledger).getByRole('heading', { level: 3 })).toHaveAttribute(
      'id',
      'cycle-standings-heading',
    );
    expect(within(ledger).getAllByRole('heading', { level: 4 })).toHaveLength(4);
    expect(within(ledger).queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.headingHelp')).toBeVisible();
    // Every holder still leads to their participant page.
    const hrefs = within(ledger)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([`/user/${LATEST}`, `/user/${ENDURANCE}`, `/user/${CHRONO}`]),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StandingsLedger {...baseProps} account={LATEST} />);
    await checkA11y(container);
  });

  it('has no accessibility violations at heading level 3 or while loading', async () => {
    const { container, rerender } = render(<StandingsLedger {...baseProps} headingLevel={3} />);
    await checkA11y(container);
    rerender(
      <StandingsLedger
        {...baseProps}
        headingLevel={3}
        champions={makeChampions({ isLoading: true, hasData: false })}
      />,
    );
    await checkA11y(container);
  });
});

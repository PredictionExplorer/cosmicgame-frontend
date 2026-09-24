import type { ChampionsState } from '@/hooks/useChampions';
import type { GestureInfo } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import { StandingsLedger } from '../StandingsLedger';

const LATEST = '0x1Ec14aDaf61e27AB339bc590BA4Bf2356Dd7E990';
const CHAMPION = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';
const NOW = Date.UTC(2026, 8, 24, 12, 0, 0);

function makeChampions(overrides: Partial<ChampionsState> = {}): ChampionsState {
  return {
    isLoading: false,
    hasData: true,
    endurance: { address: null, duration: 0, lockedDuration: 0, isLive: false },
    chrono: { address: null, duration: 0, lockedDuration: 0, isLive: false },
    chronoChallenge: {
      address: null,
      recordToBeat: 0,
      isLive: false,
      isRecordHolder: false,
      hasDetails: false,
    },
    lastCst: { address: null },
    latestGesture: {
      address: null,
      holdDuration: 0,
      latestGestureTime: null,
      isCurrentEnduranceChampion: false,
      isExtendingEnduranceRecord: false,
      durationToBeat: 0,
      secondsUntilEnduranceChampion: 0,
      progressToEnduranceChampion: 0,
    },
    raw: null,
    source: 'api-v1',
    ...overrides,
  };
}

const standingCycle = makeChampions({
  latestGesture: {
    address: LATEST,
    holdDuration: 3 * 3600 + 16 * 60 + 28,
    latestGestureTime: NOW / 1000 - 11_788,
    isCurrentEnduranceChampion: false,
    isExtendingEnduranceRecord: false,
    durationToBeat: 4 * 3600 + 5 * 60 + 55,
    secondsUntilEnduranceChampion: 49 * 60 + 27,
    progressToEnduranceChampion: 79.9,
  },
  endurance: { address: CHAMPION, duration: 14_755, lockedDuration: 14_755, isLive: false },
  chrono: { address: CHAMPION, duration: 783_402, lockedDuration: 783_402, isLive: false },
  chronoChallenge: {
    address: CHAMPION,
    duration: 676_202,
    recordToBeat: 783_402,
    isLive: false,
    isRecordHolder: true,
    hasDetails: true,
    startsGrowingIn: 102_384,
  },
  lastCst: { address: LATEST },
});

const latestGesture = {
  EvtLogId: 1135,
  BidderAddr: LATEST,
  GestureType: 2,
  CstCost: 210.9137,
  TimeStamp: NOW / 1000 - 3 * 3600,
  RoundNum: 2,
} as unknown as GestureInfo;

function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], .sr-only').forEach((node) => node.remove());
  // Durations and amounts join their parts with no-break spaces.
  return (clone.textContent ?? '').replace(/\s+/g, ' ');
}

function renderLedger(props: Partial<Parameters<typeof StandingsLedger>[0]> = {}) {
  return render(
    <StandingsLedger
      champions={standingCycle}
      latestGesture={latestGesture}
      account={null}
      signatureEth={8.0735}
      chronoEth={2.5835}
      nowMs={NOW}
      {...props}
    />,
  );
}

describe('StandingsLedger', () => {
  it('compares the four contested allocations as peer rows, Endurance Champion included', () => {
    renderLedger();

    expect(
      screen.getByRole('heading', { level: 2, name: 'home.deck.standings.title' }),
    ).toBeInTheDocument();
    const rows = screen.getAllByRole('listitem');
    expect(rows.map((row) => row.getAttribute('data-testid'))).toEqual([
      'standing-latest',
      'standing-endurance',
      'standing-chrono',
      'standing-lastcst',
    ]);
    // Each role is named by its glossary term, not followed by an info icon.
    expect(screen.getByTestId('standing-endurance').querySelector('[data-term]')).toHaveAttribute(
      'data-term',
      'enduranceChampion',
    );
  });

  it('shows who holds each role, the duration it is measured by and what it receives', () => {
    renderLedger();

    const latest = screen.getByTestId('standing-latest');
    expect(latest).toHaveAttribute('data-state', 'growing');
    expect(visibleText(latest)).toContain('tables.specialAllocation.currentHold');
    expect(visibleText(latest)).toContain('3h 16m 28s');
    expect(visibleText(latest)).toContain('8.0735 ETH');

    const chrono = screen.getByTestId('standing-chrono');
    expect(chrono).toHaveAttribute('data-state', 'record');
    expect(visibleText(chrono)).toContain('tables.specialAllocation.recordStanding');
    expect(visibleText(chrono)).toContain('9d 1h 36m 42s');
    expect(visibleText(chrono)).toContain('2.5835 ETH');

    expect(visibleText(screen.getByTestId('standing-endurance'))).toContain('4h 5m 55s');
    expect(visibleText(screen.getByTestId('standing-lastcst'))).toContain(
      'home.deck.board.cstPlusNft',
    );
  });

  it('adds what the last Gesture paid and a link to it', () => {
    renderLedger();

    const line = screen.getByTestId('standing-latest-gesture');
    expect(visibleText(line)).toContain('tables.specialAllocation.amountPaid');
    // The exact amount paid, in the method's own unit, and the method by name.
    expect(visibleText(line)).toContain('210.9137 CST');
    expect(visibleText(line)).toContain('home.form.method.cst.label');
    expect(within(line).getByRole('link')).toHaveAttribute('href', '/gesture/1135');
    expect(screen.getByTestId('standing-latest-progress')).toHaveTextContent(
      'tables.specialAllocation.needsToBecomeChampion(duration=49m 27s)',
    );
  });

  it('keeps the Endurance challenge to one caption line under the ledger', () => {
    renderLedger();

    const challenge = screen.getByTestId('standing-challenge');
    expect(visibleText(challenge)).toContain('tables.specialAllocation.activeEnduranceChallenge');
    expect(visibleText(challenge)).toContain('tables.specialAllocation.canExtendIn');
    expect(visibleText(challenge)).toContain('1d 4h 26m 24s');
  });

  it('says plainly that a role is not held yet, with no record badge or 0s duration', () => {
    renderLedger({ champions: makeChampions(), latestGesture: null });

    for (const key of ['latest', 'endurance', 'chrono', 'lastcst']) {
      const row = screen.getByTestId(`standing-${key}`);
      expect(row).toHaveAttribute('data-state', 'empty');
      expect(visibleText(row)).not.toContain('tables.specialAllocation.recordStanding');
      expect(visibleText(row)).not.toContain('0s');
    }
    expect(screen.getByText('tables.specialAllocation.noChronoRecord')).toHaveClass(
      'text-muted-foreground',
    );
    expect(screen.queryByTestId('standing-challenge')).not.toBeInTheDocument();
  });

  it('marks the connected wallet on the roles it holds', () => {
    renderLedger({ account: LATEST.toLowerCase() });

    expect(
      within(screen.getByTestId('standing-latest')).getByText('tables.status.youBadge'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('standing-lastcst')).getByText('tables.status.youBadge'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('standing-chrono')).queryByText('tables.status.youBadge'),
    ).not.toBeInTheDocument();
  });

  it('shows skeleton lines, not empty-state copy, while the standings load', () => {
    renderLedger({ champions: makeChampions({ isLoading: true, hasData: false }) });

    expect(screen.queryByText('tables.specialAllocation.noChronoRecord')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderLedger();
    await checkA11y(container);
  });
});

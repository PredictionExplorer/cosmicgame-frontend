import { zeroAddress } from 'viem';

import type { DashboardInfo } from '@/services/api';

import { renderWithQuery, screen, within } from '@/test-utils';

import { CycleMonument } from '../CycleMonument';

const NOW = Date.UTC(2026, 8, 24, 12, 0, 0);

function makeDashboard(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 2,
    CurNumBids: 10,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    PrizeAmountEth: 8.0735,
    TsRoundStart: NOW / 1000 - 3600,
    ...overrides,
  } as DashboardInfo;
}

type MonumentProps = Parameters<typeof CycleMonument>[0];

function renderMonument(props: Partial<MonumentProps> = {}) {
  return renderWithQuery(
    <CycleMonument
      data={makeDashboard()}
      loading={false}
      allocationTime={NOW + (6 * 86_400 + 5 * 3_600 + 54 * 60 + 58) * 1000}
      activationTime={0}
      now={NOW}
      finalizationConfirmed
      {...props}
    />,
  );
}

function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], .sr-only').forEach((node) => node.remove());
  return clone.textContent ?? '';
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CycleMonument', () => {
  it('sets the finalization clock as type: the days, then the time', () => {
    renderMonument();

    const clock = screen.getByRole('timer');
    expect(within(clock).getByTestId('monument-clock-days')).toHaveTextContent('6d');
    expect(within(clock).getByTestId('monument-clock-time')).toHaveTextContent('05:54:58');
    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'live');
    // The phase reads as words; a calm live phase carries no state tag.
    expect(screen.queryByTestId('monument-phase-badge')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /home\.chrono\.phase\.live\.eyebrow/ }),
    ).toBeInTheDocument();
  });

  it('drops the day figure inside the last day', () => {
    renderMonument({ allocationTime: NOW + 3_723_000 });

    expect(screen.queryByTestId('monument-clock-days')).not.toBeInTheDocument();
    expect(screen.getByTestId('monument-clock-time')).toHaveTextContent('01:02:03');
  });

  it('tags the final minute without changing the figures', () => {
    renderMonument({ allocationTime: NOW + 42_000 });

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'final-minute');
    expect(screen.getByTestId('monument-phase-badge')).toHaveTextContent(
      'home.chrono.phase.finalMinute.label',
    );
    expect(screen.getByTestId('monument-clock-time')).toHaveTextContent('00:00:42');
  });

  it('reads the waiting phase as words, not as a zero clock', () => {
    renderMonument({ data: makeDashboard({ LastBidderAddr: zeroAddress }) });

    const clock = screen.getByRole('timer');
    expect(clock).toHaveTextContent('home.chrono.phase.waitingFirstGesture.display');
    expect(within(clock).queryByTestId('monument-clock-time')).not.toBeInTheDocument();
  });

  it('shows a skeleton while the cycle loads', () => {
    renderMonument({ data: null, loading: true });

    expect(screen.getByTestId('monument-clock-loading')).toBeInTheDocument();
    expect(visibleText(screen.getByTestId('monument-reserve'))).not.toContain('0.0000');
  });

  it('headlines the Signature Allocation with its unit set apart', () => {
    renderMonument();

    const reserve = screen.getByTestId('monument-reserve');
    expect(visibleText(reserve)).toContain('home.deck.monument.reserveLabel');
    expect(reserve.querySelector('data')).toHaveAttribute('value', '8.0735');
    expect(visibleText(reserve)).toContain('8.0735 ETH');
    // Nothing is attached this cycle, so the line names none.
    expect(screen.getByTestId('monument-reserve-extras')).toHaveTextContent(
      /^home\.deck\.monument\.extras\.base$/,
    );
  });

  it('names the attached assets only when the cycle holds some', () => {
    const { rerender } = renderMonument({ attachedNFTCount: 2 });
    expect(screen.getByTestId('monument-reserve-extras')).toHaveTextContent(
      'home.deck.monument.extras.withNft(nftCount=2)',
    );

    rerender(
      <CycleMonument
        data={makeDashboard()}
        loading={false}
        allocationTime={NOW + 13 * 3600_000}
        activationTime={0}
        now={NOW}
        finalizationConfirmed
        attachedNFTCount={1}
        attachedERC20Count={3}
      />,
    );
    expect(screen.getByTestId('monument-reserve-extras')).toHaveTextContent(
      'home.deck.monument.extras.withBoth(nftCount=1,erc20Count=3)',
    );
  });

  it('marks an unreadable Signature Allocation as unknown, never 0', () => {
    renderMonument({
      data: makeDashboard({ PrizeAmountEth: undefined, CurPrizeAmountEth: undefined }),
    });

    const reserve = screen.getByTestId('monument-reserve');
    expect(visibleText(reserve)).toContain('—');
    expect(visibleText(reserve)).not.toContain('0.0000');
  });

  it('offers the opening as a calendar event while the next cycle waits', () => {
    renderMonument({ activationTime: NOW / 1000 + 3600 });

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.getByTestId('monument-calendar-link')).toHaveAttribute('download');
  });

  it('renders the console as its children, under the readouts', () => {
    renderMonument({ children: <div data-testid="console-slot" /> });

    const monument = screen.getByTestId('cycle-monument');
    const reserve = screen.getByTestId('monument-reserve');
    const slot = screen.getByTestId('console-slot');
    expect(monument).toContainElement(slot);
    expect(reserve.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

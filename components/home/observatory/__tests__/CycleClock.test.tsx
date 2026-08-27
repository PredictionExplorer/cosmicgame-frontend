import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import { CycleClock } from '../CycleClock';

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    CurRoundNum: 7,
    CurNumBids: 10,
    LastBidderAddr: '0xBidder',
    PrizeAmountEth: 2.75,
    TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
    ...overrides,
  }) as never;

const baseProps = {
  data: makeData(),
  loading: false,
  allocationTime: Date.now() + 13 * 60 * 60_000,
  activationTime: 0,
  now: Date.now(),
  finalizationConfirmed: true,
  account: '0xUser' as string | null,
  canClaim: false,
  isClaiming: false,
  claimWait: 0,
  onFinalize: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CycleClock', () => {
  it('renders the live countdown with phase copy and a timer landmark', () => {
    render(<CycleClock {...baseProps} />);

    const clock = screen.getByTestId('cycle-clock');
    expect(clock).toHaveAttribute('data-phase', 'live');
    expect(within(clock).getByText('home.chrono.phase.live.eyebrow')).toBeInTheDocument();
    expect(within(clock).getByText('home.chrono.phase.live.status')).toBeInTheDocument();
    expect(within(clock).getByRole('timer')).toBeInTheDocument();
  });

  it('shows the reserve with its extras and a USD conversion when a price is known', () => {
    render(<CycleClock {...baseProps} ethUsdPrice={2000} />);

    const reserve = screen.getByTestId('clock-reserve');
    expect(within(reserve).getByText('home.observatory.clock.reserveLabel')).toBeInTheDocument();
    expect(within(reserve).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(reserve).getByText('home.observatory.clock.reserveExtras')).toBeInTheDocument();
    // 2.75 ETH × 2000 USD.
    expect(screen.getByTestId('clock-reserve-usd')).toHaveTextContent(
      'home.observatory.clock.reserveUsd(amount=5,500)',
    );
  });

  it('hides the USD line until the market price resolves', () => {
    render(<CycleClock {...baseProps} ethUsdPrice={0} />);
    expect(screen.queryByTestId('clock-reserve-usd')).not.toBeInTheDocument();
  });

  /* ── Finalize ───────────────────────────────────────────────── */

  it('lets the final-gesture wallet finalize once the deadline is confirmed', async () => {
    const user = userEvent.setup();
    render(
      <CycleClock
        {...baseProps}
        data={makeData({ LastBidderAddr: '0xUser' })}
        allocationTime={Date.now() - 60 * 60_000}
        canClaim
        claimWait={Date.now() - 30 * 60_000}
      />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'ready-to-finalize');
    const finalize = screen.getByTestId('clock-finalize');
    expect(finalize).toBeEnabled();
    await user.click(finalize);

    expect(baseProps.onFinalize).toHaveBeenCalledTimes(1);
  });

  it('makes other wallets wait out the exclusivity window with a visible countdown', () => {
    render(
      <CycleClock
        {...baseProps}
        data={makeData({ LastBidderAddr: '0xSomeoneElse' })}
        allocationTime={Date.now() - 60_000}
        canClaim
        claimWait={Date.now() + 10 * 60_000}
      />,
    );

    expect(screen.getByTestId('clock-finalize')).toBeDisabled();
    expect(screen.getByText(/home\.form\.finalizeAvailableIn/)).toBeInTheDocument();
    expect(screen.getByText('home.form.finalizeWaitNote')).toBeInTheDocument();
  });

  it('withholds finalize while the zero-cross is still being verified on-chain', () => {
    render(
      <CycleClock
        {...baseProps}
        allocationTime={Date.now() - 60_000}
        finalizationConfirmed={false}
        canClaim={false}
      />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'confirming');
    expect(screen.queryByTestId('clock-finalize')).not.toBeInTheDocument();
  });

  /* ── Notify control ─────────────────────────────────────────── */

  it('exposes notify thresholds during an active countdown', async () => {
    const user = userEvent.setup();
    const onNotifyThresholdChange = jest.fn();
    render(
      <CycleClock
        {...baseProps}
        notifyThresholdMin={5}
        onNotifyThresholdChange={onNotifyThresholdChange}
      />,
    );

    const control = screen.getByTestId('clock-notify-control');
    expect(
      within(control).getByRole('button', {
        name: 'home.observatory.clock.notifyMinutes(minutes=5)',
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(
      within(control).getByRole('button', {
        name: 'home.observatory.clock.notifyMinutes(minutes=30)',
      }),
    );
    expect(onNotifyThresholdChange).toHaveBeenCalledWith(30);
  });

  /* ── Between cycles ─────────────────────────────────────────── */

  it('offers a calendar invite and the cycle-details path before opening', () => {
    render(
      <CycleClock
        {...baseProps}
        activationTime={Math.floor(Date.now() / 1000) + 3600}
        onNotifyThresholdChange={jest.fn()}
      />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.getByTestId('clock-calendar-link')).toHaveAttribute(
      'href',
      expect.stringContaining('data:text/calendar'),
    );
    expect(screen.getByRole('link', { name: /home\.chrono\.cta\.viewCycle/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    // No finalization countdown yet — no notify control.
    expect(screen.queryByTestId('clock-notify-control')).not.toBeInTheDocument();
  });

  it('shows the awaiting display text instead of a countdown before the first gesture', () => {
    render(
      <CycleClock
        {...baseProps}
        data={makeData({
          TsRoundStart: 0,
          LastBidderAddr: '0x0000000000000000000000000000000000000000',
        })}
      />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute(
      'data-phase',
      'waiting-first-gesture',
    );
    expect(screen.getByText('home.chrono.phase.waitingFirstGesture.display')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CycleClock {...baseProps} ethUsdPrice={2000} />);
    await checkA11y(container);
  });
});

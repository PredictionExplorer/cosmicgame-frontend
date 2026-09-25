import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';

import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, within, checkA11y } from '@/test-utils';

import { CycleClock, PREHYDRATION_TICK } from '../CycleClock';

const HOLDER = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    CurRoundNum: 7,
    CurNumBids: 10,
    LastBidderAddr: HOLDER,
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
  account: HOLDER as string | null,
  canClaim: false,
  isClaiming: false,
  claimWait: 0,
  onFinalize: jest.fn(),
};

/** A zero-crossed clock: the deadline passed an hour ago and the chain confirms it. */
const atZero = {
  allocationTime: Date.now() - 60 * 60_000,
  canClaim: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CycleClock', () => {
  it('sets the countdown as type with localized units, the phase and a timer', () => {
    render(<CycleClock {...baseProps} allocationTime={Date.now() + 2 * 86_400_000 + 5_000} />);

    const clock = screen.getByTestId('cycle-clock');
    expect(clock).toHaveAttribute('data-phase', 'live');
    // The phase is the region's visible heading, in the desk's one heading
    // style; the region keeps its stable name.
    expect(
      within(clock).getByRole('heading', { level: 2, name: 'home.chrono.phase.live.eyebrow' }),
    ).toHaveClass('type-heading-3');
    expect(screen.getByRole('region', { name: 'home.chrono.sectionAria' })).toBe(clock);
    expect(screen.getByTestId('clock-status')).toHaveTextContent('home.chrono.phase.live.status');
    expect(within(clock).getByRole('timer')).toBeInTheDocument();

    // Days, hours, minutes and seconds: two digits each, a fixed caption each
    // (the one clock catalog the landing shares) that never changes word or
    // width as the digits tick.
    const figures = screen.getByTestId('clock-figures');
    expect(within(figures).getByText('02')).toBeInTheDocument();
    expect(within(figures).getByText('days')).toBeInTheDocument();
    expect(within(figures).getByText('seconds')).toBeInTheDocument();
    expect(figures.textContent).not.toMatch(/count=/);
    // No tiles, ring or glow behind the figures.
    expect(figures.innerHTML).not.toMatch(/rounded-full|blur|animate-/);
    // The shared figure tier sets the digits solid (line-height 1), so row 1
    // never outgrows the 1280x720 first viewport.
    expect(figures).toHaveClass('type-figure-xl');
    expect(figures).toHaveAttribute('data-size', 'desk');
  });

  it('drops the day group, not the figure size, once less than a day remains', () => {
    render(<CycleClock {...baseProps} allocationTime={Date.now() + 5 * 60_000} />);
    const figures = screen.getByTestId('clock-figures');
    expect(within(figures).queryByText('days')).not.toBeInTheDocument();
    expect(within(figures).getByText('hours')).toBeInTheDocument();
  });

  it('ships a tick script after the figures in the server HTML, so the clock never sits frozen', () => {
    const allocationTime = Date.now() + 5 * 60_000;
    const html = renderToString(
      <TooltipProvider>
        <CycleClock {...baseProps} allocationTime={allocationTime} />
      </TooltipProvider>,
    );
    const container = document.createElement('div');
    container.innerHTML = html;
    const figures = container.querySelector('[data-testid="clock-figures"]')!;
    expect(figures).toHaveAttribute('data-deadline', String(allocationTime));
    expect(figures).not.toHaveAttribute('data-hydrated');
    expect(figures.querySelectorAll('[data-unit]')).toHaveLength(3);
    const script = figures.nextElementSibling;
    expect(script?.tagName).toBe('SCRIPT');
    expect(script?.innerHTML).toBe(PREHYDRATION_TICK);
  });

  it('never creates the script in a client render, where React ticks from the first frame', () => {
    render(<CycleClock {...baseProps} allocationTime={Date.now() + 5 * 60_000} />);
    const figures = screen.getByTestId('clock-figures');
    expect(figures).toHaveAttribute('data-hydrated', 'true');
    expect(screen.getByTestId('cycle-clock').querySelector('script')).toBeNull();
  });

  it('ticks the server-rendered figures from the deadline until hydration, then stops', () => {
    jest.useFakeTimers();
    const container = document.createElement('div');
    try {
      jest.setSystemTime(1_000_000);
      // 1d 1h 1m 1s before the deadline.
      container.innerHTML =
        `<div id="figures" data-deadline="${1_000_000 + 90_061_000}">` +
        '<span data-unit="days">09</span><span data-unit="hours">09</span>' +
        '<span data-unit="minutes">09</span><span data-unit="seconds">09</span></div>' +
        '<script id="tick"></script>';
      document.body.append(container);
      const script = container.querySelector('#tick');
      Object.defineProperty(document, 'currentScript', { configurable: true, get: () => script });
      new Function(PREHYDRATION_TICK)();

      const figures = container.querySelector('#figures')!;
      const digits = () => [...figures.querySelectorAll('[data-unit]')].map((n) => n.textContent);
      // The first paint already reads the time left now, not when the page was built.
      expect(digits()).toEqual(['01', '01', '01', '01']);
      jest.advanceTimersByTime(2_000);
      expect(digits()).toEqual(['01', '01', '00', '59']);

      // Once React has the figures, the script leaves them alone.
      figures.setAttribute('data-hydrated', 'true');
      jest.advanceTimersByTime(3_000);
      expect(digits()).toEqual(['01', '01', '00', '59']);
    } finally {
      Reflect.deleteProperty(document, 'currentScript');
      container.remove();
      jest.useRealTimers();
    }
  });

  it('puts the alerts control beside the heading it is about', () => {
    render(<CycleClock {...baseProps} headingAction={<button type="button">Alerts</button>} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.parentElement?.parentElement).toContainElement(
      screen.getByRole('button', { name: 'Alerts' }),
    );
  });

  it('leads with the Signature Allocation as an explained term and a tabular figure', () => {
    render(<CycleClock {...baseProps} ethUsdPrice={2000} />);

    const reserve = screen.getByTestId('clock-reserve');
    expect(
      within(reserve).getByRole('button', { name: /home\.observatory\.clock\.reserveLabel/ }),
    ).toHaveAttribute('data-term', 'signatureAllocation');
    // One unbreakable value: the unit joins the figure with a no-break space.
    const nbsp = String.fromCharCode(160);
    expect(screen.getByTestId('clock-reserve-amount').textContent).toBe(`2.7500${nbsp}ETH`);
    expect(screen.getByTestId('clock-reserve-amount')).toHaveClass('type-figure-lg');
    // The fixed extras as list items whose dots hang in a clipped gutter.
    const extras = within(reserve).getByTestId('clock-reserve-extras');
    expect(
      within(extras)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['home.observatory.clock.reserveExtraCst', 'home.observatory.clock.reserveExtraNft']);
    expect(extras.textContent).not.toContain('·');
    expect(screen.getByTestId('clock-reserve-usd')).toHaveTextContent(
      'home.observatory.clock.reserveUsd(amount=5,500)',
    );
  });

  it('names attached assets only when the cycle has some, and links to them', () => {
    const { rerender } = render(<CycleClock {...baseProps} attachedAssetCount={0} />);
    expect(screen.queryByTestId('clock-reserve-attached')).not.toBeInTheDocument();
    expect(screen.getByTestId('clock-reserve')).not.toHaveTextContent(/reserveAttached/);

    rerender(
      <CycleClock
        {...baseProps}
        attachedAssetCount={3}
        attachedAssetsHref="#home-attached-assets"
      />,
    );
    const attached = screen.getByTestId('clock-reserve-attached');
    expect(within(attached).getByRole('link')).toHaveAttribute('href', '#home-attached-assets');
    expect(attached).toHaveTextContent('home.observatory.clock.reserveAttached(count=3)');
  });

  it('reads from the start edge, so a late USD figure never moves the allocation', () => {
    render(<CycleClock {...baseProps} ethUsdPrice={2000} />);
    const reserve = screen.getByTestId('clock-reserve');
    expect(reserve.className).not.toMatch(/text-center/);
    expect(screen.getByTestId('clock-reserve-amount').parentElement?.className).not.toMatch(
      /justify-center/,
    );
    expect(screen.getByTestId('clock-figures')).toHaveClass('justify-start');
  });

  it('hides the USD line until the market price resolves', () => {
    render(<CycleClock {...baseProps} ethUsdPrice={0} />);
    expect(screen.queryByTestId('clock-reserve-usd')).not.toBeInTheDocument();
  });

  it('says the allocation is unknown instead of showing 0 ETH when the read lacks it', () => {
    render(<CycleClock {...baseProps} data={makeData({ PrizeAmountEth: undefined })} />);
    expect(screen.queryByTestId('clock-reserve-amount')).not.toBeInTheDocument();
    expect(screen.getByTestId('clock-reserve')).toHaveTextContent('—');
  });

  /* ── Zero ───────────────────────────────────────────────────── */

  it('never shrinks at zero: "Ready to finalize" takes the figures place, with its status', () => {
    render(
      <CycleClock {...baseProps} {...atZero} account={null} claimWait={baseProps.now - 1_000} />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'ready-to-finalize');
    const display = screen.getByTestId('clock-display');
    expect(display).toHaveTextContent('home.observatory.clock.state.ready');
    expect(display).toHaveClass('text-positive', 'leading-tight');
    // The explanation stays visible at zero (it used to be screen-reader only).
    expect(screen.getByTestId('clock-status')).toHaveTextContent(
      'home.chrono.phase.readyToFinalize.status',
    );
    expect(screen.getByTestId('clock-finalize-window')).toHaveTextContent(
      'home.observatory.clock.finalize.openNow',
    );
  });

  it('lets the Last Gesture holder finalize and says how long the window is theirs', async () => {
    const user = userEvent.setup();
    render(<CycleClock {...baseProps} {...atZero} claimWait={baseProps.now + 10 * 60_000} />);

    const window = screen.getByTestId('clock-finalize-window');
    expect(window).toHaveTextContent('home.observatory.clock.finalize.exclusiveFor');
    expect(within(window).getByText(/\d{2}:\d{2}/)).toBeInTheDocument();

    const finalize = screen.getByTestId('clock-finalize');
    expect(finalize).toHaveClass('bg-signature-gradient');
    await user.click(finalize);
    expect(baseProps.onFinalize).toHaveBeenCalledTimes(1);
  });

  it('tells everyone else when finalization opens to them, without a dead button', () => {
    render(
      <CycleClock
        {...baseProps}
        {...atZero}
        account={OTHER}
        claimWait={baseProps.now + 10 * 60_000}
      />,
    );

    expect(screen.getByTestId('clock-finalize-window')).toHaveTextContent(
      'home.observatory.clock.finalize.openIn',
    );
    expect(screen.queryByTestId('clock-finalize')).not.toBeInTheDocument();
  });

  it('offers Finalize to any wallet once the exclusive window has passed', () => {
    render(
      <CycleClock {...baseProps} {...atZero} account={OTHER} claimWait={baseProps.now - 1_000} />,
    );
    expect(screen.getByTestId('clock-finalize')).toBeEnabled();
  });

  it('keeps the button focusable and busy while finalization is in flight', () => {
    render(<CycleClock {...baseProps} {...atZero} isClaiming claimWait={baseProps.now - 1_000} />);
    const finalize = screen.getByTestId('clock-finalize');
    expect(finalize).toHaveAttribute('aria-busy', 'true');
    expect(finalize).not.toBeDisabled();
  });

  it('shows "Confirming" at full size while the zero-cross is verified, with no Finalize', () => {
    render(
      <CycleClock
        {...baseProps}
        allocationTime={Date.now() - 60_000}
        finalizationConfirmed={false}
        canClaim={false}
      />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'confirming');
    expect(screen.getByTestId('clock-display')).toHaveTextContent(
      'home.observatory.clock.state.confirming',
    );
    expect(screen.queryByTestId('clock-finalize')).not.toBeInTheDocument();
  });

  /* ── Between cycles ─────────────────────────────────────────── */

  it('offers a calendar invite and the cycle-details path before opening', () => {
    render(<CycleClock {...baseProps} activationTime={Math.floor(Date.now() / 1000) + 3600} />);

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.getByTestId('clock-calendar-link')).toHaveAttribute(
      'href',
      expect.stringContaining('data:text/calendar'),
    );
    expect(screen.getByRole('link', { name: /home\.chrono\.cta\.viewCycle/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('never shows a stale finalize action beside an opening countdown', () => {
    render(
      <CycleClock
        {...baseProps}
        activationTime={Math.floor(Date.now() / 1000) + 3600}
        allocationTime={Date.now() - 60_000}
        canClaim
      />,
    );

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.queryByTestId('clock-finalize')).not.toBeInTheDocument();
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
    expect(screen.getByTestId('clock-display')).toHaveTextContent(
      'home.chrono.phase.waitingFirstGesture.display',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CycleClock {...baseProps} ethUsdPrice={2000} />);
    await checkA11y(container);
  });
});

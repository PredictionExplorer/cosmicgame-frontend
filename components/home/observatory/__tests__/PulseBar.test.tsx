import { render, screen, within, checkA11y } from '@/test-utils';

import { PulseBar, introForPhase } from '../PulseBar';

const baseProps = {
  cycleNumber: 7,
  phase: 'live' as const,
  gestureCount: 42,
  lastGestureAge: 'home.ticker.age.seconds(count=12)',
};

describe('PulseBar', () => {
  it('carries the page H1 with the live cycle pulse in one compact band', () => {
    render(<PulseBar {...baseProps} />);

    const bar = screen.getByTestId('home-deck-header');
    const h1 = within(bar).getByRole('heading', { level: 1, name: 'home.deck.title' });
    // The display size every app H1 uses, not the section-heading tier.
    expect(h1).toHaveClass('type-display-sm');
    expect(within(bar).getByText('home.hero.cycleNumber(number=7)')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-phase-chip')).toHaveTextContent(
      'home.chrono.phase.live.label',
    );
    expect(screen.getByTestId('pulse-gesture-count')).toHaveTextContent(
      'home.observatory.pulse.gestureCount(count=42)',
    );
    expect(screen.getByTestId('pulse-last-gesture')).toHaveTextContent(
      'home.observatory.pulse.lastGestureAge(age=home.ticker.age.seconds(count=12))',
    );
  });

  it('lists the facts with decorative separators that never orphan at a wrap', () => {
    render(<PulseBar {...baseProps} />);
    const facts = screen.getByTestId('pulse-gesture-count').closest('ul');
    expect(facts).not.toBeNull();
    // The dots are pseudo-elements in a clipped gutter, not text nodes a
    // wrapped line could end on (or a screen reader could read).
    expect(facts!.textContent).not.toContain('·');
    expect(facts!.parentElement).toHaveClass('overflow-hidden');
    expect(within(facts!).getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
  });

  it('routes newcomers to the walkthrough, on the H1 line and short on desktop', () => {
    render(<PulseBar {...baseProps} />);
    const link = screen.getByRole('link', { name: /home\.deck\.newHere/ });
    expect(link).toHaveAttribute('href', '/how-it-works');
    // Phones and tablets ask "New here?"; the desktop strip reads short so it
    // keeps one line at 1280px and the method selector stays in the fold.
    expect(within(link).getByText('home.deck.newHere')).toHaveClass('lg:hidden');
    expect(within(link).getByText('home.deck.howItWorks')).toHaveClass('max-lg:hidden');
    // From sm the link centres on the H1's first line, not on the whole strip.
    const strut = link.previousElementSibling;
    expect(strut).toHaveAttribute('aria-hidden');
    expect(strut).toHaveClass('type-display-sm', 'h-[1lh]');
    expect(screen.getByTestId('home-deck-header')).toHaveClass('sm:items-start');
  });

  it('keeps the masthead focused on one newcomer route', () => {
    render(<PulseBar {...baseProps} />);

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.queryByTestId('experimental-ui-entry')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('home.deck.title');
  });

  it('falls back gracefully before the cycle number resolves', () => {
    render(<PulseBar {...baseProps} cycleNumber={null} lastGestureAge={null} />);

    expect(screen.getByText('home.hero.cycleFallback')).toBeInTheDocument();
    expect(screen.queryByTestId('pulse-last-gesture')).not.toBeInTheDocument();
  });

  it('reflects the current phase in the chip', () => {
    render(<PulseBar {...baseProps} phase="final-ten" />);
    expect(screen.getByTestId('pulse-phase-chip')).toHaveTextContent(
      'home.chrono.phase.finalTen.label',
    );
  });

  it('never shows a count it does not know', () => {
    render(<PulseBar {...baseProps} gestureCount={null} />);
    const count = screen.getByTestId('pulse-gesture-count');
    expect(count).not.toHaveTextContent(/\d/);
    expect(count).toHaveTextContent('common.status.loadingEllipsis');
  });

  it('says so in the masthead while the wallet holds the Last Gesture', () => {
    const { rerender } = render(<PulseBar {...baseProps} />);
    expect(screen.queryByTestId('pulse-you-latest')).not.toBeInTheDocument();
    rerender(<PulseBar {...baseProps} youHoldLatest />);
    expect(screen.getByTestId('pulse-you-latest')).toHaveTextContent(
      'home.observatory.standing.positionLatest',
    );
  });

  it('explains the zero moment instead of the standing intro', () => {
    const { rerender } = render(<PulseBar {...baseProps} phase="ready-to-finalize" />);
    const intro = screen.getByTestId('pulse-intro');
    expect(intro).toHaveTextContent('home.deck.introByPhase.zero');
    // A moment's explanation is never clamped on phones.
    expect(intro.className).not.toMatch(/line-clamp/);

    rerender(<PulseBar {...baseProps} phase="confirming" />);
    expect(screen.getByTestId('pulse-intro')).toHaveTextContent('home.deck.introByPhase.zero');

    rerender(<PulseBar {...baseProps} phase="final-minute" />);
    expect(screen.queryByTestId('pulse-intro')).not.toBeInTheDocument();
  });

  it('says nothing more while Gestures run, so the desk starts high on every screen', () => {
    render(<PulseBar {...baseProps} phase="live" />);
    // The clock's status, the form and the cycle guide say how to take part.
    expect(screen.queryByTestId('pulse-intro')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-deck-header')).not.toHaveTextContent('home.deck.intro');
  });

  it('writes the Gesture count as a figure with its coined noun', () => {
    render(<PulseBar {...baseProps} />);
    expect(screen.getByTestId('pulse-gesture-count')).toHaveClass('tabular-nums');
    // The age also reads in the ledger; it shows only where the strip has room.
    expect(screen.getByTestId('pulse-last-gesture').closest('li')).toHaveClass('max-2xl:hidden');
  });

  it.each([
    ['opening-soon', 'openingSoon'],
    ['waiting-first-gesture', 'waitingFirstGesture'],
    ['confirming', 'zero'],
    ['ready-to-finalize', 'zero'],
    ['live', 'default'],
    ['approach', 'default'],
    ['final-hour', 'default'],
    ['final-ten', 'default'],
    ['final-minute', 'default'],
    ['loading', 'default'],
    ['unavailable', 'default'],
  ] as const)('reads the %s phase with the %s intro', (phase, intro) => {
    expect(introForPhase(phase)).toBe(intro);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PulseBar {...baseProps} />);
    await checkA11y(container);
  });
});

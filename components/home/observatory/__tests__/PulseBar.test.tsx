import { render, screen, within, checkA11y } from '@/test-utils';

import { PulseBar } from '../PulseBar';

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
    expect(
      within(bar).getByRole('heading', { level: 1, name: 'home.deck.title' }),
    ).toBeInTheDocument();
    expect(within(bar).getByText('home.deck.intro')).toBeInTheDocument();
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

  it('routes newcomers to the walkthrough', () => {
    render(<PulseBar {...baseProps} />);
    expect(screen.getByRole('link', { name: /home\.deck\.newHere/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
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
    expect(count).toHaveTextContent('Loading...');
  });

  it('says so in the masthead while the wallet holds the Last Gesture', () => {
    const { rerender } = render(<PulseBar {...baseProps} />);
    expect(screen.queryByTestId('pulse-you-latest')).not.toBeInTheDocument();
    rerender(<PulseBar {...baseProps} youHoldLatest />);
    expect(screen.getByTestId('pulse-you-latest')).toHaveTextContent(
      'home.observatory.standing.positionLatest',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PulseBar {...baseProps} />);
    await checkA11y(container);
  });
});

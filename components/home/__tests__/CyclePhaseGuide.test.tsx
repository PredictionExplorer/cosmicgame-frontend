import { render, screen, within, checkA11y } from '@/test-utils';

import { CYCLE_STEPS, CyclePhaseGuide, stepForPhase } from '../CyclePhaseGuide';

describe('CyclePhaseGuide', () => {
  it('tells how the cycle works as where it is now, with the current step marked', () => {
    render(<CyclePhaseGuide phase="live" />);

    expect(screen.getByRole('heading', { level: 2, name: 'home.orientation.title' })).toBeVisible();
    const steps = within(
      screen.getByRole('list', { name: 'home.phaseGuide.timelineAria' }),
    ).getAllByRole('listitem');
    expect(steps).toHaveLength(CYCLE_STEPS.length);
    expect(steps.map((step) => step.getAttribute('data-state-step'))).toEqual([
      'passed',
      'passed',
      'now',
      'next',
      'next',
      'next',
    ]);
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(within(steps[2]!).getByText('home.phaseGuide.stepState.now')).toBeVisible();
  });

  it('explains every step from 1024px and the current one under the phone rail', () => {
    render(<CyclePhaseGuide phase="ready-to-finalize" />);
    for (const step of CYCLE_STEPS) {
      expect(
        screen.getAllByText(`home.phaseGuide.steps.${step.messageKey}.detail`).length,
      ).toBeGreaterThan(0);
    }
    expect(screen.getByTestId('cycle-phase-guide-current')).toHaveTextContent(
      'home.phaseGuide.steps.finalization.detail',
    );
    expect(screen.getByTestId('cycle-phase-guide-current')).toHaveClass('lg:hidden');
  });

  it('scrolls sideways on phones instead of stacking six cards', () => {
    render(<CyclePhaseGuide phase="opening-soon" />);
    const list = screen.getByRole('list', { name: 'home.phaseGuide.timelineAria' });
    // The rail: one row that scrolls, snapping to steps, vertical from 1024px.
    expect(list.parentElement).toHaveClass('max-lg:snap-x', 'lg:flex-col');
    expect(list.parentElement?.className).toMatch(/overflow-x-auto/);
  });

  it('closes with cycle links, the walkthrough and the FAQ', () => {
    render(<CyclePhaseGuide phase="live" cycleLinks={<a href="/current-cycle">Cycle</a>} />);
    expect(screen.getByRole('link', { name: 'Cycle' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: /home\.phaseGuide\.explainer\.walkthroughLink/ }),
    ).toHaveAttribute('href', '/how-it-works');
    expect(
      screen.getByRole('link', { name: /home\.phaseGuide\.explainer\.faqLink/ }),
    ).toHaveAttribute('href', '/faq');
    // No dismissible duplicate explainer (F280).
    expect(screen.queryByText('home.phaseGuide.explainer.title')).not.toBeInTheDocument();
  });

  it.each([
    ['loading', 'opening-soon'],
    ['unavailable', 'opening-soon'],
    ['opening-soon', 'opening-soon'],
    ['waiting-first-gesture', 'first-gesture'],
    ['live', 'open'],
    ['approach', 'open'],
    ['final-hour', 'final-window'],
    ['final-ten', 'final-window'],
    ['final-minute', 'final-window'],
    ['confirming', 'finalization'],
    ['ready-to-finalize', 'finalization'],
  ] as const)('places the %s phase on the %s step', (phase, step) => {
    expect(stepForPhase(phase)).toBe(step);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CyclePhaseGuide phase="final-ten" />);
    await checkA11y(container);
  });
});

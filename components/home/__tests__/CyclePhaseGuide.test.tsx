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

  it('draws with the progress-rule colours only, never a chip or a fill of its own', () => {
    const { container } = render(<CyclePhaseGuide phase="live" />);
    // The state reads as a caption beside the step's label, not a badge.
    const now = screen.getByText('home.phaseGuide.stepState.now');
    expect(now).toHaveClass('type-caption', 'text-primary');
    expect(now.parentElement).toHaveTextContent('home.phaseGuide.steps.open.label');
    expect(now.parentElement?.tagName).toBe('P');
    // Travelled rails and checked markers in the accent, the rest on the rule:
    // no background, subtle or tinted fill adds to the page's palette.
    const fills = Array.from(container.querySelectorAll<HTMLElement>('[class*="bg-"]')).flatMap(
      (element) => element.className.split(/\s+/).filter((name) => name.startsWith('bg-')),
    );
    expect(new Set(fills)).toEqual(new Set(['bg-primary', 'bg-rule']));
  });

  it('explains every step from 1024px and the current one at every width', () => {
    render(<CyclePhaseGuide phase="ready-to-finalize" />);
    for (const step of CYCLE_STEPS) {
      expect(screen.getByText(`home.phaseGuide.steps.${step.messageKey}.detail`)).toBeTruthy();
    }
    const current = screen.getByTestId('cycle-phase-guide-current');
    expect(current).toHaveTextContent('home.phaseGuide.steps.finalization.detail');
    expect(current).not.toHaveClass('max-lg:sr-only');
    // The other steps keep their explanation for screen readers below 1024px.
    expect(screen.getByText('home.phaseGuide.steps.allocation.detail')).toHaveClass(
      'max-lg:sr-only',
    );
  });

  it('is a vertical stepper at every width: nothing scrolls sideways or is clipped', () => {
    const { container } = render(<CyclePhaseGuide phase="opening-soon" />);
    const list = screen.getByRole('list', { name: 'home.phaseGuide.timelineAria' });
    expect(list).toHaveClass('flex-col');
    expect(list.className).not.toMatch(/(?:^|\s)(?:[a-z-]+:)?flex-row/);
    // No sideways scroller, so no scrollable region without a focusable child.
    expect(container.querySelector('[class*="overflow-x-auto"]')).toBeNull();
  });

  it('lists its links with a 24px line box at every width', () => {
    render(<CyclePhaseGuide phase="live" />);
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveClass('leading-6');
      expect(link.className).not.toMatch(/max-sm:leading-6/);
      expect(link.closest('li')).not.toBeNull();
    }
  });

  it('closes with cycle links, the walkthrough and the FAQ', () => {
    render(
      <CyclePhaseGuide
        phase="live"
        cycleLinks={
          <li>
            <a href="/current-cycle">Cycle</a>
          </li>
        }
      />,
    );
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

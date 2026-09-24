import type { DashboardInfo } from '@/services/api';
import type { CyclePhase } from '@/lib/cycleState';

import { checkA11y, render, screen } from '@/test-utils';

import { CyclePhaseGuide, phaseToTimelineId } from '../CyclePhaseGuide';

const NOW = Date.UTC(2026, 8, 24, 12, 0, 0);

const data = {
  CurRoundNum: 2,
  LastBidderAddr: '0x1111111111111111111111111111111111111111',
  TsRoundStart: NOW / 1000 - 3600,
} as DashboardInfo;

describe('CyclePhaseGuide', () => {
  it.each<[CyclePhase, string]>([
    ['loading', 'opening-soon'],
    ['opening-soon', 'opening-soon'],
    ['waiting-first-gesture', 'first-gesture'],
    ['live', 'open'],
    ['approach', 'open'],
    ['final-hour', 'final-window'],
    ['final-minute', 'final-window'],
    ['confirming', 'finalization'],
    ['ready-to-finalize', 'finalization'],
  ])('places the %s phase on the %s step', (phase, step) => {
    expect(phaseToTimelineId(phase)).toBe(step);
  });

  it('marks the current phase as the step, the earlier ones as passed', () => {
    render(
      <CyclePhaseGuide
        data={data}
        loading={false}
        allocationTime={NOW + 13 * 3600_000}
        activationTime={0}
        now={NOW}
        finalizationConfirmed
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'home.phaseGuide.title' }),
    ).toBeInTheDocument();
    const steps = screen.getAllByRole('listitem');
    // Only the step right after the current one is "Next"; the rest come later.
    expect(steps.map((step) => step.getAttribute('data-state'))).toEqual([
      'passed',
      'passed',
      'now',
      'next',
      'later',
      'later',
    ]);
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(steps[3]).toHaveTextContent('home.phaseGuide.stepState.next');
    expect(steps[4]).toHaveTextContent('home.deck.phaseGuide.later');
    expect(screen.getByRole('link', { name: /home\.phaseGuide\.howItWorks/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });

  it('keeps the phones to one compact rail with the current phase explained under it', () => {
    render(
      <CyclePhaseGuide
        data={data}
        loading={false}
        allocationTime={NOW + 13 * 3600_000}
        activationTime={0}
        now={NOW}
        finalizationConfirmed
      />,
    );

    // One scrolling row, not six stacked cards; each cell's own explanation
    // is kept for screen readers until 1280px.
    const list = screen.getByRole('list', { name: 'home.phaseGuide.timelineAria' });
    expect(list).toHaveClass('flex', 'xl:grid', 'xl:grid-cols-6');
    screen.getAllByRole('listitem').forEach((step) => {
      expect(step).toHaveClass('min-w-[9rem]', 'snap-start');
      expect(step.querySelector('p:last-child')).toHaveClass('max-xl:sr-only');
    });
    const current = screen.getByTestId('cycle-phase-guide-current');
    expect(current).toHaveTextContent('home.phaseGuide.steps.open.detail');
    expect(current).toHaveClass('xl:hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CyclePhaseGuide
        data={data}
        loading={false}
        allocationTime={NOW + 3600_000}
        activationTime={0}
        now={NOW}
      />,
    );
    await checkA11y(container);
  });
});

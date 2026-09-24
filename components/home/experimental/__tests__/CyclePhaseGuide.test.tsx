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
    expect(steps.map((step) => step.getAttribute('data-state'))).toEqual([
      'passed',
      'passed',
      'now',
      'next',
      'next',
      'next',
    ]);
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('link', { name: /home\.phaseGuide\.howItWorks/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
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

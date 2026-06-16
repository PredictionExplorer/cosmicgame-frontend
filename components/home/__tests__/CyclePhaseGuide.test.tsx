import userEvent from '@testing-library/user-event';

import type { DashboardInfo } from '@/services/api';

import { render, screen, within, checkA11y } from '@/test-utils';

import { CyclePhaseGuide } from '../CyclePhaseGuide';

const NOW_MS = 1_700_000_000_000;

function makeData(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    TsRoundStart: NOW_MS / 1000 - 3_600,
    LastBidderAddr: '0xBidder',
    ...overrides,
  } as Partial<DashboardInfo> as DashboardInfo;
}

interface GuideProps {
  data?: DashboardInfo | null;
  loading?: boolean;
  allocationTime?: number;
  activationTime?: number;
  now?: number;
}

function renderGuide({
  data = makeData(),
  loading = false,
  // Default: more than 12h remaining => 'live' phase => Open Cycle.
  allocationTime = NOW_MS + 24 * 60 * 60_000,
  activationTime = 0,
  now = NOW_MS,
}: GuideProps = {}) {
  return render(
    <CyclePhaseGuide
      data={data}
      loading={loading}
      allocationTime={allocationTime}
      activationTime={activationTime}
      now={now}
    />,
  );
}

function getStep(label: string) {
  const timeline = screen.getByRole('list', { name: 'Performance Cycle phases' });
  const heading = within(timeline).getByRole('heading', { name: label });
  const step = heading.closest('li');
  if (!step) throw new Error(`step "${label}" must render inside a list item`);
  return step;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('CyclePhaseGuide', () => {
  it('renders all five cycle phases with a heading and how-it-works link', () => {
    renderGuide();

    expect(
      screen.getByRole('heading', { name: 'Where this Performance Cycle is now' }),
    ).toBeInTheDocument();
    for (const label of [
      'Opening Soon',
      'First Gesture',
      'Open Cycle',
      'Final Window',
      'Finalization',
      'Allocation',
    ]) {
      expect(getStep(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: /How it works/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });

  it('marks Open Cycle as the current step during a stable cycle', () => {
    renderGuide();

    expect(getStep('Open Cycle')).toHaveAttribute('aria-current', 'step');
    expect(getStep('First Gesture')).not.toHaveAttribute('aria-current');
    expect(getStep('First Gesture')).toHaveTextContent('Passed');
    expect(getStep('Final Window')).toHaveTextContent('Next');
  });

  it('marks Opening Soon before the next cycle opens', () => {
    renderGuide({ activationTime: NOW_MS / 1000 + 3_600 });

    expect(getStep('Opening Soon')).toHaveAttribute('aria-current', 'step');
    expect(getStep('First Gesture')).toHaveTextContent('Next');
  });

  it('marks the Final Window step in the closing hour', () => {
    renderGuide({ allocationTime: NOW_MS + 30 * 60_000 });

    expect(getStep('Final Window')).toHaveAttribute('aria-current', 'step');
  });

  it('marks Finalization once the cycle timer expires', () => {
    renderGuide({ allocationTime: NOW_MS - 1_000 });

    expect(getStep('Finalization')).toHaveAttribute('aria-current', 'step');
    expect(getStep('Open Cycle')).toHaveTextContent('Passed');
  });

  it('marks First Gesture before the first gesture of a cycle', () => {
    renderGuide({
      data: makeData({ LastBidderAddr: '0x0000000000000000000000000000000000000000' }),
    });

    expect(getStep('First Gesture')).toHaveAttribute('aria-current', 'step');
  });

  it('shows the first-visit explainer with FAQ and walkthrough links', () => {
    renderGuide();

    expect(screen.getByText('New here? Read the cycle in 30 seconds.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the FAQ' })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: 'See the full walkthrough' })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });

  it('dismisses the explainer and persists the choice in localStorage', async () => {
    const user = userEvent.setup();
    renderGuide();

    await user.click(screen.getByRole('button', { name: 'Dismiss cycle explainer' }));

    expect(screen.queryByText('New here? Read the cycle in 30 seconds.')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('cosmic-cycle-explainer-dismissed')).toBe('1');
  });

  it('keeps the explainer hidden for returning visitors', () => {
    window.localStorage.setItem('cosmic-cycle-explainer-dismissed', '1');
    renderGuide();

    expect(screen.queryByText('New here? Read the cycle in 30 seconds.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Where this Performance Cycle is now' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderGuide();
    await checkA11y(container);
  });
});

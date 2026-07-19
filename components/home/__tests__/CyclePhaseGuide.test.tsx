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

function getStep(labelKey: string) {
  const timeline = screen.getByRole('list', { name: 'home.phaseGuide.timelineAria' });
  const heading = within(timeline).getByRole('heading', {
    name: `home.phaseGuide.steps.${labelKey}.label`,
  });
  const step = heading.closest('li');
  if (!step) throw new Error(`step "${labelKey}" must render inside a list item`);
  return step;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('CyclePhaseGuide', () => {
  it('renders all five cycle phases with a heading and how-it-works link', () => {
    renderGuide();

    expect(screen.getByRole('heading', { name: 'home.phaseGuide.title' })).toBeInTheDocument();
    for (const labelKey of [
      'openingSoon',
      'firstGesture',
      'open',
      'finalWindow',
      'finalization',
      'allocation',
    ]) {
      expect(getStep(labelKey)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: /home\.phaseGuide\.howItWorks/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });

  it('marks Open Cycle as the current step during a stable cycle', () => {
    renderGuide();

    expect(getStep('open')).toHaveAttribute('aria-current', 'step');
    expect(getStep('firstGesture')).not.toHaveAttribute('aria-current');
    expect(getStep('firstGesture')).toHaveTextContent('home.phaseGuide.stepState.passed');
    expect(getStep('finalWindow')).toHaveTextContent('home.phaseGuide.stepState.next');
  });

  it('marks Opening Soon before the next cycle opens', () => {
    renderGuide({ activationTime: NOW_MS / 1000 + 3_600 });

    expect(getStep('openingSoon')).toHaveAttribute('aria-current', 'step');
    expect(getStep('firstGesture')).toHaveTextContent('home.phaseGuide.stepState.next');
  });

  it('marks the Final Window step in the closing hour', () => {
    renderGuide({ allocationTime: NOW_MS + 30 * 60_000 });

    expect(getStep('finalWindow')).toHaveAttribute('aria-current', 'step');
  });

  it('marks Finalization once the cycle timer expires', () => {
    renderGuide({ allocationTime: NOW_MS - 1_000 });

    expect(getStep('finalization')).toHaveAttribute('aria-current', 'step');
    expect(getStep('open')).toHaveTextContent('home.phaseGuide.stepState.passed');
  });

  it('marks First Gesture before the first gesture of a cycle', () => {
    renderGuide({
      data: makeData({ LastBidderAddr: '0x0000000000000000000000000000000000000000' }),
    });

    expect(getStep('firstGesture')).toHaveAttribute('aria-current', 'step');
  });

  it('shows the first-visit explainer with FAQ and walkthrough links', () => {
    renderGuide();

    expect(screen.getByText('home.phaseGuide.explainer.title')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home.phaseGuide.explainer.faqLink' })).toHaveAttribute(
      'href',
      '/faq',
    );
    expect(
      screen.getByRole('link', { name: 'home.phaseGuide.explainer.walkthroughLink' }),
    ).toHaveAttribute('href', '/how-it-works');
  });

  it('dismisses the explainer and persists the choice in localStorage', async () => {
    const user = userEvent.setup();
    renderGuide();

    await user.click(screen.getByRole('button', { name: 'home.phaseGuide.explainer.dismissAria' }));

    expect(screen.queryByText('home.phaseGuide.explainer.title')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('cosmic-cycle-explainer-dismissed')).toBe('1');
  });

  it('keeps the explainer hidden for returning visitors', () => {
    window.localStorage.setItem('cosmic-cycle-explainer-dismissed', '1');
    renderGuide();

    expect(screen.queryByText('home.phaseGuide.explainer.title')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'home.phaseGuide.title' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderGuide();
    await checkA11y(container);
  });
});

import { act, render, screen, waitFor } from '@testing-library/react';

import {
  fetchLandingCurrentTimeSec,
  fetchLandingDashboardSnapshot,
  fetchLandingFinalizationTimeSec,
  type LandingDashboardSnapshot,
} from '../landing-cycle-data';
import { EventHorizonCountdown, POLL_INTERVAL_MS, spokenShards } from '../EventHorizonCountdown';

// The countdown reads through the zod-free landing-cycle-data module (NOT
// the services/api barrel — that would drag axios+zod into the landing).
jest.mock('../landing-cycle-data', () => ({
  LANDING_FETCH_TIMEOUT_MS: 8_000,
  fetchLandingFinalizationTimeSec: jest.fn(),
  fetchLandingCurrentTimeSec: jest.fn(),
  fetchLandingDashboardSnapshot: jest.fn(),
}));

const mockFetchFinalization = jest.mocked(fetchLandingFinalizationTimeSec);
const mockFetchCurrentTime = jest.mocked(fetchLandingCurrentTimeSec);
const mockFetchDashboard = jest.mocked(fetchLandingDashboardSnapshot);

function dashboard(overrides: Partial<LandingDashboardSnapshot> = {}): LandingDashboardSnapshot {
  return {
    CurRoundNum: 21,
    CurNumBids: 55,
    TsRoundStart: 1,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    ...overrides,
  };
}

const clockValues = () =>
  screen.getAllByTestId('countdown-value').map((value) => value.textContent);

describe('<EventHorizonCountdown />', () => {
  const nowMs = 1_700_000_000_000;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(nowMs);
    mockFetchFinalization.mockResolvedValue(1_700_007_265);
    mockFetchCurrentTime.mockResolvedValue(1_700_000_000);
    mockFetchDashboard.mockResolvedValue(dashboard());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('keeps the final structure while the first reading is on its way', () => {
    mockFetchFinalization.mockReturnValue(new Promise(() => {}));
    render(<EventHorizonCountdown />);

    // Four dashed figures at their final size, so nothing reflows on arrival.
    const placeholder = screen.getByTestId('countdown-placeholder');
    expect(placeholder).toHaveTextContent('––');
    expect(placeholder.querySelectorAll('[data-testid="countdown-value"]')).toHaveLength(0);
    expect(screen.getByRole('timer')).toHaveAccessibleName(
      /^landing\.timer\.phases\.loading\.title/,
    );
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.connecting');
  });

  it('shows the live Cycle Finalization Time as type, with the gesture count', async () => {
    render(<EventHorizonCountdown />);

    await waitFor(() => expect(clockValues()).toEqual(['02', '01', '05']));
    expect(
      screen.getByRole('heading', { name: /landing\.timer\.phases\.approach\.title/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('landing.timer.gestureCount(count=55)')).toBeInTheDocument();
    expect(screen.getByTestId('event-horizon-countdown')).toHaveAttribute('data-fresh', 'true');
    expect(screen.getByRole('link', { name: /landing\.timer\.currentCycle/ })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/current-cycle',
    );
    // The market link belongs to the footer's ecosystem row, not the clock.
    expect(screen.queryByRole('link', { name: /GeckoTerminal/i })).not.toBeInTheDocument();
  });

  it('reads the clock as text to the minute, named by its heading, without announcing ticks (V416)', async () => {
    jest.useFakeTimers({ doNotFake: ['Date'] });
    render(<EventHorizonCountdown />);

    await waitFor(() => expect(clockValues()).toEqual(['02', '01', '05']));
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(timer).not.toHaveAttribute('aria-label');
    expect(screen.getByTestId('countdown-units')).toHaveAttribute('aria-hidden', 'true');
    // The name is the heading, which does not change as the digits tick.
    expect(timer).toHaveAccessibleName(
      screen.getByRole('heading', { name: /landing\.timer\.phases\.approach\.title/ }).textContent!,
    );
    const spoken =
      'landing.timer.duration.hours(count=2)landing.timer.durationSeparatorlanding.timer.duration.minutes(count=1)';
    expect(timer).toHaveTextContent(spoken);

    jest.mocked(Date.now).mockReturnValue(nowMs + 1_000);
    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(clockValues()).toEqual(['02', '01', '04']);
    expect(timer).toHaveTextContent(spoken);
  });

  it('stops polling while the tab is hidden and reads at once when it is shown (V045)', async () => {
    jest.useFakeTimers({ doNotFake: ['Date'] });
    mockFetchDashboard.mockClear();
    let visibility: DocumentVisibilityState = 'visible';
    const visibilitySpy = jest
      .spyOn(document, 'visibilityState', 'get')
      .mockImplementation(() => visibility);
    try {
      render(<EventHorizonCountdown />);
      await waitFor(() => expect(mockFetchDashboard).toHaveBeenCalledTimes(1));
      // Every read carries a timeout, so a hung request never holds the loop.
      expect(mockFetchDashboard).toHaveBeenLastCalledWith(8_000);

      visibility = 'hidden';
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
        jest.advanceTimersByTime(POLL_INTERVAL_MS * 5);
      });
      expect(mockFetchDashboard).toHaveBeenCalledTimes(1);

      visibility = 'visible';
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await waitFor(() => expect(mockFetchDashboard).toHaveBeenCalledTimes(2));
    } finally {
      visibilitySpy.mockRestore();
    }
  });

  it('never discards its last good reading when a poll fails', async () => {
    jest.useFakeTimers({ doNotFake: ['Date'] });
    render(<EventHorizonCountdown />);
    await waitFor(() => expect(clockValues()).toEqual(['02', '01', '05']));

    // The next poll loses every read.
    mockFetchFinalization.mockResolvedValue(null);
    mockFetchCurrentTime.mockResolvedValue(null);
    mockFetchDashboard.mockResolvedValue(null);
    jest.mocked(Date.now).mockReturnValue(nowMs + POLL_INTERVAL_MS);
    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });

    await waitFor(() =>
      expect(screen.getByTestId('event-horizon-countdown')).toHaveAttribute('data-fresh', 'false'),
    );
    // Still counting from the last reading, and saying the reading is not fresh.
    expect(clockValues()).toEqual(['02', '00', '53']);
    expect(
      screen.getByRole('heading', { name: /landing\.timer\.phases\.approach\.title/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.reconnecting');
    expect(
      screen.queryByRole('heading', { name: /landing\.timer\.phases\.unavailable\.title/ }),
    ).not.toBeInTheDocument();
  });

  it('does not announce ready to finalize when only the finalization time failed', async () => {
    mockFetchFinalization.mockResolvedValue(null);
    render(<EventHorizonCountdown />);

    await waitFor(() => expect(mockFetchFinalization).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('timer')).toHaveAccessibleName(
        /^landing\.timer\.phases\.loading\.title/,
      ),
    );
    expect(screen.queryByText(/phases\.ready/)).not.toBeInTheDocument();
    expect(screen.getByTestId('countdown-placeholder')).toBeInTheDocument();
  });

  it('sends the visitor to the app when the clock could never be read', async () => {
    // The fetch helpers degrade to null on any failure (they never throw).
    mockFetchFinalization.mockResolvedValue(null);
    mockFetchCurrentTime.mockResolvedValue(null);
    mockFetchDashboard.mockResolvedValue(null);

    render(<EventHorizonCountdown />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /landing\.timer\.phases\.unavailable\.title/ }),
      ).toBeInTheDocument(),
    );
    // No "live" claim and no dead instrument: the eyebrow drops "live" and
    // the readout becomes a way into the app.
    expect(screen.getByText('landing.timer.cycleClock')).toBeInTheDocument();
    expect(screen.queryByText('landing.timer.liveClock')).not.toBeInTheDocument();
    expect(screen.getByText('landing.timer.phases.unavailable.body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nav\.cta\.openApp/ })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com',
    );
    expect(screen.queryByTestId('countdown-units')).not.toBeInTheDocument();
    expect(screen.queryByText(/landing\.timer\.gestureCount/)).not.toBeInTheDocument();
  });

  it('waits for the first Gesture without a ticking countdown', async () => {
    mockFetchDashboard.mockResolvedValue(
      dashboard({
        CurNumBids: 0,
        TsRoundStart: 0,
        LastBidderAddr: '0x0000000000000000000000000000000000000000',
      }),
    );

    render(<EventHorizonCountdown />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /landing\.timer\.phases\.waitingFirstGesture\.title/ }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('landing.timer.phases.waitingFirstGesture.body')).toBeInTheDocument();
    expect(screen.queryByTestId('countdown-units')).not.toBeInTheDocument();
    // "0 Gestures" says nothing: the count appears once there is one.
    expect(screen.queryByText(/landing\.timer\.gestureCount/)).not.toBeInTheDocument();
  });

  it('captions each figure with its fixed unit label, as the app clock does', async () => {
    render(<EventHorizonCountdown />);

    await waitFor(() => expect(clockValues()).toEqual(['02', '01', '05']));
    const units = screen.getByTestId('countdown-units');
    // A column label, never pluralized for the value: it does not change
    // word or width as the digits tick (the timer's name spells them out).
    expect(units).toHaveTextContent('hours');
    expect(units).toHaveTextContent('minutes');
    expect(units).toHaveTextContent('seconds');
    expect(units.textContent).not.toMatch(/count=/);
  });

  it('keeps the readout at the clock size at zero: the state in words, then what can still happen', async () => {
    // The deadline passed a minute ago and a gesture was made: ready to finalize.
    mockFetchFinalization.mockResolvedValue(1_700_000_000 - 60);
    render(<EventHorizonCountdown />);

    await waitFor(() =>
      expect(screen.getByText('landing.timer.phases.ready.state')).toBeInTheDocument(),
    );
    expect(screen.getByText('landing.timer.phases.ready.state')).toHaveClass('type-figure-xl');
    expect(screen.getByText('landing.timer.phases.ready.body')).toBeInTheDocument();
    expect(screen.queryByTestId('countdown-units')).not.toBeInTheDocument();
  });

  it('calls itself live only once the page runs', async () => {
    render(<EventHorizonCountdown />);
    await waitFor(() => expect(screen.getByText('landing.timer.liveClock')).toBeInTheDocument());
  });
});

describe('spokenShards', () => {
  const shards = (days: number, hours: number, minutes: number, seconds: number) => [
    { unit: 'days' as const, value: days },
    { unit: 'hours' as const, value: hours },
    { unit: 'minutes' as const, value: minutes },
    { unit: 'seconds' as const, value: seconds },
  ];
  const units = (list: readonly { unit: string; value: number }[]) =>
    list.map(({ unit, value }) => `${value} ${unit}`);

  it('speaks the non-zero units to the minute', () => {
    expect(units(spokenShards(shards(4, 0, 12, 33)))).toEqual(['4 days', '12 minutes']);
  });

  it('counts the seconds only in the final minute', () => {
    expect(units(spokenShards(shards(0, 0, 0, 42)))).toEqual(['42 seconds']);
    expect(units(spokenShards(shards(0, 0, 0, 0)))).toEqual(['0 seconds']);
  });
});

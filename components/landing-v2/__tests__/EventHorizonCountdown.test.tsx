import { act, render, screen, waitFor } from '@testing-library/react';

import {
  fetchLandingCurrentTimeSec,
  fetchLandingDashboardSnapshot,
  fetchLandingFinalizationTimeSec,
  type LandingDashboardSnapshot,
} from '../landing-cycle-data';
import { EventHorizonCountdown, POLL_INTERVAL_MS } from '../EventHorizonCountdown';

// The countdown reads through the zod-free landing-cycle-data module (NOT
// the services/api barrel — that would drag axios+zod into the landing).
jest.mock('../landing-cycle-data', () => ({
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

    await waitFor(() => expect(clockValues()).toEqual(['00', '02', '01', '05']));
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

  it('keeps the visible clock and its accessible duration in sync without announcing every tick', async () => {
    jest.useFakeTimers({ doNotFake: ['Date'] });
    render(<EventHorizonCountdown />);

    await waitFor(() => expect(clockValues()).toEqual(['00', '02', '01', '05']));
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(screen.getByTestId('countdown-units')).toHaveAttribute('aria-hidden', 'true');
    expect(timer).toHaveAccessibleName(/landing\.timer\.duration\.seconds\(count=5\)/);

    jest.mocked(Date.now).mockReturnValue(nowMs + 1_000);
    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(clockValues()).toEqual(['00', '02', '01', '04']);
    expect(timer).toHaveAccessibleName(/landing\.timer\.duration\.seconds\(count=4\)/);
  });

  it('never discards its last good reading when a poll fails', async () => {
    jest.useFakeTimers({ doNotFake: ['Date'] });
    render(<EventHorizonCountdown />);
    await waitFor(() => expect(clockValues()).toEqual(['00', '02', '01', '05']));

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
    expect(clockValues()).toEqual(['00', '02', '00', '53']);
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
});

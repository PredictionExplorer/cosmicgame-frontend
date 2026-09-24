import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act, render, screen, waitFor } from '@testing-library/react';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing } from '@/i18n/routing';

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

  it('captions each figure for its own value, as the app clock does', async () => {
    render(<EventHorizonCountdown />);

    await waitFor(() => expect(clockValues()).toEqual(['00', '02', '01', '05']));
    const units = screen.getByTestId('countdown-units');
    expect(units).toHaveTextContent('landing.timer.units.hours(count=2)');
    expect(units).toHaveTextContent('landing.timer.units.minutes(count=1)');
    expect(units).toHaveTextContent('landing.timer.units.seconds(count=5)');
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

describe('landing clock unit captions', () => {
  const read = (locale: string, namespace: string) =>
    JSON.parse(
      readFileSync(resolve(process.cwd(), 'messages', locale, `${namespace}.json`), 'utf8'),
    ) as Record<string, Record<string, unknown>>;
  const units = ['days', 'hours', 'minutes', 'seconds'] as const;
  const landingUnits = (locale: string) =>
    (read(locale, 'landing').timer as { units: Record<string, string> }).units;

  /** Formats a one-plural caption message for `count` (the pound sign becomes the count). */
  const caption = (message: string, locale: string, count: number): string => {
    const [element] = parse(message);
    if (element?.type !== TYPE.plural) throw new Error(`not a plural: ${message}`);
    const option =
      element.options[`=${count}`] ??
      element.options[new Intl.PluralRules(locale).select(count)] ??
      element.options.other;
    return (option?.value ?? [])
      .map((part) => (part.type === TYPE.literal ? part.value : String(count)))
      .join('');
  };

  it.each(routing.locales)(
    '%s shares the app clock captions, so the hosts cannot drift',
    (locale) => {
      const home = (
        read(locale, 'home').observatory as { clock: { units: Record<string, string> } }
      ).clock.units;
      expect(landingUnits(locale)).toEqual(home);
    },
  );

  it.each(routing.locales)('%s captions a value of 1 in the singular form', (locale) => {
    const intlLocale = getLocaleConfig(locale).intlLocale;
    const rules = new Intl.PluralRules(intlLocale);
    for (const unit of units) {
      const one = caption(landingUnits(locale)[unit]!, intlLocale, 1);
      const two = caption(landingUnits(locale)[unit]!, intlLocale, 2);
      expect(one.length).toBeGreaterThan(0);
      // Where the language has a singular, 1 takes it (en "hour", uk "година").
      if (rules.select(1) !== rules.select(2)) expect(one).not.toEqual(two);
    }
  });

  it('reads "01 hour" in English, not "01 hours"', () => {
    expect(caption(landingUnits('en').hours!, 'en', 1)).toBe('hour');
    expect(caption(landingUnits('en').hours!, 'en', 6)).toBe('hours');
  });
});

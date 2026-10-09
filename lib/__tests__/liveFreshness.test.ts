import {
  DELAYED_AFTER_MS,
  getFreshnessAge,
  getLiveFreshness,
  isFreshEnough,
  type LiveFreshnessInput,
} from '../liveFreshness';

const NOW = 1_700_000_000_000;

function freshness(overrides: Partial<LiveFreshnessInput>) {
  return getLiveFreshness({
    lastSuccessAtMs: NOW - 5_000,
    lastAttemptFailed: false,
    online: true,
    pollIntervalMs: 12_000,
    nowMs: NOW,
    ...overrides,
  });
}

describe('getLiveFreshness', () => {
  it('is live while recent data arrived and nothing failed since', () => {
    expect(freshness({})).toBe('live');
    expect(isFreshEnough('live')).toBe(true);
  });

  it('is offline whenever the browser is, whatever the data', () => {
    expect(freshness({ online: false })).toBe('offline');
    expect(freshness({ online: false, lastSuccessAtMs: 0 })).toBe('offline');
  });

  it('is connecting before the first client fetch (server seeds are dated 0)', () => {
    expect(freshness({ lastSuccessAtMs: 0 })).toBe('connecting');
    expect(freshness({ lastSuccessAtMs: null })).toBe('connecting');
    expect(isFreshEnough('connecting')).toBe(false);
  });

  it('is reconnecting while the latest attempt failed', () => {
    expect(freshness({ lastAttemptFailed: true })).toBe('reconnecting');
    expect(freshness({ lastSuccessAtMs: 0, lastAttemptFailed: true })).toBe('reconnecting');
  });

  it('is delayed once nothing has arrived for a minute', () => {
    expect(freshness({ lastSuccessAtMs: NOW - DELAYED_AFTER_MS })).toBe('live');
    expect(freshness({ lastSuccessAtMs: NOW - DELAYED_AFTER_MS - 1 })).toBe('delayed');
    expect(freshness({ lastSuccessAtMs: NOW - 90_000, lastAttemptFailed: true })).toBe('delayed');
  });

  it('stretches the delayed threshold for a slow cadence', () => {
    expect(freshness({ lastSuccessAtMs: NOW - 90_000, pollIntervalMs: 60_000 })).toBe('live');
    expect(freshness({ lastSuccessAtMs: NOW - 130_000, pollIntervalMs: 60_000 })).toBe('delayed');
  });
});

describe('getFreshnessAge', () => {
  it.each([
    [0, 'justNow', 0],
    [4_999, 'justNow', 0],
    [12_000, 'seconds', 12],
    [59_999, 'seconds', 59],
    [60_000, 'minutes', 1],
    [3_599_000, 'minutes', 59],
    [3_600_000, 'hours', 1],
    [86_400_000 * 2, 'days', 2],
    [-5_000, 'justNow', 0],
  ])('reads %i ms as %s (%i)', (ageMs, unit, count) => {
    expect(getFreshnessAge(ageMs)).toEqual({ unit, count });
  });
});

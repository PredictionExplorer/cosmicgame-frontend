import { PACES, isPaceName, paceToSetterValues } from '../director/pace';

const MICROS = 1_000_000n;

describe('pace presets', () => {
  it('recognizes exactly the defined pace names', () => {
    expect(isPaceName('demo')).toBe(true);
    expect(isPaceName('fast')).toBe(true);
    expect(isPaceName('realtime')).toBe(true);
    expect(isPaceName('seed-history')).toBe(true);
    expect(isPaceName('warp-speed')).toBe(false);
  });

  it.each(Object.values(PACES))('derives $name divisors that round-trip durations', (pace) => {
    const values = paceToSetterValues(pace);
    expect(values.timeIncrementMicros).toBe(BigInt(pace.timeIncrementSeconds) * MICROS);

    // The game computes duration (in seconds) = incrementMicros / divisor;
    // the derived divisor must reproduce the requested duration within
    // integer rounding.
    const roundTrip = (divisor: bigint) => Number(values.timeIncrementMicros / divisor);
    expect(roundTrip(values.initialCountdownDivisor)).toBeCloseTo(pace.initialCountdownSeconds, -1);
    expect(roundTrip(values.ethWindowDivisor)).toBeCloseTo(pace.ethWindowSeconds, -1);

    expect(values.cstWindowSeconds).toBe(BigInt(pace.cstWindowSeconds));
    expect(values.activationDelaySeconds).toBe(BigInt(pace.activationDelaySeconds));
    expect(values.finalizeExclusivitySeconds).toBe(BigInt(pace.finalizeExclusivitySeconds));
    expect(values.retrievalTimeoutSeconds).toBe(BigInt(pace.retrievalTimeoutSeconds));
  });

  it('matches the realtime preset to production contract defaults', () => {
    const values = paceToSetterValues(PACES.realtime);
    // 1 hour increment, ~24h initial countdown, ~2 day ETH window: the
    // documented launch parameters (see the Python simulator in the
    // contracts repo and content/protocol-facts.ts).
    expect(values.timeIncrementMicros).toBe(3_600_000_000n);
    expect(values.initialCountdownDivisor).toBe(41_666n);
    expect(values.ethWindowDivisor).toBe(20_833n);
  });

  it('never derives a zero divisor even for extreme durations', () => {
    const values = paceToSetterValues({
      ...PACES.fast,
      initialCountdownSeconds: 10_000_000,
    });
    expect(values.initialCountdownDivisor).toBeGreaterThanOrEqual(1n);
  });
});

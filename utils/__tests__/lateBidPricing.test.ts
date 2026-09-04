import {
  LATE_GESTURE_CURVE_HEADROOM_PERCENT,
  LATE_GESTURE_LAST_MINUTE_SECONDS,
  computeMaxLateGesturePrice,
  resolveLateGesturePhase,
} from '@/utils/lateBidPricing';

// Deployment defaults of the v3-2026-07-24 contracts (a ~1-hour main prize
// time increment): a 1224-second window and a premium reaching ~4× the base.
const WINDOW = 1224n;
const PREMIUM_BASE_MULTIPLIER = 29_228_998_656n;
const INCREMENT_MICROSECONDS = 3_672_360_000n;
const PREMIUM_EXPONENT = 8n;
const ONE_ETH = 10n ** 18n;

describe('resolveLateGesturePhase', () => {
  it('is normal while the countdown exceeds the late-gesture window', () => {
    expect(resolveLateGesturePhase(WINDOW + 1n, WINDOW)).toBe('normal');
    expect(resolveLateGesturePhase(100_000n, WINDOW)).toBe('normal');
  });

  it('is curve from window entry until the last minute', () => {
    expect(resolveLateGesturePhase(WINDOW, WINDOW)).toBe('curve');
    expect(resolveLateGesturePhase(LATE_GESTURE_LAST_MINUTE_SECONDS + 1n, WINDOW)).toBe('curve');
  });

  it('is lastMinute inside the final minute and once the deadline passed', () => {
    expect(resolveLateGesturePhase(LATE_GESTURE_LAST_MINUTE_SECONDS, WINDOW)).toBe('lastMinute');
    expect(resolveLateGesturePhase(1n, WINDOW)).toBe('lastMinute');
    // getDurationUntilMainPrize() clamps overdue rounds to zero, where the
    // premium sits at its maximum — the full cap must apply there.
    expect(resolveLateGesturePhase(0n, WINDOW)).toBe('lastMinute');
  });

  it('keeps the curve headroom above the default tolerance', () => {
    expect(LATE_GESTURE_CURVE_HEADROOM_PERCENT).toBeGreaterThan(2);
  });
});

describe('computeMaxLateGesturePrice', () => {
  const params = {
    roundLateBidDuration: WINDOW,
    premiumBaseMultiplier: PREMIUM_BASE_MULTIPLIER,
    mainPrizeTimeIncrementInMicroSeconds: INCREMENT_MICROSECONDS,
    premiumExponent: PREMIUM_EXPONENT,
  };

  it('yields ~5x the base under the default configuration', () => {
    const cap = computeMaxLateGesturePrice({ basePrice: ONE_ETH, ...params });
    const ratio = Number(cap) / Number(ONE_ETH);
    expect(ratio).toBeGreaterThan(4.99);
    expect(ratio).toBeLessThan(5.01);
  });

  it('replicates the contract integer math exactly', () => {
    // Mirrors _addRoundLateBidPricePremiumAmountIfNeeded with the elapsed
    // duration clamped to the full window.
    const scaled = (WINDOW * PREMIUM_BASE_MULTIPLIER) / INCREMENT_MICROSECONDS;
    const expected = ONE_ETH + ((scaled ** PREMIUM_EXPONENT * ONE_ETH) >> (PREMIUM_EXPONENT * 13n));
    expect(computeMaxLateGesturePrice({ basePrice: ONE_ETH, ...params })).toBe(expected);
  });

  it('scales with the base price (up to integer flooring in the shift)', () => {
    const capOne = computeMaxLateGesturePrice({ basePrice: ONE_ETH, ...params });
    const capThree = computeMaxLateGesturePrice({ basePrice: 3n * ONE_ETH, ...params });
    const diff = capThree - 3n * capOne;
    expect(diff >= 0n && diff < 4n).toBe(true);
  });

  it('returns the base unchanged on degenerate configuration', () => {
    expect(computeMaxLateGesturePrice({ basePrice: 0n, ...params })).toBe(0n);
    expect(
      computeMaxLateGesturePrice({
        basePrice: ONE_ETH,
        ...params,
        mainPrizeTimeIncrementInMicroSeconds: 0n,
      }),
    ).toBe(ONE_ETH);
    expect(computeMaxLateGesturePrice({ basePrice: ONE_ETH, ...params, premiumExponent: 0n })).toBe(
      ONE_ETH,
    );
  });
});

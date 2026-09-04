/**
 * V3 late-gesture price-cap policy.
 *
 * Inside the V3 late-gesture window the cost rises every second along
 * `price × (1 + (elapsed × mul / inc)^exp >> 13·exp)` (BiddingV3.sol,
 * Comment-202607119), reaching ~5× the premium-free base at `mainPrizeTime`
 * and clamping there once the deadline has passed. A fixed percentage of
 * headroom over the live quote therefore cannot survive the steep end of the
 * curve: seconds before the deadline the price outruns any small percentage
 * between quote and mining, and the transaction reverts with
 * `InsufficientReceivedBidAmount` (selector 0x814ac7ff).
 *
 * Policy (V3 deployments only — V1/V2 have no premium):
 * - outside the window: the user's regular "raise by %" headroom;
 * - inside the window but more than a minute from the deadline: at least
 *   +20% headroom (the curve is still shallow there);
 * - during the last minute (or past the deadline): the exact contract
 *   maximum. ETH overpayment is refunded in the same transaction and the CST
 *   limit is only a cap the contract never charges above, so the full-size
 *   limit costs the gesturer nothing.
 */

/** Below this many seconds until the main prize the full 5× cap applies. */
export const LATE_GESTURE_LAST_MINUTE_SECONDS = 60n;

/** Minimum headroom percentage while on the premium curve (but not last-minute). */
export const LATE_GESTURE_CURVE_HEADROOM_PERCENT = 20;

/** `ROUND_LATE_BID_PRICE_PREMIUM_AMOUNT_RESOLUTION_EXPONENT` in CosmicSignatureConstants.sol. */
const PREMIUM_RESOLUTION_EXPONENT = 13n;

export type LateGesturePhase = 'normal' | 'curve' | 'lastMinute';

/**
 * Classifies the moment of a gesture relative to the V3 late-gesture window.
 * `durationUntilMainPrize` is the contract's clamped-to-zero countdown, so an
 * overdue round (deadline in the past, premium at maximum) lands in
 * 'lastMinute' as required.
 */
export function resolveLateGesturePhase(
  durationUntilMainPrize: bigint,
  roundLateBidDuration: bigint,
): LateGesturePhase {
  if (durationUntilMainPrize > roundLateBidDuration) return 'normal';
  if (durationUntilMainPrize > LATE_GESTURE_LAST_MINUTE_SECONDS) return 'curve';
  return 'lastMinute';
}

export interface MaxLateGesturePriceParams {
  /** Premium-free price the premium multiplies (`nextEthBidPrice` for ETH). */
  basePrice: bigint;
  /** `getRoundLateBidDuration()` — full window length in seconds. */
  roundLateBidDuration: bigint;
  /** `roundLateBidPricePremiumAmountBaseMultiplier()`. */
  premiumBaseMultiplier: bigint;
  /** `mainPrizeTimeIncrementInMicroSeconds()`. */
  mainPrizeTimeIncrementInMicroSeconds: bigint;
  /** `roundLateBidPricePremiumAmountExponent()`. */
  premiumExponent: bigint;
}

/**
 * The highest price the V3 contract can ever charge for the given base: the
 * premium with the elapsed duration clamped to the full window, computed with
 * the same integer arithmetic as `_addRoundLateBidPricePremiumAmountIfNeeded`
 * (≈5× the base under the default configuration).
 */
export function computeMaxLateGesturePrice({
  basePrice,
  roundLateBidDuration,
  premiumBaseMultiplier,
  mainPrizeTimeIncrementInMicroSeconds,
  premiumExponent,
}: MaxLateGesturePriceParams): bigint {
  if (basePrice <= 0n || mainPrizeTimeIncrementInMicroSeconds <= 0n || premiumExponent <= 0n) {
    return basePrice;
  }
  const scaledElapsed =
    (roundLateBidDuration * premiumBaseMultiplier) / mainPrizeTimeIncrementInMicroSeconds;
  const premium =
    (scaledElapsed ** premiumExponent * basePrice) >>
    (premiumExponent * PREMIUM_RESOLUTION_EXPONENT);
  return basePrice + premium;
}

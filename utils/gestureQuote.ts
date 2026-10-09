import { protocolFacts } from '@/content/protocol-facts';

import { formatNumber } from '@/utils/format';

/**
 * Quotes for the ETH a participant is about to send. Every surface that shows an ETH Gesture
 * Cost (method tabs, the submit button, the mobile dock, the collision line) formats it here,
 * so one gesture never shows three different figures.
 */

/** Significant digits for an ETH cost quote: enough to see a 1% step, never rounded to 0.10. */
const QUOTE_SIGNIFICANT_DIGITS = 5;

/** The largest collision buffer the gesture form accepts, in percent. */
export const MAX_COLLISION_BUFFER_PERCENT = 50;

/** Buffer added to the RandomWalk imprint value so a cost rise before confirmation still succeeds. */
export const IMPRINT_COST_BUFFER_PERCENT = 1;

/**
 * Formats an ETH amount for a cost quote: five significant digits, no grouping, with the
 * format layer's decimal mark ("0.10211", uk "0.10211" per its style guide, vi "0,10211"),
 * so a quote reads like every other figure on the page.
 */
export function formatEthQuote(eth: number, locale: string = 'en'): string {
  return formatNumber(eth, locale, {
    maximumSignificantDigits: QUOTE_SIGNIFICANT_DIGITS,
    useGrouping: false,
  });
}

/** The ETH Gesture Cost for a gesture type: the RandomWalk NFT halves the ETH price. */
export function ethGestureBaseCost(ethPrice: number, gestureType: string): number {
  return gestureType === 'RandomWalk'
    ? ethPrice * (1 - protocolFacts.randomWalkDiscountPercentage / 100)
    : ethPrice;
}

/** Fraction digits that give an ETH amount its quote's five significant digits. */
function quoteFractionDigits(eth: number): number {
  if (!Number.isFinite(eth) || eth <= 0) return 0;
  const magnitude = Math.floor(Math.log10(eth));
  return Math.min(18, Math.max(0, QUOTE_SIGNIFICANT_DIGITS - 1 - magnitude));
}

/**
 * A gesture method's ETH cost at the ETH method's precision: the full price
 * keeps its five significant digits and ETH + Random Walk stops at the same
 * decimal ("0.10211" beside "0.05105", never "0.051053"), so the two prices
 * line up wherever they sit together (the method choice, the submit label,
 * the dock). A round price drops its trailing zeros ("0.01", "0.005"). The
 * wallet prompt still carries the exact value.
 */
export function formatEthMethodQuote(
  ethPrice: number,
  gestureType: string,
  locale: string = 'en',
): string {
  return formatNumber(ethGestureBaseCost(ethPrice, gestureType), locale, {
    maximumFractionDigits: quoteFractionDigits(ethPrice),
    useGrouping: false,
  });
}

/**
 * The ETH the form sends: the Gesture Cost plus the collision buffer. Mirrors the wei math in
 * `useGestureForm` (base × (100 + buffer) / 100, then the RandomWalk reduction).
 */
export function ethGestureSendAmount(
  ethPrice: number,
  gestureType: string,
  bufferPercent: number,
): number {
  return ethGestureBaseCost(ethPrice, gestureType) * (1 + bufferPercent / 100);
}

/**
 * Clamps a collision-buffer input to a whole percent in [0, 50]. Empty, negative or non-numeric
 * input becomes 0: a negative buffer would underpay and revert.
 */
export function clampCollisionBufferPercent(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.min(MAX_COLLISION_BUFFER_PERCENT, Math.floor(numeric));
}

/** The value sent with a RandomWalk imprint: the contract's current cost plus the buffer, in wei. */
export function imprintSendValueWei(contractCostWei: bigint): bigint {
  return (contractCostWei * BigInt(100 + IMPRINT_COST_BUFFER_PERCENT)) / 100n;
}

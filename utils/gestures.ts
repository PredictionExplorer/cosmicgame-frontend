/**
 * Gesture method codes shared by the API and contracts:
 * 0 = ETH, 1 = ETH + Random Walk NFT, 2 = CST.
 */

/** Resolves the numeric gesture method, falling back to the raw backend `BidType` field. */
export function resolveGestureTypeCode(record: {
  GestureType?: unknown;
  BidType?: unknown;
}): number | undefined {
  if (typeof record.GestureType === 'number') return record.GestureType;
  if (typeof record.BidType === 'number') return record.BidType;
  return undefined;
}

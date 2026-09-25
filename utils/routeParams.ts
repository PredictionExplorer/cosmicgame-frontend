/**
 * Parses the canonical decimal form used by public non-negative integer routes.
 *
 * Rejects signs, whitespace, fractions, mixed strings, leading zeroes, and
 * values beyond JavaScript's safe-integer range.
 */
export function parseCanonicalNonNegativeSafeInteger(raw: string): number | null {
  if (!/^(?:0|[1-9]\d*)$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * A token id from the URL (`/detail/25`, `/detail/000025`): a whole, safe,
 * non-negative number, else null. Leading zeroes are allowed, because the
 * site prints token ids zero-padded.
 */
export function parseTokenId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const tokenId = Number(raw);
  return Number.isSafeInteger(tokenId) ? tokenId : null;
}

/**
 * A gesture's event-log id from the URL (`/gesture/29434`): a whole, safe,
 * non-negative number, else null ("12abc" is not gesture 12).
 */
export function parseGestureId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

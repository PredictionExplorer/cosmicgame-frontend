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

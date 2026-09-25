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

/** An anchor action's two route segments, read (`/anchor-action/0/23`). */
export interface AnchorActionParams {
  /** `1` for a Random Walk action, `0` for a Cosmic Signature one. */
  isRwalk: 0 | 1;
  actionId: number;
}

/**
 * The anchor action route's two segments: the collection flag (`0` or `1`,
 * nothing else) and a canonical action id. `null` for anything else, which
 * the route answers with a 404 instead of a record titled "Anchor action
 * #NaN".
 */
export function parseAnchorActionParams(
  rawIsRwalk: string,
  rawActionId: string,
): AnchorActionParams | null {
  const actionId = parseCanonicalNonNegativeSafeInteger(rawActionId);
  if (actionId === null) return null;
  if (rawIsRwalk === '0') return { isRwalk: 0, actionId };
  if (rawIsRwalk === '1') return { isRwalk: 1, actionId };
  return null;
}

/**
 * Whether a route segment names an address: `0x` and 40 hexadecimal digits,
 * in any case, around any whitespace. The routes read it the same way
 * (`participantAddress` lower-cases it, so no checksum applies) and check-sum
 * it themselves.
 */
export function isAddressParam(raw: string): boolean {
  return /^0x[0-9a-f]{40}$/i.test(raw.trim());
}

/**
 * Whether a configuration window's three segments (`/system-event/2/200/350`)
 * can name one: a canonical cycle and last event log id, and a first id that
 * is canonical or `-1` (the first setup's "from the beginning") and not past
 * the last.
 */
export function isSystemEventWindowParams(
  rawRound: string,
  rawStart: string,
  rawEnd: string,
): boolean {
  const round = parseCanonicalNonNegativeSafeInteger(rawRound);
  const end = parseCanonicalNonNegativeSafeInteger(rawEnd);
  const start = rawStart === '-1' ? -1 : parseCanonicalNonNegativeSafeInteger(rawStart);
  return round !== null && end !== null && start !== null && start <= end;
}

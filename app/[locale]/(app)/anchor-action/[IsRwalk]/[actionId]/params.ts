import { parseCanonicalNonNegativeSafeInteger } from '@/utils';

export interface AnchorActionParams {
  /** `1` for a Random Walk action, `0` for a Cosmic Signature one. */
  isRwalk: 0 | 1;
  actionId: number;
}

/**
 * The route's two segments: the collection flag (`0` or `1`, nothing else)
 * and a canonical action id. `null` for anything else, which the route
 * answers with a 404 instead of a record titled "Anchor action #NaN".
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

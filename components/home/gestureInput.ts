import { protocolFacts } from '@/content/protocol-facts';

import { truncateToBytes, utf8ByteLength } from '@/components/nft/nftName';

/**
 * The contract's default cap on a Gesture message (`bidMessageLengthMaxLimit`),
 * in UTF-8 bytes. The contract checks `bytes(message).length`, so a Chinese,
 * Japanese or Korean character takes three of them and an emoji four: a cap
 * counted in characters let about 94 CJK characters through, and the Gesture
 * then reverted on-chain. The owner can change the cap; the form reads the
 * live value and falls back to this one.
 */
export const GESTURE_MESSAGE_MAX_BYTES = protocolFacts.gestureMessageMaxLength;

/** How many bytes a Gesture message takes on-chain (UTF-8), the unit the contract counts. */
export function gestureMessageBytes(message: string): number {
  return utf8ByteLength(message);
}

/**
 * The message as the contract will take it: unchanged when it fits
 * `maxBytes`, otherwise cut after the last whole character that fits, so a
 * typed or pasted message stops at the cap instead of reverting later.
 */
export function fitGestureMessage(message: string, maxBytes: number): string {
  return utf8ByteLength(message) <= maxBytes ? message : truncateToBytes(message, maxBytes);
}

/**
 * Whether a Random Walk NFT may ride on the Gesture: one of the wallet's
 * unused tokens, from a list read for this wallet (`status` is the hook's
 * `rwlkListStatus`). A token picked for another wallet, a used one, or one
 * the list has not confirmed yet never enables the submit.
 */
export function isUsableRandomWalkToken(
  tokenId: number,
  status: 'no-wallet' | 'loading' | 'ready' | 'error',
  unusedIds: readonly number[],
): boolean {
  return tokenId >= 0 && status === 'ready' && unusedIds.includes(tokenId);
}

/** A token id from a URL: a whole number of 0 or more, never NaN or a guess. */
export function parseTokenId(raw: string | null | undefined): number | null {
  const value = raw?.trim() ?? '';
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * The Random Walk collection's deep link into the gesture form
 * (`?randomwalk=1&tokenId=12`): null when the URL is not one, and a null
 * `tokenId` when the link names no valid token (the method is still chosen,
 * the token is not). The token is only a suggestion: the form keeps it only
 * while it is one of the connected wallet's unused Random Walk NFTs.
 */
export function readRandomWalkLink(search: string): { tokenId: number | null } | null {
  const params = new URLSearchParams(search);
  if (!params.get('randomwalk')) return null;
  return { tokenId: parseTokenId(params.get('tokenId')) };
}

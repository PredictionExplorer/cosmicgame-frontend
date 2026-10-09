import { parseCanonicalNonNegativeSafeInteger } from '@/utils';

import { participantAddress } from '@/components/winnings/participantAddress';

export interface TokenDistributionParams {
  /** The anchor-holder, checksummed: the one spelling the server read and the client query share. */
  address: `0x${string}`;
  tokenId: number;
}

/**
 * The route's two segments, validated before anything is read: an address
 * (any case, returned checksummed) and a canonical token id (`45`, not `045`
 * or `4.5`). `null` for anything else, which the route answers with a 404,
 * so no raw segment ever reaches the upstream request path.
 */
export function parseTokenDistributionParams(
  rawAddress: string,
  rawTokenId: string,
): TokenDistributionParams | null {
  const address = participantAddress(rawAddress);
  const tokenId = parseCanonicalNonNegativeSafeInteger(rawTokenId);
  return address === null || tokenId === null ? null : { address, tokenId };
}

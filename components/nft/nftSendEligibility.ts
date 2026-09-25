import { getAddress, isAddress, type Address } from 'viem';

import { sameAddress } from '@/utils/format';
import type { CSTTokenInfo } from '@/services/api';

/**
 * Why a Signature in the wallet cannot be sent right now: it is anchored
 * (the anchoring contract holds it until it is released), or the wallet read
 * is stale and another address owns it now.
 */
export type NftSendBlock = 'anchored' | 'ownerChanged';

/** The checksummed address a wallet string names, or `null`. */
export function toSourceAddress(value: string | null | undefined): Address | null {
  const trimmed = value?.trim() ?? '';
  return isAddress(trimmed, { strict: false }) ? getAddress(trimmed) : null;
}

/** Why `token` cannot be sent from `source`, or `null` when it can. */
export function nftSendBlock(
  token: Pick<CSTTokenInfo, 'Staked' | 'CurOwnerAddr'>,
  source: Address | null,
): NftSendBlock | null {
  if (token.Staked) return 'anchored';
  if (source && token.CurOwnerAddr && !sameAddress(token.CurOwnerAddr, source)) {
    return 'ownerChanged';
  }
  return null;
}

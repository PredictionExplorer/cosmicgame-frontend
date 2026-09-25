import { getAddress, isAddress } from 'viem';

/**
 * The checksummed address in a profile URL, or null when the segment is not
 * an address. Only the address's form decides: whether it has gestured says
 * nothing about whether it is a participant (a Random Walk anchor-holder can
 * receive Stellar Selection NFTs without ever making a gesture).
 */
export function profileAddress(raw: string): string | null {
  const lower = raw.toLowerCase();
  return isAddress(lower) ? getAddress(lower) : null;
}

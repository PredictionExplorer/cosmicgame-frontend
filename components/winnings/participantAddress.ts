import { getAddress, isAddress } from 'viem';

/**
 * The checksummed address of a route parameter, or `null` when it is not an
 * address. Server-safe: a route validates its segment with it before any
 * read, so the upstream request and the client's query key both use the one
 * canonical spelling.
 */
export function participantAddress(raw: string | null | undefined): `0x${string}` | null {
  const value = raw?.trim().toLowerCase() ?? '';
  return isAddress(value) ? getAddress(value) : null;
}
